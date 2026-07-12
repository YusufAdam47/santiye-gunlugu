'use client';

import { useState } from 'react';
import Nav from '@/components/Nav';
import EntriesPanel from '@/components/EntriesPanel';
import PanelGate from '@/components/PanelGate';

export default function PanelPage() {
  const [refreshKey] = useState(0);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-4 text-lg font-medium text-neutral-900">Şantiye Günlüğü</h1>
      <Nav />
      <PanelGate>
        {(auth) => <EntriesPanel refreshKey={refreshKey} isAdmin={auth.isAdmin} code={auth.code} />}
      </PanelGate>
    </main>
  );
}
