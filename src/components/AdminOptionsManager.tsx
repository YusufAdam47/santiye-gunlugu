'use client';

import { useState, useEffect } from 'react';
import {
  Option,
  fetchCompanies,
  fetchProjects,
  addCompany,
  addProject,
  deleteCompany,
  deleteProject,
} from '@/lib/options';

function OptionList({
  title,
  items,
  onAdd,
  onDelete,
  placeholder,
}: {
  title: string;
  items: Option[];
  onAdd: (name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  placeholder: string;
}) {
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    if (!newName.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await onAdd(newName.trim());
      setNewName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eklenemedi (aynı isim zaten var olabilir).');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu seçeneği silmek istediğine emin misin? Geçmiş kayıtlar etkilenmez.')) return;
    setBusy(true);
    try {
      await onDelete(id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <h3 className="mb-2 text-sm font-medium text-neutral-700">{title}</h3>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {items.length === 0 && <p className="text-xs text-neutral-400">Henüz seçenek yok.</p>}
        {items.map((item) => (
          <span
            key={item.id}
            className="flex items-center gap-1.5 rounded bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700"
          >
            {item.name}
            <button
              onClick={() => handleDelete(item.id)}
              disabled={busy}
              className="text-neutral-400 hover:text-red-600"
              aria-label={`${item.name} sil`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900"
        />
        <button
          onClick={handleAdd}
          disabled={busy}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Ekle
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function AdminOptionsManager() {
  const [companies, setCompanies] = useState<Option[]>([]);
  const [projects, setProjects] = useState<Option[]>([]);
  const [open, setOpen] = useState(false);

  async function loadAll() {
    const [c, p] = await Promise.all([fetchCompanies(), fetchProjects()]);
    setCompanies(c);
    setProjects(p);
  }

  useEffect(() => {
    if (open) loadAll();
  }, [open]);

  return (
    <div className="mb-4 print:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="mb-2 text-sm font-medium text-blue-700"
      >
        {open ? 'Firma / Proje Yönetimini Kapat' : 'Firma / Proje Yönetimi'}
      </button>
      {open && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <OptionList
            title="Taşeron Firmalar"
            items={companies}
            placeholder="Yeni firma adı"
            onAdd={async (name) => {
              const { error } = await addCompany(name);
              if (error) throw new Error(error.message);
              await loadAll();
            }}
            onDelete={async (id) => {
              await deleteCompany(id);
              await loadAll();
            }}
          />
          <OptionList
            title="Proje / Blok"
            items={projects}
            placeholder="Yeni blok adı"
            onAdd={async (name) => {
              const { error } = await addProject(name);
              if (error) throw new Error(error.message);
              await loadAll();
            }}
            onDelete={async (id) => {
              await deleteProject(id);
              await loadAll();
            }}
          />
        </div>
      )}
    </div>
  );
}
