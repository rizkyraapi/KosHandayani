'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import {
  CalendarDays,
  ExternalLink,
  FileText,
  MapPin,
  Pencil,
  ReceiptText,
  Tags,
  Trash2,
  WalletCards,
  X,
} from 'lucide-react';
import { formatExpenseAmountInput, parseExpenseAmount } from '@/lib/expense-amount';
import {
  EXPENSE_CATEGORIES,
  type ApiBranch,
  type CreateExpensePayload,
  type ExpenseCategory,
  type OwnerExpense,
} from '@/lib/api';
import { OwnerButton, StatusPill } from './OwnerUi';

function rupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value?: string | null) {
  if (!value) return '-';
  const date = new Date(`${value}T00:00:00`);

  return Number.isNaN(date.getTime())
    ? '-'
    : new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(date);
}

function ModalShell({
  title,
  description,
  onClose,
  children,
  footer,
}: {
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111c2d]/45 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="expense-dialog-title"
        className="flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white bg-white shadow-[0_28px_90px_rgba(17,28,45,0.26)]"
      >
        <header className="flex items-start justify-between gap-5 border-b border-[#e7eeff] px-5 py-5 sm:px-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#006e2f]">Expense Management</p>
            <h2 id="expense-dialog-title" className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-[#111c2d]">
              {title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-[#3d4a3d]">{description}</p>
          </div>
          <button
            type="button"
            aria-label="Tutup modal"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0f3ff] text-[#3d4a3d] transition hover:bg-[#e7eeff]"
          >
            <X size={18} />
          </button>
        </header>
        <div className="overflow-y-auto px-5 py-6 sm:px-7">{children}</div>
        {footer && (
          <footer className="flex flex-wrap justify-end gap-3 border-t border-[#e7eeff] bg-[#f9f9ff] px-5 py-4 sm:px-7">
            {footer}
          </footer>
        )}
      </section>
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#e7eeff] bg-[#f9f9ff] p-4">
      <div className="flex items-center gap-2 text-[#006e2f]">
        <Icon size={16} />
        <p className="text-xs font-bold uppercase tracking-[0.09em]">{label}</p>
      </div>
      <div className="mt-3 text-base font-semibold leading-6 text-[#111c2d]">{value}</div>
    </div>
  );
}

export function ExpenseDetailDialog({
  expense,
  onClose,
  onEdit,
  onDelete,
}: {
  expense: OwnerExpense;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <ModalShell
      title="Detail Pengeluaran"
      description="Informasi transaksi operasional yang tercatat."
      onClose={onClose}
      footer={(
        <>
          <OwnerButton variant="ghost" onClick={onClose}>Tutup</OwnerButton>
          <OwnerButton variant="secondary" onClick={onEdit}><Pencil size={16} />Edit</OwnerButton>
          <OwnerButton variant="danger" onClick={onDelete}><Trash2 size={16} />Hapus</OwnerButton>
        </>
      )}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <DetailItem icon={MapPin} label="Cabang" value={expense.branch?.branch_name || 'Cabang tidak diketahui'} />
        <DetailItem icon={Tags} label="Kategori" value={<StatusPill label={expense.category || 'Tidak diketahui'} tone="blue" />} />
        <DetailItem icon={WalletCards} label="Nominal" value={<span className="text-xl font-bold text-red-700">{rupiah(expense.amount || 0)}</span>} />
        <DetailItem icon={CalendarDays} label="Tanggal Pengeluaran" value={formatDate(expense.expense_date)} />
        <div className="sm:col-span-2">
          <DetailItem icon={FileText} label="Deskripsi" value={expense.description || '-'} />
        </div>
        <div className="sm:col-span-2">
          <DetailItem
            icon={ReceiptText}
            label="Bukti Pengeluaran"
            value={expense.receipt_url ? (
              <a
                href={expense.receipt_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-[#006e2f] hover:underline"
              >
                <ExternalLink size={16} />
                Buka bukti pengeluaran
              </a>
            ) : 'Tidak ada bukti yang diunggah'}
          />
        </div>
      </div>
    </ModalShell>
  );
}

export function ExpenseEditDialog({
  expense,
  branches,
  categories,
  saving,
  onClose,
  onSubmit,
}: {
  expense: OwnerExpense;
  branches: ApiBranch[];
  categories: ExpenseCategory[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateExpensePayload) => Promise<void>;
}) {
  const safeBranches = Array.isArray(branches) ? branches : [];
  const branchOptions = safeBranches.some((branch) => branch.id === expense.branch_id)
    ? safeBranches
    : expense.branch
      ? [{ id: expense.branch.id, branch_name: expense.branch.branch_name }, ...safeBranches]
      : safeBranches;
  const safeCategories = categories.length ? categories : EXPENSE_CATEGORIES;
  const fallbackCategory: ExpenseCategory = safeCategories[0] ?? 'Perawatan';
  const [form, setForm] = useState({
    branchId: String(expense.branch_id || branchOptions[0]?.id || ''),
    category: safeCategories.includes(expense.category) ? expense.category : fallbackCategory,
    description: expense.description || '',
    amount: expense.amount > 0 ? String(expense.amount) : '',
    expenseDate: expense.expense_date || '',
    receipt: null as File | null,
  });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = parseExpenseAmount(form.amount);

    if (!form.branchId || !form.category || !form.expenseDate || amount <= 0) return;

    await onSubmit({
      branch_id: Number(form.branchId),
      category: form.category,
      description: form.description.trim(),
      amount,
      expense_date: form.expenseDate,
      receipt: form.receipt,
    });
  };

  return (
    <ModalShell
      title="Edit Pengeluaran"
      description="Perbarui rincian transaksi. Bukti lama tetap digunakan jika tidak diganti."
      onClose={onClose}
    >
      <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-[#3d4a3d]">
          Cabang
          <select
            required
            value={form.branchId}
            onChange={(event) => {
              const branchId = event.currentTarget?.value ?? '';
              setForm((current) => ({ ...current, branchId }));
            }}
            className="h-12 rounded-xl border border-[#d8e3fb] bg-white px-4 text-[#111c2d] outline-none focus:border-[#006e2f] focus:ring-2 focus:ring-green-100"
          >
            <option value="">Pilih cabang</option>
            {branchOptions.map((branch) => (
              <option key={branch.id} value={branch.id}>{branch.branch_name || `Cabang ${branch.id}`}</option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-bold text-[#3d4a3d]">
          Kategori
          <select
            required
            value={form.category}
            onChange={(event) => {
              const value = event.currentTarget?.value;
              const category = safeCategories.includes(value as ExpenseCategory)
                ? value as ExpenseCategory
                : fallbackCategory;
              setForm((current) => ({ ...current, category }));
            }}
            className="h-12 rounded-xl border border-[#d8e3fb] bg-white px-4 text-[#111c2d] outline-none focus:border-[#006e2f] focus:ring-2 focus:ring-green-100"
          >
            {safeCategories.map((category) => <option key={category} value={category}>{category}</option>)}
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
              const amount = parseExpenseAmount(event.currentTarget?.value);
              setForm((current) => ({ ...current, amount: amount > 0 ? String(amount) : '' }));
            }}
            className="h-12 rounded-xl border border-[#d8e3fb] bg-white px-4 text-[#111c2d] outline-none focus:border-[#006e2f] focus:ring-2 focus:ring-green-100"
          />
        </label>

        <label className="grid gap-2 text-sm font-bold text-[#3d4a3d]">
          Tanggal Pengeluaran
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

        <label className="grid gap-2 text-sm font-bold text-[#3d4a3d] sm:col-span-2">
          Deskripsi
          <textarea
            rows={3}
            value={form.description}
            onChange={(event) => {
              const description = event.currentTarget?.value ?? '';
              setForm((current) => ({ ...current, description }));
            }}
            className="rounded-xl border border-[#d8e3fb] bg-white px-4 py-3 text-[#111c2d] outline-none focus:border-[#006e2f] focus:ring-2 focus:ring-green-100"
          />
        </label>

        <label className="grid gap-2 text-sm font-bold text-[#3d4a3d] sm:col-span-2">
          Bukti Pengeluaran
          {expense.receipt_url && (
            <a
              href={expense.receipt_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#006e2f] hover:underline"
            >
              <ExternalLink size={14} />
              Lihat bukti saat ini
            </a>
          )}
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            onChange={(event) => {
              const receipt = event.currentTarget?.files?.[0] ?? null;
              setForm((current) => ({ ...current, receipt }));
            }}
            className="rounded-xl border border-dashed border-[#bccbb9] bg-[#f9f9ff] px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-green-50 file:px-3 file:py-2 file:font-bold file:text-[#006e2f]"
          />
        </label>

        <div className="flex flex-wrap justify-end gap-3 sm:col-span-2">
          <OwnerButton variant="ghost" onClick={onClose} disabled={saving}>Batal</OwnerButton>
          <OwnerButton type="submit" disabled={saving}>
            <Pencil size={16} />
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </OwnerButton>
        </div>
      </form>
    </ModalShell>
  );
}

export function ExpenseDeleteDialog({
  expense,
  deleting,
  onClose,
  onConfirm,
}: {
  expense: OwnerExpense;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  return (
    <ModalShell
      title="Hapus Pengeluaran"
      description="Data akan disembunyikan dari expenses, analytics, laporan, dan PDF."
      onClose={onClose}
      footer={(
        <>
          <OwnerButton variant="ghost" onClick={onClose} disabled={deleting}>Batal</OwnerButton>
          <OwnerButton variant="danger" onClick={() => void onConfirm()} disabled={deleting}>
            <Trash2 size={16} />
            {deleting ? 'Menghapus...' : 'Hapus'}
          </OwnerButton>
        </>
      )}
    >
      <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
        <p className="text-sm leading-6 text-red-800">
          Pastikan transaksi berikut memang ingin dihapus. Penghapusan menggunakan soft delete dan tidak menghapus bukti secara permanen.
        </p>
        <dl className="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-bold uppercase tracking-[0.08em] text-red-700">Kategori</dt>
            <dd className="mt-1 font-semibold text-[#111c2d]">{expense.category || 'Tidak diketahui'}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-[0.08em] text-red-700">Nominal</dt>
            <dd className="mt-1 font-semibold text-[#111c2d]">{rupiah(expense.amount || 0)}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-[0.08em] text-red-700">Tanggal</dt>
            <dd className="mt-1 font-semibold text-[#111c2d]">{formatDate(expense.expense_date)}</dd>
          </div>
        </dl>
      </div>
    </ModalShell>
  );
}
