'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  downloadPaymentReceipt,
  getMyPayments,
  getMyRentalApplications,
  type Payment,
  type RentalApplication,
} from '@/lib/api';
import type { AuthUser } from '@/lib/auth';
import {
  getPaymentMetaFromApplication,
  getPaymentMetaFromPayment,
  getPaymentStatusMetaFromKey,
  type PaymentStatusKey,
} from '@/lib/paymentStatus';
import { getDurationInMonths, getRentalPaymentBreakdown } from '@/lib/rental-payment';

/* ─────────────────────────────────────────────
   INJECT FONTS & MATERIAL SYMBOLS
───────────────────────────────────────────── */
/* ─────────────────────────────────────────────
   INLINE STYLES (Material Symbols + glass-effect)
───────────────────────────────────────────── */
const inlineCSS = `
  *, *::before, *::after { box-sizing: border-box; }

  body { font-family: var(--font-manrope), Manrope, sans-serif; margin: 0; }

  .font-headline { font-family: var(--font-manrope), Manrope, sans-serif; }

  .material-symbols-outlined {
    font-family: 'Material Symbols Outlined';
    font-weight: normal;
    font-style: normal;
    font-size: 24px;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-smoothing: antialiased;
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    user-select: none;
  }

  .glass-effect {
    background: rgba(255,255,255,0.18);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.1);
  }

  /* custom scrollbar */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #bccbb9; border-radius: 9999px; }
`;

/* ─────────────────────────────────────────────
   TAILWIND CUSTOM COLOR TOKENS (CSS vars inline)
   We apply them via inline style objects since
   Tailwind JIT won't pick up dynamic class names.
   All semantic colour classes still work because
   we keep tailwind.config.js updated, but for
   self-contained usage in this file we also map
   the tokens as CSS custom properties injected
   into :root.
───────────────────────────────────────────── */
const cssVarsCSS = `
  :root {
    --color-on-primary: #ffffff;
    --color-primary-fixed: #6bff8f;
    --color-outline: #6d7b6c;
    --color-on-surface: #111c2d;
    --color-inverse-primary: #4ae176;
    --color-secondary-container: #afefb4;
    --color-tertiary: #9e4036;
    --color-tertiary-fixed: #ffdad5;
    --color-surface: #f9f9ff;
    --color-on-secondary-fixed-variant: #145126;
    --color-on-primary-fixed: #002109;
    --color-error-container: #ffdad6;
    --color-on-tertiary-fixed: #410001;
    --color-surface-container-low: #f0f3ff;
    --color-primary-fixed-dim: #4ae176;
    --color-surface-variant: #d8e3fb;
    --color-tertiary-fixed-dim: #ffb4a9;
    --color-outline-variant: #bccbb9;
    --color-secondary-fixed-dim: #96d59d;
    --color-on-primary-container: #004b1e;
    --color-secondary: #2f6a3c;
    --color-surface-container-highest: #d8e3fb;
    --color-primary: #006e2f;
    --color-tertiary-container: #ff8b7c;
    --color-on-tertiary-fixed-variant: #7f2a21;
    --color-on-surface-variant: #3d4a3d;
    --color-primary-container: #22c55e;
    --color-on-secondary-fixed: #002109;
    --color-error: #ba1a1a;
    --color-on-error-container: #93000a;
    --color-on-error: #ffffff;
    --color-inverse-on-surface: #ecf1ff;
    --color-surface-tint: #006e2f;
    --color-background: #f9f9ff;
    --color-surface-dim: #cfdaf2;
    --color-surface-bright: #f9f9ff;
    --color-on-tertiary: #ffffff;
    --color-surface-container: #e7eeff;
    --color-on-primary-fixed-variant: #005321;
    --color-on-background: #111c2d;
    --color-inverse-surface: #263143;
    --color-surface-container-lowest: #ffffff;
    --color-on-tertiary-container: #76231b;
    --color-on-secondary-container: #346e40;
    --color-secondary-fixed: #b2f2b7;
    --color-surface-container-high: #dee8ff;
    --color-on-secondary: #ffffff;
  }
`;

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
interface Transaction {
  id: string;
  paymentId?: number;
  period: string;
  periodDetail: string;
  typeLabel: string;
  payDate: string;
  amount: string;
  amountValue: number;
  subtotal: string;
  discount: string;
  discountValue: number;
  status: PaymentStatusKey;
  canDownloadReceipt: boolean;
}

