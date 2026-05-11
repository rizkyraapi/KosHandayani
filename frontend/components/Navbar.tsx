'use client';

import { ChevronDown, LayoutDashboard, LogOut, Menu, UserCircle, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getRedirectPathForRole } from '@/lib/auth';

const navLinks = [
  { label: 'Beranda', href: '/' },
  { label: 'Semua Kamar', href: '/rooms' },
  { label: 'Bantuan', href: '/#bantuan' },
];

function isActiveLink(pathname: string, href: string) {
  if (href === '/') {
    return pathname === '/';
  }

  return pathname.startsWith(href);
}

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dashboardHref = user ? getRedirectPathForRole(user.role) : '/login';

  async function handleLogout() {
    setProfileOpen(false);
    setMobileMenuOpen(false);
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

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = isActiveLink(pathname, link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-start border-b-2 tracking-[-0.4px] leading-6 transition-colors ${
                  isActive
                    ? 'border-green-600 font-bold text-green-700'
                    : 'border-transparent font-medium text-slate-600 hover:text-green-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {user ? (
          <div
            className="hidden md:block relative"
            onMouseEnter={() => setProfileOpen(true)}
            onMouseLeave={() => setProfileOpen(false)}
          >
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
                  Dashboard
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  disabled={isLoading}
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="px-5 py-2 font-medium text-slate-600 text-base tracking-[-0.4px] hover:text-green-600 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-6 py-2 rounded-lg text-white text-base tracking-[-0.4px] font-semibold border-0 shadow-md transition-opacity hover:opacity-90"
              style={{
                background: 'linear-gradient(90deg, rgba(0,110,47,1) 0%, rgba(34,197,94,1) 100%)',
              }}
            >
              Daftar
            </Link>
          </div>
        )}

        <button
          type="button"
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 sm:px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => {
            const isActive = isActiveLink(pathname, link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-base transition-colors ${
                  isActive ? 'text-green-700 font-bold' : 'text-slate-600 font-medium'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}

          {user ? (
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center gap-3 px-1 pb-3">
                <UserCircle size={30} className="text-green-700" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{user.full_name || 'Pengguna'}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link
                  href={dashboardHref}
                  className="flex-1 py-2 text-center font-medium text-slate-600 border border-slate-200 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleLogout}
                  className="flex-1 py-2 text-center font-semibold text-red-600 border border-red-100 rounded-lg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link
                href="/login"
                className="flex-1 py-2 text-center font-medium text-slate-600 border border-slate-200 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="flex-1 py-2 text-center rounded-lg text-white font-semibold border-0"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(0,110,47,1) 0%, rgba(34,197,94,1) 100%)',
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Daftar
              </Link>
            </div>
          )}
          </div>
        )}
      </nav>
      <div aria-hidden="true" className="h-[72px] shrink-0" />
    </>
  );
}
