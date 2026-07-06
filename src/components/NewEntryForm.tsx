'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

const PROJECTS = ['B-Blok', 'A-Blok', 'TBM Girişi', 'NATM Kesimi', 'Portal'];
const WORKS = ['Kazı', 'Kalıp', 'Donatı', 'Beton dökümü', 'Püskürtme beton', 'Tahkimat', 'Diğer'];

export default function NewEntryForm({ onSaved }: { onSaved: () => void }) {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [project, setProject] = useState(PROJECTS[0]);
  const [work, setWork] = useState(WORKS[0]);
  const [note, setNote] = useState('');
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState('Konum alınıyor...');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      let photoUrl: string | null = null;

      if (photoFile) {
        const ext = photoFile.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(fileName, photoFile);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('photos').getPublicUrl(fileName);
        photoUrl = publicUrlData.publicUrl;
      }

      const { error: insertError } = await supabase.from('entries').insert({
        project,
        work,
        note: note || null,
        photo_url: photoUrl,
        gps_lat: gps?.lat ?? null,
        gps_lng: gps?.lng ?? null,
      });
      if (insertError) throw insertError;

      setPhotoFile(null);
      setPhotoPreview(null);
      setNote('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      onSaved();
    } catch (err) {
      console.error(err);
      setError('Kaydetme hatası. İnternet bağlantını kontrol edip tekrar dene.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <label className="mb-1.5 block text-sm text-neutral-500">Fotoğraf</label>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="mb-3 w-full text-sm"
      />
      {photoPreview && (
        <img src={photoPreview} alt="önizleme" className="mb-3 w-full rounded-lg" />
      )}

      <label className="mb-1.5 block text-sm text-neutral-500">Proje / blok</label>
      <select
        value={project}
        onChange={(e) => setProject(e.target.value)}
        className="mb-3 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
      >
        {PROJECTS.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      <label className="mb-1.5 block text-sm text-neutral-500">İmalat kalemi</label>
      <select
        value={work}
        onChange={(e) => setWork(e.target.value)}
        className="mb-3 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
      >
        {WORKS.map((w) => (
          <option key={w} value={w}>
            {w}
          </option>
        ))}
      </select>

      <label className="mb-1.5 block text-sm text-neutral-500">Not (opsiyonel)</label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="Örn: sağ tünel 45. metre, kalıp söküldü"
        className="mb-3 w-full resize-y rounded-lg border border-neutral-200 px-3 py-2 text-sm"
      />

      <p className="mb-3 text-xs text-neutral-400">{gpsStatus}</p>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {saving ? 'Kaydediliyor...' : 'Kaydet'}
      </button>
    </div>
  );
}
