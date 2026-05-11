'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, LogOut, ReceiptText, ScrollText, UserRound } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const tenantNavItems = [
  { label: 'Dashboard', href: '/tenant/dashboard', icon: LayoutDashboard },
  { label: 'Tagihan', href: '/tenant/tagihan', icon: ReceiptText },
  { label: 'Riwayat', href: '/tenant/riwayat', icon: ScrollText },
  { label: 'Profil', href: '/tenant/profil', icon: UserRound },
];

export default function TenantSidebar() {
  const pathname = usePathname();
  const { logout, isLoading } = useAuth();

  return (
    <aside
      className="hidden lg:flex fixed left-0 w-64 flex-col border-r border-slate-100 bg-slate-50 px-4 py-6"
      style={{
        top: '72px',
        height: 'calc(100vh - 72px)',
        zIndex: 30,
      }}
    >
      <nav className="flex flex-col gap-2">
        {tenantNavItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${
                active
                  ? 'bg-green-50 font-bold text-green-700'
                  : 'font-medium text-slate-500 hover:bg-slate-100 hover:text-green-700'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-200 pt-4">
        <button
          type="button"
          disabled={isLoading}
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
