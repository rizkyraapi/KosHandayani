'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileClock,
  RefreshCw,
  RotateCw,
  Search,
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
import {
  getOwnerApplicationMonitoring,
  type OwnerApplicationMonitorItem,
  type OwnerApplicationMonitoring,
  type OwnerPaymentOverview,
} from '@/lib/api';
import { useAutoRefresh } from '@/lib/use-auto-refresh';
import { useOwnerBranchScope } from '@/lib/use-owner-branch-scope';

type Tab = 'new' | 'renewal' | 'cancelled' | 'rejected' | 'all';

function date(value?: string | null) {
  return value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value)) : '-';
}

function rupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

function applicationPaymentLabel(item: OwnerApplicationMonitorItem) {
  if (item.payment_status === 'paid') return 'Pembayaran berhasil';
  if (item.payment_status === 'failed') return 'Pembayaran gagal';
  if (item.status === 'approved') return 'Menunggu pembayaran';
  if (item.status === 'cancelled') return 'Dibatalkan';
  if (item.status === 'rejected') return 'Ditolak';
  return 'Belum diproses';
}

function ApplicationRow({ item }: { item: OwnerApplicationMonitorItem }) {
  return (
    <Link
      href={`/owner/rental-applications/${item.id}`}
      className="group grid gap-4 rounded-2xl border border-[#e7eeff] bg-[#f9f9ff] p-5 transition hover:border-[#bccbb9] hover:bg-[#f0f3ff] lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_180px] lg:items-center"
    >
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <StatusPill
            label={item.status === 'pending' ? 'Menunggu review' : item.status}
            tone={item.status === 'pending' ? 'amber' : item.status === 'approved' ? 'green' : item.status === 'cancelled' ? 'slate' : 'red'}
          />
          <PaymentStatusPill status={item.payment_status} />
        </div>
        <h3 className="text-xl font-semibold text-[#111c2d]">{item.tenant?.full_name || item.tenant?.email || 'Penyewa'}</h3>
        <p className="mt-1 text-base text-[#3d4a3d]">{item.room?.room_name || 'Kamar tidak tersedia'} · {item.room?.branch?.branch_name || 'Cabang belum diatur'}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div><p className="text-[#3d4a3d]">Tanggal masuk</p><p className="mt-1 font-semibold">{date(item.move_in_date)}</p></div>
        <div><p className="text-[#3d4a3d]">Durasi</p><p className="mt-1 font-semibold">{item.duration}</p></div>
        <div><p className="text-[#3d4a3d]">Diajukan</p><p className="mt-1 font-semibold">{date(item.created_at)}</p></div>
        <div><p className="text-[#3d4a3d]">Pembayaran</p><p className="mt-1 font-semibold">{applicationPaymentLabel(item)}</p></div>
      </div>
      <div className="flex items-center justify-between gap-3 lg:justify-end">
        <span className="text-sm font-semibold text-[#3d4a3d]">{item.payment_count} transaksi</span>
        <ArrowRight className="text-[#006e2f] transition group-hover:translate-x-1" size={19} />
      </div>
    </Link>
  );
}

function RenewalRow({ payment }: { payment: OwnerPaymentOverview['payments'][number] }) {
  return (
    <Link
      href={`/owner/rental-applications/${payment.rental_application_id}`}
      className="group grid gap-4 rounded-2xl border border-[#e7eeff] bg-[#f9f9ff] p-5 transition hover:border-[#bccbb9] hover:bg-[#f0f3ff] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_180px] lg:items-center"
    >
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <StatusPill label="Perpanjangan" tone="purple" />
          <PaymentStatusPill status={payment.transaction_status} />
        </div>
        <h3 className="text-xl font-semibold">{payment.tenant?.full_name || payment.tenant?.email || 'Penyewa'}</h3>
        <p className="mt-1 text-base text-[#3d4a3d]">{payment.room?.room_name || '-'} · {payment.room?.branch?.branch_name || '-'}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div><p className="text-[#3d4a3d]">Periode baru</p><p className="mt-1 font-semibold">{date(payment.period_start)} – {date(payment.period_end)}</p></div>
        <div><p className="text-[#3d4a3d]">Nominal</p><p className="mt-1 font-semibold">{rupiah(payment.gross_amount)}</p></div>
      </div>
      <div className="flex items-center justify-between gap-3 lg:justify-end">
        <span className="truncate text-sm font-semibold text-[#3d4a3d]">{payment.order_id}</span>
        <ArrowRight className="shrink-0 text-[#006e2f] transition group-hover:translate-x-1" size={19} />
      </div>
    </Link>
  );
}

