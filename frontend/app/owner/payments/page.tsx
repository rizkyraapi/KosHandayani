'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Clock3,
  CreditCard,
  RefreshCw,
  RotateCw,
  Search,
  TriangleAlert,
} from 'lucide-react';
import {
  BranchScopeControl,
  EmptyPanel,
  ErrorPanel,
  LoadingPanel,
  MetricCard,
  OwnerButton,
  OwnerCard,
  OwnerInput,
  OwnerPage,
  OwnerPageHeader,
  PaymentStatusPill,
  SectionHeader,
  StatusPill,
} from '@/components/owner/OwnerUi';
import { getOwnerPayments, type OwnerPaymentOverview } from '@/lib/api';
import { getPaymentStatusMeta } from '@/lib/paymentStatus';
import { useAutoRefresh } from '@/lib/use-auto-refresh';
import { useOwnerBranchScope } from '@/lib/use-owner-branch-scope';

type Filter = 'all' | 'initial' | 'renewal' | 'success' | 'pending' | 'failed';

function rupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

function rupiahCompact(value: number) {
  if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} M`;
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
  if (value >= 1_000) return `Rp ${(value / 1_000).toLocaleString('id-ID', { maximumFractionDigits: 0 })} rb`;
  return rupiah(value);
}

function dateTime(value?: string | null) {
  return value
    ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
    : '-';
}

function normalizedStatus(status: string) {
  const meta = getPaymentStatusMeta(status);
  if (meta.isPaid) return 'success';
  if (meta.isFailed) return 'failed';
  return 'pending';
}

export default function Page() {
  const [overview, setOverview] = useState<OwnerPaymentOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>(() => {
    if (typeof window === 'undefined') return 'all';
    const params = new URLSearchParams(window.location.search);
    const requestedFilter = params.get('filter');
    const category = params.get('category');
    if (category === 'renewal') return 'renewal';
    if (requestedFilter?.endsWith('success')) return 'success';
    if (requestedFilter?.endsWith('failed')) return 'failed';
    if (requestedFilter?.includes('renewal')) return 'renewal';
    return 'all';
  });
  const [search, setSearch] = useState('');
  const [tenantId, setTenantId] = useState(() => (
    typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('tenant') || ''
  ));
  const { branches, branchScope, setBranchScope, branchesLoading } = useOwnerBranchScope();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setOverview(await getOwnerPayments(branchScope));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Gagal memuat data pembayaran.');
    } finally {
      setLoading(false);
    }
  }, [branchScope]);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);
  useAutoRefresh(load);

  const rows = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    return (overview?.payments || []).filter((payment) => {
      const status = normalizedStatus(payment.transaction_status);
      const matchesFilter = filter === 'all'
        || (filter === 'initial' && payment.payment_category === 'initial_rent')
        || (filter === 'renewal' && payment.payment_category === 'renewal')
        || status === filter;
      const matchesSearch = !keyword || [
        payment.tenant?.full_name,
        payment.tenant?.email,
        payment.room?.room_name,
        payment.room?.branch?.branch_name,
        payment.order_id,
      ].filter(Boolean).join(' ').toLowerCase().includes(keyword);
      const matchesTenant = !tenantId || String(payment.tenant?.id) === tenantId;
      return matchesFilter && matchesSearch && matchesTenant;
    });
  }, [filter, overview, search, tenantId]);

  const filters: Array<{ key: Filter; label: string }> = [
    { key: 'all', label: 'Semua' },
    { key: 'initial', label: 'Initial Rent' },
    { key: 'renewal', label: 'Renewal' },
    { key: 'success', label: 'Lunas' },
    { key: 'pending', label: 'Menunggu' },
    { key: 'failed', label: 'Gagal' },
  ];

  return (
    <OwnerPage>
      <OwnerPageHeader
        eyebrow="Payment Reconciliation"
        title="Pembayaran"
        description="Pisahkan initial rent dan renewal, pantau nominal pending/gagal, dan telusuri setiap order."
        actions={<OwnerButton onClick={() => void load()}><RefreshCw size={17} />Segarkan</OwnerButton>}
      />

      <BranchScopeControl
        branches={branches}
        value={branchScope}
        onChange={setBranchScope}
        disabled={loading || branchesLoading}
        className="mb-8"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Revenue Initial Rent" value={rupiahCompact(overview?.stats.revenue_initial || 0)} icon={CreditCard} tone="green" />
        <MetricCard label="Revenue Renewal" value={rupiahCompact(overview?.stats.revenue_renewal || 0)} icon={RotateCw} tone="purple" />
        <MetricCard label="Pending Amount" value={rupiahCompact(overview?.stats.pending_amount || 0)} icon={Clock3} tone="amber" />
        <MetricCard label="Failed Amount" value={rupiahCompact(overview?.stats.failed_amount || 0)} icon={TriangleAlert} tone="red" />
      </div>

      <OwnerCard>
        <SectionHeader
          title="Riwayat Transaksi"
          description={`${rows.length} transaksi ditampilkan · Total terkumpul ${rupiah(overview?.stats.total_collected || 0)}`}
          action={(
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 text-[#6d7b6c]" size={17} />
              <OwnerInput value={search} onChange={setSearch} placeholder="Cari tenant, kamar, order ID..." className="w-full pl-10 sm:w-72" />
            </div>
          )}
        />

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {filters.map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`h-10 shrink-0 rounded-xl px-4 text-sm font-bold transition ${
                filter === item.key ? 'bg-[#006e2f] text-white' : 'bg-[#f0f3ff] text-[#3d4a3d] hover:bg-[#e7eeff]'
              }`}
            >
              {item.label}
            </button>
          ))}
          {tenantId && (
            <button onClick={() => setTenantId('')} className="h-10 shrink-0 rounded-xl bg-red-50 px-4 text-sm font-bold text-red-700">
              Hapus filter tenant
            </button>
          )}
        </div>

        {loading && !overview ? (
          <LoadingPanel />
        ) : error && !overview ? (
          <ErrorPanel message={error} onRetry={() => void load()} />
        ) : rows.length === 0 ? (
          <EmptyPanel title="Transaksi tidak ditemukan" description="Ubah filter atau kata kunci untuk melihat transaksi lainnya." />
        ) : (
          <div className="grid gap-3">
            {rows.map((payment) => (
              <Link
                key={payment.id}
                href={`/owner/rental-applications/${payment.rental_application_id}`}
                className="group grid gap-4 rounded-2xl border border-[#e7eeff] bg-[#f9f9ff] p-5 transition hover:border-[#bccbb9] hover:bg-[#f0f3ff] xl:grid-cols-[minmax(0,1fr)_minmax(0,0.75fr)_minmax(0,0.75fr)_190px] xl:items-center"
              >
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <StatusPill label={payment.payment_category === 'renewal' ? 'Renewal' : 'Initial Rent'} tone={payment.payment_category === 'renewal' ? 'purple' : 'blue'} />
                    <PaymentStatusPill status={payment.transaction_status} />
                  </div>
                  <h3 className="text-xl font-semibold">{payment.tenant?.full_name || payment.tenant?.email || 'Penyewa'}</h3>
                  <p className="mt-1 text-base text-[#3d4a3d]">{payment.room?.room_name || '-'} · {payment.room?.branch?.branch_name || '-'}</p>
                </div>

                <div>
                  <p className="text-sm text-[#3d4a3d]">Order ID</p>
                  <p className="mt-1 break-all text-sm font-semibold">{payment.order_id}</p>
                  <p className="mt-3 text-sm text-[#3d4a3d]">Metode</p>
                  <p className="mt-1 text-sm font-semibold">{payment.payment_type || '-'}</p>
                </div>

                <div>
                  <p className="text-sm text-[#3d4a3d]">Subtotal</p>
                  <p className="mt-1 text-base font-semibold">{rupiah(payment.subtotal_amount ?? payment.gross_amount)}</p>
                  <p className="mt-3 text-sm text-[#3d4a3d]">Diskon / Total</p>
                  <p className="mt-1 text-base font-semibold">{rupiah(payment.discount_amount || 0)} / {rupiah(payment.gross_amount)}</p>
                </div>

                <div className="flex items-center justify-between gap-3 xl:justify-end">
                  <div className="xl:text-right">
                    <p className="text-sm text-[#3d4a3d]">Tanggal</p>
                    <p className="mt-1 text-sm font-semibold">{dateTime(payment.paid_at || payment.created_at)}</p>
                  </div>
                  <ArrowRight className="shrink-0 text-[#006e2f] transition group-hover:translate-x-1" size={18} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </OwnerCard>
    </OwnerPage>
  );
}
