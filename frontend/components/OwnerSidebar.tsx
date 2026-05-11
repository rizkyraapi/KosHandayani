'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  BedDouble,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  UsersRound,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ownerNavItems = [
  { label: 'Dashboard', href: '/owner/dashboard', icon: LayoutDashboard },
  { label: 'Data Kamar', href: '/owner/rooms', icon: BedDouble },
  { label: 'Data Penyewa', href: '/owner/tenants', icon: UsersRound },
  { label: 'Tagihan', href: '/owner/payments', icon: ReceiptText },
  { label: 'Laporan', href: '/owner/reports', icon: BarChart3 },
];

function isActivePath(pathname: string, href: string) {
  if (href === '/owner/dashboard') {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function OwnerSidebar() {
  const pathname = usePathname();
  const { logout, isLoading } = useAuth();

  return (
    <aside
      className="owner-sidebar"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: 256,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8fafc',
        borderRight: '1px solid #e2e8f0',
        padding: 16,
        zIndex: 40,
        overflow: 'hidden',
      }}
    >
      <Link
        href="/owner/dashboard"
        aria-label="Owner Dashboard"
        style={{
          display: 'block',
          marginBottom: 28,
          padding: '0 4px',
          width: '100%',
        }}
      >
        <Image
          src="/KosHandayani_Logo.png"
          alt="KosHandayani"
          width={192}
          height={64}
          priority
          style={{
            width: 192,
            maxWidth: '100%',
            height: 'auto',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </Link>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {ownerNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                borderRadius: 10,
                padding: '11px 12px',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: active ? 700 : 500,
                color: active ? '#006e2f' : '#64748b',
                backgroundColor: active ? '#dcfce7' : 'transparent',
                transition: 'background 0.15s, color 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={20} style={{ flexShrink: 0 }} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
        <button
          type="button"
          disabled={isLoading}
          onClick={logout}
          style={{
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            gap: 12,
            borderRadius: 10,
            border: 'none',
            background: 'transparent',
            padding: '11px 12px',
            color: '#dc2626',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: 14,
            fontWeight: 700,
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          <LogOut size={20} style={{ flexShrink: 0 }} />
          Logout
        </button>
      </div>
    </aside>
  );
}
