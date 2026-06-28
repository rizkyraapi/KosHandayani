'use client';

import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  Inbox,
  Loader2,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ApiBranch } from '@/lib/api';
import { getPaymentStatusMeta } from '@/lib/paymentStatus';

export const OWNER_COLORS = {
  background: '#f9f9ff',
  surface: '#ffffff',
  surfaceLow: '#f0f3ff',
  surfaceContainer: '#e7eeff',
  text: '#111c2d',
  muted: '#3d4a3d',
  primary: '#006e2f',
  primaryDark: '#005321',
  outline: '#d8e3fb',
};

export function OwnerPage({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main
      className={`min-h-screen bg-[#f9f9ff] px-4 py-6 text-[#111c2d] sm:px-6 lg:px-8 lg:py-10 ${className}`}
      style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif' }}
    >
      <div className="mx-auto max-w-[1440px]">{children}</div>
    </main>
  );
}

export function OwnerPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-[#006e2f]">{eyebrow}</p>
        <h1 className="text-4xl font-bold leading-[1.08] tracking-[-0.04em] text-[#111c2d] sm:text-5xl">
          {title}
        </h1>
        {description && <p className="mt-4 max-w-2xl text-base leading-7 text-[#3d4a3d]">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}

export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-semibold tracking-[-0.025em] text-[#111c2d]">{title}</h2>
        {description && <p className="mt-1 text-base leading-6 text-[#3d4a3d]">{description}</p>}
      </div>
      {action}
    </div>
  );
}

const tones = {
  green: 'bg-green-50 text-green-700',
  blue: 'bg-blue-50 text-blue-700',
  amber: 'bg-amber-50 text-amber-700',
  orange: 'bg-orange-50 text-orange-700',
  red: 'bg-red-50 text-red-700',
  slate: 'bg-slate-100 text-slate-700',
  purple: 'bg-purple-50 text-purple-700',
};

export type OwnerTone = keyof typeof tones;

export function MetricCard({
  label,
  value,
  icon: Icon,
  tone = 'green',
  hint,
  href,
}: {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  tone?: OwnerTone;
  hint?: React.ReactNode;
  href?: string;
}) {
  const content = (
    <div className="relative h-full overflow-hidden rounded-2xl border border-white bg-white p-5 shadow-[0_12px_40px_rgba(17,28,45,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_44px_rgba(17,28,45,0.08)]">
      <span className={`absolute right-5 top-5 inline-flex h-11 w-11 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon size={20} />
      </span>
      <p className="min-h-11 pr-14 text-sm font-bold uppercase tracking-[0.1em] text-[#3d4a3d]">{label}</p>
      <div className="mt-2 text-4xl font-bold leading-none tracking-[-0.045em] text-[#111c2d]">
        {value}
      </div>
      {hint && <div className="mt-3 text-sm leading-5 text-[#3d4a3d]">{hint}</div>}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export function OwnerCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-white bg-white p-5 shadow-[0_12px_40px_rgba(17,28,45,0.05)] sm:p-6 ${className}`}>
      {children}
    </section>
  );
}

export function StatusPill({
  label,
  tone = 'slate',
  dot = true,
}: {
  label: string;
  tone?: OwnerTone | 'darkred';
  dot?: boolean;
}) {
  const className = tone === 'darkred' ? 'bg-red-950 text-white' : tones[tone];

  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ${className}`}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />}
      {label}
    </span>
  );
}

export function LifecyclePill({
  status,
  label,
}: {
  status?: string | null;
  label?: string | null;
}) {
  const tone = status === 'overdue'
    ? 'darkred'
    : status === 'h1'
      ? 'red'
      : status === 'h7'
        ? 'orange'
        : status === 'h30'
          ? 'amber'
          : 'green';

  return <StatusPill label={label || 'Aktif'} tone={tone} />;
}

export function PaymentStatusPill({ status }: { status?: string | null }) {
  const { t } = useLanguage();
  const meta = getPaymentStatusMeta(status);
  const tone = meta.tone === 'orange' ? 'orange' : meta.tone === 'slate' ? 'slate' : meta.tone;

  return <StatusPill label={t(meta.labelKey)} tone={tone} />;
}

export function OwnerButton({
  href,
  children,
  variant = 'primary',
  onClick,
  disabled,
  type = 'button',
}: {
  href?: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  const classes = {
    primary: 'bg-[#006e2f] text-white hover:bg-[#005321]',
    secondary: 'border border-[#d8e3fb] bg-[#f0f3ff] text-[#111c2d] hover:bg-[#e7eeff]',
    danger: 'border border-red-100 bg-red-50 text-red-700 hover:bg-red-100',
    ghost: 'bg-transparent text-[#006e2f] hover:bg-green-50',
  };
  const className = `inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${classes[variant]}`;

  if (href) {
    return <Link href={href} className={className}>{children}</Link>;
  }

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={className}>
      {children}
    </button>
  );
}

export function OwnerInput({
  value,
  onChange,
  placeholder,
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <input
      value={value ?? ''}
      onChange={(event) => {
        const nextValue = event.currentTarget?.value ?? '';
        onChange(nextValue);
      }}
      placeholder={placeholder}
      className={`h-11 rounded-xl border border-[#d8e3fb] bg-white px-4 text-sm text-[#111c2d] outline-none transition placeholder:text-[#6d7b6c] focus:border-[#006e2f] focus:ring-2 focus:ring-green-100 ${className}`}
    />
  );
}

