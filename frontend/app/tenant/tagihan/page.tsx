'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { createPayment, getMyPayments, syncPaymentStatus, type Payment } from '@/lib/api';
import type { AuthUser } from '@/lib/auth';
import type { Locale } from '@/lib/i18n';
import { payWithMidtransSnap } from '@/lib/midtrans';
import { getPaymentMetaFromPayment } from '@/lib/paymentStatus';
import { getRentalPaymentBreakdown } from '@/lib/rental-payment';
import { syncTenantDataAfterPayment } from '@/lib/tenant-data-sync';
import { useAutoRefresh } from '@/lib/use-auto-refresh';

const globalStyle = `
  :root {
    --color-on-error: #ffffff;
    --color-on-primary-fixed: #002109;
    --color-on-background: #111c2d;
    --color-surface-variant: #d8e3fb;
    --color-inverse-on-surface: #ecf1ff;
    --color-tertiary: #9e4036;
    --color-on-surface: #111c2d;
    --color-outline-variant: #bccbb9;
    --color-on-error-container: #93000a;
    --color-surface-container-high: #dee8ff;
    --color-on-secondary-container: #346e40;
    --color-secondary-fixed: #b2f2b7;
    --color-tertiary-fixed-dim: #ffb4a9;
    --color-tertiary-container: #ff8b7c;
    --color-outline: #6d7b6c;
    --color-on-tertiary: #ffffff;
    --color-error: #ba1a1a;
    --color-secondary-fixed-dim: #96d59d;
    --color-on-tertiary-container: #76231b;
    --color-on-secondary-fixed: #002109;
    --color-on-primary-container: #004b1e;
    --color-surface-tint: #006e2f;
    --color-background: #f9f9ff;
    --color-secondary-container: #afefb4;
    --color-secondary: #2f6a3c;
    --color-primary-container: #22c55e;
    --color-surface-container-highest: #d8e3fb;
    --color-surface-bright: #f9f9ff;
    --color-primary-fixed: #6bff8f;
    --color-on-surface-variant: #3d4a3d;
    --color-surface-dim: #cfdaf2;
    --color-on-tertiary-fixed: #410001;
    --color-error-container: #ffdad6;
    --color-tertiary-fixed: #ffdad5;
    --color-surface-container-lowest: #ffffff;
    --color-on-primary-fixed-variant: #005321;
    --color-primary-fixed-dim: #4ae176;
    --color-surface-container: #e7eeff;
    --color-primary: #006e2f;
    --color-inverse-primary: #4ae176;
    --color-on-secondary: #ffffff;
    --color-on-tertiary-fixed-variant: #7f2a21;
    --color-inverse-surface: #263143;
    --color-surface-container-low: #f0f3ff;
    --color-surface: #f9f9ff;
    --color-on-secondary-fixed-variant: #145126;
    --color-on-primary: #ffffff;
  }

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
    font-feature-settings: 'liga';
    -webkit-font-feature-settings: 'liga';
    -webkit-font-smoothing: antialiased;
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  body {
    font-family: var(--font-manrope), Manrope, sans-serif;
    background-color: var(--color-background);
    color: var(--color-on-background);
    min-height: 100vh;
  }

  h1, h2, h3, .headline {
    font-family: var(--font-manrope), Manrope, sans-serif;
  }

  .glass-effect {
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.5);
  }

  .page-bg { background-color: #f9f9ff; }
  .sidebar-bg { background-color: #f8fafc; }

  .nav-active {
    background-color: #f0fdf4;
    color: #15803d;
    font-weight: 600;
  }

  .text-primary { color: var(--color-primary); }
  .text-on-surface { color: var(--color-on-surface); }
  .text-on-surface-variant { color: var(--color-on-surface-variant); }
  .text-tertiary { color: var(--color-tertiary); }
  .text-on-primary { color: var(--color-on-primary); }
  .bg-primary { background-color: var(--color-primary); }
  .bg-background { background-color: var(--color-background); }
  .bg-surface { background-color: var(--color-surface); }
  .bg-surface-container-lowest { background-color: var(--color-surface-container-lowest); }
  .bg-surface-container-low { background-color: var(--color-surface-container-low); }
  .bg-surface-container { background-color: var(--color-surface-container); }
  .bg-surface-container-high { background-color: var(--color-surface-container-high); }
  .bg-surface-container-highest { background-color: var(--color-surface-container-highest); }
  .bg-tertiary-container { background-color: var(--color-tertiary-container); }
  .border-outline-variant { border-color: var(--color-outline-variant); }
  .border-primary { border-color: var(--color-primary); }
  .border-surface-container-high { border-color: var(--color-surface-container-high); }

  .gradient-btn {
    background: linear-gradient(to right, var(--color-primary), var(--color-primary-container));
  }
`;

