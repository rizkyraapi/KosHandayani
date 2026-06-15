'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { EmptyState, ErrorState, LoadingState } from '@/components/UiState';
import { useLanguage } from '@/contexts/LanguageContext';
import { getOwnerPayments, type OwnerPaymentOverview } from '@/lib/api';
import type { Locale } from '@/lib/i18n';
import { useAutoRefresh } from '@/lib/use-auto-refresh';

type PaymentRow = {
  id: number;
  tenantName: string;
  tenantAvatar: string | null;
  initials: string;
  roomName: string;
  branchName: string;
  status: 'paid' | 'failed' | 'pending';
  paidDate: string;
  orderId: string;
  subtotal: string;
  discount: string;
  discountValue: number;
  amount: string;
  href: string;
};

type StatCardData = {
  icon: string;
  label: string;
  value: string;
  iconBg: string;
  iconColor: string;
  valueColor: string;
  badge?: string;
  borderLeft?: boolean;
  borderColor?: string;
};

function Icon({
  name,
  filled = false,
  size = 24,
  style,
}: {
  name: string;
  filled?: boolean;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <span
      className="material-symbols-outlined"
      style={{
        fontSize: size,
        fontVariationSettings: filled
          ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
          : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
        ...style,
      }}
    >
      {name}
    </span>
  );
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(value?: string | null, locale: Locale = 'id') {
  if (!value) return '-';

  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'TN';
}

function normalizePaymentStatus(status: string): PaymentRow['status'] {
  if (['settlement', 'capture'].includes(status)) return 'paid';
  if (['expire', 'cancel', 'deny'].includes(status)) return 'failed';

  return 'pending';
}

function buildRows(payments: OwnerPaymentOverview['payments'], locale: Locale, fallbackTenant: string, fallbackBranch: string): PaymentRow[] {
  return payments.map((payment) => {
    const tenantName = payment.tenant?.full_name || payment.tenant?.email || fallbackTenant;
    const status = normalizePaymentStatus(payment.transaction_status);
    const subtotalAmount = payment.subtotal_amount ?? payment.gross_amount;
    const discountAmount = Math.max(0, payment.discount_amount ?? 0);

    return {
      id: payment.id,
      tenantName,
      tenantAvatar: payment.tenant?.profile_photo_url ?? null,
      initials: getInitials(tenantName),
      roomName: payment.room?.room_name || '-',
      branchName: payment.room?.branch?.branch_name || fallbackBranch,
      status,
      paidDate: status === 'paid' ? formatDateTime(payment.paid_at, locale) : formatDateTime(payment.created_at, locale),
      orderId: payment.order_id,
      subtotal: formatRupiah(subtotalAmount),
      discount: discountAmount > 0 ? `-${formatRupiah(discountAmount)}` : formatRupiah(0),
      discountValue: discountAmount,
      amount: formatRupiah(payment.gross_amount),
      href: `/owner/rental-applications/${payment.rental_application_id}`,
    };
  });
}

function buildStats(
  stats: OwnerPaymentOverview['stats'] | undefined,
  t: (key: string) => string,
): StatCardData[] {
  const safeStats = stats ?? {
    total_collected: 0,
    paid_count: 0,
    failed_count: 0,
    pending_count: 0,
    tenant_count: 0,
  };

  return [
    {
      icon: 'payments',
      label: t('owner.payments.totalCollected'),
      value: formatRupiah(safeStats.total_collected),
      iconBg: 'rgba(0,110,47,0.1)',
      iconColor: '#006e2f',
      valueColor: '#111c2d',
    },
    {
      icon: 'check_circle',
      label: t('owner.payments.paid'),
      value: `${safeStats.paid_count} / ${safeStats.tenant_count} ${t('common.tenants')}`,
      iconBg: 'rgba(34,197,94,0.2)',
      iconColor: '#004b1e',
      valueColor: '#111c2d',
    },
    {
      icon: 'warning',
      label: t('owner.payments.failed'),
      value: `${safeStats.failed_count} ${t('common.payments')}`,
      iconBg: 'rgba(255,218,214,0.5)',
      iconColor: '#ba1a1a',
      valueColor: '#ba1a1a',
      borderLeft: true,
      borderColor: '#9e4036',
    },
    {
      icon: 'pending',
      label: t('owner.payments.pendingConfirmation'),
      value: `${safeStats.pending_count} ${t('common.payments')}`,
      iconBg: 'rgba(175,239,180,0.3)',
      iconColor: '#346e40',
      valueColor: '#111c2d',
    },
  ];
}

function StatusBadge({ status }: { status: PaymentRow['status'] }) {
  const { t } = useLanguage();
  const cfg: Record<PaymentRow['status'], { bg: string; text: string; dot: string; labelKey: string }> = {
    paid: { bg: '#afefb4', text: '#346e40', dot: '#2f6a3c', labelKey: 'status.paid' },
    failed: { bg: '#ffdad6', text: '#ba1a1a', dot: '#ba1a1a', labelKey: 'status.failed' },
    pending: { bg: '#dee8ff', text: '#3d4a3d', dot: '#3d4a3d', labelKey: 'status.awaitingVerification' },
  };
  const c = cfg[status];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: c.bg,
        color: c.text,
        padding: '4px 12px',
        borderRadius: 9999,
        fontSize: 12,
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {t(c.labelKey)}
    </span>
  );
}

