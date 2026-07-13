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
import { Manager, fetchManagers, addManager, deleteManager } from '@/lib/managers';
import {
  Category,
  fetchCategoriesWithItems,
  addCategory,
  deleteCategory,
  addCategoryItem,
  deleteCategoryItem,
} from '@/lib/customCategories';

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

function ManagerList({ projects }: { projects: Option[] }) {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [newCode, setNewCode] = useState('');
  const [newProject, setNewProject] = useState('');
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setManagers(await fetchManagers());
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!newProject && projects.length > 0) setNewProject(projects[0].name);
  }, [projects, newProject]);

  async function handleAdd() {
    if (!newCode.trim() || !newProject) return;
    setBusy(true);
    setError(null);
    try {
      const { error: err } = await addManager(newCode, newProject, newName);
      if (err) throw new Error(err.message);
      setNewCode('');
      setNewName('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eklenemedi (bu kod zaten kullanılıyor olabilir).');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu yetkiliyi silmek istediğine emin misin?')) return;
    setBusy(true);
    await deleteManager(id);
    await load();
    setBusy(false);
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <h3 className="mb-2 text-sm font-medium text-neutral-700">
        Proje Yetkilileri (sadece atandığı projeyi görür)
      </h3>
      <div className="mb-3 space-y-1.5">
        {managers.length === 0 && <p className="text-xs text-neutral-400">Henüz yetkili yok.</p>}
        {managers.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between rounded bg-neutral-100 px-3 py-1.5 text-xs"
          >
            <span className="font-medium text-neutral-700">
              Kod: {m.code} → {m.project} {m.name ? `(${m.name})` : ''}
            </span>
            <button
              onClick={() => handleDelete(m.id)}
              disabled={busy}
              className="text-neutral-400 hover:text-red-600"
              aria-label="Yetkiliyi sil"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          value={newCode}
          onChange={(e) => setNewCode(e.target.value)}
          placeholder="Yetkili kodu (örn: 5551)"
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900"
        />
        <select
          value={newProject}
          onChange={(e) => setNewProject(e.target.value)}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="İsim (opsiyonel)"
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

function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [newItemNames, setNewItemNames] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setCategories(await fetchCategoriesWithItems());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAddCategory() {
    if (!newCategoryLabel.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const { error: err } = await addCategory(newCategoryLabel);
      if (err) throw new Error(err.message);
      setNewCategoryLabel('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eklenemedi (aynı isim zaten var olabilir).');
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm('Bu kategoriyi ve içindeki tüm seçenekleri silmek istediğine emin misin?')) return;
    setBusy(true);
    await deleteCategory(id);
    await load();
    setBusy(false);
  }

  async function handleAddItem(categoryId: string) {
    const name = newItemNames[categoryId];
    if (!name || !name.trim()) return;
    setBusy(true);
    await addCategoryItem(categoryId, name);
    setNewItemNames({ ...newItemNames, [categoryId]: '' });
    await load();
    setBusy(false);
  }

  async function handleDeleteItem(id: string) {
    setBusy(true);
    await deleteCategoryItem(id);
    await load();
    setBusy(false);
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <h3 className="mb-2 text-sm font-medium text-neutral-700">
        Özel Kategoriler (Ekipman, Ekip vb.)
      </h3>
      <div className="mb-4 space-y-3">
        {categories.map((cat) => (
          <div key={cat.id} className="rounded-lg border border-neutral-200 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-800">{cat.label}</span>
              <button
                onClick={() => handleDeleteCategory(cat.id)}
                disabled={busy}
                className="text-xs font-medium text-red-600"
              >
                Kategoriyi Sil
              </button>
            </div>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {cat.items.length === 0 && <p className="text-xs text-neutral-400">Henüz seçenek yok.</p>}
              {cat.items.map((item) => (
                <span
                  key={item.id}
                  className="flex items-center gap-1.5 rounded bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700"
                >
                  {item.name}
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    disabled={busy}
                    className="text-neutral-400 hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newItemNames[cat.id] || ''}
                onChange={(e) => setNewItemNames({ ...newItemNames, [cat.id]: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem(cat.id)}
                placeholder={`Yeni ${cat.label.toLowerCase()} seçeneği`}
                className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900"
              />
              <button
                onClick={() => handleAddItem(cat.id)}
                disabled={busy}
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700"
              >
                Ekle
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 border-t border-neutral-200 pt-3">
        <input
          type="text"
          value={newCategoryLabel}
          onChange={(e) => setNewCategoryLabel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
          placeholder="Yeni kategori adı (örn: Ekipman)"
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900"
        />
        <button
          onClick={handleAddCategory}
          disabled={busy}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Yeni Kategori Ekle
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
        {open ? 'Yönetimi Kapat' : 'Firma / Proje / Yetkili Yönetimi'}
      </button>
      {open && (
        <div className="space-y-3">
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
          <ManagerList projects={projects} />
          <CategoryManager />
        </div>
      )}
    </div>
  );
}