// ─── Data ─────────────────────────────────────────────────────────────────────

const navItems = [
  { icon: 'home', labelKey: 'common.myRoom', href: '/tenant/dashboard', active: false },
  { icon: 'door_front', labelKey: 'tenant.billing.myRoom', href: '/rooms', active: false },
  { icon: 'request_quote', labelKey: 'common.bill', href: '/tenant/tagihan', active: true },
  { icon: 'history', labelKey: 'common.history', href: '/tenant/riwayat', active: false },
  { icon: 'account_circle', labelKey: 'common.profile', href: '/tenant/profil', active: false },
];

function formatRupiah(value?: number | null) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

function formatDate(value?: string | null, locale: Locale = 'id') {
  if (!value) return '-';
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', { dateStyle: 'medium' }).format(new Date(value));
}

function normalizePaymentStatus(payment?: Payment | null) {
  return getPaymentMetaFromPayment(payment).key;
}

function paymentStatusLabel(payment: Payment | null | undefined, t: (key: string) => string) {
  return t(getPaymentMetaFromPayment(payment).labelKey);
}

function isActiveBill(payment: Payment) {
  return getPaymentMetaFromPayment(payment).isActiveBill;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

const Icon = ({
  name,
  className = '',
  filled = false,
  style: extraStyle = {},
}: {
  name: string;
  className?: string;
  filled?: boolean;
  style?: React.CSSProperties;
}) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{
      fontVariationSettings: filled
        ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
        : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
      ...extraStyle,
    }}
  >
    {name}
  </span>
);

function Sidebar({ currentUser }: { currentUser: AuthUser | null }) {
  const { t } = useLanguage();
  const displayName = currentUser?.full_name || currentUser?.email || t('common.tenant');
  const profilePhoto =
    currentUser?.profile_photo_url ||
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBxHlmogJT2E4aPWpZrwi8tDGS-f5SPJOAG6IzqDRlvMsTCf6v9mOSeE_oQx7sSj5ku0MZ5UPQ_sW9O1mQK5NfHnbjiHuW8CgV9oUiFi72IKkb9_R0E6kfEpQG97bCp-_WCZaTQGvd4W6CIpZu94A8zInMrCVeqHDcQG3ciZk2Rd1jAXSIH3dOzJkyHGwkzi6KFQR52Y5OnRWDNF_E_lW83OR3_AVyV_pcq_leeRnMUllzNgjyZIa_gGN3UU90HBQsJhj8NDyLGgTbT';

  return (
    <aside
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        width: '16rem',
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        padding: '1rem',
        borderRight: 'none',
        zIndex: 40,
      }}
      className="hidden-mobile"
    >
      <div style={{ marginBottom: '2.5rem', padding: '0 0.5rem' }}>
        <h1
          style={{
            fontSize: '1.25rem',
            fontWeight: 900,
            color: '#0f172a',
            letterSpacing: '-0.05em',
            fontFamily: 'var(--font-manrope), Manrope, sans-serif',
          }}
        >
          KosHandayani
        </h1>
        <p
          style={{
            fontSize: '0.625rem',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: '#94a3b8',
            fontWeight: 700,
          }}
        >
          {t('tenant.applications.tenantArea')}
        </p>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1 }}>
        {navItems.map((item) => (
          <Link
            key={item.labelKey}
            href={item.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              fontWeight: item.active ? 600 : 500,
              transition: 'all 0.15s',
              transform: 'scale(0.95)',
              textDecoration: 'none',
              ...(item.active
                ? {
                    backgroundColor: '#f0fdf4',
                    color: '#15803d',
                  }
                : {
                    color: '#64748b',
                  }),
            }}
            onMouseEnter={(e) => {
              if (!item.active) {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#e2e8f0';
              }
            }}
            onMouseLeave={(e) => {
              if (!item.active) {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              }
            }}
          >
            <Icon name={item.icon} filled={item.active} />
            <span>{t(item.labelKey)}</span>
          </Link>
        ))}
      </nav>

      <div
        style={{
          marginTop: 'auto',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          backgroundColor: 'rgba(255,255,255,0.5)',
          borderRadius: '0.75rem',
        }}
      >
        <div
          style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '9999px',
            backgroundColor: '#dee8ff',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <img
            src={profilePhoto}
            alt={displayName}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div style={{ overflow: 'hidden' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {displayName}
          </p>
          <p style={{ fontSize: '0.625rem', color: '#3d4a3d' }}>{currentUser?.email || t('tenant.applications.tenantArea')}</p>
        </div>
      </div>
    </aside>
  );
}