export default function Page() {
  const [data, setData] = useState<OwnerApplicationMonitoring | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('new');
  const [search, setSearch] = useState('');
  const { branches, branchScope, setBranchScope, branchesLoading } = useOwnerBranchScope();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setData(await getOwnerApplicationMonitoring(branchScope));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Gagal memuat monitoring pengajuan.');
    } finally {
      setLoading(false);
    }
  }, [branchScope]);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);
  useAutoRefresh(load);

  const applicationRows = useMemo(() => {
    if (!data) return [];
    const rows = tab === 'new'
      ? data.new_applications
      : tab === 'cancelled'
        ? data.cancelled
        : tab === 'rejected'
          ? data.rejected
          : data.all_applications;
    const keyword = search.toLowerCase().trim();

    return rows.filter((item) => !keyword || [
      item.tenant?.full_name,
      item.tenant?.email,
      item.room?.room_name,
      item.room?.branch?.branch_name,
    ].filter(Boolean).join(' ').toLowerCase().includes(keyword));
  }, [data, search, tab]);

  const renewalRows = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    return (data?.renewals || []).filter((payment) => !keyword || [
      payment.tenant?.full_name,
      payment.tenant?.email,
      payment.room?.room_name,
      payment.order_id,
    ].filter(Boolean).join(' ').toLowerCase().includes(keyword));
  }, [data, search]);

  const tabs: Array<{ key: Tab; label: string; count: number }> = [
    { key: 'new', label: 'Pengajuan Baru', count: data?.new_applications.length || 0 },
    { key: 'renewal', label: 'Perpanjangan', count: data?.renewals.length || 0 },
    { key: 'cancelled', label: 'Dibatalkan', count: data?.cancelled.length || 0 },
    { key: 'rejected', label: 'Ditolak', count: data?.rejected.length || 0 },
    { key: 'all', label: 'Semua', count: data?.all_applications.length || 0 },
  ];

  return (
    <OwnerPage>
      <OwnerPageHeader
        eyebrow="Application Lifecycle"
        title="Pengajuan Sewa"
        description="Pengajuan awal dan renewal dipantau terpisah dengan status pembayaran yang konsisten."
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
        <MetricCard label="Menunggu Review" value={data?.stats.pending_review || 0} icon={FileClock} tone="amber" />
        <MetricCard label="Menunggu Pembayaran" value={data?.stats.awaiting_payment || 0} icon={Clock3} tone="orange" />
        <MetricCard label="Pembayaran Berhasil" value={data?.stats.payment_success || 0} icon={CheckCircle2} tone="green" />
        <MetricCard label="Renewal Pending" value={data?.stats.renewal_pending || 0} icon={RotateCw} tone="purple" />
      </div>

      <OwnerCard>
        <SectionHeader
          title="Antrian Pengajuan"
          description="Pilih kategori untuk meninjau state bisnis yang relevan."
          action={(
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 text-[#6d7b6c]" size={17} />
              <OwnerInput value={search} onChange={setSearch} placeholder="Cari penyewa, kamar, order ID..." className="w-full pl-10 sm:w-72" />
            </div>
          )}
        />

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {tabs.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-bold transition ${
                tab === item.key ? 'bg-[#006e2f] text-white' : 'bg-[#f0f3ff] text-[#3d4a3d] hover:bg-[#e7eeff]'
              }`}
            >
              {item.label}
              <span className={`rounded-full px-2 py-0.5 text-xs ${tab === item.key ? 'bg-white/20' : 'bg-white'}`}>{item.count}</span>
            </button>
          ))}
        </div>

        {loading && !data ? (
          <LoadingPanel />
        ) : error && !data ? (
          <ErrorPanel message={error} onRetry={() => void load()} />
        ) : tab === 'renewal' ? (
          renewalRows.length ? (
            <div className="grid gap-4">{renewalRows.map((payment) => <RenewalRow key={payment.id} payment={payment} />)}</div>
          ) : <EmptyPanel title="Tidak ada renewal" description="Pembayaran perpanjangan akan muncul di sini." />
        ) : applicationRows.length ? (
          <div className="grid gap-4">{applicationRows.map((item) => <ApplicationRow key={item.id} item={item} />)}</div>
        ) : (
          <EmptyPanel title="Tidak ada pengajuan" description="Tidak ada data yang sesuai dengan kategori dan pencarian saat ini." />
        )}
      </OwnerCard>
    </OwnerPage>
  );
}
