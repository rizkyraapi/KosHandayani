'use client';

import {
  BarChart3,
  BedDouble,
  ClipboardList,
  CircleHelp,
  Home,
  LayoutDashboard,
  ReceiptText,
  ScrollText,
  UserRound,
  UsersRound,
  WalletCards,
  type LucideIcon,
} from 'lucide-react';

export type AppNavItem = {
  labelKey: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
};

export const publicNavItems: AppNavItem[] = [
  { labelKey: 'common.home', href: '/', icon: Home, exact: true },
  { labelKey: 'common.allRooms', href: '/rooms', icon: BedDouble },
  { labelKey: 'common.help', href: '/#bantuan', icon: CircleHelp },
];

export const tenantNavItems: AppNavItem[] = [
  { labelKey: 'common.dashboard', href: '/tenant/dashboard', icon: LayoutDashboard, exact: true },
  { labelKey: 'tenant.nav.applyRental', href: '/tenant/rental-applications', icon: ClipboardList },
  { labelKey: 'common.bill', href: '/tenant/tagihan', icon: ReceiptText },
  { labelKey: 'common.history', href: '/tenant/riwayat', icon: ScrollText },
  { labelKey: 'common.profile', href: '/tenant/profil', icon: UserRound },
];

export const ownerNavItems: AppNavItem[] = [
  { labelKey: 'common.dashboard', href: '/owner/dashboard', icon: LayoutDashboard, exact: true },
  { labelKey: 'nav.ownerRooms', href: '/owner/rooms', icon: BedDouble },
  { labelKey: 'common.rentalApplications', href: '/owner/rental-applications', icon: ClipboardList },
  { labelKey: 'common.activeTenants', href: '/owner/tenants', icon: UsersRound },
  { labelKey: 'common.payments', href: '/owner/payments', icon: ReceiptText },
  { labelKey: 'common.expenses', href: '/owner/expenses', icon: WalletCards },
  { labelKey: 'common.reports', href: '/owner/reports', icon: BarChart3 },
];

export function isActiveNavItem(pathname: string, item: Pick<AppNavItem, 'href' | 'exact'>) {
  if (item.href.includes('#')) {
    return false;
  }

  const hrefPath = item.href.split('#')[0] || '/';

  if (item.exact || hrefPath === '/') {
    return pathname === hrefPath;
  }

  return pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);
}

export function findActiveNavItem(pathname: string, items: AppNavItem[]) {
  return items.find((item) => isActiveNavItem(pathname, item)) ?? null;
}
