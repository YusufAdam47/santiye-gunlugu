'use client';

import { useState } from 'react';
import NewEntryForm from '@/components/NewEntryForm';
import EntriesPanel from '@/components/EntriesPanel';

export default function Home() {
  const [tab, setTab] = useState<'new' | 'panel'>('new');
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <h1 className="mb-4 text-lg font-medium text-neutral-900">Şantiye Günlüğü</h1>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setTab('new')}
          className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
            tab === 'new'
              ? 'border-blue-600 bg-blue-50 text-blue-700'
              : 'border-neutral-200 bg-white text-neutral-600'
          }`}
        >
          Yeni kayıt
        </button>
        <button
          onClick={() => setTab('panel')}
          className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
            tab === 'panel'
              ? 'border-blue-600 bg-blue-50 text-blue-700'
              : 'border-neutral-200 bg-white text-neutral-600'
          }`}
        >
          Panel
        </button>
      </div>

      {tab === 'new' ? (
        <NewEntryForm
          onSaved={() => {
            setRefreshKey((k) => k + 1);
            setTab('panel');
          }}
        />
      ) : (
        <EntriesPanel refreshKey={refreshKey} />
      )}
    </main>
  );
}