const RECEIPT_READY_STATUSES = new Set(['settlement', 'capture']);

function formatRupiah(value?: number | null) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

function formatDate(value?: string | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value));
}

function formatPeriod(value?: string | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', { month: 'short', year: 'numeric' }).format(new Date(value));
}

function normalizePaymentStatus(payment: Payment): Transaction['status'] {
  return getPaymentMetaFromPayment(payment).key;
}

function normalizeApplicationStatus(application: RentalApplication): Transaction['status'] {
  return getPaymentMetaFromApplication(application).key;
}

function buildTransactions(payments: Payment[], applications: RentalApplication[], t: (key: string, params?: Record<string, string | number>) => string): Transaction[] {
  const paymentApplicationIds = new Set(payments.map((payment) => payment.rental_application_id));
  const paymentRows = payments.map((payment) => {
    const isRenewal = payment.payment_category === 'renewal';
    const durationMonths = payment.duration_months ?? getDurationInMonths(payment.rental_application?.duration);
    const breakdown = getRentalPaymentBreakdown({
      monthlyPrice: payment.monthly_price ?? payment.rental_application?.room?.price,
      duration: `${durationMonths} Bulan`,
      subtotalAmount: payment.subtotal_amount,
      discountAmount: payment.discount_amount,
      grossAmount: payment.gross_amount,
    });

    return {
      id: payment.order_id,
      paymentId: payment.id,
      period: payment.period_start && payment.period_end
        ? `${formatDate(payment.period_start)} - ${formatDate(payment.period_end)}`
        : formatPeriod(payment.paid_at ?? payment.created_at),
      periodDetail: `${isRenewal ? t('tenant.renewal.paymentPurposeRenewal') : t('tenant.renewal.paymentPurposeInitial')} ${payment.rental_application?.room?.room_name || t('tenant.billing.roomRentFallback')} - ${t('tenant.renewal.months', { count: durationMonths })}`,
      typeLabel: isRenewal ? t('tenant.renewal.paymentPurposeRenewal') : t('tenant.renewal.paymentPurposeInitial'),
      payDate: formatDate(payment.paid_at ?? payment.created_at),
      amount: formatRupiah(breakdown.grossAmount),
      amountValue: breakdown.grossAmount,
      subtotal: formatRupiah(breakdown.subtotalAmount),
      discount: breakdown.discountAmount > 0 ? `-${formatRupiah(breakdown.discountAmount)}` : formatRupiah(0),
      discountValue: breakdown.discountAmount,
      status: normalizePaymentStatus(payment),
      canDownloadReceipt: RECEIPT_READY_STATUSES.has(payment.transaction_status.toLowerCase()),
    };
  });
  const applicationRows = applications
    .filter((application) => !paymentApplicationIds.has(application.id))
    .map((application) => {
      const breakdown = getRentalPaymentBreakdown({
        monthlyPrice: application.room?.price,
        duration: application.duration,
        subtotalAmount: application.payment?.subtotal_amount,
        discountAmount: application.payment?.discount_amount,
        grossAmount: application.payment?.gross_amount,
      });
      const hasPaymentAmount = typeof application.payment?.gross_amount === 'number';

      return {
        id: `APP-${application.id}`,
        period: formatPeriod(application.created_at),
        periodDetail: `Pengajuan ${application.room?.room_name || 'sewa kamar'} - ${application.duration}`,
        typeLabel: t('common.rentalApplication'),
        payDate: formatDate(application.created_at),
        amount: hasPaymentAmount ? formatRupiah(breakdown.grossAmount) : '-',
        amountValue: hasPaymentAmount ? breakdown.grossAmount : 0,
        subtotal: formatRupiah(breakdown.subtotalAmount),
        discount: breakdown.discountAmount > 0 ? `-${formatRupiah(breakdown.discountAmount)}` : formatRupiah(0),
        discountValue: breakdown.discountAmount,
        status: normalizeApplicationStatus(application),
        canDownloadReceipt: false,
      };
    });

  return [...paymentRows, ...applicationRows];
}