function StatCard({ stat }: { stat: StatCardData }) {
  return (
    <div
      style={{
        background: '#ffffff',
        padding: 24,
        borderRadius: 12,
        boxShadow: '0 12px 40px rgba(17,28,45,0.06)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderLeft: stat.borderLeft ? `4px solid ${stat.borderColor}` : undefined,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ padding: 8, background: stat.iconBg, borderRadius: 8, color: stat.iconColor }}>
          <Icon name={stat.icon} />
        </div>
        {stat.badge && (
          <span style={{ fontSize: 11, fontWeight: 700, background: '#f0fdf4', color: '#15803d', padding: '4px 8px', borderRadius: 9999 }}>
            {stat.badge}
          </span>
        )}
      </div>
      <div style={{ marginTop: 16 }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: '#3d4a3d' }}>{stat.label}</p>
        <h3 style={{ fontSize: 24, fontWeight: 900, color: stat.valueColor, fontFamily: 'Manrope, sans-serif' }}>{stat.value}</h3>
      </div>
    </div>
  );
}

function PaymentTableRow({ row }: { row: PaymentRow }) {
  return (
    <tr
      style={{ transition: 'background 0.15s' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(248,250,252,0.5)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <td style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {row.tenantAvatar ? (
            <img src={row.tenantAvatar} alt={row.tenantName} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: 700, fontSize: 14 }}>
              {row.initials}
            </div>
          )}
          <div>
            <p style={{ fontWeight: 700, color: '#111c2d' }}>{row.tenantName}</p>
            <p style={{ marginTop: 2, color: '#64748b', fontSize: 12, fontWeight: 600 }}>{row.orderId}</p>
          </div>
        </div>
      </td>
      <td style={{ padding: '20px 24px', fontSize: 14, fontWeight: 600 }}>{row.roomName}</td>
      <td style={{ padding: '20px 24px', fontSize: 14, color: '#3d4a3d' }}>{row.branchName}</td>
      <td style={{ padding: '20px 24px' }}>
        <StatusBadge status={row.status} />
      </td>
      <td style={{ padding: '20px 24px', fontSize: 14, fontWeight: 700, color: '#111c2d', whiteSpace: 'nowrap' }}>
        {row.subtotal}
      </td>
      <td style={{ padding: '20px 24px', fontSize: 14, fontWeight: 800, color: row.discountValue > 0 ? '#006e2f' : '#3d4a3d', whiteSpace: 'nowrap' }}>
        {row.discount}
      </td>
      <td style={{ padding: '20px 24px', fontSize: 14, fontWeight: 900, color: '#006e2f', whiteSpace: 'nowrap' }}>
        {row.amount}
      </td>
      <td style={{ padding: '20px 24px', fontSize: 14, fontWeight: 500, color: row.status === 'failed' ? '#ba1a1a' : '#3d4a3d' }}>
        <div>{row.paidDate}</div>
        <div style={{ marginTop: 2, fontSize: 12, fontWeight: 700, color: '#64748b' }}>{row.orderId}</div>
      </td>
      <td style={{ padding: '20px 24px', textAlign: 'center' }}>
        <Link
          href={row.href}
          title="Lihat detail"
          style={{ padding: 8, color: '#006e2f', background: 'transparent', borderRadius: 8, display: 'inline-flex', textDecoration: 'none', transition: 'background 0.15s' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,110,47,0.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <Icon name={row.status === 'pending' ? 'verified' : 'visibility'} />
        </Link>
      </td>
    </tr>
  );
}

export default function Page() {
  const { locale, t } = useLanguage();
  const [overview, setOverview] = useState<OwnerPaymentOverview | null>(null);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [paymentsError, setPaymentsError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');

  const loadPayments = useCallback(async () => {
    try {
      setIsLoadingPayments(true);
      setPaymentsError('');
      const data = await getOwnerPayments();
      setOverview(data);
    } catch (error) {
      setPaymentsError(error instanceof Error ? error.message : t('messages.loadPaymentsFailed'));
      setOverview(null);
    } finally {
      setIsLoadingPayments(false);
    }
  }, [t]);

  useEffect(() => {
    void Promise.resolve().then(loadPayments);
  }, [loadPayments]);

  useAutoRefresh(loadPayments);

  const rows = useMemo(
    () => buildRows(overview?.payments ?? [], locale, t('common.tenant'), t('tenant.applications.branchUnset')),
    [locale, overview, t],
  );
  const statsData = useMemo(() => buildStats(overview?.stats, t), [overview, t]);
  const branchOptions = useMemo(() => Array.from(new Set(rows.map((row) => row.branchName))).sort(), [rows]);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesBranch = selectedBranch === 'all' || row.branchName === selectedBranch;
      const searchable = `${row.tenantName} ${row.roomName} ${row.branchName} ${row.orderId}`.toLowerCase();

      return matchesBranch && (!keyword || searchable.includes(keyword));
    });
  }, [rows, search, selectedBranch]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f9f9ff; color: #111c2d; font-family: Inter, sans-serif; }
        .material-symbols-outlined { font-family: 'Material Symbols Outlined'; font-weight: normal; font-style: normal; line-height: 1; letter-spacing: normal; text-transform: none; display: inline-block; white-space: nowrap; direction: ltr; vertical-align: middle; -webkit-font-smoothing: antialiased; }
        select { appearance: none; -webkit-appearance: none; }

        @media (max-width: 1023px) {
          .owner-payments-main { padding: 16px !important; }
        }
        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .header-actions, .filter-bar { flex-direction: column !important; align-items: stretch !important; }
          .filter-selects { flex-direction: column !important; }
          .banner-inner { flex-direction: column !important; align-items: flex-start !important; }
        }
        @media (max-width: 400px) {
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <main
        className="owner-payments-main"
        style={{ minHeight: '100vh', background: '#f9f9ff', padding: 32, color: '#111c2d', fontFamily: 'Inter, sans-serif' }}
      >
        <header
          style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 40 }}
          className="header-actions"
        >
          <div>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3d4a3d', fontSize: 14, marginBottom: 8, fontWeight: 500 }}>
              <span>{t('owner.applications.eyebrow')}</span>
              <Icon name="chevron_right" size={16} />
              <span style={{ color: '#006e2f', fontWeight: 700 }}>{t('owner.payments.breadcrumb')}</span>
            </nav>
            <h1 style={{ fontSize: 36, fontWeight: 800, color: '#111c2d', fontFamily: 'Manrope, sans-serif', lineHeight: 1.1 }}>
              {t('owner.payments.title')}
            </h1>
            <p style={{ color: '#3d4a3d', marginTop: 4, fontSize: 14 }}>
              {t('owner.payments.subtitle')}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              type="button"
              disabled
              title={`${t('owner.payments.exportPdf')} - ${t('common.comingSoon')}`}
              style={{ background: '#ffffff', color: '#3d4a3d', border: '1px solid rgba(188,203,185,0.3)', padding: '10px 16px', borderRadius: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'not-allowed', fontSize: 14, opacity: 0.65 }}
            >
              <Icon name="file_download" />
              <span>{t('owner.payments.exportPdf')} - {t('owner.payments.comingSoonSuffix')}</span>
            </button>
            <button
              type="button"
              disabled
              title={`${t('owner.payments.manualInput')} - ${t('common.comingSoon')}`}
              style={{ background: '#e7eeff', color: '#3d4a3d', padding: '10px 20px', borderRadius: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, border: 'none', cursor: 'not-allowed', fontSize: 14, boxShadow: 'none', opacity: 0.75 }}
            >
              <Icon name="account_balance_wallet" />
              <span>{t('owner.payments.manualInput')} - {t('owner.payments.comingSoonSuffix')}</span>
            </button>
          </div>
        </header>

        <section
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 40 }}
          className="stats-grid"
        >
          {statsData.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </section>

        <section
          style={{ background: '#f0f3ff', padding: 20, borderRadius: 16, marginBottom: 24, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}
          className="filter-bar"
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }} className="filter-selects">
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: '#3d4a3d', marginBottom: 4, marginLeft: 4 }}>{t('owner.payments.selectBranch')}</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={selectedBranch}
                  onChange={(event) => setSelectedBranch(event.currentTarget.value)}
                  style={{ background: '#ffffff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, padding: '10px 40px 10px 16px', cursor: 'pointer', minWidth: 180, color: '#111c2d', outline: 'none' }}
                >
                  <option value="all">{t('owner.payments.allBranches')}</option>
                  {branchOptions.map((branch) => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
                <Icon name="expand_more" size={20} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#3d4a3d', pointerEvents: 'none' }} />
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: '#3d4a3d', marginBottom: 4, marginLeft: 4 }}>{t('owner.payments.period')}</label>
              <div style={{ position: 'relative' }}>
                <select
                  style={{ background: '#ffffff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, padding: '10px 40px 10px 16px', cursor: 'pointer', minWidth: 150, color: '#111c2d', outline: 'none' }}
                >
                  <option>{t('owner.payments.allPeriods')}</option>
                </select>
                <Icon name="calendar_month" size={20} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#3d4a3d', pointerEvents: 'none' }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', padding: '10px 16px', borderRadius: 12, border: '1px solid rgba(188,203,185,0.15)', flex: '1 1 280px', maxWidth: 320 }}>
            <Icon name="search" style={{ color: '#3d4a3d', marginRight: 12 }} />
            <input
              type="text"
              placeholder={t('owner.payments.searchPlaceholder')}
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 14, fontWeight: 500, width: '100%', color: '#111c2d' }}
            />
          </div>
        </section>

        <div style={{ background: '#ffffff', borderRadius: 16, boxShadow: '0 12px 40px rgba(17,28,45,0.06)', overflow: 'hidden', padding: isLoadingPayments || paymentsError || filteredRows.length === 0 ? 20 : 0 }}>
          {isLoadingPayments ? (
            <LoadingState title={t('common.loading')} description={t('owner.payments.subtitle')} />
          ) : paymentsError ? (
            <ErrorState title={t('messages.loadFailed')} description={paymentsError} onAction={() => void loadPayments()} />
          ) : filteredRows.length === 0 ? (
            <EmptyState
              title={rows.length === 0 ? t('empty.noPayments') : t('empty.paymentsNotFound')}
              description={rows.length === 0 ? t('owner.payments.reconciliationDescription') : t('owner.applications.notFoundDescription')}
              actionLabel={t('common.refresh')}
              onAction={() => void loadPayments()}
            />
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: 1080 }}>
                  <thead>
                    <tr style={{ background: 'rgba(248,250,252,0.5)' }}>
                      {[
                        t('owner.payments.tenantName'),
                        t('owner.payments.room'),
                        t('owner.payments.branch'),
                        t('owner.payments.status'),
                        t('owner.payments.subtotal'),
                        t('owner.payments.discount'),
                        t('owner.payments.totalPaid'),
                        t('owner.payments.paidDate'),
                        t('common.action'),
                      ].map((heading, index) => (
                        <th
                          key={heading}
                          style={{
                            padding: '20px 24px',
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            color: '#3d4a3d',
                            borderBottom: '1px solid #f1f5f9',
                            textAlign: index === 8 ? 'center' : 'left',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody style={{ borderTop: '1px solid #f8fafc' }}>
                    {filteredRows.map((row) => <PaymentTableRow key={row.id} row={row} />)}
                  </tbody>
                </table>
              </div>

              <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(248,250,252,0.5)', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: 12 }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: '#3d4a3d' }}>
                  {t('common.showing', { count: filteredRows.length, total: rows.length, item: t('common.payments') })}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button disabled style={{ padding: 6, borderRadius: 8, border: '1px solid rgba(188,203,185,0.3)', color: '#3d4a3d', background: 'transparent', cursor: 'not-allowed', opacity: 0.5, display: 'flex', alignItems: 'center' }}>
                    <Icon name="chevron_left" />
                  </button>
                  <button style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: 'none', background: '#006e2f', color: '#ffffff', fontSize: 12, fontWeight: 700 }}>
                    1
                  </button>
                  <button disabled style={{ padding: 6, borderRadius: 8, border: '1px solid rgba(188,203,185,0.3)', color: '#3d4a3d', background: 'transparent', cursor: 'not-allowed', opacity: 0.5, display: 'flex', alignItems: 'center' }}>
                    <Icon name="chevron_right" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div
          style={{ marginTop: 40, background: 'linear-gradient(135deg, #111c2d 0%, #1e293b 100%)', padding: 32, borderRadius: 24, color: '#ffffff', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}
          className="banner-inner"
        >
          <div style={{ position: 'absolute', bottom: -80, right: -80, width: 256, height: 256, background: 'rgba(0,110,47,0.2)', borderRadius: '50%', filter: 'blur(48px)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 520 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, fontFamily: 'Manrope, sans-serif' }}>
              {t('owner.payments.reconciliationTitle')}
            </h2>
            <p style={{ opacity: 0.8, fontSize: 14, lineHeight: 1.6 }}>
              {t('owner.payments.reconciliationDescription')}
            </p>
          </div>
          <Link
            href="/owner/tenants"
            style={{ position: 'relative', zIndex: 1, background: '#22c55e', color: '#004b1e', padding: '10px 24px', borderRadius: 12, fontWeight: 900, fontSize: 14, textDecoration: 'none' }}
          >
            {t('owner.payments.manageTenants')}
          </Link>
        </div>
      </main>
    </>
  );
}
