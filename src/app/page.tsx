'use client';

import { useState } from 'react';
import NewEntryForm from '@/components/NewEntryForm';
import EntriesPanel from '@/components/EntriesPanel';

export default function Home() {
  const [tab, setTab] = useState<'new' | 'panel'>('new');
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className={`mx-auto px-4 py-6 ${tab === 'panel' ? 'max-w-5xl' : 'max-w-md'}`}>
      <h1 className="mb-4 text-lg font-medium text-neutral-900">Şantiye Günlüğü</h1>

      <div className="mb-4 flex gap-2 print:hidden">
        <button
          onClick={() => setTab('new')}
          className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium sm:flex-none sm:px-6 ${
            tab === 'new'
              ? 'border-blue-600 bg-blue-50 text-blue-700'
              : 'border-neutral-300 bg-white text-neutral-700'
          }`}
        >
          Yeni kayıt
        </button>
        <button
          onClick={() => setTab('panel')}
          className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium sm:flex-none sm:px-6 ${
            tab === 'panel'
              ? 'border-blue-600 bg-blue-50 text-blue-700'
              : 'border-neutral-300 bg-white text-neutral-700'
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
