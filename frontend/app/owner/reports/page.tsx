'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Building2,
  CircleDollarSign,
  DoorOpen,
  FileDown,
  RefreshCw,
  RotateCw,
  TrendingUp,
  UsersRound,
  WalletCards,
  Tags,
} from 'lucide-react';
import {
  BranchScopeControl,
  EmptyPanel,
  ErrorPanel,
  LoadingPanel,
  MetricCard,
  OwnerButton,
  OwnerCard,
  OwnerPage,
  OwnerPageHeader,
  OwnerSelect,
  PaymentStatusPill,
  SectionHeader,
  StatusPill,
} from '@/components/owner/OwnerUi';
import { exportOwnerReportPdf, getOwnerReport, type OwnerReport } from '@/lib/api';
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

function date(value?: string | null) {
  return value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value)) : '-';
}

const months = [
  'Semua bulan', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export default function Page() {
  const [report, setReport] = useState<OwnerReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [month, setMonth] = useState('all');
  const { branches, branchScope, setBranchScope, branchesLoading } = useOwnerBranchScope();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getOwnerReport({
        year,
        ...(month !== 'all' ? { month } : {}),
        branch_id: branchScope,
      });
      setReport(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Gagal memuat laporan owner.');
    } finally {
      setLoading(false);
    }
  }, [branchScope, month, year]);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const exportPdf = useCallback(async () => {
    try {
      setExporting(true);
      setError('');
      const { blob, filename } = await exportOwnerReportPdf({
        year,
        ...(month !== 'all' ? { month } : {}),
        branch_id: branchScope,
      });
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');

      anchor.href = objectUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : 'Gagal mengekspor laporan PDF.');
    } finally {
      setExporting(false);
    }
  }, [branchScope, month, year]);

  const maxFinancialValue = useMemo(
    () => Math.max(1, ...(report?.monthly_trend.flatMap((item) => [item.revenue, item.expense]) || [1])),
    [report],
  );

  return (
    <OwnerPage>
      <OwnerPageHeader
        eyebrow="Financial Intelligence"
        title="Laporan Keuangan"
        description="Laporan real-time pendapatan, pengeluaran, laba bersih, occupancy, dan renewal."
        actions={(
          <div className="flex flex-wrap gap-3">
            <OwnerSelect value={month} onChange={setMonth} ariaLabel="Filter bulan">
              {months.map((label, index) => <option key={label} value={index === 0 ? 'all' : String(index)}>{label}</option>)}
            </OwnerSelect>
            <OwnerSelect value={year} onChange={setYear} ariaLabel="Filter tahun">
              {(report?.filters.years || [Number(year)]).map((item) => <option key={item} value={String(item)}>{item}</option>)}
            </OwnerSelect>
            <OwnerButton onClick={() => void exportPdf()} variant="secondary" disabled={loading || exporting}>
              <FileDown size={17} />
              {exporting ? 'Menyiapkan PDF...' : 'Export PDF'}
            </OwnerButton>
            <OwnerButton onClick={() => void load()} disabled={loading}><RefreshCw size={17} />Segarkan</OwnerButton>
          </div>
        )}
      />

      <BranchScopeControl
        branches={branches}
        value={branchScope}
        onChange={setBranchScope}
        disabled={loading || branchesLoading}
        className="mb-8"
      />

      {loading && !report ? (
        <LoadingPanel label="Menghitung laporan dari database..." />
      ) : error && !report ? (
        <ErrorPanel message={error} onRetry={() => void load()} />
      ) : report ? (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard label="Total Revenue" value={rupiahCompact(report.summary.total_revenue)} icon={CircleDollarSign} tone="green" />
            <MetricCard label="Total Pengeluaran" value={rupiahCompact(report.summary.total_expense)} icon={WalletCards} tone="red" />
            <MetricCard label="Laba Bersih" value={rupiahCompact(report.summary.net_profit)} icon={TrendingUp} tone={report.summary.net_profit >= 0 ? 'blue' : 'red'} />
            <MetricCard label="Revenue Initial" value={rupiahCompact(report.summary.initial_revenue)} icon={TrendingUp} tone="blue" />
            <MetricCard label="Revenue Renewal" value={rupiahCompact(report.summary.renewal_revenue)} icon={RotateCw} tone="purple" />
            <MetricCard label="Average / Room" value={rupiahCompact(report.summary.average_revenue_per_room)} icon={Building2} tone="amber" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard label="Occupancy Rate" value={`${report.summary.occupancy_rate}%`} icon={DoorOpen} tone="green" />
            <MetricCard label="Tenant Aktif" value={report.summary.active_tenants} icon={UsersRound} tone="blue" />
            <MetricCard label="Renewal Rate" value={`${report.summary.renewal_rate}%`} icon={RefreshCw} tone="purple" />
          </div>

          <OwnerCard>
            <SectionHeader title="Monthly Financial Trend" description="Initial rent, renewal, dan pengeluaran per bulan dalam tahun terpilih." />
            <div className="overflow-x-auto">
              <div className="flex min-w-[760px] items-end gap-3 border-b border-[#d8e3fb] px-2 pt-8">
                {report.monthly_trend.map((item) => (
                  <div key={item.month} className="flex min-w-0 flex-1 flex-col items-center">
                    <div className="flex h-64 w-full items-end justify-center gap-1">
                      <div
                        title={`Initial ${rupiah(item.initial_revenue)}`}
                        className="w-5 rounded-t-md bg-[#006e2f]"
                        style={{ height: `${item.initial_revenue > 0 ? Math.max(2, (item.initial_revenue / maxFinancialValue) * 100) : 0}%` }}
                      />
                      <div
                        title={`Renewal ${rupiah(item.renewal_revenue)}`}
                        className="w-5 rounded-t-md bg-[#8b5cf6]"
                        style={{ height: `${item.renewal_revenue > 0 ? Math.max(2, (item.renewal_revenue / maxFinancialValue) * 100) : 0}%` }}
                      />
                      <div
                        title={`Expense ${rupiah(item.expense)}`}
                        className="w-5 rounded-t-md bg-red-500"
                        style={{ height: `${item.expense > 0 ? Math.max(2, (item.expense / maxFinancialValue) * 100) : 0}%` }}
                      />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-[#3d4a3d]">{item.label}</p>
                    <p className="mt-1 text-xs text-[#006e2f]">{item.occupancy_rate}%</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-5 text-sm">
              <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded bg-[#006e2f]" />Initial rent</span>
              <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded bg-[#8b5cf6]" />Renewal</span>
              <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded bg-red-500" />Expense</span>
              <span className="text-[#3d4a3d]">Persentase di bawah bulan = occupancy rate</span>
            </div>
          </OwnerCard>

          <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
            <OwnerCard>
              <SectionHeader title="Revenue per Cabang" description="Revenue dan occupancy dibandingkan per lokasi." />
              {report.revenue_per_branch.length === 0 ? (
                <EmptyPanel title="Belum ada cabang" description="Data cabang akan tampil setelah kamar dan transaksi tersedia." />
              ) : (
                <div className="grid gap-4">
                  {report.revenue_per_branch.map((item) => (
                    <div key={item.id} className="rounded-xl border border-[#e7eeff] bg-[#f9f9ff] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-lg font-semibold">{item.branch_name}</p>
                          <p className="mt-1 text-sm text-[#3d4a3d]">{item.occupied_units}/{item.rooms} unit terisi</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-[#006e2f]">{rupiah(item.revenue)}</p>
                          <p className="mt-1 text-sm font-semibold text-red-700">Expense {rupiah(item.expense)}</p>
                          <p className="mt-1 text-sm font-bold">Laba {rupiah(item.net_profit)}</p>
                        </div>
                      </div>
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e7eeff]">
                        <div className="h-full bg-[#006e2f]" style={{ width: `${item.occupancy_rate}%` }} />
                      </div>
                      <p className="mt-2 text-right text-sm font-semibold">{item.occupancy_rate}% occupancy</p>
                    </div>
                  ))}
                </div>
              )}
            </OwnerCard>

            <OwnerCard>
              <SectionHeader title="Revenue vs Occupancy" description="Korelasi performa unit dan pendapatan bulanan." />
              <div className="grid gap-3">
                {report.monthly_trend.filter((item) => item.revenue > 0 || item.occupied_units > 0).map((item) => (
                  <div key={item.month} className="grid grid-cols-[52px_minmax(0,1fr)_120px] items-center gap-3">
                    <span className="text-sm font-semibold">{item.label}</span>
                    <div className="h-3 overflow-hidden rounded-full bg-[#e7eeff]">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#006e2f] to-[#22c55e]" style={{ width: `${item.occupancy_rate}%` }} />
                    </div>
                    <span className="text-right text-sm font-semibold">{rupiah(item.revenue)}</span>
                  </div>
                ))}
              </div>
            </OwnerCard>
          </div>

          <div className="grid gap-8 xl:grid-cols-2">
            <OwnerCard>
              <SectionHeader title="Pengeluaran per Kategori" description="Komposisi biaya pada periode laporan." />
              {report.expense_by_category.length === 0 ? (
                <EmptyPanel title="Belum ada pengeluaran" description="Tidak ada pengeluaran pada filter periode ini." />
              ) : (
                <div className="grid gap-3">
                  {report.expense_by_category.map((item) => (
                    <div key={item.category} className="rounded-xl border border-[#e7eeff] bg-[#f9f9ff] p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Tags size={18} className="text-[#006e2f]" />
                          <div>
                            <p className="font-semibold">{item.category}</p>
                            <p className="mt-1 text-sm text-[#3d4a3d]">{item.transactions} transaksi · {item.percentage}%</p>
                          </div>
                        </div>
                        <p className="font-bold text-red-700">{rupiah(item.amount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </OwnerCard>

            <OwnerCard>
              <SectionHeader title="Pengeluaran per Cabang" description="Total biaya operasional berdasarkan lokasi." />
              {report.expense_by_branch.length === 0 ? (
                <EmptyPanel title="Belum ada pengeluaran" description="Tidak ada pengeluaran cabang pada filter periode ini." />
              ) : (
                <div className="grid gap-3">
                  {report.expense_by_branch.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl border border-[#e7eeff] bg-[#f9f9ff] p-4">
                      <div>
                        <p className="font-semibold">{item.branch_name}</p>
                        <p className="mt-1 text-sm text-[#3d4a3d]">{item.transactions} transaksi</p>
                      </div>
                      <p className="font-bold text-red-700">{rupiah(item.amount)}</p>
                    </div>
                  ))}
                </div>
              )}
            </OwnerCard>
          </div>

          <OwnerCard>
            <SectionHeader title="Transaksi Terbaru" description="Transaksi sukses pada periode laporan." />
            {report.recent_transactions.length === 0 ? (
              <EmptyPanel title="Belum ada transaksi" description="Tidak ada transaksi sukses pada filter periode ini." />
            ) : (
              <div className="grid gap-3">
                {report.recent_transactions.map((payment) => (
                  <div key={payment.id} className="grid gap-3 rounded-xl border border-[#e7eeff] bg-[#f9f9ff] p-4 md:grid-cols-[minmax(0,1fr)_160px_160px] md:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusPill label={payment.payment_category === 'renewal' ? 'Renewal' : 'Initial Rent'} tone={payment.payment_category === 'renewal' ? 'purple' : 'blue'} />
                        <PaymentStatusPill status={payment.transaction_status} />
                      </div>
                      <p className="mt-2 text-base font-semibold">{payment.tenant?.full_name || payment.tenant?.email || 'Penyewa'} · {payment.room?.room_name || '-'}</p>
                    </div>
                    <p className="text-sm font-semibold text-[#3d4a3d]">{date(payment.paid_at || payment.created_at)}</p>
                    <p className="text-right text-lg font-bold text-[#006e2f]">{rupiah(payment.gross_amount)}</p>
                  </div>
                ))}
              </div>
            )}
          </OwnerCard>

          <OwnerCard>
            <SectionHeader title="Pengeluaran Terbaru" description="Pengeluaran pada periode dan cabang yang dipilih." />
            {report.recent_expenses.length === 0 ? (
              <EmptyPanel title="Belum ada pengeluaran" description="Tidak ada pengeluaran pada filter periode ini." />
            ) : (
              <div className="grid gap-3">
                {report.recent_expenses.map((expense) => (
                  <div key={expense.id} className="grid gap-3 rounded-xl border border-[#e7eeff] bg-[#f9f9ff] p-4 md:grid-cols-[minmax(0,1fr)_160px_160px] md:items-center">
                    <div>
                      <StatusPill label={expense.category} tone="blue" />
                      <p className="mt-2 text-base font-semibold">{expense.description || 'Tanpa deskripsi'} · {expense.branch?.branch_name || '-'}</p>
                    </div>
                    <p className="text-sm font-semibold text-[#3d4a3d]">{date(expense.expense_date)}</p>
                    <p className="text-right text-lg font-bold text-red-700">{rupiah(expense.amount)}</p>
                  </div>
                ))}
              </div>
            )}
          </OwnerCard>
        </div>
      ) : null}
    </OwnerPage>
  );
}
