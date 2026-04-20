'use client';

import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav
      className="w-full sticky top-0 z-50"
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

        <div className="hidden md:flex items-center gap-4">
          <a
            href="#login"
            className="px-5 py-2 font-medium text-slate-600 text-base tracking-[-0.4px] hover:text-green-600 transition-colors"
          >
            Login
          </a>
          <a
            href="#daftar"
            className="px-6 py-2 rounded-lg text-white text-base tracking-[-0.4px] font-semibold border-0 shadow-md transition-opacity hover:opacity-90"
            style={{
              background: 'linear-gradient(90deg, rgba(0,110,47,1) 0%, rgba(34,197,94,1) 100%)',
            }}
          >
            Daftar
          </a>
        </div>

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

          <div className="flex gap-3 pt-2">
            <a
              href="#login"
              className="flex-1 py-2 text-center font-medium text-slate-600 border border-slate-200 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </a>
            <a
              href="#daftar"
              className="flex-1 py-2 text-center rounded-lg text-white font-semibold border-0"
              style={{
                background:
                  'linear-gradient(90deg, rgba(0,110,47,1) 0%, rgba(34,197,94,1) 100%)',
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Daftar
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
