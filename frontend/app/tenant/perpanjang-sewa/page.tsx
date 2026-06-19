'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  CreditCard,
  Home,
  MapPin,
  ReceiptText,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { EmptyState, ErrorState, LoadingState } from '@/components/UiState';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  createRenewalPayment,
  getRenewalContext,
  syncPaymentStatus,
  type RenewalContext,
  type RenewalDurationOption,
} from '@/lib/api';
import type { Locale } from '@/lib/i18n';
import { payWithMidtransSnap } from '@/lib/midtrans';
import { syncTenantDataAfterPayment } from '@/lib/tenant-data-sync';

const DEFAULT_OPTIONS: RenewalDurationOption[] = [1, 3, 6, 12].map((months) => ({
  duration_months: months,
  label: `${months} Bulan`,
  subtotal_amount: 0,
  discount_amount: 0,
  gross_amount: 0,
}));
const FALLBACK_OPTION = DEFAULT_OPTIONS[0];

function formatRupiah(value?: number | null) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

function formatDate(value?: string | null, locale: Locale = 'id') {
  if (!value) return '-';

  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
    dateStyle: 'medium',
  }).format(new Date(`${value}T00:00:00`));
}

function addMonthsFromEndDate(endDate: string | null | undefined, months: number) {
  if (!endDate) return null;
  const start = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(start.getTime())) return null;
  start.setDate(start.getDate() + 1);
  const end = new Date(start);
  end.setMonth(end.getMonth() + months);

  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

function SummaryRow({
  label,
  value,
  tone = '#111c2d',
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="text-sm font-medium text-[#3d4a3d]">{label}</span>
      <span className="text-sm font-bold" style={{ color: tone }}>
        {value}
      </span>
    </div>
  );
}

