'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { COMPANIES, PROJECTS, WORKS, LAST_COMPANY_KEY } from '@/lib/constants';
import { queueEntry, getPendingCount, syncPendingEntries } from '@/lib/offlineQueue';

type MediaItem = { file: File; url: string; isVideo: boolean };

const inputCls =
  'w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 bg-white placeholder:text-neutral-400';
const labelCls = 'mb-1.5 block text-sm font-medium text-neutral-700';

export default function NewEntryForm() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [company, setCompany] = useState(COMPANIES[0]);
  const [project, setProject] = useState(PROJECTS[0]);
  const [work, setWork] = useState(WORKS[0]);
  const [note, setNote] = useState('');
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState('Konum alınıyor...');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function refreshPendingCount() {
    const count = await getPendingCount();
    setPendingCount(count);
  }

  async function trySync() {
    if (!navigator.onLine) return;
    setSyncing(true);
    await syncPendingEntries();
    await refreshPendingCount();
    setSyncing(false);
  }

  useEffect(() => {
    setIsOnline(navigator.onLine);
    refreshPendingCount();

    function handleOnline() {
      setIsOnline(true);
      trySync();
    }
    function handleOffline() {
      setIsOnline(false);
    }
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    // Sayfa açılışında da bekleyen kayıt varsa göndermeyi dene
    trySync();
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(LAST_COMPANY_KEY) : null;
    if (saved && COMPANIES.includes(saved)) setCompany(saved);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus('Bu tarayıcıda konum desteklenmiyor.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsStatus(`Konum: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
      },
      () => setGpsStatus('Konum alınamadı (izin gerekli).')
    );
  }, []);

  function handleCompanyChange(value: string) {
    setCompany(value);
    localStorage.setItem(LAST_COMPANY_KEY, value);
  }

  function handleFilesAdded(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const items: MediaItem[] = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      isVideo: file.type.startsWith('video/'),
    }));
    setMedia((prev) => [...prev, ...items]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeMedia(index: number) {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      if (!navigator.onLine) {
        // Çevrimdışı: kaydı telefonda beklet, bağlantı gelince otomatik gönderilecek
        const mediaFiles = media.map((item) => ({
          blob: item.file,
          name: item.file.name,
          type: item.file.type,
        }));
        await queueEntry({
          company,
          project,
          work,
          note: note || null,
          gps_lat: gps?.lat ?? null,
          gps_lng: gps?.lng ?? null,
          mediaFiles,
        });
        setMedia([]);
        setNote('');
        setSuccessMsg(true);
        setTimeout(() => setSuccessMsg(false), 2500);
        await refreshPendingCount();
        return;
      }

      const uploadedUrls: string[] = [];

      for (const item of media) {
        const ext = item.file.name.split('.').pop() || (item.isVideo ? 'mp4' : 'jpg');
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(fileName, item.file);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('photos').getPublicUrl(fileName);
        uploadedUrls.push(publicUrlData.publicUrl);
      }

      const { error: insertError } = await supabase.from('entries').insert({
        company,
        project,
        work,
        note: note || null,
        media_urls: uploadedUrls,
        gps_lat: gps?.lat ?? null,
        gps_lng: gps?.lng ?? null,
      });
      if (insertError) throw insertError;

      setMedia([]);
      setNote('');
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 2500);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      setError(`Kaydetme hatası: ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <label className={labelCls}>Fotoğraf / video</label>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        capture="environment"
        multiple
        onChange={handleFilesAdded}
        className="hidden"
      />
      <div className="mb-3 grid grid-cols-3 gap-2">
        {media.map((item, i) => (
          <div key={i} className="relative aspect-square overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
            {item.isVideo ? (
              <video src={item.url} className="h-full w-full object-cover" muted />
            ) : (
              <img src={item.url} alt="" className="h-full w-full object-cover" />
            )}
            <button
              onClick={() => removeMedia(i)}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white"
              aria-label="Kaldır"
            >
              ×
            </button>
          </div>
        ))}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 text-2xl text-neutral-400"
          aria-label="Fotoğraf veya video ekle"
        >
          +
        </button>
      </div>

      <label className={labelCls}>Taşeron firma</label>
      <select
        value={company}
        onChange={(e) => handleCompanyChange(e.target.value)}
        className={`mb-3 ${inputCls}`}
      >
        {COMPANIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <label className={labelCls}>Proje / blok</label>
      <select
        value={project}
        onChange={(e) => setProject(e.target.value)}
        className={`mb-3 ${inputCls}`}
      >
        {PROJECTS.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      <label className={labelCls}>İmalat kalemi</label>
      <select
        value={work}
        onChange={(e) => setWork(e.target.value)}
        className={`mb-3 ${inputCls}`}
      >
        {WORKS.map((w) => (
          <option key={w} value={w}>
            {w}
          </option>
        ))}
      </select>

      <label className={labelCls}>Not (opsiyonel)</label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="Örn: sağ tünel 45. metre, kalıp söküldü"
        className={`mb-3 resize-y ${inputCls}`}
      />

      <p className="mb-3 text-xs text-neutral-500">{gpsStatus}</p>

      {!isOnline && (
        <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          İnternet yok — kayıt telefonda bekletilecek, bağlantı gelince otomatik gönderilecek.
        </p>
      )}
      {isOnline && pendingCount > 0 && (
        <p className="mb-3 rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-800">
          {syncing
            ? `${pendingCount} bekleyen kayıt gönderiliyor...`
            : `${pendingCount} bekleyen kayıt var, gönderiliyor...`}
        </p>
      )}

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      {successMsg && (
        <p className="mb-3 text-sm text-green-600">
          {isOnline ? 'Kayıt eklendi.' : 'Kayıt telefonda bekletildi, bağlantı gelince gönderilecek.'}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {saving ? 'Kaydediliyor...' : isOnline ? 'Kaydet' : 'Kaydet (çevrimdışı)'}
      </button>
    </div>
  );
}
