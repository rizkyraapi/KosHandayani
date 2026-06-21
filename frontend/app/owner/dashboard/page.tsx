'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BedDouble,
  Building2,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  DoorOpen,
  FileClock,
  Home,
  RefreshCw,
  TrendingUp,
  UsersRound,
  WalletCards,
  XCircle,
} from 'lucide-react';
import {
  AttentionList,
  BranchScopeControl,
  ErrorPanel,
  LoadingPanel,
  MetricCard,
  OwnerButton,
  OwnerCard,
  OwnerPage,
  OwnerPageHeader,
  SectionHeader,
  StatusPill,
} from '@/components/owner/OwnerUi';
import { getOwnerDashboardStats, type OwnerDashboardStats } from '@/lib/api';
import { useAutoRefresh } from '@/lib/use-auto-refresh';
import { useOwnerBranchScope } from '@/lib/use-owner-branch-scope';

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

function formatActivityDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function activityTone(type: string) {
  if (type.includes('success') || type === 'application_approved') return 'green' as const;
  if (type === 'reminder_sent') return 'amber' as const;
  return 'blue' as const;
}

export default function Page() {
  const [data, setData] = useState<OwnerDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { branches, branchScope, setBranchScope, branchesLoading } = useOwnerBranchScope();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getOwnerDashboardStats(branchScope);
      setData(response);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Gagal memuat dashboard owner.');
    } finally {
      setLoading(false);
    }
  }, [branchScope]);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  useAutoRefresh(load);
  const maxFinancialValue = Math.max(
    1,
    ...(data?.monthly_financial_trend.flatMap((item) => [item.revenue, item.expense]) || [1]),
  );

  return (
    <OwnerPage>
      <OwnerPageHeader
        eyebrow="Owner Dashboard"
        title="Pusat Monitoring Bisnis"
        description="Pantau okupansi, pendapatan, pengeluaran, laba bersih, lifecycle tenant, renewal, dan aktivitas operasional."
        actions={(
          <>
            <OwnerButton href="/owner/reports" variant="secondary">
              <TrendingUp size={17} />
              Buka laporan
            </OwnerButton>
            <OwnerButton onClick={() => void load()} disabled={loading}>
              <RefreshCw size={17} />
              Segarkan
            </OwnerButton>
          </>
        )}
      />

      <BranchScopeControl
        branches={branches}
        value={branchScope}
        onChange={setBranchScope}
        disabled={loading || branchesLoading}
        className="mb-8"
      />

      {loading && !data ? (
        <LoadingPanel label="Menyusun metrik bisnis terbaru..." />
      ) : error && !data ? (
        <ErrorPanel message={error} onRetry={() => void load()} />
      ) : data ? (
        <div className="space-y-8">
          {error && <ErrorPanel message={error} onRetry={() => void load()} />}

          <section>
            <SectionHeader title="Kinerja Keuangan Bulan Ini" description="Laba bersih dihitung dari revenue sukses dikurangi pengeluaran tercatat." />
            <div className="grid gap-4 sm:grid-cols-3">
              <MetricCard label="Pendapatan" value={rupiahCompact(data.financial.revenue)} icon={CircleDollarSign} tone="green" />
              <MetricCard label="Pengeluaran" value={rupiahCompact(data.financial.expense)} icon={WalletCards} tone="red" href="/owner/expenses" />
              <MetricCard
                label="Laba Bersih"
                value={rupiahCompact(data.financial.net_profit)}
                icon={TrendingUp}
                tone={data.financial.net_profit >= 0 ? 'blue' : 'red'}
              />
            </div>
          </section>

          <OwnerCard>
            <SectionHeader title="Revenue vs Expense" description={`Perbandingan bulanan tahun ${new Date(data.generated_at).getFullYear()}.`} />
            <div className="overflow-x-auto">
              <div className="flex min-w-[760px] items-end gap-3 border-b border-[#d8e3fb] px-2 pt-8">
                {data.monthly_financial_trend.map((item) => (
                  <div key={item.month} className="flex min-w-0 flex-1 flex-col items-center">
                    <div className="flex h-56 w-full items-end justify-center gap-1">
                      <div
                        title={`Revenue ${rupiah(item.revenue)}`}
                        className="w-5 rounded-t-md bg-[#006e2f]"
                        style={{ height: `${item.revenue > 0 ? Math.max(2, (item.revenue / maxFinancialValue) * 100) : 0}%` }}
                      />
                      <div
                        title={`Expense ${rupiah(item.expense)}`}
                        className="w-5 rounded-t-md bg-red-500"
                        style={{ height: `${item.expense > 0 ? Math.max(2, (item.expense / maxFinancialValue) * 100) : 0}%` }}
                      />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-[#3d4a3d]">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-5 text-sm">
              <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded bg-[#006e2f]" />Revenue</span>
              <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded bg-red-500" />Expense</span>
            </div>
          </OwnerCard>

          <section>
            <SectionHeader title="Statistik Utama" description="Okupansi dihitung dari room occupancy aktif, bukan sekadar flag kamar." />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Total Unit" value={data.units.total} icon={BedDouble} tone="blue" />
              <MetricCard label="Unit Terisi" value={data.units.occupied} icon={Home} tone="green" />
              <MetricCard label="Unit Kosong" value={data.units.vacant} icon={DoorOpen} tone="amber" />
              <MetricCard label="Occupancy Rate" value={`${data.units.occupancy_rate}%`} icon={Building2} tone="purple" hint={`${data.units.maintenance} unit maintenance`} />
            </div>
          </section>

          <section>
            <SectionHeader title="Pendapatan" description="Hanya transaksi settlement/capture yang dihitung sebagai revenue." />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Bulan Ini" value={rupiahCompact(data.revenue.this_month)} icon={CalendarClock} tone="green" />
              <MetricCard label="Total Pendapatan" value={rupiahCompact(data.revenue.total)} icon={CircleDollarSign} tone="blue" />
              <MetricCard label="Renewal" value={rupiahCompact(data.revenue.renewal)} icon={RefreshCw} tone="purple" />
              <MetricCard label="Initial Rent" value={rupiahCompact(data.revenue.initial)} icon={CreditCard} tone="green" />
            </div>
          </section>

          <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
            <section>
              <SectionHeader title="Lifecycle Tenant" description="Prioritas berdasarkan jarak tanggal akhir occupancy aktif." />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-2 2xl:grid-cols-5">
                <MetricCard label="Tenant Aktif" value={data.tenants.active} icon={UsersRound} tone="green" href="/owner/tenants" />
                <MetricCard label="H-30" value={data.tenants.h30} icon={Clock3} tone="amber" href="/owner/tenants?status=h30" />
                <MetricCard label="H-7" value={data.tenants.h7} icon={AlertTriangle} tone="orange" href="/owner/tenants?status=h7" />
                <MetricCard label="H-1" value={data.tenants.h1} icon={FileClock} tone="red" href="/owner/tenants?status=h1" />
                <MetricCard label="Overdue" value={data.tenants.overdue} icon={XCircle} tone="red" href="/owner/tenants?status=overdue" />
              </div>
            </section>

            <section>
              <SectionHeader title="Renewal Monitoring" description="Status pembayaran perpanjangan terbaru." />
              <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
                <MetricCard label="Renewal Pending" value={data.renewals.pending} icon={Clock3} tone="amber" href="/owner/payments?filter=renewal-pending" />
                <MetricCard label="Renewal Berhasil" value={data.renewals.successful} icon={CheckCircle2} tone="green" href="/owner/payments?filter=renewal-success" />
                <MetricCard label="Renewal Gagal" value={data.renewals.failed} icon={XCircle} tone="red" href="/owner/payments?filter=renewal-failed" />
              </div>
            </section>
          </div>

          <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
            <OwnerCard>
              <SectionHeader title="Perlu Perhatian" description="Item operasional dengan prioritas tertinggi." />
              <AttentionList items={data.attention} />
            </OwnerCard>

            <OwnerCard>
              <SectionHeader
                title="Aktivitas Terbaru"
                description="Pengajuan, pembayaran, renewal, dan reminder."
                action={<Link href="/owner/rental-applications" className="text-sm font-bold text-[#006e2f]">Lihat semua</Link>}
              />
              <div className="space-y-1">
                {data.activities.length === 0 ? (
                  <p className="py-8 text-center text-base text-[#3d4a3d]">Belum ada aktivitas terbaru.</p>
                ) : data.activities.map((activity, index) => (
                  <Link key={activity.id} href={activity.href} className="group flex gap-4 py-4">
                    <div className="flex flex-col items-center">
                      <span className="mt-0.5 h-3 w-3 rounded-full bg-[#006e2f]" />
                      {index < data.activities.length - 1 && <span className="mt-1 h-full w-px bg-[#d8e3fb]" />}
                    </div>
                    <div className="min-w-0 flex-1 border-b border-[#e7eeff] pb-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <StatusPill label={activity.title} tone={activityTone(activity.type)} dot={false} />
                          <p className="text-base font-semibold text-[#111c2d]">{activity.description}</p>
                        </div>
                        <span className="text-sm text-[#3d4a3d]">{formatActivityDate(activity.occurred_at)}</span>
                      </div>
                    </div>
                    <ArrowRight className="mt-4 shrink-0 text-[#006e2f] opacity-0 transition group-hover:opacity-100" size={17} />
                  </Link>
                ))}
              </div>
            </OwnerCard>
          </div>

          <OwnerCard>
            <SectionHeader title="Statistik Cabang" description="Unit, okupansi, revenue, expense, laba bersih, dan tenant aktif per cabang." />
            <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
              {data.branches.map((branch) => (
                <div key={branch.id} className="rounded-2xl border border-[#e7eeff] bg-[#f9f9ff] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.1em] text-[#006e2f]">Cabang</p>
                      <h3 className="mt-2 text-xl font-semibold text-[#111c2d]">{branch.branch_name}</h3>
                    </div>
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#006e2f] shadow-sm">
                      <Building2 size={20} />
                    </span>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-[#3d4a3d]">Jumlah kamar</p><p className="mt-1 text-lg font-bold">{branch.room_count}</p></div>
                    <div><p className="text-[#3d4a3d]">Kamar terisi</p><p className="mt-1 text-lg font-bold">{branch.occupied_units}</p></div>
                    <div><p className="text-[#3d4a3d]">Revenue</p><p className="mt-1 text-lg font-bold">{rupiah(branch.revenue)}</p></div>
                    <div><p className="text-[#3d4a3d]">Expense</p><p className="mt-1 text-lg font-bold text-red-700">{rupiah(branch.expense)}</p></div>
                    <div><p className="text-[#3d4a3d]">Laba bersih</p><p className="mt-1 text-lg font-bold">{rupiah(branch.net_profit)}</p></div>
                    <div><p className="text-[#3d4a3d]">Tenant aktif</p><p className="mt-1 text-lg font-bold">{branch.active_tenants}</p></div>
                  </div>
                  <div className="mt-5">
                    <div className="mb-2 flex justify-between text-sm font-semibold">
                      <span>Occupancy rate</span>
                      <span className="text-[#006e2f]">{branch.occupancy_rate}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#e7eeff]">
                      <div className="h-full rounded-full bg-[#006e2f]" style={{ width: `${Math.min(100, branch.occupancy_rate)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </OwnerCard>

          <OwnerCard className="bg-[#006e2f] text-white">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.1em] text-white/70">Antrian operasional</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Review pengajuan dan pembayaran berikutnya</h2>
                <p className="mt-2 text-base text-white/80">
                  {data.applications.pending_review} menunggu review · {data.applications.awaiting_payment} menunggu pembayaran
                </p>
              </div>
              <OwnerButton href="/owner/rental-applications" variant="secondary">
                Kelola pengajuan
                <ArrowRight size={17} />
              </OwnerButton>
            </div>
          </OwnerCard>
        </div>
      ) : null}
    </OwnerPage>
  );
}
