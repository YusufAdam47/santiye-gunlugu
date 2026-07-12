'use client';

import { useState, useEffect } from 'react';
import { supabase, Entry, isVideoUrl } from '@/lib/supabase';
import { WORKS } from '@/lib/constants';
import { archiveEntries, ArchiveProgress } from '@/lib/archive';
import { exportEntriesToExcel } from '@/lib/excelExport';
import { fetchCompanies, fetchProjects, Option } from '@/lib/options';

const selectCls = 'rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 bg-white';
const editInputCls =
  'w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 bg-white mb-2';

type EditState = {
  company: string;
  project: string;
  work: string;
  note: string;
  media_urls: string[];
};

export default function EntriesPanel({
  refreshKey,
  isAdmin,
  code,
}: {
  refreshKey: number;
  isAdmin: boolean;
  code: string;
}) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [companies, setCompanies] = useState<Option[]>([]);
  const [projects, setProjects] = useState<Option[]>([]);
  const [companyFilter, setCompanyFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [codeFilter, setCodeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [archiveMsg, setArchiveMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    let query = supabase.from('entries').select('*').order('created_at', { ascending: false });
    if (!isAdmin) query = query.eq('entry_code', code);
    if (isAdmin && codeFilter.trim()) query = query.eq('entry_code', codeFilter.trim());
    if (companyFilter) query = query.eq('company', companyFilter);
    if (projectFilter) query = query.eq('project', projectFilter);
    if (dateFrom) query = query.gte('created_at', `${dateFrom}T00:00:00`);
    if (dateTo) query = query.lte('created_at', `${dateTo}T23:59:59`);
    const { data, error } = await query;
    if (!error && data) setEntries(data as Entry[]);
    setLoading(false);
  }

  useEffect(() => {
    fetchCompanies().then(setCompanies);
    fetchProjects().then(setProjects);
  }, [refreshKey]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyFilter, projectFilter, codeFilter, dateFrom, dateTo, refreshKey, isAdmin, code]);

  function startEdit(e: Entry) {
    setEditingId(e.id);
    setEditState({
      company: e.company || (companies[0]?.name ?? ''),
      project: e.project,
      work: e.work,
      note: e.note || '',
      media_urls: e.media_urls || [],
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditState(null);
  }

  function removeMediaFromEdit(url: string) {
    if (!editState) return;
    setEditState({ ...editState, media_urls: editState.media_urls.filter((u) => u !== url) });
  }

  async function saveEdit(id: string) {
    if (!editState) return;
    setSavingEdit(true);
    const { error } = await supabase
      .from('entries')
      .update({
        company: editState.company,
        project: editState.project,
        work: editState.work,
        note: editState.note || null,
        media_urls: editState.media_urls,
      })
      .eq('id', id);
    setSavingEdit(false);
    if (!error) {
      cancelEdit();
      load();
    } else {
      alert('Güncelleme hatası: ' + error.message);
    }
  }

  async function deleteEntry(id: string) {
    if (!confirm('Bu kaydı silmek istediğine emin misin? Bu işlem geri alınamaz.')) return;
    const { error } = await supabase.from('entries').delete().eq('id', id);
    if (!error) {
      load();
    } else {
      alert('Silme hatası: ' + error.message);
    }
  }

  async function handleArchive() {
    if (
      !confirm(
        `Görünen ${entries.length} kayıttaki fotoğraflar zip olarak indirilecek, sonra Supabase'den silinecek (metin bilgisi kalır). Devam edilsin mi?`
      )
    )
      return;
    setArchiving(true);
    setArchiveMsg(null);
    await archiveEntries(entries, (p: ArchiveProgress) => {
      const labels: Record<ArchiveProgress['step'], string> = {
        zipliyor: 'Fotoğraflar zip haline getiriliyor...',
        indiriliyor: 'Bilgisayara indiriliyor...',
        temizleniyor: 'Supabase üzerinde temizleniyor...',
        tamam: p.detail || 'Tamamlandı.',
        hata: p.detail || 'Hata oluştu.',
      };
      setArchiveMsg(labels[p.step]);
    });
    setArchiving(false);
    load();
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2 print:hidden">
        {isAdmin && (
          <input
            type="text"
            inputMode="numeric"
            value={codeFilter}
            onChange={(e) => setCodeFilter(e.target.value)}
            placeholder="Kişisel kod ile ara"
            className={`flex-1 ${selectCls}`}
          />
        )}
        <select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className={`flex-1 ${selectCls}`}
        >
          <option value="">Tüm firmalar</option>
          {companies.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className={`flex-1 ${selectCls}`}
        >
          <option value="">Tüm bloklar</option>
          {projects.map((p) => (
            <option key={p.id} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className={selectCls}
          aria-label="Başlangıç tarihi"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className={selectCls}
          aria-label="Bitiş tarihi"
        />
        <button
          onClick={() => window.print()}
          className="whitespace-nowrap rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-900"
        >
          Rapor
        </button>
        <button
          onClick={() => exportEntriesToExcel(entries)}
          className="whitespace-nowrap rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-900"
        >
          Excel
        </button>
        {isAdmin && (
          <button
            onClick={handleArchive}
            disabled={archiving}
            className="whitespace-nowrap rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 disabled:opacity-50"
          >
            {archiving ? 'Arşivleniyor...' : 'Arşivle'}
          </button>
        )}
      </div>

      {archiveMsg && (
        <p className="mb-3 rounded-lg bg-neutral-100 px-3 py-2 text-xs font-medium text-neutral-700 print:hidden">
          {archiveMsg}
        </p>
      )}

      {loading && <p className="text-sm text-neutral-500">Yükleniyor...</p>}

      {!loading && entries.length === 0 && (
        <div className="py-10 text-center text-neutral-500">
          <p className="text-sm">Henüz kayıt yok.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {entries.map((e) => {
          const d = new Date(e.created_at);
          const dateStr =
            d.toLocaleDateString('tr-TR') +
            ' ' +
            d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
          const media = e.media_urls || [];
          const isEditing = editingId === e.id;

          if (isEditing && editState) {
            return (
              <div key={e.id} className="rounded-xl border-2 border-blue-400 bg-white p-3">
                {editState.media_urls.length > 0 && (
                  <div className="mb-2 grid grid-cols-2 gap-1">
                    {editState.media_urls.map((url, i) =>
                      isVideoUrl(url) ? (
                        <div key={i} className="relative aspect-square">
                          <video src={url} className="h-full w-full rounded-lg object-cover" muted />
                          <button
                            onClick={() => removeMediaFromEdit(url)}
                            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div key={i} className="relative aspect-square">
                          <img src={url} alt="" className="h-full w-full rounded-lg object-cover" />
                          <button
                            onClick={() => removeMediaFromEdit(url)}
                            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white"
                          >
                            ×
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}
                <label className="mb-1 block text-xs font-medium text-neutral-600">Taşeron firma</label>
                <select
                  value={editState.company}
                  onChange={(ev) => setEditState({ ...editState, company: ev.target.value })}
                  className={editInputCls}
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <label className="mb-1 block text-xs font-medium text-neutral-600">Proje / blok</label>
                <select
                  value={editState.project}
                  onChange={(ev) => setEditState({ ...editState, project: ev.target.value })}
                  className={editInputCls}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <label className="mb-1 block text-xs font-medium text-neutral-600">İmalat kalemi</label>
                <select
                  value={editState.work}
                  onChange={(ev) => setEditState({ ...editState, work: ev.target.value })}
                  className={editInputCls}
                >
                  {WORKS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
                <label className="mb-1 block text-xs font-medium text-neutral-600">Not</label>
                <textarea
                  value={editState.note}
                  onChange={(ev) => setEditState({ ...editState, note: ev.target.value })}
                  rows={2}
                  className={`${editInputCls} resize-y`}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(e.id)}
                    disabled={savingEdit}
                    className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {savingEdit ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex-1 rounded-lg border border-neutral-300 py-2 text-sm font-medium text-neutral-700"
                  >
                    İptal
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div key={e.id} className="rounded-xl border border-neutral-200 bg-white p-3">
              {media.length > 0 && (
                <div className={`mb-2 grid gap-1 ${media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {media.map((url, i) =>
                    isVideoUrl(url) ? (
                      <video key={i} src={url} controls className="aspect-square w-full rounded-lg object-cover" />
                    ) : (
                      <img
                        key={i}
                        src={url}
                        alt=""
                        onClick={() => setLightbox(url)}
                        className="aspect-square w-full cursor-zoom-in rounded-lg object-cover"
                      />
                    )
                  )}
                </div>
              )}
              <div className="mb-1.5 flex flex-wrap gap-1.5">
                {e.company && (
                  <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                    {e.company}
                  </span>
                )}
                <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-800">
                  {e.project}
                </span>
                <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
                  {e.work}
                </span>
                {e.entry_code && (
                  <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
                    Kod: {e.entry_code}
                  </span>
                )}
              </div>
              {e.note && <p className="mb-1.5 text-sm text-neutral-900">{e.note}</p>}
              <p className="mb-2 text-xs text-neutral-500">
                {dateStr}
                {e.gps_lat && e.gps_lng
                  ? ` · ${e.gps_lat.toFixed(4)}, ${e.gps_lng.toFixed(4)}`
                  : ''}
              </p>
              <div className="flex gap-2 print:hidden">
                <button
                  onClick={() => startEdit(e)}
                  className="flex-1 rounded-lg border border-neutral-300 py-1.5 text-xs font-medium text-neutral-700"
                >
                  Düzenle
                </button>
                <button
                  onClick={() => deleteEntry(e.id)}
                  className="flex-1 rounded-lg border border-red-200 py-1.5 text-xs font-medium text-red-600"
                >
                  Sil
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/80 p-4"
        >
          <img src={lightbox} alt="" className="max-h-full max-w-full rounded-lg object-contain" />
        </div>
      )}
    </div>
  );
}
