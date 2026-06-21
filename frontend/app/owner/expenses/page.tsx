'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  Calculator,
  ExternalLink,
  Paperclip,
  Plus,
  ReceiptText,
  RefreshCw,
  Save,
  Tags,
  WalletCards,
  X,
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
  SectionHeader,
  StatusPill,
} from '@/components/owner/OwnerUi';
import { getAuthErrorMessage } from '@/lib/auth';
import {
  createOwnerExpense,
  getOwnerExpenses,
  type ExpenseCategory,
  type OwnerExpenseOverview,
} from '@/lib/api';
import { useOwnerBranchScope } from '@/lib/use-owner-branch-scope';

const defaultCategories: ExpenseCategory[] = [
  'Perawatan',
  'Utilitas',
  'Internet',
  'Kebersihan',
  'Keamanan',
  'Perlengkapan',
  'Pajak',
  'Lainnya',
];

const months = [
  'Semua bulan', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

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

function formatDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`));
}

function today() {
  const value = new Date();
  const offset = value.getTimezoneOffset();
  return new Date(value.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

export default function Page() {
  const now = new Date();
  const [overview, setOverview] = useState<OwnerExpenseOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [category, setCategory] = useState('all');
  const [receiptInputKey, setReceiptInputKey] = useState(0);
  const { branches, branchScope, setBranchScope, branchesLoading } = useOwnerBranchScope();
  const [form, setForm] = useState<{
    branchId: string;
    category: ExpenseCategory;
    description: string;
    amount: string;
    expenseDate: string;
    receipt: File | null;
  }>({
    branchId: '',
    category: 'Perawatan',
    description: '',
    amount: '',
    expenseDate: today(),
    receipt: null,
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getOwnerExpenses({
        year,
        ...(month !== 'all' ? { month } : {}),
        branch_id: branchScope,
        ...(category !== 'all' ? { category } : {}),
      });
      setOverview(data);
    } catch (loadError) {
      setError(getAuthErrorMessage(loadError, 'Gagal memuat data pengeluaran.'));
    } finally {
      setLoading(false);
    }
  }, [branchScope, category, month, setError, setLoading, setOverview, year]);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const selectedBranchId = branchScope !== 'all'
    ? branchScope
    : form.branchId || (branches[0] ? String(branches[0].id) : '');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedBranchId || Number(form.amount) <= 0 || !form.expenseDate || !form.category) {
      setError('Cabang, kategori, nominal lebih dari 0, dan tanggal wajib diisi.');
      return;
    }

    try {
      setSaving(true);
      await createOwnerExpense({
        branch_id: Number(selectedBranchId),
        category: form.category,
        description: form.description.trim(),
        amount: Number(form.amount),
        expense_date: form.expenseDate,
        receipt: form.receipt,
      });
      setSuccess('Pengeluaran berhasil ditambahkan.');
      setForm((current) => ({
        ...current,
        description: '',
        amount: '',
        expenseDate: today(),
        receipt: null,
      }));
      setReceiptInputKey((current) => current + 1);
      setShowForm(false);
      await load();
    } catch (saveError) {
      setError(getAuthErrorMessage(saveError, 'Pengeluaran gagal disimpan.'));
    } finally {
      setSaving(false);
    }
  };

  const categories = overview?.filters.categories || defaultCategories;

  return (
    <OwnerPage>
      <OwnerPageHeader
        eyebrow="Expense Management"
        title="Pengeluaran"
        description="Catat biaya operasional per cabang dan pantau dampaknya terhadap laba bersih."
        actions={(
          <>
            <OwnerButton variant="secondary" onClick={() => void load()} disabled={loading}>
              <RefreshCw size={17} />
              Segarkan
            </OwnerButton>
            <OwnerButton onClick={() => setShowForm((current) => !current)}>
              {showForm ? <X size={17} /> : <Plus size={17} />}
              {showForm ? 'Tutup Form' : 'Tambah Pengeluaran'}
            </OwnerButton>
          </>
        )}
      />

      <BranchScopeControl
        branches={branches}
        value={branchScope}
        onChange={setBranchScope}
        disabled={loading || branchesLoading}
        className="mb-6"
      />

      <div className="mb-8 flex flex-wrap gap-3">
        <OwnerSelect value={month} onChange={setMonth} ariaLabel="Filter bulan pengeluaran">
          {months.map((label, index) => (
            <option key={label} value={index === 0 ? 'all' : String(index)}>{label}</option>
          ))}
        </OwnerSelect>
        <OwnerSelect value={year} onChange={setYear} ariaLabel="Filter tahun pengeluaran">
          {(overview?.filters.years || [Number(year)]).map((item) => (
            <option key={item} value={String(item)}>{item}</option>
          ))}
        </OwnerSelect>
        <OwnerSelect value={category} onChange={setCategory} ariaLabel="Filter kategori pengeluaran">
          <option value="all">Semua kategori</option>
          {categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </OwnerSelect>
      </div>

      {showForm && (
        <OwnerCard className="mb-8">
          <SectionHeader title="Tambah Pengeluaran" description="Bukti transaksi dapat berupa JPG, PNG, WEBP, atau PDF maksimal 5 MB." />
          <form onSubmit={submit} className="grid gap-5 lg:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-[#3d4a3d]">
              Cabang
              <select
                required
                value={selectedBranchId}
                onChange={(event) => setForm((current) => ({ ...current, branchId: event.currentTarget.value }))}
                className="h-12 rounded-xl border border-[#d8e3fb] bg-white px-4 text-[#111c2d] outline-none focus:border-[#006e2f] focus:ring-2 focus:ring-green-100"
              >
                <option value="">Pilih cabang</option>
                {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.branch_name}</option>)}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-bold text-[#3d4a3d]">
              Kategori
              <select
                required
                value={form.category}
                onChange={(event) => setForm((current) => ({ ...current, category: event.currentTarget.value as ExpenseCategory }))}
                className="h-12 rounded-xl border border-[#d8e3fb] bg-white px-4 text-[#111c2d] outline-none focus:border-[#006e2f] focus:ring-2 focus:ring-green-100"
              >
                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-bold text-[#3d4a3d]">
              Nominal
              <input
                required
                min="1"
                step="1"
                type="number"
                inputMode="numeric"
                value={form.amount}
                onChange={(event) => setForm((current) => ({ ...current, amount: event.currentTarget.value }))}
                placeholder="Contoh: 250000"
                className="h-12 rounded-xl border border-[#d8e3fb] bg-white px-4 text-[#111c2d] outline-none placeholder:text-[#6d7b6c] focus:border-[#006e2f] focus:ring-2 focus:ring-green-100"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-[#3d4a3d]">
              Tanggal
              <input
                required
                type="date"
                value={form.expenseDate}
                onChange={(event) => setForm((current) => ({ ...current, expenseDate: event.currentTarget.value }))}
                className="h-12 rounded-xl border border-[#d8e3fb] bg-white px-4 text-[#111c2d] outline-none focus:border-[#006e2f] focus:ring-2 focus:ring-green-100"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-[#3d4a3d] lg:col-span-2">
              Deskripsi
              <textarea
                rows={3}
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.currentTarget.value }))}
                placeholder="Jelaskan kebutuhan atau rincian pengeluaran"
                className="rounded-xl border border-[#d8e3fb] bg-white px-4 py-3 text-[#111c2d] outline-none placeholder:text-[#6d7b6c] focus:border-[#006e2f] focus:ring-2 focus:ring-green-100"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-[#3d4a3d] lg:col-span-2">
              Upload Bukti (opsional)
              <input
                key={receiptInputKey}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={(event) => setForm((current) => ({ ...current, receipt: event.currentTarget.files?.[0] || null }))}
                className="rounded-xl border border-dashed border-[#bccbb9] bg-[#f9f9ff] px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-green-50 file:px-3 file:py-2 file:font-bold file:text-[#006e2f]"
              />
            </label>

            <div className="flex justify-end lg:col-span-2">
              <OwnerButton type="submit" disabled={saving}>
                <Save size={17} />
                {saving ? 'Menyimpan...' : 'Simpan Pengeluaran'}
              </OwnerButton>
            </div>
          </form>
        </OwnerCard>
      )}

      {success && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
          {success}
        </div>
      )}

      {error && overview && <div className="mb-6"><ErrorPanel message={error} onRetry={() => void load()} /></div>}

      {loading && !overview ? (
        <LoadingPanel label="Menghitung pengeluaran..." />
      ) : error && !overview ? (
        <ErrorPanel message={error} onRetry={() => void load()} />
      ) : overview ? (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Total Pengeluaran Bulan Ini" value={rupiahCompact(overview.stats.total_expense)} icon={WalletCards} tone="red" />
            <MetricCard label="Jumlah Transaksi" value={overview.stats.transaction_count} icon={ReceiptText} tone="blue" />
            <MetricCard
              label="Kategori Terbesar"
              value={overview.stats.largest_category?.category || '-'}
              icon={Tags}
              tone="amber"
              hint={overview.stats.largest_category ? rupiah(overview.stats.largest_category.amount) : 'Belum ada pengeluaran'}
            />
            <MetricCard label="Rata-rata Pengeluaran" value={rupiahCompact(overview.stats.average_expense)} icon={Calculator} tone="purple" />
          </div>

          <OwnerCard>
            <SectionHeader
              title="Detail Pengeluaran"
              description={`${overview.expenses.length} transaksi sesuai filter aktif.`}
            />
            {overview.expenses.length === 0 ? (
              <EmptyPanel title="Belum ada pengeluaran" description="Tambahkan transaksi baru atau ubah filter periode dan cabang." />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[920px] w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#d8e3fb] text-xs uppercase tracking-[0.08em] text-[#3d4a3d]">
                      <th className="px-3 py-4">Tanggal</th>
                      <th className="px-3 py-4">Cabang</th>
                      <th className="px-3 py-4">Kategori</th>
                      <th className="px-3 py-4">Deskripsi</th>
                      <th className="px-3 py-4 text-right">Nominal</th>
                      <th className="px-3 py-4 text-center">Bukti</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.expenses.map((expense) => (
                      <tr key={expense.id} className="border-b border-[#edf1fb] align-top last:border-0">
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold">{formatDate(expense.expense_date)}</td>
                        <td className="px-3 py-4 text-sm">{expense.branch?.branch_name || '-'}</td>
                        <td className="px-3 py-4"><StatusPill label={expense.category} tone="blue" /></td>
                        <td className="max-w-sm px-3 py-4 text-sm leading-6 text-[#3d4a3d]">{expense.description || '-'}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-right text-base font-bold text-red-700">{rupiah(expense.amount)}</td>
                        <td className="px-3 py-4 text-center">
                          {expense.receipt_url ? (
                            <a
                              href={expense.receipt_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-xs font-bold text-[#006e2f]"
                            >
                              <ExternalLink size={14} />
                              Lihat
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs text-[#6d7b6c]"><Paperclip size={14} />-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </OwnerCard>
        </div>
      ) : null}
    </OwnerPage>
  );
}