export default function Page() {
  const router = useRouter();
  const { locale, t } = useLanguage();
  const [context, setContext] = useState<RenewalContext | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(3);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadContext = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await getRenewalContext();
      setContext(data);
      setSelectedDuration(data.duration_options[0]?.duration_months ?? 3);
    } catch (loadError) {
      setContext(null);
      setError(loadError instanceof Error ? loadError.message : t('messages.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadContext();
  }, [loadContext]);

  const options = context?.duration_options?.length ? context.duration_options : DEFAULT_OPTIONS;
  const selectedOption = useMemo(
    () => options.find((option) => option.duration_months === selectedDuration) ?? options[0] ?? FALLBACK_OPTION,
    [options, selectedDuration],
  );
  const period = addMonthsFromEndDate(context?.occupancy.end_date, selectedOption.duration_months);
  const pendingPayment = context?.pending_renewal_payment;
  const hasPendingRenewal = pendingPayment?.transaction_status === 'pending' && Boolean(pendingPayment.snap_token);

  async function refreshAfterPayment(nextMessage: string, orderId: string) {
    setMessage(nextMessage);
    await syncPaymentStatus(orderId).catch(() => null);
    await syncTenantDataAfterPayment();
    await loadContext();
    router.push('/tenant/dashboard');
  }

  async function handlePay() {
    try {
      setIsPaying(true);
      setMessage('');
      setError('');

      const payment = hasPendingRenewal && pendingPayment?.snap_token && pendingPayment.order_id
        ? { snap_token: pendingPayment.snap_token, order_id: pendingPayment.order_id }
        : await createRenewalPayment(selectedOption.duration_months);

      await payWithMidtransSnap(payment.snap_token, {
        onSuccess: () => {
          void refreshAfterPayment(t('messages.paymentSuccessRefresh'), payment.order_id);
        },
        onPending: () => {
          void refreshAfterPayment(t('messages.paymentPending'), payment.order_id);
        },
        onError: () => {
          setError(t('status.paymentFailed'));
        },
        onClose: () => {
          setMessage(t('messages.paymentCancelled'));
        },
      });
    } catch (payError) {
      setError(payError instanceof Error ? payError.message : t('messages.paymentOpenFailed'));
    } finally {
      setIsPaying(false);
    }
  }

  return (
    <main
      className="min-h-screen bg-[#f9f9ff] px-4 py-6 text-[#111c2d] sm:px-6 lg:px-8 lg:py-8"
      style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif' }}
    >
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 rounded-2xl border border-white bg-white/80 p-5 shadow-sm sm:p-6 lg:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase text-[#006e2f]">
                <span>{t('tenant.applications.tenantArea')}</span>
                <ChevronRight size={14} aria-hidden="true" />
                <span>{t('tenant.renewal.title')}</span>
              </div>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight text-[#111c2d] sm:text-4xl">
                {t('tenant.renewal.title')}
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[#3d4a3d] sm:text-base">
                {t('tenant.renewal.subtitle')}
              </p>
            </div>
            <Link
              href="/tenant/riwayat"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#d8e3fb] bg-white px-4 text-sm font-bold text-[#111c2d] shadow-sm transition hover:bg-[#f0f3ff]"
            >
              <ReceiptText size={17} aria-hidden="true" />
              {t('tenant.renewal.viewHistory')}
            </Link>
          </div>
        </header>

        {isLoading ? (
          <LoadingState title={t('tenant.renewal.loadingTitle')} description={t('tenant.renewal.loadingDescription')} />
        ) : error && !context ? (
          <ErrorState
            title={t('tenant.renewal.unavailableTitle')}
            description={error}
            actionLabel={t('common.tryAgain')}
            onAction={() => void loadContext()}
          />
        ) : !context ? (
          <div className="space-y-4">
            <EmptyState title={t('tenant.renewal.noActiveLease')} description={t('tenant.renewal.noActiveLeaseDescription')} />
            <div className="flex justify-center">
              <Link
                href="/rooms"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#006e2f] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#005321]"
              >
                <Home size={17} aria-hidden="true" />
                {t('tenant.dashboard.viewRoomsCta')}
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <section className="rounded-2xl border border-white bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-[#006e2f]">
                    <Building2 size={19} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase text-[#006e2f]">{t('tenant.renewal.activeResidence')}</p>
                    <h2 className="mt-1 text-xl font-extrabold text-[#111c2d]">{context.room?.room_name ?? '-'}</h2>
                  </div>
                </div>

                <div className="grid border-t border-[#eef2ff] sm:grid-cols-2">
                  <div className="py-5 sm:pr-6">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 shrink-0 text-[#006e2f]" size={18} aria-hidden="true" />
                      <div>
                        <p className="text-xs font-bold uppercase text-[#3d4a3d]">{t('owner.applications.branch')}</p>
                        <p className="mt-1 text-sm font-bold text-[#111c2d]">
                          {context.room?.branch?.branch_name ?? t('tenant.applications.branchUnset')}
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 flex items-start gap-3">
                      <CreditCard className="mt-0.5 shrink-0 text-[#006e2f]" size={18} aria-hidden="true" />
                      <div>
                        <p className="text-xs font-bold uppercase text-[#3d4a3d]">{t('tenant.renewal.monthlyPrice')}</p>
                        <p className="mt-1 text-lg font-extrabold text-[#111c2d]">{formatRupiah(context.room?.price)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-[#eef2ff] py-5 sm:border-l sm:border-t-0 sm:pl-6">
                    <div className="flex items-start gap-3">
                      <CalendarDays className="mt-0.5 shrink-0 text-[#006e2f]" size={18} aria-hidden="true" />
                      <div>
                        <p className="text-xs font-bold uppercase text-[#3d4a3d]">{t('tenant.renewal.currentEndDate')}</p>
                        <p className="mt-1 text-lg font-extrabold text-[#111c2d]">
                          {formatDate(context.occupancy.end_date, locale)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 flex items-start gap-3">
                      <Clock3 className="mt-0.5 shrink-0 text-[#006e2f]" size={18} aria-hidden="true" />
                      <div>
                        <p className="text-xs font-bold uppercase text-[#3d4a3d]">{t('tenant.renewal.newPeriod')}</p>
                        <p className="mt-1 text-sm font-bold leading-6 text-[#111c2d]">
                          {formatDate(period?.start, locale)} - {formatDate(period?.end, locale)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-white bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e7eeff] text-[#006e2f]">
                    <CalendarDays size={19} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase text-[#006e2f]">{t('tenant.renewal.duration')}</p>
                    <h2 className="mt-1 text-xl font-extrabold text-[#111c2d]">{t('tenant.renewal.chooseDuration')}</h2>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {options.map((option) => {
                    const active = option.duration_months === selectedOption.duration_months;
                    const hasDiscount = option.discount_amount > 0;

                    return (
                      <button
                        key={option.duration_months}
                        type="button"
                        disabled={hasPendingRenewal || isPaying}
                        aria-pressed={active}
                        onClick={() => setSelectedDuration(option.duration_months)}
                        className={`relative min-h-28 rounded-xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          active
                            ? 'border-[#006e2f] bg-green-50 shadow-sm'
                            : 'border-[#d8e3fb] bg-white hover:border-[#96d59d] hover:bg-[#f9f9ff]'
                        }`}
                      >
                        <span
                          className={`absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full border ${
                            active ? 'border-[#006e2f] bg-[#006e2f] text-white' : 'border-[#bccbb9] bg-white text-transparent'
                          }`}
                        >
                          <Check size={14} strokeWidth={3} aria-hidden="true" />
                        </span>
                        <span className="block pr-7 text-lg font-extrabold text-[#111c2d]">
                          {t('tenant.renewal.months', { count: option.duration_months })}
                        </span>
                        <span
                          className={`mt-4 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                            hasDiscount ? 'bg-green-100 text-green-800' : 'bg-[#f0f3ff] text-[#3d4a3d]'
                          }`}
                        >
                          <Tag size={12} aria-hidden="true" />
                          {hasDiscount ? `-${formatRupiah(option.discount_amount)}` : t('tenant.renewal.noDiscount')}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {hasPendingRenewal && (
                  <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-800">
                    <Clock3 className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
                    <p>{t('tenant.renewal.pendingNotice')}</p>
                  </div>
                )}
              </section>
            </div>

            <aside className="rounded-2xl border border-white bg-white shadow-sm lg:sticky lg:top-24">
              <div className="border-b border-[#eef2ff] p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-[#006e2f]">
                    <ReceiptText size={19} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase text-[#006e2f]">{t('tenant.renewal.paymentSummary')}</p>
                    <h2 className="mt-1 text-xl font-extrabold text-[#111c2d]">{t('tenant.renewal.total')}</h2>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="divide-y divide-[#eef2ff]">
                  <SummaryRow label={t('tenant.renewal.monthlyPrice')} value={formatRupiah(context.room?.price)} />
                  <SummaryRow
                    label={t('tenant.renewal.duration')}
                    value={t('tenant.renewal.months', { count: selectedOption.duration_months })}
                  />
                  <SummaryRow label={t('tenant.renewal.subtotal')} value={formatRupiah(selectedOption.subtotal_amount)} />
                  <SummaryRow
                    label={t('tenant.renewal.discount')}
                    value={selectedOption.discount_amount ? `-${formatRupiah(selectedOption.discount_amount)}` : formatRupiah(0)}
                    tone="#006e2f"
                  />
                </div>

                <div className="mt-4 border-t-2 border-[#d8e3fb] pt-5">
                  <p className="text-xs font-bold uppercase text-[#3d4a3d]">{t('tenant.renewal.total')}</p>
                  <p className="mt-2 text-3xl font-extrabold leading-none text-[#006e2f] sm:text-4xl">
                    {formatRupiah(selectedOption.gross_amount)}
                  </p>
                </div>

                <div className="mt-5 flex items-start gap-3 border-t border-[#eef2ff] pt-5">
                  <ShieldCheck className="mt-0.5 shrink-0 text-[#006e2f]" size={18} aria-hidden="true" />
                  <p className="text-xs font-medium leading-5 text-[#3d4a3d]">{t('tenant.billing.securityNotice')}</p>
                </div>

                {message && (
                  <p className="mt-4 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-bold text-green-800">
                    {message}
                  </p>
                )}
                {error && (
                  <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
                    {error}
                  </p>
                )}

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <Link
                    href="/tenant/dashboard"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#d8e3fb] bg-white px-4 text-sm font-bold text-[#111c2d] transition hover:bg-[#f0f3ff]"
                  >
                    <ArrowLeft size={17} aria-hidden="true" />
                    {t('common.back')}
                  </Link>
                  <button
                    type="button"
                    disabled={isPaying}
                    onClick={() => void handlePay()}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#006e2f] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#005321] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isPaying ? t('common.processing') : t('tenant.renewal.continuePayment')}
                    <ChevronRight size={17} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
