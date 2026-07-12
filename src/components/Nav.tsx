'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Nav() {
  const pathname = usePathname();
  const onPanel = pathname === '/panel';

  return (
    <div className="mb-4 flex gap-2 print:hidden">
      <Link
        href="/"
        className={`flex-1 rounded-lg border px-3 py-2 text-center text-sm font-medium sm:flex-none sm:px-6 ${
          !onPanel
            ? 'border-blue-600 bg-blue-50 text-blue-700'
            : 'border-neutral-300 bg-white text-neutral-700'
        }`}
      >
        Yeni kayıt
      </Link>
      <Link
        href="/panel"
        className={`flex-1 rounded-lg border px-3 py-2 text-center text-sm font-medium sm:flex-none sm:px-6 ${
          onPanel
            ? 'border-blue-600 bg-blue-50 text-blue-700'
            : 'border-neutral-300 bg-white text-neutral-700'
        }`}
      >
        Panel
      </Link>
    </div>
  );
}
