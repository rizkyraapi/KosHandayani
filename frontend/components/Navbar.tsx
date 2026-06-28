'use client';

import { ChevronDown, LayoutDashboard, LogOut, Menu, UserCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getRedirectPathForRole } from '@/lib/auth';
import LanguageSwitcher from './LanguageSwitcher';
import MobileNavigationDrawer from './navigation/MobileNavigationDrawer';
import {
  isActiveNavItem,
  publicNavItems,
  tenantNavItems,
} from './navigation/menuItems';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();
  const { t } = useLanguage();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const isTenantArea = pathname.startsWith('/tenant');
  const mobileItems = isTenantArea ? tenantNavItems : publicNavItems;
  const mobileBreakpointClass = isTenantArea ? 'lg:hidden' : 'md:hidden';
  const desktopBreakpointClass = isTenantArea ? 'hidden lg:flex' : 'hidden md:flex';
  const accountBreakpointClass = isTenantArea ? 'hidden lg:flex' : 'hidden md:flex';
  const dashboardHref = user ? getRedirectPathForRole(user.role) : '/login';

  async function handleLogout() {
    setProfileOpen(false);
    setMobileDrawerOpen(false);
    await logout();
  }

  return (
    <>
      <nav
        className="w-full fixed top-0 left-0 right-0 z-50"
        style={{
          backgroundColor: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0px 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 md:px-8 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="shrink-0" aria-label="Kos Handayani Beranda">
            <Image
              src="/KosHandayani_Logo.png"
              alt="Kos Handayani"
              width={164}
              height={40}
              priority
              style={{ width: '164px', height: 'auto', objectFit: 'contain' }}
            />
          </Link>
        </div>

        <div className={`${desktopBreakpointClass} items-center gap-8`}>
          {publicNavItems.map((link) => {
            const isActive = isActiveNavItem(pathname, link);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-start border-b-2 tracking-[-0.4px] leading-6 transition-colors ${
                  isActive
                    ? 'border-green-600 font-bold text-green-700'
                    : 'border-transparent font-medium text-slate-600 hover:text-green-600'
                }`}
                onClick={() => setMobileDrawerOpen(false)}
              >
                {t(link.labelKey)}
              </Link>
            );
          })}
        </div>

        {user ? (
          <div
            className={`${accountBreakpointClass} relative items-center gap-3`}
          >
            <LanguageSwitcher compact />
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-green-50 hover:text-green-700 transition-colors"
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              onClick={() => setProfileOpen((open) => !open)}
            >
              <UserCircle size={28} />
              <span className="max-w-36 truncate font-semibold text-sm">{user.full_name || user.email}</span>
              <ChevronDown size={16} />
            </button>

            {profileOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-64 rounded-lg bg-white border border-slate-100 shadow-xl py-2 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-bold text-slate-800 truncate">{user.full_name || 'Pengguna'}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
                <Link
                  href={dashboardHref}
                  role="menuitem"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-green-50 hover:text-green-700 transition-colors"
                  onClick={() => setProfileOpen(false)}
                >
                  <LayoutDashboard size={18} />
                  {t('common.dashboard')}
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  disabled={isLoading}
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LogOut size={18} />
                  {t('common.logout')}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className={`${accountBreakpointClass} items-center gap-4`}>
            <Link
              href="/login"
              className="px-5 py-2 font-medium text-slate-600 text-base tracking-[-0.4px] hover:text-green-600 transition-colors"
            >
              {t('common.login')}
            </Link>
            <Link
              href="/register"
              className="px-6 py-2 rounded-lg text-white text-base tracking-[-0.4px] font-semibold border-0 shadow-md transition-opacity hover:opacity-90"
              style={{
                background: 'linear-gradient(90deg, rgba(0,110,47,1) 0%, rgba(34,197,94,1) 100%)',
              }}
            >
              {t('common.register')}
            </Link>
            <LanguageSwitcher compact />
          </div>
        )}

        <button
          type="button"
          className={`${mobileBreakpointClass} rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100`}
          aria-label={mobileDrawerOpen ? t('nav.closeMenu') : t('nav.openMenu')}
          aria-expanded={mobileDrawerOpen}
          aria-controls="mobile-navigation-drawer"
          onClick={() => setMobileDrawerOpen((open) => !open)}
        >
          <Menu size={22} />
        </button>
        </div>
      </nav>
      <MobileNavigationDrawer
        id="mobile-navigation-drawer"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        items={mobileItems}
        user={user}
        onLogout={isTenantArea || user ? handleLogout : undefined}
        isLoggingOut={isLoading}
        dashboardHref={dashboardHref}
        showAuthActions={!isTenantArea}
        hideAt={isTenantArea ? 'lg' : 'md'}
      />
      <div aria-hidden="true" className="h-[72px] shrink-0" />
    </>
  );
}
