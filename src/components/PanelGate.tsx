'use client';

import { useState, useEffect } from 'react';

const SESSION_KEY = 'santiye-yetkili-oturum';

export default function PanelGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [checked, setChecked] = useState(false);
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved === 'ok') setUnlocked(true);
    setChecked(true);
  }, []);

  function submit() {
    const correctPw = process.env.NEXT_PUBLIC_PANEL_PASSWORD || '';
    if (pw === correctPw && correctPw !== '') {
      sessionStorage.setItem(SESSION_KEY, 'ok');
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  }

  if (!checked) return null;

  if (!unlocked) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
          Yetkili şifresi
        </label>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          className="mb-3 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900"
          placeholder="Şifreyi gir"
        />
        {error && <p className="mb-3 text-sm text-red-600">Şifre yanlış.</p>}
        <button
          onClick={submit}
          className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white"
        >
          Giriş yap
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
