'use client';

import { useState, useEffect } from 'react';
import { supabase, Entry } from '@/lib/supabase';

const PROJECTS = ['B-Blok', 'A-Blok', 'TBM Girişi', 'NATM Kesimi', 'Portal'];

export default function EntriesPanel({ refreshKey }: { refreshKey: number }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      let query = supabase.from('entries').select('*').order('created_at', { ascending: false });
      if (filter) query = query.eq('project', filter);
      const { data, error } = await query;
      if (!error && data) setEntries(data as Entry[]);
      setLoading(false);
    }
    load();
  }, [filter, refreshKey]);

  return (
    <div>
      <div className="mb-3 flex gap-2 print:hidden">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm"
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
          className="whitespace-nowrap rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium"
        >
          Rapor
        </button>
      </div>

      {loading && <p className="text-sm text-neutral-400">Yükleniyor...</p>}

      {!loading && entries.length === 0 && (
        <div className="py-10 text-center text-neutral-400">
          <p className="text-sm">Henüz kayıt yok.</p>
        </div>
      )}

      <div className="space-y-3">
        {entries.map((e) => {
          const d = new Date(e.created_at);
          const dateStr =
            d.toLocaleDateString('tr-TR') +
            ' ' +
            d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
          return (
            <div key={e.id} className="rounded-xl border border-neutral-200 bg-white p-3">
              {e.photo_url && (
                <img src={e.photo_url} alt="" className="mb-2 w-full rounded-lg" />
              )}
              <div className="mb-1.5 flex flex-wrap gap-1.5">
                <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                  {e.project}
                </span>
                <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                  {e.work}
                </span>
              </div>
              {e.note && <p className="mb-1.5 text-sm text-neutral-800">{e.note}</p>}
              <p className="text-xs text-neutral-400">
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