interface NavItem {
  icon: string;
  labelKey: string;
  href: string;
  active?: boolean;
}

const navItems: NavItem[] = [
  { icon: 'dashboard', labelKey: 'common.myRoom', href: '/tenant/dashboard' },
  { icon: 'receipt_long', labelKey: 'common.bill', href: '/tenant/tagihan' },
  { icon: 'history', labelKey: 'common.history', href: '/tenant/riwayat', active: true },
  { icon: 'person', labelKey: 'common.profile', href: '/tenant/profil' },
];

/* ─────────────────────────────────────────────
   COMPONENTS
───────────────────────────────────────────── */

function Icon({ name, className = '', style }: { name: string; className?: string; style?: React.CSSProperties }) {
  return (
    <span className={`material-symbols-outlined ${className}`} style={style}>
      {name}
    </span>
  );
}

function StatusBadge({ status }: { status: Transaction['status'] }) {
  const { t } = useLanguage();
  const meta = getPaymentStatusMetaFromKey(status);

  if (meta.isPaid) {
    return (
      <span
        style={{
          background: 'rgba(34,197,94,0.1)',
          color: '#004b1e',
          border: '1px solid rgba(34,197,94,0.2)',
        }}
        className="text-[11px] font-bold px-3 py-1 rounded-full"
      >
        {t(meta.labelKey)}
      </span>
    );
  }
  if (meta.isFailed) {
    return (
      <span
        style={{
          background: 'rgba(255,218,214,0.2)',
          color: '#ba1a1a',
          border: '1px solid rgba(255,218,214,0.4)',
        }}
        className="text-[11px] font-bold px-3 py-1 rounded-full"
      >
        {t(meta.labelKey)}
      </span>
    );
  }
  return (
    <span
      style={{
        background: 'rgba(255,236,153,0.3)',
        color: '#795200',
        border: '1px solid rgba(255,236,153,0.5)',
      }}
      className="text-[11px] font-bold px-3 py-1 rounded-full"
    >
      {t(meta.labelKey)}
    </span>
  );
}