export function OwnerSelect({
  value,
  onChange,
  children,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  ariaLabel: string;
}) {
  return (
    <select
      aria-label={ariaLabel}
      value={value ?? ''}
      onChange={(event) => {
        const nextValue = event.currentTarget?.value ?? '';
        onChange(nextValue);
      }}
      className="h-11 rounded-xl border border-[#d8e3fb] bg-white px-4 text-sm font-semibold text-[#111c2d] outline-none focus:border-[#006e2f] focus:ring-2 focus:ring-green-100"
    >
      {children}
    </select>
  );
}

export function BranchScopeControl({
  branches,
  value,
  onChange,
  disabled = false,
  className = '',
}: {
  branches: ApiBranch[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  const safeBranches = Array.isArray(branches)
    ? branches.filter((branch) => branch && Number.isFinite(Number(branch.id)))
    : [];
  const safeValue = value || 'all';
  const options = [
    { value: 'all', label: 'Semua Cabang' },
    ...safeBranches.map((branch) => ({
      value: String(branch.id),
      label: branch.branch_name || `Cabang ${branch.id}`,
    })),
  ];

  return (
    <div className={className}>
      <p className="mb-2 text-sm font-bold uppercase tracking-[0.1em] text-[#3d4a3d]">Scope Cabang</p>
      <div
        role="group"
        aria-label="Filter cabang"
        className="flex max-w-full gap-1 overflow-x-auto rounded-2xl border border-[#d8e3fb] bg-[#f0f3ff] p-1"
      >
        {options.map((option) => {
          const selected = safeValue === option.value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={`h-10 shrink-0 rounded-xl px-4 text-sm font-bold transition disabled:cursor-wait disabled:opacity-60 ${
                selected
                  ? 'bg-[#006e2f] text-white shadow-sm'
                  : 'text-[#3d4a3d] hover:bg-white hover:text-[#111c2d]'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function LoadingPanel({ label = 'Memuat data terbaru...' }: { label?: string }) {
  return (
    <OwnerCard className="flex min-h-56 items-center justify-center">
      <div className="text-center">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-[#006e2f]">
          <Loader2 className="animate-spin" size={22} />
        </span>
        <p className="mt-4 text-base font-semibold text-[#3d4a3d]">{label}</p>
      </div>
    </OwnerCard>
  );
}

export function ErrorPanel({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <OwnerCard className="border-red-100 bg-red-50">
      <div className="flex items-start gap-3 text-red-800">
        <AlertCircle className="mt-0.5 shrink-0" size={20} />
        <div>
          <p className="font-bold">Gagal memuat data owner</p>
          <p className="mt-1 text-sm leading-6">{message}</p>
          <button onClick={onRetry} className="mt-3 inline-flex items-center gap-2 text-sm font-bold">
            <RefreshCw size={15} />
            Coba lagi
          </button>
        </div>
      </div>
    </OwnerCard>
  );
}

export function EmptyPanel({
  title,
  description,
  icon: Icon = Inbox,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[#bccbb9] bg-[#f9f9ff] px-6 py-12 text-center">
      <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e7eeff] text-[#006e2f]">
        <Icon size={24} />
      </span>
      <p className="mt-4 text-lg font-semibold text-[#111c2d]">{title}</p>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#3d4a3d]">{description}</p>
    </div>
  );
}

export function AttentionList({
  items,
}: {
  items: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    href: string;
  }>;
}) {
  if (!items.length) {
    return <EmptyPanel title="Semua terkendali" description="Tidak ada tenant atau pembayaran yang memerlukan perhatian segera." />;
  }

  return (
    <div className="grid gap-3">
      {items.map((item) => {
        const tone: OwnerTone | 'darkred' = item.type === 'overdue'
          ? 'darkred'
          : item.type === 'h1' || item.type === 'payment_failed'
            ? 'red'
            : item.type === 'h7'
              ? 'orange'
              : 'amber';

        return (
          <Link
            key={item.id}
            href={item.href}
            className="flex items-center justify-between gap-4 rounded-xl border border-[#e7eeff] bg-[#f9f9ff] p-4 transition hover:border-[#bccbb9] hover:bg-[#f0f3ff]"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill label={item.type.replaceAll('_', ' ')} tone={tone} />
                <p className="font-semibold text-[#111c2d]">{item.title}</p>
              </div>
              <p className="mt-2 text-sm leading-5 text-[#3d4a3d]">{item.description}</p>
            </div>
            <ArrowRight className="shrink-0 text-[#006e2f]" size={18} />
          </Link>
        );
      })}
    </div>
  );
}