function BillSummaryCard({
  payment,
  isLoading,
  error,
  message,
}: {
  payment?: Payment | null;
  isLoading: boolean;
  error: string;
  message: string;
}) {
  const { locale, t } = useLanguage();
  const room = payment?.rental_application?.room;
  const title = isLoading && !payment
    ? t('tenant.billing.loadingBill')
    : room?.room_name
      ? t('tenant.billing.roomRent', { room: room.room_name })
      : t('empty.noPayments');
  const breakdown = getRentalPaymentBreakdown({
    monthlyPrice: payment?.monthly_price ?? room?.price,
    duration: payment?.duration_months ? `${payment.duration_months} Bulan` : payment?.rental_application?.duration,
    subtotalAmount: payment?.subtotal_amount,
    discountAmount: payment?.discount_amount,
    grossAmount: payment?.gross_amount,
  });
  const discountLabel = breakdown.discountAmount > 0 ? `-${formatRupiah(breakdown.discountAmount)}` : formatRupiah(0);

  return (
    <section
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '0.75rem',
        padding: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          padding: '2rem',
          opacity: 0.1,
          pointerEvents: 'none',
        }}
      >
        <Icon name="receipt_long" style={{ fontSize: '6rem' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 10 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '2.5rem',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <span
              style={{
                display: 'inline-block',
                padding: '0.25rem 0.75rem',
                backgroundColor: 'rgba(255,139,124,0.2)',
                color: '#9e4036',
                fontSize: '0.625rem',
                fontWeight: 700,
                borderRadius: '9999px',
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
                marginBottom: '0.75rem',
              }}
            >
              {isLoading ? t('tenant.billing.loadingBill') : paymentStatusLabel(payment, t)}
            </span>
            <h3
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#111c2d',
                fontFamily: 'var(--font-manrope), Manrope, sans-serif',
              }}
            >
              {title}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#3d4a3d' }}>
              {t('tenant.detail.paymentDate')}: {formatDate(payment?.paid_at, locale)}
            </p>
            {(error || message) && (
              <p style={{ fontSize: '0.875rem', color: error ? '#93000a' : '#166534', fontWeight: 700, marginTop: '0.5rem' }}>
                {error || message}
              </p>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 500, color: '#3d4a3d' }}>{t('tenant.billing.totalBill')}</p>
            <p
              style={{
                fontSize: '1.875rem',
                fontWeight: 900,
                color: '#006e2f',
                letterSpacing: '-0.05em',
                fontFamily: 'var(--font-manrope), Manrope, sans-serif',
              }}
            >
              {formatRupiah(payment ? breakdown.grossAmount : null)}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          {[
            { label: t('tenant.billing.subtotal'), value: formatRupiah(payment ? breakdown.subtotalAmount : null), icon: 'receipt', accent: '#111c2d' },
            { label: t('tenant.billing.discount'), value: payment ? discountLabel : '-', icon: 'sell', accent: '#006e2f' },
            { label: t('tenant.billing.totalPaid'), value: formatRupiah(payment ? breakdown.grossAmount : null), icon: 'payments', accent: '#006e2f' },
          ].map((item) => (
            <div key={item.label} style={{ backgroundColor: '#f0f3ff', padding: '1rem', borderRadius: '0.5rem' }}>
              <p style={{ fontSize: '0.625rem', textTransform: 'uppercase', fontWeight: 700, color: '#3d4a3d', marginBottom: '0.25rem' }}>
                {item.label}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: item.accent }}>
                <Icon name={item.icon} style={{ fontSize: '1.125rem' }} />
                <span style={{ fontWeight: 800 }}>{item.value}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div
            style={{
              backgroundColor: '#f0f3ff',
              padding: '1rem',
              borderRadius: '0.5rem',
            }}
          >
            <p
              style={{
                fontSize: '0.625rem',
                textTransform: 'uppercase',
                fontWeight: 700,
                color: '#3d4a3d',
                marginBottom: '0.25rem',
              }}
            >
              {t('owner.applications.paymentStatus')}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9e4036' }}>
              <Icon name="event" style={{ fontSize: '1.125rem' }} />
              <span style={{ fontWeight: 700 }}>{paymentStatusLabel(payment, t)}</span>
            </div>
          </div>
          <div
            style={{
              backgroundColor: '#f0f3ff',
              padding: '1rem',
              borderRadius: '0.5rem',
            }}
          >
            <p
              style={{
                fontSize: '0.625rem',
                textTransform: 'uppercase',
                fontWeight: 700,
                color: '#3d4a3d',
                marginBottom: '0.25rem',
              }}
            >
              {t('tenant.history.transactionId')}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#111c2d' }}>
              <Icon name="fingerprint" style={{ fontSize: '1.125rem' }} />
              <span style={{ fontWeight: 700 }}>{payment?.order_id ?? '-'}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ConfirmationSidebar({
  payment,
  isPaying,
  onPay,
}: {
  payment?: Payment | null;
  isPaying: boolean;
  onPay: () => void;
}) {
  const { t } = useLanguage();
  const room = payment?.rental_application?.room;
  const breakdown = getRentalPaymentBreakdown({
    monthlyPrice: payment?.monthly_price ?? room?.price,
    duration: payment?.duration_months ? `${payment.duration_months} Bulan` : payment?.rental_application?.duration,
    subtotalAmount: payment?.subtotal_amount,
    discountAmount: payment?.discount_amount,
    grossAmount: payment?.gross_amount,
  });
  const discountLabel = breakdown.discountAmount > 0 ? `-${formatRupiah(breakdown.discountAmount)}` : formatRupiah(0);
  const normalizedStatus = normalizePaymentStatus(payment);
  const canPay = ['pending', 'failed'].includes(normalizedStatus) && Boolean(payment);
  const summaryItems = [
    { label: room?.room_name ? t('tenant.billing.roomRent', { room: room.room_name }) : t('tenant.billing.roomRentFallback'), amount: formatRupiah(payment ? breakdown.subtotalAmount : null), isDiscount: false, isGratis: false },
    { label: t('tenant.billing.discount'), amount: payment ? discountLabel : '-', isDiscount: breakdown.discountAmount > 0, isGratis: false },
    { label: t('owner.applications.paymentStatus'), amount: paymentStatusLabel(payment, t), isDiscount: false, isGratis: false },
    { label: t('tenant.billing.serviceFee'), amount: t('tenant.billing.free'), isDiscount: false, isGratis: true },
  ];

  return (
    <div style={{ position: 'sticky', top: '2rem' }}>
      <section
        style={{
          backgroundColor: '#f0f3ff',
          borderRadius: '0.75rem',
          padding: '2rem',
          border: '1px solid #ffffff',
        }}
      >
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            marginBottom: '2rem',
            fontFamily: 'var(--font-manrope), Manrope, sans-serif',
            color: '#111c2d',
          }}
        >
          {t('tenant.billing.confirmationSummary')}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '2.5rem' }}>
          {summaryItems.map((item, idx) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 0',
                borderBottom: idx < summaryItems.length - 1 ? '1px solid rgba(188,203,185,0.15)' : 'none',
              }}
            >
              <span style={{ fontSize: '0.875rem', color: '#3d4a3d' }}>{item.label}</span>
              <span
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: item.isGratis || item.isDiscount ? '#006e2f' : '#111c2d',
                }}
              >
                {item.amount}
              </span>
            </div>
          ))}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '1rem',
            }}
          >
            <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111c2d', fontFamily: 'var(--font-manrope), Manrope, sans-serif' }}>
              {t('tenant.billing.totalPay')}
            </span>
            <span
              style={{
                fontSize: '1.5rem',
                fontWeight: 900,
                color: '#111c2d',
                letterSpacing: '-0.05em',
                fontFamily: 'var(--font-manrope), Manrope, sans-serif',
              }}
            >
              {formatRupiah(payment ? breakdown.grossAmount : null)}
            </span>
          </div>
        </div>

        {canPay ? (
          <button
            disabled={isPaying}
            onClick={onPay}
            style={{
              width: '100%',
              background: 'linear-gradient(to right, #006e2f, #22c55e)',
              color: '#ffffff',
              padding: '1.25rem',
              borderRadius: '0.75rem',
              fontWeight: 700,
              fontSize: '1.125rem',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              border: 'none',
              cursor: isPaying ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              transition: 'all 0.15s',
              fontFamily: 'var(--font-manrope), Manrope, sans-serif',
              opacity: isPaying ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 25px rgba(0,110,47,0.3)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
            }}
            onMouseDown={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(0.98)';
            }}
            onMouseUp={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            }}
          >
            <Icon name="security" filled />
            {isPaying ? t('common.processing') : normalizedStatus === 'failed' ? t('tenant.billing.payAgain') : t('tenant.billing.continuePayment')}
          </button>
        ) : (
          <p style={{ margin: 0, color: '#3d4a3d', fontWeight: 700 }}>
            {payment ? paymentStatusLabel(payment, t) : t('tenant.billing.noActiveBill')}
          </p>
        )}

        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: 'rgba(255,255,255,0.4)',
            borderRadius: '0.5rem',
            border: '1px solid rgba(255,255,255,0.5)',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start',
          }}
        >
          <Icon name="verified_user" style={{ color: '#006e2f', fontSize: '1.25rem', flexShrink: 0 }} />
          <p
            style={{
              fontSize: '0.6875rem',
              lineHeight: 1.6,
              color: '#3d4a3d',
            }}
          >
            {t('tenant.billing.securityNotice')}
          </p>
        </div>
      </section>

      <div
        style={{
          marginTop: '1.5rem',
          padding: '1.5rem',
          backgroundColor: 'rgba(216,227,251,0.3)',
          borderRadius: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111c2d' }}>{t('tenant.billing.needHelp')}</p>
          <p style={{ fontSize: '0.625rem', color: '#3d4a3d' }}>{t('tenant.billing.contactConcierge')}</p>
        </div>
        <button
          type="button"
          disabled
          aria-label={t('tenant.billing.contactConcierge')}
          style={{
            backgroundColor: '#ffffff',
            padding: '0.75rem',
            borderRadius: '9999px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: 'none',
            cursor: 'not-allowed',
            opacity: 0.72,
            transition: 'transform 0.15s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="support_agent" style={{ color: '#006e2f' }} />
        </button>
      </div>
    </div>
  );
}

function BillingEmptyState() {
  const { t } = useLanguage();

  return (
    <section
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '1rem',
        border: '1px solid #e7eeff',
        padding: 'clamp(2rem, 5vw, 3rem)',
        boxShadow: '0 12px 32px rgba(17,28,45,0.06)',
        textAlign: 'center',
      }}
    >
      <span
        style={{
          width: '4rem',
          height: '4rem',
          margin: '0 auto',
          borderRadius: '1.25rem',
          backgroundColor: '#e7f8eb',
          color: '#006e2f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name="check_circle" filled style={{ fontSize: '2rem' }} />
      </span>
      <h3
        style={{
          margin: '1.25rem 0 0',
          fontFamily: 'var(--font-manrope), Manrope, sans-serif',
          fontSize: 'clamp(1.5rem, 3vw, 2rem)',
          fontWeight: 900,
          color: '#111c2d',
          letterSpacing: '-0.04em',
        }}
      >
        Tidak ada tagihan saat ini
      </h3>
      <p
        style={{
          margin: '0.75rem auto 0',
          maxWidth: '34rem',
          color: '#3d4a3d',
          lineHeight: 1.7,
          fontSize: '0.95rem',
        }}
      >
        Semua tagihan aktif sudah dibayar. Jika ada pembayaran baru atau perpanjangan sewa, tagihan akan muncul otomatis di halaman ini.
      </p>
      <div
        style={{
          marginTop: '1.75rem',
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <Link
          href="/tenant/riwayat"
          style={{
            minHeight: '2.75rem',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            borderRadius: '0.75rem',
            backgroundColor: '#006e2f',
            color: '#ffffff',
            padding: '0 1rem',
            fontSize: '0.875rem',
            fontWeight: 800,
            textDecoration: 'none',
          }}
        >
          <Icon name="history" style={{ fontSize: '1.125rem' }} />
          {t('common.history')}
        </Link>
        <Link
          href="/tenant/dashboard"
          style={{
            minHeight: '2.75rem',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            borderRadius: '0.75rem',
            backgroundColor: '#f0f3ff',
            color: '#111c2d',
            padding: '0 1rem',
            fontSize: '0.875rem',
            fontWeight: 800,
            textDecoration: 'none',
          }}
        >
          <Icon name="home" style={{ fontSize: '1.125rem' }} />
          Dashboard
        </Link>
      </div>
    </section>
  );
}

function BillingErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { t } = useLanguage();

  return (
    <section
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '1rem',
        border: '1px solid #ffdad6',
        padding: 'clamp(1.5rem, 4vw, 2rem)',
        boxShadow: '0 12px 32px rgba(17,28,45,0.06)',
      }}
    >
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <span
          style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '1rem',
            backgroundColor: '#ffdad6',
            color: '#93000a',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon name="error" filled />
        </span>
        <div>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontSize: '1.25rem', fontWeight: 900, color: '#111c2d' }}>
            Gagal memuat tagihan
          </h3>
          <p style={{ margin: '0.5rem 0 0', color: '#3d4a3d', lineHeight: 1.7 }}>{message}</p>
          <button
            type="button"
            onClick={onRetry}
            style={{
              marginTop: '1rem',
              minHeight: '2.5rem',
              border: 'none',
              borderRadius: '0.75rem',
              backgroundColor: '#006e2f',
              color: '#ffffff',
              padding: '0 1rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    </section>
  );
}

function MobileNav() {
  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #f1f5f9',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 50,
      }}
      className="show-mobile"
    >
      <Link
        href="/tenant/dashboard"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
          color: '#64748b',
          background: 'none',
          border: 'none',
          textDecoration: 'none',
        }}
      >
        <Icon name="home" />
        <span style={{ fontSize: '0.625rem', fontWeight: 500 }}>Beranda</span>
      </Link>

      <Link
        href="/tenant/tagihan"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
          color: '#006e2f',
          background: 'none',
          border: 'none',
          textDecoration: 'none',
        }}
      >
        <Icon name="request_quote" filled />
        <span style={{ fontSize: '0.625rem', fontWeight: 700 }}>Tagihan</span>
      </Link>

      <div style={{ marginTop: '-2.5rem' }}>
        <Link
          href="/rooms"
          style={{
            width: '3.5rem',
            height: '3.5rem',
            backgroundColor: '#006e2f',
            color: '#ffffff',
            borderRadius: '9999px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
          }}
        >
          <Icon name="add" />
        </Link>
      </div>

      <Link
        href="/tenant/riwayat"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
          color: '#64748b',
          background: 'none',
          border: 'none',
          textDecoration: 'none',
        }}
      >
        <Icon name="history" />
        <span style={{ fontSize: '0.625rem', fontWeight: 500 }}>Riwayat</span>
      </Link>

      <Link
        href="/tenant/profil"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
          color: '#64748b',
          background: 'none',
          border: 'none',
          textDecoration: 'none',
        }}
      >
        <Icon name="account_circle" />
        <span style={{ fontSize: '0.625rem', fontWeight: 500 }}>Profil</span>
      </Link>
    </nav>
  );
}

