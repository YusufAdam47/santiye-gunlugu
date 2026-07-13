import { openDB, DBSchema } from 'idb';
import { supabase } from './supabase';

type PendingEntry = {
  id: string;
  company: string;
  project: string;
  work: string;
  note: string | null;
  gps_lat: number | null;
  gps_lng: number | null;
  entry_code: string;
  extra: Record<string, string>;
  mediaFiles: { blob: Blob; name: string; type: string }[];
  createdAt: string;
};

interface OfflineDB extends DBSchema {
  pending: {
    key: string;
    value: PendingEntry;
  };
}

const DB_NAME = 'santiye-offline';
const STORE_NAME = 'pending';

async function getDb() {
  return openDB<OfflineDB>(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
}

export async function queueEntry(entry: Omit<PendingEntry, 'id' | 'createdAt'>) {
  const db = await getDb();
  const id = `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await db.put(STORE_NAME, { ...entry, id, createdAt: new Date().toISOString() });
  return id;
}

export async function getPendingCount(): Promise<number> {
  const db = await getDb();
  return db.count(STORE_NAME);
}

export async function getPendingEntries(): Promise<PendingEntry[]> {
  const db = await getDb();
  return db.getAll(STORE_NAME);
}

export async function removePendingEntry(id: string) {
  const db = await getDb();
  await db.delete(STORE_NAME, id);
}

// Bekleyen tüm kayıtları Supabase'e göndermeyi dener. Başarılı olanlar kuyruktan silinir.
export async function syncPendingEntries(): Promise<{ synced: number; failed: number }> {
  const pending = await getPendingEntries();
  let synced = 0;
  let failed = 0;

  for (const item of pending) {
    try {
      const uploadedUrls: string[] = [];
      for (const media of item.mediaFiles) {
        const ext = media.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(fileName, media.blob, { contentType: media.type });
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('photos').getPublicUrl(fileName);
        uploadedUrls.push(publicUrlData.publicUrl);
      }

      const { error: insertError } = await supabase.from('entries').insert({
        company: item.company,
        project: item.project,
        work: item.work,
        note: item.note,
        media_urls: uploadedUrls,
        gps_lat: item.gps_lat,
        gps_lng: item.gps_lng,
        entry_code: item.entry_code,
        extra: item.extra,
      });
      if (insertError) throw insertError;

      await removePendingEntry(item.id);
      synced++;
    } catch (err) {
      console.error('Senkronizasyon hatası:', err);
      failed++;
    }
  }

  return { synced, failed };
}
