'use client';

import { useState, useEffect } from 'react';
import { findManagerByCode } from '@/lib/managers';

const SESSION_KEY = 'santiye-yetkili-oturum';

export type PanelAuth = {
  role: 'admin' | 'manager' | 'personal';
  code: string;
  project?: string;
};

export default function PanelGate({
  children,
}: {
  children: (auth: PanelAuth) => React.ReactNode;
}) {
  const [auth, setAuth] = useState<PanelAuth | null>(null);
  const [checked, setChecked] = useState(false);
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        setAuth(JSON.parse(saved));
      } catch {
        // yoksay
      }
    }
    setChecked(true);
  }, []);

  async function submit() {
    const trimmed = pw.trim();
    if (trimmed === '') {
      setError(true);
      return;
    }
    setChecking(true);
    setError(false);

    const masterCode = process.env.NEXT_PUBLIC_PANEL_PASSWORD || '';
    let newAuth: PanelAuth;

    if (masterCode !== '' && trimmed === masterCode) {
      newAuth = { role: 'admin', code: trimmed };
    } else {
      const manager = await findManagerByCode(trimmed);
      if (manager) {
        newAuth = { role: 'manager', code: trimmed, project: manager.project };
      } else {
        newAuth = { role: 'personal', code: trimmed };
      }
    }

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(newAuth));
    setAuth(newAuth);
    setChecking(false);
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    setAuth(null);
    setPw('');
  }

  if (!checked) return null;

  if (!auth) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
          Yetkili şifresi veya kişisel kod
        </label>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          className="mb-3 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900"
          placeholder="Şifreyi ya da kodunu gir"
        />
        {error && <p className="mb-3 text-sm text-red-600">Bir şey gir.</p>}
        <button
          onClick={submit}
          disabled={checking}
          className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {checking ? 'Kontrol ediliyor...' : 'Giriş yap'}
        </button>
      </div>
    );
  }

  const roleLabel =
    auth.role === 'admin'
      ? 'Yetkili girişi (tüm kayıtlar)'
      : auth.role === 'manager'
      ? `Proje yetkilisi: ${auth.project} (sadece bu projenin kayıtları)`
      : `Kişisel kod: ${auth.code} (sadece kendi kayıtların)`;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between print:hidden">
        <span className="text-xs text-neutral-500">{roleLabel}</span>
        <button onClick={logout} className="text-xs font-medium text-blue-700">
          Çıkış yap
        </button>
      </div>
      {children(auth)}
    </div>
  );
}
