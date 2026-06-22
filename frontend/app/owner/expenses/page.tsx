'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  Calculator,
  Eye,
  Pencil,
  Plus,
  ReceiptText,
  RefreshCw,
  Save,
  Tags,
  Trash2,
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
import {
  ExpenseDeleteDialog,
  ExpenseDetailDialog,
  ExpenseEditDialog,
} from '@/components/owner/ExpenseDialogs';
import { getAuthErrorMessage } from '@/lib/auth';
import { formatExpenseAmountInput, parseExpenseAmount } from '@/lib/expense-amount';
import {
  createEmptyOwnerExpenseOverview,
  createOwnerExpense,
  deleteOwnerExpense,
  EXPENSE_CATEGORIES,
  getOwnerExpense,
  getOwnerExpenses,
  updateOwnerExpense,
  type CreateExpensePayload,
  type ExpenseCategory,
  type OwnerExpense,
  type OwnerExpenseOverview,
} from '@/lib/api';
import { useOwnerBranchScope } from '@/lib/use-owner-branch-scope';

const defaultCategories = EXPENSE_CATEGORIES;

const months = [
  'Semua bulan', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

type ExpenseDialogState = {
  mode: 'detail' | 'edit' | 'delete';
  expense: OwnerExpense;
};

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

function formatDate(value?: string | null) {
  if (!value) return '-';

  const date = new Date(`${value}T00:00:00`);

  return Number.isNaN(date.getTime())
    ? '-'
    : new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(date);
}

function today() {
  const value = new Date();
  const offset = value.getTimezoneOffset();
  return new Date(value.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

export default function Page() {
  const now = new Date();
  const initialYear = String(now.getFullYear());
  const initialMonth = String(now.getMonth() + 1);
  const [overview, setOverview] = useState<OwnerExpenseOverview>(() => (
    createEmptyOwnerExpenseOverview({ year: initialYear, month: initialMonth })
  ));
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [dialog, setDialog] = useState<ExpenseDialogState | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);
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
      setHasLoadedData(true);
    } catch (loadError) {
      setError(getAuthErrorMessage(loadError, 'Gagal memuat data pengeluaran.'));
    } finally {
      setLoading(false);
      setInitialLoadComplete(true);
    }
  }, [branchScope, category, month, year]);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const safeBranches = Array.isArray(branches) ? branches : [];
  const firstBranchId = safeBranches[0]?.id ? String(safeBranches[0].id) : '';
  const scopedBranchId = branchScope !== 'all'
    && safeBranches.some((branch) => String(branch?.id ?? '') === branchScope)
    ? branchScope
    : '';
  const formBranchId = safeBranches.some((branch) => String(branch?.id ?? '') === form.branchId)
    ? form.branchId
    : '';
  const selectedBranchId = scopedBranchId || formBranchId || firstBranchId;
  const categories = Array.isArray(overview.filters?.categories) && overview.filters.categories.length > 0
    ? overview.filters.categories
    : defaultCategories;
  const selectedCategory = categories.includes(form.category)
    ? form.category
    : categories[0] ?? 'Perawatan';
  const years = Array.isArray(overview.filters?.years) && overview.filters.years.length > 0
    ? overview.filters.years
    : [Number(year)];
  const expenses = Array.isArray(overview.expenses) ? overview.expenses : [];

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    const amount = parseExpenseAmount(form.amount);

    if (!selectedBranchId || amount <= 0 || !form.expenseDate || !selectedCategory) {
      setError('Cabang, kategori, nominal lebih dari 0, dan tanggal wajib diisi.');
      return;
    }

    try {
      setSaving(true);
      await createOwnerExpense({
        branch_id: Number(selectedBranchId),
        category: selectedCategory,
        description: form.description.trim(),
        amount,
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

  const openExpenseDialog = async (mode: 'detail' | 'edit', expenseId: number) => {
    try {
      setActionLoadingId(expenseId);
      setError('');
      const expense = await getOwnerExpense(expenseId);
      setDialog({ mode, expense });
    } catch (detailError) {
      setError(getAuthErrorMessage(detailError, 'Detail pengeluaran gagal dimuat.'));
    } finally {
      setActionLoadingId(null);
    }
  };

  const updateExpense = async (payload: CreateExpensePayload) => {
    if (!dialog) return;

    try {
      setUpdating(true);
      setError('');
      await updateOwnerExpense(dialog.expense.id, payload);
      setDialog(null);
      setSuccess('Pengeluaran berhasil diperbarui.');
      await load();
    } catch (updateError) {
      setError(getAuthErrorMessage(updateError, 'Pengeluaran gagal diperbarui.'));
    } finally {
      setUpdating(false);
    }
  };

  const deleteExpense = async () => {
    if (!dialog) return;

    try {
      setDeleting(true);
      setError('');
      await deleteOwnerExpense(dialog.expense.id);
      setDialog(null);
      setSuccess('Pengeluaran berhasil dihapus.');
      await load();
    } catch (deleteError) {
      setError(getAuthErrorMessage(deleteError, 'Pengeluaran gagal dihapus.'));
    } finally {
      setDeleting(false);
    }
  };

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
          {years.map((item) => (
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
                disabled={safeBranches.length === 0}
                onChange={(event) => {
                  const branchId = event.currentTarget?.value ?? '';
                  setForm((current) => ({ ...current, branchId }));
                }}
                className="h-12 rounded-xl border border-[#d8e3fb] bg-white px-4 text-[#111c2d] outline-none focus:border-[#006e2f] focus:ring-2 focus:ring-green-100"
              >
                <option value="">{safeBranches.length ? 'Pilih cabang' : 'Cabang belum tersedia'}</option>
                {safeBranches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.branch_name || `Cabang ${branch.id}`}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-bold text-[#3d4a3d]">
              Kategori
              <select
                required
                value={selectedCategory}
                onChange={(event) => {
                  const nextCategory = event.currentTarget?.value;
                  const safeCategory = categories.includes(nextCategory as ExpenseCategory)
                    ? nextCategory as ExpenseCategory
                    : 'Perawatan';
                  setForm((current) => ({ ...current, category: safeCategory }));
                }}
                className="h-12 rounded-xl border border-[#d8e3fb] bg-white px-4 text-[#111c2d] outline-none focus:border-[#006e2f] focus:ring-2 focus:ring-green-100"
              >
                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-bold text-[#3d4a3d]">
              Nominal
              <input
                required
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={formatExpenseAmountInput(form.amount)}
                onChange={(event) => {
                  const amountValue = parseExpenseAmount(event.currentTarget?.value);
                  setForm((current) => ({
                    ...current,
                    amount: amountValue > 0 ? String(amountValue) : '',
                  }));
                }}
                placeholder="Contoh: 50.000"
                className="h-12 rounded-xl border border-[#d8e3fb] bg-white px-4 text-[#111c2d] outline-none placeholder:text-[#6d7b6c] focus:border-[#006e2f] focus:ring-2 focus:ring-green-100"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-[#3d4a3d]">
              Tanggal
              <input
                required
                type="date"
                value={form.expenseDate}
                onChange={(event) => {
                  const expenseDate = event.currentTarget?.value ?? '';
                  setForm((current) => ({ ...current, expenseDate }));
                }}
                className="h-12 rounded-xl border border-[#d8e3fb] bg-white px-4 text-[#111c2d] outline-none focus:border-[#006e2f] focus:ring-2 focus:ring-green-100"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-[#3d4a3d] lg:col-span-2">
              Deskripsi
              <textarea
                rows={3}
                value={form.description}
                onChange={(event) => {
                  const description = event.currentTarget?.value ?? '';
                  setForm((current) => ({ ...current, description }));
                }}
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
                onChange={(event) => {
                  const receipt = event.currentTarget?.files?.[0] ?? null;
                  setForm((current) => ({ ...current, receipt }));
                }}
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

      {error && hasLoadedData && <div className="mb-6"><ErrorPanel message={error} onRetry={() => void load()} /></div>}

      {loading && !initialLoadComplete ? (
        <LoadingPanel label="Menghitung pengeluaran..." />
      ) : error && !hasLoadedData ? (
        <OwnerCard>
          <EmptyPanel
            title="Data pengeluaran belum dapat dimuat"
            description={`${error} Anda tetap dapat mencoba kembali tanpa meninggalkan halaman ini.`}
          />
          <div className="mt-4 flex justify-center">
            <OwnerButton onClick={() => void load()} disabled={loading}>
              <RefreshCw size={17} />
              Coba lagi
            </OwnerButton>
          </div>
        </OwnerCard>
      ) : (
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
              description={`${expenses.length} transaksi sesuai filter aktif.`}
            />
            {expenses.length === 0 ? (
              <EmptyPanel title="Belum ada pengeluaran" description="Tambahkan transaksi baru atau ubah filter periode dan cabang." />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[860px] w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#d8e3fb] text-xs uppercase tracking-[0.08em] text-[#3d4a3d]">
                      <th className="px-3 py-4">Tanggal</th>
                      <th className="px-3 py-4">Cabang</th>
                      <th className="px-3 py-4">Kategori</th>
                      <th className="px-3 py-4">Deskripsi</th>
                      <th className="px-3 py-4 text-right">Nominal</th>
                      <th className="px-3 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense, index) => (
                      <tr key={expense.id || `expense-${index}`} className="border-b border-[#edf1fb] align-top last:border-0">
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold">{formatDate(expense.expense_date)}</td>
                        <td className="px-3 py-4 text-sm">{expense.branch?.branch_name || '-'}</td>
                        <td className="px-3 py-4"><StatusPill label={expense.category || 'Tidak diketahui'} tone="blue" /></td>
                        <td className="max-w-sm px-3 py-4 text-sm leading-6 text-[#3d4a3d]">{expense.description || '-'}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-right text-base font-bold text-red-700">{rupiah(expense.amount)}</td>
                        <td className="px-3 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              aria-label="Lihat detail pengeluaran"
                              title="Detail"
                              disabled={actionLoadingId === expense.id}
                              onClick={() => void openExpenseDialog('detail', expense.id)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0f3ff] text-[#111c2d] transition hover:bg-[#e7eeff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8294c4] disabled:opacity-60"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              type="button"
                              aria-label="Edit pengeluaran"
                              title="Edit"
                              disabled={actionLoadingId === expense.id}
                              onClick={() => void openExpenseDialog('edit', expense.id)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-[#006e2f] transition hover:bg-green-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300 disabled:opacity-60"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              aria-label="Hapus pengeluaran"
                              title="Hapus"
                              onClick={() => setDialog({ mode: 'delete', expense })}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-700 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </OwnerCard>
        </div>
      )}

      {dialog?.mode === 'detail' && (
        <ExpenseDetailDialog
          expense={dialog.expense}
          onClose={() => setDialog(null)}
          onEdit={() => setDialog({ mode: 'edit', expense: dialog.expense })}
          onDelete={() => setDialog({ mode: 'delete', expense: dialog.expense })}
        />
      )}

      {dialog?.mode === 'edit' && (
        <ExpenseEditDialog
          key={dialog.expense.id}
          expense={dialog.expense}
          branches={safeBranches}
          categories={categories}
          saving={updating}
          onClose={() => setDialog(null)}
          onSubmit={updateExpense}
        />
      )}

      {dialog?.mode === 'delete' && (
        <ExpenseDeleteDialog
          expense={dialog.expense}
          deleting={deleting}
          onClose={() => setDialog(null)}
          onConfirm={deleteExpense}
        />
      )}
    </OwnerPage>
  );
}