// ─── Responsive styles injected ───────────────────────────────────────────────
const responsiveStyle = `
  .hidden-mobile {
    display: flex;
  }
  .show-mobile {
    display: none;
  }
  .main-content {
    margin-left: 16rem;
    padding: 3rem;
  }
  .bento-grid {
    display: grid;
    grid-template-columns: 7fr 5fr;
    gap: 2rem;
    align-items: start;
  }
  @media (max-width: 768px) {
    .hidden-mobile {
      display: none !important;
    }
    .show-mobile {
      display: flex !important;
    }
    .main-content {
      margin-left: 0;
      padding: 1.5rem;
      padding-bottom: 6rem;
    }
    .bento-grid {
      grid-template-columns: 1fr;
    }
  }
`;

// ─── Page Component ────────────────────────────────────────────────────────────

export default function Page() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const activePayment = payments.find(isActiveBill) ?? null;

  const refreshPayments = useCallback(async () => {
    try {
      setIsLoadingPayments(true);
      setPaymentError('');
      const data = await getMyPayments();
      setPayments(data);
    } catch (loadError) {
      setPaymentError(loadError instanceof Error ? loadError.message : 'Gagal memuat tagihan.');
    } finally {
      setIsLoadingPayments(false);
    }
  }, []);

  useEffect(() => {
    const globalStyleElement = document.createElement('style');
    globalStyleElement.textContent = globalStyle;
    document.head.appendChild(globalStyleElement);

    const responsiveStyleElement = document.createElement('style');
    responsiveStyleElement.textContent = responsiveStyle;
    document.head.appendChild(responsiveStyleElement);

    return () => {
      globalStyleElement.remove();
      responsiveStyleElement.remove();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadPayments() {
      try {
        setIsLoadingPayments(true);
        setPaymentError('');
        const data = await getMyPayments();
        if (isMounted) setPayments(data);
      } catch (loadError) {
        if (isMounted) setPaymentError(loadError instanceof Error ? loadError.message : t('messages.loadPaymentsFailed'));
      } finally {
        if (isMounted) setIsLoadingPayments(false);
      }
    }

    void loadPayments();

    return () => {
      isMounted = false;
    };
  }, [t]);

  useEffect(() => {
    const handleTenantDataSync = () => {
      void refreshPayments();
    };

    window.addEventListener('tenant-data-sync', handleTenantDataSync);

    return () => {
      window.removeEventListener('tenant-data-sync', handleTenantDataSync);
    };
  }, [refreshPayments]);

  useAutoRefresh(refreshPayments);

  async function handleContinuePayment() {
    if (!activePayment) return;

    async function refreshAfterPayment(nextMessage: string) {
      setPaymentMessage(nextMessage);
      await syncTenantDataAfterPayment();
      await Promise.allSettled([refreshPayments(), refreshUser()]);
      router.push('/tenant/tagihan');
    }

    try {
      setIsPaying(true);
      setPaymentMessage('');
      setPaymentError('');

      const status = normalizePaymentStatus(activePayment);
      let snapToken = status === 'failed' ? null : activePayment.snap_token;
      let orderId = activePayment.order_id;

      if (!snapToken) {
        if (activePayment.payment_category === 'renewal') {
          router.push('/tenant/perpanjang-sewa');
          return;
        }

        const payment = await createPayment(activePayment.rental_application_id);
        snapToken = payment.snap_token;
        orderId = payment.order_id;
      }

      await payWithMidtransSnap(snapToken, {
        onSuccess: () => {
          void syncPaymentStatus(orderId)
            .catch(() => null)
            .then(() => refreshAfterPayment(t('messages.paymentSuccessRefresh')));
        },
        onPending: () => {
          void syncPaymentStatus(orderId)
            .catch(() => null)
            .then(() => refreshAfterPayment(t('messages.paymentPending')));
        },
        onError: () => {
          void refreshAfterPayment(t('status.paymentFailed'));
        },
        onClose: () => {
          setPaymentMessage(t('messages.paymentCancelled'));
        },
      });
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : t('messages.paymentOpenFailed'));
    } finally {
      setIsPaying(false);
    }
  }

  return (
    <div style={{ backgroundColor: '#f9f9ff', minHeight: '100vh', color: '#111c2d' }}>
      <Sidebar currentUser={user} />

      <main className="main-content" style={{ maxWidth: '80rem', marginRight: 'auto' }}>
        {/* Header */}
        <header style={{ marginBottom: '3rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#006e2f',
              fontWeight: 700,
              marginBottom: '0.5rem',
            }}
          >
            <Icon name="arrow_back" style={{ fontSize: '0.875rem' }} />
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              {t('tenant.billing.backToDashboard')}
            </span>
          </div>
          <h2
            style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: '#111c2d',
              marginBottom: '0.5rem',
              fontFamily: 'var(--font-manrope), Manrope, sans-serif',
            }}
          >
            {t('tenant.detail.paymentSummary')}
          </h2>
          <p
            style={{
              color: '#3d4a3d',
              maxWidth: '32rem',
              lineHeight: 1.6,
            }}
          >
            {t('tenant.billing.subtitle')}
          </p>
        </header>

        {isLoadingPayments ? (
          <div className="bento-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <BillSummaryCard payment={activePayment} isLoading={isLoadingPayments} error={paymentError} message={paymentMessage} />
            </div>
            <ConfirmationSidebar payment={activePayment} isPaying={isPaying} onPay={() => void handleContinuePayment()} />
          </div>
        ) : paymentError && !activePayment ? (
          <BillingErrorState message={paymentError} onRetry={() => void refreshPayments()} />
        ) : !activePayment ? (
          <BillingEmptyState />
        ) : (
          <div className="bento-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <BillSummaryCard payment={activePayment} isLoading={isLoadingPayments} error={paymentError} message={paymentMessage} />
            </div>
            <ConfirmationSidebar payment={activePayment} isPaying={isPaying} onPay={() => void handleContinuePayment()} />
          </div>
        )}

        {/* Footer */}
        <footer
          style={{
            width: '100%',
            paddingTop: '3rem',
            paddingBottom: '3rem',
            marginTop: '5rem',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <p style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontSize: '0.75rem', color: '#64748b' }}>
            © 2026 KosHandayani. Digital Concierge Property Management.
          </p>
          <div style={{ display: 'flex', gap: '2rem' }}>
            {['Tentang Kami', 'Syarat & Ketentuan', 'Kebijakan Privasi'].map((link) => (
              <span
                key={link}
                style={{
                  color: '#94a3b8',
                  fontSize: '0.75rem',
                  textDecoration: 'none',
                }}
              >
                {link}
              </span>
            ))}
          </div>
        </footer>
      </main>

      <MobileNav />
    </div>
  );
}
