'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { EmptyState, ErrorState, LoadingState } from '@/components/UiState';
import { useLanguage } from '@/contexts/LanguageContext';
import { getOwnerTenants, type OwnerTenantOccupancy } from '@/lib/api';
import type { Locale } from '@/lib/i18n';
import { useAutoRefresh } from '@/lib/use-auto-refresh';

function formatDate(value?: string | null, locale: Locale = 'id') {
  if (!value) return '-';
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', { dateStyle: 'medium' }).format(new Date(value));
}

function formatRupiah(value?: number | null) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

function paymentStatusLabel(status: string | null | undefined, t: (key: string) => string) {
  if (!status) return t('common.none');

  return t(`status.${status}`);
}

function paymentStatusStyle(status?: string | null) {
  if (status === 'paid') {
    return { bg: '#afefb4', color: '#346e40' };
  }

  if (status === 'failed') {
    return { bg: '#ffdad6', color: '#ba1a1a' };
  }

  return { bg: '#dee8ff', color: '#3d4a3d' };
}

export default function Page() {
  const { locale, t } = useLanguage();
  const [occupancies, setOccupancies] = useState<OwnerTenantOccupancy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const loadTenants = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await getOwnerTenants();
      setOccupancies(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t('messages.loadTenantsFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void Promise.resolve().then(loadTenants);
  }, [loadTenants]);

  useAutoRefresh(loadTenants);

  const filteredOccupancies = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return occupancies.filter((occupancy) => {
      const searchable = [
        occupancy.tenant?.full_name,
        occupancy.tenant?.email,
        occupancy.room?.room_name,
        occupancy.room?.branch?.branch_name,
        occupancy.payment?.order_id,
      ].filter(Boolean).join(' ').toLowerCase();

      return !keyword || searchable.includes(keyword);
    });
  }, [occupancies, search]);

  const paidCount = occupancies.filter((item) => item.payment_status === 'paid').length;
  const failedCount = occupancies.filter((item) => item.payment_status === 'failed').length;
  const totalRevenue = occupancies.reduce((total, item) => {
    if (item.payment_status !== 'paid') return total;
    return total + (item.payment?.gross_amount ?? 0);
  }, 0);

  return (
    <main style={{ minHeight: '100vh', background: '#f9f9ff', padding: 32, color: '#111c2d', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 28 }}>
        <div>
          <p style={{ margin: '0 0 8px', color: '#006e2f', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {t('owner.applications.eyebrow')}
          </p>
          <h1 style={{ margin: 0, fontFamily: 'Manrope, sans-serif', fontSize: 'clamp(28px, 4vw, 36px)' }}>{t('owner.tenants.title')}</h1>
          <p style={{ margin: '6px 0 0', color: '#3d4a3d' }}>{t('owner.tenants.subtitle')}</p>
        </div>
        <input
          type="text"
          placeholder={t('owner.tenants.searchPlaceholder')}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          style={{ width: 280, maxWidth: '100%', border: 'none', borderRadius: 12, background: '#f0f3ff', padding: '12px 14px', color: '#111c2d', outline: 'none' }}
        />
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 24 }}>
        <Stat label={t('owner.tenants.active')} value={occupancies.length} />
        <Stat label={t('owner.tenants.paidPayments')} value={paidCount} />
        <Stat label={t('owner.tenants.failedPayments')} value={failedCount} />
        <Stat label={t('owner.tenants.paidRevenue')} value={formatRupiah(totalRevenue)} />
      </section>

      <section style={{ background: '#fff', borderRadius: 12, boxShadow: '0 12px 36px rgba(17,28,45,0.05)', overflow: 'hidden', padding: isLoading || error || filteredOccupancies.length === 0 ? 20 : 0 }}>
        {isLoading ? (
          <LoadingState title={t('common.loading')} description={t('owner.tenants.subtitle')} />
        ) : error ? (
          <ErrorState title={t('messages.loadFailed')} description={error} onAction={() => void loadTenants()} />
        ) : filteredOccupancies.length === 0 ? (
          <EmptyState
            title={occupancies.length === 0 ? t('empty.noTenants') : t('empty.tenantsNotFound')}
            description={occupancies.length === 0 ? t('owner.tenants.subtitle') : t('owner.applications.notFoundDescription')}
            actionLabel={t('common.refresh')}
            onAction={() => void loadTenants()}
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 860 }}>
              <thead>
                <tr style={{ background: '#f0f3ff', height: 54 }}>
                  {[
                    t('common.tenant'),
                    t('common.room'),
                    t('owner.applications.branch'),
                    t('owner.tenants.startDate'),
                    t('owner.tenants.endDate'),
                    t('owner.tenants.paymentStatus'),
                    t('common.action'),
                  ].map((heading) => (
                    <th key={heading} style={{ padding: '0 18px', color: '#3d4a3d', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOccupancies.map((occupancy) => {
                  const statusStyle = paymentStatusStyle(occupancy.payment_status);

                  return (
                    <tr key={occupancy.id} style={{ borderTop: '1px solid #f0f3ff' }}>
                      <td style={{ padding: 18 }}>
                        <p style={{ margin: 0, fontWeight: 800 }}>{occupancy.tenant?.full_name || '-'}</p>
                        <p style={{ margin: '3px 0 0', color: '#3d4a3d', fontSize: 12 }}>{occupancy.tenant?.email || '-'}</p>
                      </td>
                      <td style={{ padding: 18 }}>{occupancy.room?.room_name || '-'}</td>
                      <td style={{ padding: 18 }}>{occupancy.room?.branch?.branch_name || '-'}</td>
                      <td style={{ padding: 18 }}>{formatDate(occupancy.start_date, locale)}</td>
                      <td style={{ padding: 18 }}>{formatDate(occupancy.end_date, locale)}</td>
                      <td style={{ padding: 18 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 999, background: statusStyle.bg, color: statusStyle.color, padding: '5px 10px', fontSize: 12, fontWeight: 800 }}>
                          {paymentStatusLabel(occupancy.payment_status, t)}
                        </span>
                        {occupancy.payment && (
                          <p style={{ margin: '6px 0 0', color: '#006e2f', fontSize: 12, fontWeight: 800 }}>
                            {formatRupiah(occupancy.payment.gross_amount)}
                          </p>
                        )}
                      </td>
                      <td style={{ padding: 18 }}>
                        <Link href={`/owner/rental-applications/${occupancy.rental_application_id}`} style={{ color: '#006e2f', fontWeight: 800, textDecoration: 'none' }}>
                          {t('common.detail')}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 12px 36px rgba(17,28,45,0.05)' }}>
      <p style={{ margin: 0, color: '#3d4a3d', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>{label}</p>
      <p style={{ margin: '8px 0 0', color: '#111c2d', fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 900 }}>{value}</p>
    </div>
  );
}
