'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { AuthUser } from '@/lib/auth';
import LanguageSwitcher from '../LanguageSwitcher';
import { type AppNavItem, isActiveNavItem } from './menuItems';

type DrawerBreakpoint = 'md' | 'lg';

type MobileNavigationDrawerProps = {
  id: string;
  open: boolean;
  onClose: () => void;
  items: AppNavItem[];
  user: AuthUser | null;
  onLogout?: () => Promise<void>;
  isLoggingOut?: boolean;
  dashboardHref?: string;
  showAuthActions?: boolean;
  hideAt?: DrawerBreakpoint;
};

function getFocusableElements(container: HTMLElement | null) {
  if (!container) return [];

  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => {
    const style = window.getComputedStyle(element);

    return style.display !== 'none' && style.visibility !== 'hidden';
  });
}

export default function MobileNavigationDrawer({
  id,
  open,
  onClose,
  items,
  user,
  onLogout,
  isLoggingOut = false,
  dashboardHref,
  showAuthActions = false,
  hideAt = 'lg',
}: MobileNavigationDrawerProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const drawerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const responsiveClass = hideAt === 'md' ? 'md:hidden' : 'lg:hidden';

  useEffect(() => {
    if (!open) return undefined;

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const animationFrame = window.requestAnimationFrame(() => {
      const focusableElements = getFocusableElements(drawerRef.current);
      (focusableElements[0] ?? drawerRef.current)?.focus();
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements(drawerRef.current);
      if (focusableElements.length === 0) {
        event.preventDefault();
        drawerRef.current?.focus();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [onClose, open]);

  async function handleLogout() {
    onClose();
    await onLogout?.();
  }

  return (
    <div
      className={`fixed inset-0 z-[80] ${responsiveClass} ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
      inert={!open}
    >
      <div
        className={`absolute inset-0 bg-slate-950/45 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onMouseDown={onClose}
      />

      <aside
        id={id}
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('nav.mobileNavigation')}
        tabIndex={-1}
        className={`relative flex h-[100dvh] w-[min(88vw,22rem)] flex-col overflow-y-auto border-r border-slate-200 bg-white px-4 py-5 shadow-2xl outline-none transition-transform duration-300 ease-out ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ paddingTop: 'max(1.25rem, env(safe-area-inset-top))' }}
      >
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link href="/" className="shrink-0" aria-label="KosHandayani" onClick={onClose}>
            <Image
              src="/KosHandayani_Logo.png"
              alt="KosHandayani"
              width={150}
              height={44}
              priority
              className="h-auto w-[150px]"
            />
          </Link>
          <button
            type="button"
            className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            aria-label={t('nav.closeMenu')}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1" aria-label={t('nav.mobileNavigation')}>
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActiveNavItem(pathname, item);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors ${
                  active
                    ? 'bg-green-50 font-extrabold text-green-700 shadow-sm'
                    : 'font-semibold text-slate-600 hover:bg-slate-50 hover:text-green-700'
                }`}
                aria-current={active ? 'page' : undefined}
                onClick={onClose}
              >
                <Icon size={19} className="shrink-0" />
                <span className="truncate">{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <div className="mb-3">
            <LanguageSwitcher compact />
          </div>

          {showAuthActions && !user && (
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/login"
                className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-bold text-slate-600"
                onClick={onClose}
              >
                {t('common.login')}
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-[#006e2f] px-4 py-3 text-center text-sm font-bold text-white"
                onClick={onClose}
              >
                {t('common.register')}
              </Link>
            </div>
          )}

          {showAuthActions && user && dashboardHref && (
            <Link
              href={dashboardHref}
              className="mb-3 flex items-center justify-center rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-extrabold text-green-700"
              onClick={onClose}
            >
              {t('common.dashboard')}
            </Link>
          )}

          {onLogout && (
            <button
              type="button"
              disabled={isLoggingOut}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 px-4 py-3 text-sm font-extrabold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => void handleLogout()}
            >
              <LogOut size={18} />
              {t('common.logout')}
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
