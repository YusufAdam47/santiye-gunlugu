'use client';

import { useState, useEffect } from 'react';
import { supabase, Entry, isVideoUrl } from '@/lib/supabase';
import { COMPANIES, PROJECTS } from '@/lib/constants';

const selectCls = 'rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 bg-white';

export default function EntriesPanel({ refreshKey }: { refreshKey: number }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [companyFilter, setCompanyFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      let query = supabase.from('entries').select('*').order('created_at', { ascending: false });
      if (companyFilter) query = query.eq('company', companyFilter);
      if (projectFilter) query = query.eq('project', projectFilter);
      const { data, error } = await query;
      if (!error && data) setEntries(data as Entry[]);
      setLoading(false);
    }
    load();
  }, [companyFilter, projectFilter, refreshKey]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2 print:hidden">
        <select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className={`flex-1 ${selectCls}`}
        >
          <option value="">Tüm firmalar</option>
          {COMPANIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className={`flex-1 ${selectCls}`}
        >
          <option value="">Tüm bloklar</option>
          {PROJECTS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <button
          onClick={() => window.print()}
          className="whitespace-nowrap rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-900"
        >
          Rapor
        </button>
      </div>

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
          return (
            <div key={e.id} className="rounded-xl border border-neutral-200 bg-white p-3">
              {media.length > 0 && (
                <div className={`mb-2 grid gap-1 ${media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {media.map((url, i) =>
                    isVideoUrl(url) ? (
                      <video key={i} src={url} controls className="aspect-square w-full rounded-lg object-cover" />
                    ) : (
                      <img key={i} src={url} alt="" className="aspect-square w-full rounded-lg object-cover" />
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
              </div>
              {e.note && <p className="mb-1.5 text-sm text-neutral-900">{e.note}</p>}
              <p className="text-xs text-neutral-500">
                {dateStr}
                {e.gps_lat && e.gps_lng
                  ? ` · ${e.gps_lat.toFixed(4)}, ${e.gps_lng.toFixed(4)}`
                  : ''}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