function SideNav({
  mobileOpen,
  onClose,
  currentUser,
  onLogout,
  isLoggingOut,
}: {
  mobileOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  onLogout: () => Promise<void>;
  isLoggingOut: boolean;
}) {
  const { t } = useLanguage();
  const displayName = currentUser?.full_name || currentUser?.email || t('common.tenant');
  const displaySubtitle = currentUser?.email || t('tenant.applications.tenantArea');
  const profilePhoto =
    currentUser?.profile_photo_url ||
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC96Sewl9eO6LFyL4YtlIUyYYMGLK9sxB841-UdivA4BJkrj_LBrQ2jvTAm4tRJKB--5zXLDZbJ7GMtN-EMkjWaowmWT8SKehRa6YGK6KqT-AYWNFEHSAAkEtAPCEv0oC-iGZi0Pq1upDFDZWxkfsAMADQKBkPB1FNZRH8EKCKOZ2QkaXNRym1AcXzD1w8SNH4ZSZW0n6Zo5UDVZo2USk8diEqUyOEwJQBoGufzXKtsXIlNn9mg8c30HMnA7oNPehqmozp1A7YQBbLL';

  return (
    <>
      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          h-screen w-64 fixed left-0 top-0 flex flex-col p-4 z-50
          transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ background: '#f1f5f9' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 py-6 mb-8">
          <img
            className="w-10 h-10 rounded-xl object-contain shadow-sm"
            style={{ background: '#006e2f' }}
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWCE7SxdAoUjp4PKlodesfUG6nxtbH3TjYBcHTXVuxTydpz3cBJzs2lj6hmceQnIlmUzHkLKAM0j9FlnAhTlJX5rUXohQf8Lz7e6eR_-QBWL2QiDyYeHkk9M53sGfKoVFXBshlhs8F3iDRHLh0NM2JTGEoeTM_oBf6vkUaJAZ2VXQGFlOnYxJXzMBzZM1jMkD47SW5XJ_cxDEdExrOzc3EQnRLj1QaW473FFyUUbQGwr8D3oAOf0plGs2tJ-09VhlDBEL1Yi1aVdny"
            alt="KosHandayani Logo"
          />
          <div>
            <h1 className="font-headline font-black text-lg leading-none" style={{ color: '#0f172a' }}>
              KosHandayani
            </h1>
            <p className="text-[10px] font-medium tracking-widest uppercase mt-1" style={{ color: '#3d4a3d' }}>
              Digital Concierge
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col flex-1 space-y-1">
          {navItems.map((item) =>
            item.active ? (
              <Link
                key={item.labelKey}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-sm font-semibold text-sm translate-x-1 transition-transform"
                style={{ background: '#ffffff', color: '#16a34a' }}
              >
                <Icon name={item.icon} />
                {t(item.labelKey)}
              </Link>
            ) : (
              <Link
                key={item.labelKey}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium"
                style={{ color: '#64748b' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#e2e8f0')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Icon name={item.icon} />
                {t(item.labelKey)}
              </Link>
            )
          )}
        </nav>

        {/* User Profile */}
        <div className="mt-auto pt-4" style={{ borderTop: '1px solid #e2e8f0' }}>
          <div
            className="flex items-center gap-3 px-4 py-4 mb-4 rounded-xl"
            style={{ background: '#f0f3ff' }}
          >
            <img
              className="w-10 h-10 rounded-full"
              style={{ border: '2px solid #ffffff' }}
              src={profilePhoto}
              alt={displayName}
            />
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate" style={{ color: '#111c2d' }}>{displayName}</p>
              <p className="text-[10px]" style={{ color: '#3d4a3d' }}>{displaySubtitle}</p>
            </div>
          </div>
          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium"
            style={{ color: '#ef4444', cursor: isLoggingOut ? 'wait' : 'pointer', opacity: isLoggingOut ? 0.7 : 1 }}
            disabled={isLoggingOut}
            onClick={() => void onLogout()}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Icon name="logout" />
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
}

function TopHeader({ onMenuToggle }: { onMenuToggle: () => void }) {
  const { t } = useLanguage();

  return (
    <header
      className="fixed top-0 right-0 z-40 flex justify-between items-center px-4 sm:px-8 lg:px-12 py-5"
      style={{
        left: 0,
        background: 'rgba(249,249,255,0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Left: hamburger (mobile) + breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-4" style={{ paddingLeft: '0' }}>
        {/* Mobile hamburger */}
        <button
          className="tenant-local-menu-button lg:hidden p-2 rounded-full transition-colors"
          style={{ color: '#64748b' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(226,232,240,0.5)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          onClick={onMenuToggle}
        >
          <Icon name="menu" />
        </button>

        <Link
          href="/tenant/dashboard"
          className="hidden lg:flex p-2 rounded-full transition-colors"
          style={{ color: '#64748b' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(226,232,240,0.5)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Icon name="arrow_back" />
        </Link>
        <nav className="flex text-xs font-medium gap-2 items-center" style={{ color: '#94a3b8' }}>
          <Link href="/tenant/dashboard" className="hover:text-green-700 transition-colors">{t('common.myRoom')}</Link>
          <Icon name="chevron_right" className="text-[10px]" />
          <span className="font-bold" style={{ color: '#006e2f' }}>{t('common.history')}</span>
        </nav>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-4" style={{ marginLeft: 'calc(256px)' }}>
        <span
          aria-label="Notifikasi belum tersedia"
          role="status"
          className="p-2 rounded-full relative"
          style={{ color: '#94a3b8' }}
        >
          <Icon name="notifications" />
          <span
            className="absolute top-2 right-2 w-2 h-2 rounded-full"
            style={{ background: '#ef4444', border: '2px solid #f8fafc' }}
          />
        </span>
        <span
          aria-label="Bantuan belum tersedia"
          role="status"
          className="p-2 rounded-full"
          style={{ color: '#94a3b8' }}
        >
          <Icon name="help_outline" />
        </span>
      </div>
    </header>
  );
}

function SummaryGrid({ transactions }: { transactions: Transaction[] }) {
  const { t } = useLanguage();
  const paidTransactions = transactions.filter((transaction) => transaction.status === 'paid');
  const totalPaid = paidTransactions.reduce((total, transaction) => total + transaction.amountValue, 0);
  const lastPaid = paidTransactions[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {/* Big card */}
      <div
        className="col-span-1 md:col-span-2 p-8 rounded-xl shadow-lg text-white relative overflow-hidden group"
        style={{ background: 'linear-gradient(135deg, #006e2f 0%, #22c55e 100%)' }}
      >
        <div className="relative z-10">
          <p className="font-medium text-sm mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
            {t('tenant.history.totalPayments')}
          </p>
          <h3 className="font-headline font-black tracking-tighter mb-4" style={{ fontSize: '2.8rem', lineHeight: 1.1 }}>
            {formatRupiah(totalPaid)}
          </h3>
          <div className="flex flex-wrap gap-4">
            <div
              className="glass-effect px-4 py-2 rounded-lg"
            >
              <p className="text-[10px] font-bold uppercase" style={{ color: 'rgba(255,255,255,0.7)' }}>{t('tenant.history.lastPayment')}</p>
              <p className="text-sm font-semibold text-white">{lastPaid?.payDate ?? '-'}</p>
            </div>
            <div
              className="glass-effect px-4 py-2 rounded-lg"
            >
              <p className="text-[10px] font-bold uppercase" style={{ color: 'rgba(255,255,255,0.7)' }}>{t('tenant.history.totalTransactions')}</p>
              <p className="text-sm font-semibold text-white">{t('tenant.history.transactionCount', { count: transactions.length })}</p>
            </div>
          </div>
        </div>
        <div
          className="absolute -right-10 -bottom-10 opacity-20 group-hover:scale-110 transition-transform duration-700"
        >
          <Icon
            name="account_balance_wallet"
            className=""
            style={{ fontSize: '200px', fontVariationSettings: "'FILL' 1" }}
          />
        </div>
      </div>

      {/* Status card */}
      <div
        className="p-8 rounded-xl flex flex-col justify-between shadow-sm"
        style={{ background: '#ffffff', border: '1px solid rgba(241,245,249,0.5)' }}
      >
        <div>
          <div className="flex justify-between items-start mb-6">
            <div
              className="p-3 rounded-xl"
              style={{ background: 'rgba(175,239,180,0.3)', color: '#006e2f' }}
            >
              <Icon name="verified" />
            </div>
            <span
              className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest"
              style={{ background: 'rgba(34,197,94,0.2)', color: '#004b1e' }}
            >
              {lastPaid ? t(getPaymentStatusMetaFromKey(lastPaid.status).labelKey) : t('status.pendingPayment')}
            </span>
          </div>
          <p className="text-sm mb-1" style={{ color: '#3d4a3d' }}>{t('tenant.history.latestStatus')}</p>
          <h4 className="font-headline font-bold text-2xl" style={{ color: '#0f172a' }}>{lastPaid?.payDate ?? '-'}</h4>
        </div>
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid #f8fafc' }}>
          <p className="text-xs" style={{ color: '#3d4a3d' }}>
            {lastPaid ? t('tenant.history.verifiedBySystem', { item: lastPaid.periodDetail }) : t('tenant.history.noPaidPayment')}
          </p>
        </div>
      </div>
    </div>
  );
}

function saveBlobAsFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function ReceiptDownloadButton({
  transaction,
  isDownloading,
  onDownload,
}: {
  transaction: Transaction;
  isDownloading: boolean;
  onDownload: (transaction: Transaction) => void;
}) {
  const { t } = useLanguage();
  const disabled = !transaction.paymentId || !transaction.canDownloadReceipt || isDownloading;
  const unavailableText = 'Bukti pembayaran tersedia setelah pembayaran berhasil.';

  return (
    <button
      type="button"
      disabled={disabled}
      title={disabled ? unavailableText : t('tenant.history.download')}
      aria-label={disabled ? unavailableText : t('tenant.history.download')}
      onClick={() => onDownload(transaction)}
      className="inline-flex items-center gap-1 text-sm font-bold transition-colors disabled:cursor-not-allowed"
      style={{ color: disabled ? '#94a3b8' : '#006e2f' }}
    >
      <Icon name="download" style={{ fontSize: '18px' }} />
      {isDownloading ? 'Mengunduh...' : t('tenant.history.download')}
    </button>
  );
}

function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [downloadingPaymentId, setDownloadingPaymentId] = useState<number | null>(null);
  const rowsPerPage = 4;

  const filtered = transactions.filter((t) =>
    t.id.toLowerCase().includes(search.toLowerCase())
  );
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  async function handleDownloadReceipt(transaction: Transaction) {
    if (!transaction.paymentId || !transaction.canDownloadReceipt || downloadingPaymentId) {
      return;
    }

    try {
      setDownloadingPaymentId(transaction.paymentId);
      const { blob, filename } = await downloadPaymentReceipt(transaction.paymentId);
      saveBlobAsFile(blob, filename);
    } catch {
      window.alert('Bukti pembayaran belum dapat diunduh. Silakan coba lagi.');
    } finally {
      setDownloadingPaymentId(null);
    }
  }

  return (
    <div
      className="rounded-xl shadow-sm overflow-hidden"
      style={{ background: '#ffffff', border: '1px solid rgba(241,245,249,0.5)' }}
    >
      {/* Table Header */}
      <div
        className="px-4 sm:px-8 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        style={{ borderBottom: '1px solid #f8fafc' }}
      >
        <h3 className="font-headline font-bold" style={{ color: '#0f172a' }}>{t('tenant.history.transactionList')}</h3>
        <div className="flex gap-2 w-full sm:w-auto">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm flex-1 sm:flex-none transition-all"
            style={{ background: '#f0f3ff', color: '#3d4a3d' }}
          >
            <Icon name="search" className="text-sm" style={{ fontSize: '18px' }} />
            <input
              className="bg-transparent border-none focus:outline-none p-0 text-sm w-full sm:w-40"
              placeholder={t('tenant.history.searchPlaceholder')}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ color: '#111c2d' }}
            />
          </div>
          <span
            aria-label="Filter tambahan belum tersedia"
            role="status"
            className="p-2 rounded-lg"
            style={{ color: '#94a3b8' }}
          >
            <Icon name="filter_list" />
          </span>
        </div>
      </div>

      {/* Table - desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ background: 'rgba(240,243,255,0.5)' }}>
              {[t('tenant.history.transactionId'), t('tenant.history.period'), t('tenant.history.paidDate'), t('tenant.history.amount'), t('common.status'), t('common.action')].map((h, i) => (
                <th
                  key={h}
                  className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest"
                  style={{
                    color: '#3d4a3d',
                    textAlign: i === 4 ? 'center' : i === 5 ? 'right' : 'left',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((tx) => (
              <tr
                key={tx.id}
                className="transition-colors"
                style={{ borderBottom: '1px solid #f8fafc' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(240,243,255,0.3)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <td className="px-8 py-6 font-mono text-sm font-semibold" style={{ color: '#006e2f' }}>
                  {tx.id}
                  <div className="mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-bold" style={{ background: '#eefdf2', color: '#006e2f', fontFamily: 'var(--font-manrope), Manrope, sans-serif' }}>
                    {tx.typeLabel}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="text-sm font-bold" style={{ color: '#111c2d' }}>{tx.period}</div>
                  <div className="text-[11px]" style={{ color: '#3d4a3d' }}>{tx.periodDetail}</div>
                </td>
                <td className="px-8 py-6 text-sm" style={{ color: '#3d4a3d' }}>{tx.payDate}</td>
                <td className="px-8 py-6">
                  <div className="text-sm font-bold" style={{ color: '#111c2d' }}>{tx.amount}</div>
                  <div className="text-[11px]" style={{ color: tx.discountValue > 0 ? '#006e2f' : '#3d4a3d' }}>
                    {t('tenant.history.discountReceived')}: {tx.discount}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex justify-center">
                    <StatusBadge status={tx.status} />
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <ReceiptDownloadButton
                    transaction={tx}
                    isDownloading={downloadingPaymentId === tx.paymentId}
                    onDownload={handleDownloadReceipt}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden divide-y" style={{ borderColor: '#f8fafc' }}>
        {paginated.map((tx) => (
          <div key={tx.id} className="px-5 py-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-mono text-sm font-semibold" style={{ color: '#006e2f' }}>{tx.id}</p>
                <p className="mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-bold" style={{ background: '#eefdf2', color: '#006e2f' }}>{tx.typeLabel}</p>
                <p className="text-sm font-bold mt-0.5" style={{ color: '#111c2d' }}>{tx.period}</p>
                <p className="text-[11px]" style={{ color: '#3d4a3d' }}>{tx.periodDetail}</p>
              </div>
              <StatusBadge status={tx.status} />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs" style={{ color: '#3d4a3d' }}>{tx.payDate}</p>
                <p className="text-sm font-bold mt-0.5" style={{ color: '#111c2d' }}>{tx.amount}</p>
                <p className="text-[11px] mt-0.5" style={{ color: tx.discountValue > 0 ? '#006e2f' : '#3d4a3d' }}>
                  {t('tenant.history.discountReceived')}: {tx.discount}
                </p>
              </div>
              <ReceiptDownloadButton
                transaction={tx}
                isDownloading={downloadingPaymentId === tx.paymentId}
                onDownload={handleDownloadReceipt}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div
        className="px-4 sm:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4"
        style={{ background: 'rgba(240,243,255,0.2)', borderTop: '1px solid #f8fafc' }}
      >
        <p className="text-xs" style={{ color: '#3d4a3d' }}>
          Menampilkan <span className="font-bold" style={{ color: '#111c2d' }}>{paginated.length}</span> dari{' '}
          <span className="font-bold" style={{ color: '#111c2d' }}>{total}</span> transaksi
        </p>
        <div className="flex gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: '#3d4a3d' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#e2e8f0')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Icon name="chevron_left" className="text-sm" style={{ fontSize: '18px' }} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors"
              style={
                page === p
                  ? { background: '#006e2f', color: '#ffffff' }
                  : { color: '#3d4a3d' }
              }
              onMouseEnter={(e) => {
                if (page !== p) e.currentTarget.style.background = '#e2e8f0';
              }}
              onMouseLeave={(e) => {
                if (page !== p) e.currentTarget.style.background = 'transparent';
              }}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: '#3d4a3d' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#e2e8f0')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Icon name="chevron_right" className="text-sm" style={{ fontSize: '18px' }} />
          </button>
        </div>
      </div>
    </div>
  );
}

function HelpBanner() {
  return (
    <div
      className="mt-12 p-6 sm:p-8 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6"
      style={{ background: '#f0f3ff' }}
    >
      <div className="flex items-center gap-6">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center shadow-inner shrink-0"
          style={{ background: '#ffffff' }}
        >
          <Icon
            name="help"
            className=""
            style={{ color: '#006e2f', fontSize: '30px', fontVariationSettings: "'FILL' 1" }}
          />
        </div>
        <div>
          <h4 className="font-headline font-bold" style={{ color: '#111c2d' }}>Butuh Bantuan?</h4>
          <p className="text-sm" style={{ color: '#3d4a3d' }}>
            Jika terdapat kendala pada riwayat transaksi Anda, tim kami siap membantu.
          </p>
        </div>
      </div>
      <span
        className="font-bold py-4 px-8 rounded-xl text-white shrink-0 text-sm inline-block"
        style={{ background: '#006e2f', opacity: 0.72 }}
      >
        Hubungi Admin
      </span>
    </div>
  );
}

function Footer() {
  return (
    <footer
      className="w-full py-8 mt-12"
      style={{ borderTop: '1px solid #f1f5f9', background: '#ffffff' }}
    >
      <div className="flex flex-col md:flex-row justify-between items-center px-4 sm:px-8 lg:px-12 gap-4">
        <p className="text-xs" style={{ color: '#94a3b8', fontFamily: 'var(--font-manrope), Manrope, sans-serif' }}>
          © 2026 KosHandayani Property Management.
        </p>
        <div className="flex gap-6">
          {['Syarat & Ketentuan', 'Kebijakan Privasi', 'Hubungi Kami'].map((label) => (
            <span
              key={label}
              className="text-xs"
              style={{ color: '#94a3b8', fontFamily: 'var(--font-manrope), Manrope, sans-serif' }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────
   PAGE ROOT
───────────────────────────────────────────── */
export default function Page() {
  const { user, logout, isLoading } = useAuth();
  const { t } = useLanguage();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [historyError, setHistoryError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      try {
        const [payments, applications] = await Promise.all([
          getMyPayments(),
          getMyRentalApplications(),
        ]);

        if (isMounted) {
          setTransactions(buildTransactions(payments, applications, t));
          setHistoryError('');
        }
      } catch (error) {
        if (isMounted) {
          setHistoryError(error instanceof Error ? error.message : t('messages.loadPaymentsFailed'));
        }
      }
    }

    if (user?.role === 'tenant') {
      void loadHistory();
    }

    const handleTenantDataSync = () => {
      void loadHistory();
    };

    window.addEventListener('tenant-data-sync', handleTenantDataSync);

    return () => {
      isMounted = false;
      window.removeEventListener('tenant-data-sync', handleTenantDataSync);
    };
  }, [t, user?.role]);

  return (
    <>
      {/* Inject all CSS */}
      <style>{inlineCSS + cssVarsCSS}</style>

      <div style={{ background: '#f9f9ff', color: '#111c2d', minHeight: '100vh' }}>
        <SideNav
          mobileOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          currentUser={user}
          onLogout={logout}
          isLoggingOut={isLoading}
        />

        {/* Main content offset by sidebar on large screens */}
        <main className="lg:ml-64 min-h-screen">
          <TopHeader onMenuToggle={() => setMobileNavOpen((v) => !v)} />

          <section className="pt-24 pb-12 px-4 sm:px-8 lg:px-12">
            <div className="max-w-6xl mx-auto">
              {/* Page Title */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-6">
                <div>
                  <h2
                    className="font-headline font-black tracking-tight mb-2"
                    style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: '#0f172a' }}
                  >
                    {t('tenant.history.title')}
                  </h2>
                  <p className="max-w-lg" style={{ color: '#3d4a3d' }}>
                    {t('tenant.history.subtitle')}
                  </p>
                </div>
                <Link
                  href="/tenant/dashboard"
                  className="flex items-center gap-2 py-3 px-6 rounded-xl font-semibold transition-all text-sm shrink-0"
                  style={{ background: '#f0f3ff', color: '#111c2d' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#dee8ff')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#f0f3ff')}
                >
                  <Icon name="arrow_back" className="text-sm" style={{ fontSize: '18px' }} />
                  {t('tenant.history.backHome')}
                </Link>
              </div>

              {historyError && (
                <p className="mb-6 rounded-xl px-4 py-3 text-sm font-bold" style={{ color: '#93000a', background: '#ffdad6' }}>
                  {historyError}
                </p>
              )}
              <SummaryGrid transactions={transactions} />
              <TransactionsTable transactions={transactions} />
              <HelpBanner />
            </div>
          </section>

          <Footer />
        </main>
      </div>
    </>
  );
}
