import JSZip from 'jszip';
import { supabase, Entry } from './supabase';

function safe(text: string) {
  return text.replace(/[^a-zA-Z0-9ığüşöçİĞÜŞÖÇ_-]+/g, '_').slice(0, 40);
}

function extractStoragePath(url: string): string | null {
  const marker = '/storage/v1/object/public/photos/';
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

export type ArchiveProgress = {
  step: 'zipliyor' | 'indiriliyor' | 'temizleniyor' | 'tamam' | 'hata';
  detail?: string;
};

export async function archiveEntries(
  entries: Entry[],
  onProgress: (p: ArchiveProgress) => void
): Promise<void> {
  const withMedia = entries.filter((e) => e.media_urls && e.media_urls.length > 0);
  if (withMedia.length === 0) {
    onProgress({ step: 'tamam', detail: 'Arşivlenecek fotoğraf yok.' });
    return;
  }

  onProgress({ step: 'zipliyor' });
  const zip = new JSZip();

  for (const entry of withMedia) {
    const urls = entry.media_urls || [];
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        const ext = url.split('.').pop()?.split('?')[0] || 'jpg';
        const dateStr = new Date(entry.created_at).toISOString().slice(0, 10);
        const name = `${dateStr}_${safe(entry.company || 'firma')}_${safe(entry.project)}_${entry.id.slice(0, 8)}_${i + 1}.${ext}`;
        zip.file(name, blob);
      } catch (err) {
        console.error('Dosya indirilemedi, atlanıyor:', url, err);
      }
    }
  }

  onProgress({ step: 'zipliyor', detail: 'Zip oluşturuluyor...' });
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const zipName = `santiye-gunlugu-arsiv-${new Date().toISOString().slice(0, 10)}.zip`;

  // 1) Bilgisayara indir
  onProgress({ step: 'indiriliyor' });
  const dlUrl = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = dlUrl;
  a.download = zipName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(dlUrl);

  // 2) Supabase'den fotoğrafları temizle (metin kaydı kalır)
  onProgress({ step: 'temizleniyor' });
  const pathsToDelete: string[] = [];
  for (const entry of withMedia) {
    for (const url of entry.media_urls || []) {
      const p = extractStoragePath(url);
      if (p) pathsToDelete.push(p);
    }
  }

  if (pathsToDelete.length > 0) {
    const { error: removeError } = await supabase.storage.from('photos').remove(pathsToDelete);
    if (removeError) console.error('Storage temizleme hatası:', removeError);
  }

  for (const entry of withMedia) {
    await supabase.from('entries').update({ media_urls: [] }).eq('id', entry.id);
  }

  onProgress({ step: 'tamam', detail: `${withMedia.length} kayıt arşivlendi ve temizlendi.` });
}
