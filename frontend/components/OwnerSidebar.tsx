'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import MobileNavigationDrawer from './navigation/MobileNavigationDrawer';
import { isActiveNavItem, ownerNavItems } from './navigation/menuItems';

export default function OwnerSidebar() {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();
  const { t } = useLanguage();
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function handleLogout() {
    setDrawerOpen(false);
    await logout();
  }

  return (
    <>
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
          fontFamily: 'var(--font-manrope), Manrope, sans-serif',
        }}
      >
      <Link
        href="/owner/dashboard"
        aria-label={t('common.ownerDashboard')}
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
          const active = isActiveNavItem(pathname, item);

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
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
        <div style={{ marginBottom: 12 }}>
          <LanguageSwitcher compact />
        </div>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => void handleLogout()}
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
          {t('common.logout')}
        </button>
      </div>
      </aside>

      <header className="owner-mobile-header fixed inset-x-0 top-0 z-40 flex h-[72px] items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden">
        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
          aria-label={drawerOpen ? t('nav.closeMenu') : t('nav.openMenu')}
          aria-expanded={drawerOpen}
          aria-controls="owner-mobile-navigation-drawer"
          onClick={() => setDrawerOpen((open) => !open)}
        >
          <Menu size={22} />
        </button>
        <Link href="/owner/dashboard" className="flex shrink-0 items-center gap-3">
          <Image
            src="/KosHandayani_Logo.png"
            alt="KosHandayani"
            width={132}
            height={42}
            style={{ width: 132, height: 'auto' }}
          />
        </Link>
      </header>

      <MobileNavigationDrawer
        id="owner-mobile-navigation-drawer"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        items={ownerNavItems}
        user={user}
        onLogout={handleLogout}
        isLoggingOut={isLoading}
        hideAt="lg"
      />
    </>
  );
}
