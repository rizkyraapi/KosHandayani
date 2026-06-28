'use client';

import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  ExternalLink,
  FileText,
  Home,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ReceiptText,
  UserRound,
  XCircle,
} from 'lucide-react';
import RentalApplicationStatusBadge from '@/components/RentalApplicationStatusBadge';
import { useLanguage } from '@/contexts/LanguageContext';
import type { RentalApplication } from '@/lib/api';
import type { Locale } from '@/lib/i18n';
import { getPaymentMetaFromApplication } from '@/lib/paymentStatus';
import { getRentalPaymentBreakdown } from '@/lib/rental-payment';

const fallbackImageUrl = 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=900';

type TFunction = (key: string, params?: Record<string, string | number>) => string;

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

function isAwaitingPayment(application: RentalApplication) {
  return application.status === 'approved'
    && (application.payment_status === 'pending' || application.payment_status === 'unpaid');
}

function paymentStatusLabel(application: RentalApplication, t: TFunction) {
  if (application.status === 'pending') return t('status.awaitingOwnerApproval');
  if (application.status === 'cancelled') return t('status.cancelled');
  if (application.status === 'rejected') return t('status.applicationRejected');

  return t(getPaymentMetaFromApplication(application).labelKey);
}

function tenantPaymentTone(application: RentalApplication) {
  if (application.status === 'pending') {
    return {
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      text: 'text-amber-700',
      icon: Clock3,
    };
  }

  const paymentMeta = getPaymentMetaFromApplication(application);

  if (isAwaitingPayment(application) || paymentMeta.isPending) {
    return {
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      text: 'text-emerald-700',
      icon: CreditCard,
    };
  }

  if (paymentMeta.isPaid) {
    return {
      bg: 'bg-green-50',
      border: 'border-green-100',
      text: 'text-green-700',
      icon: CheckCircle2,
    };
  }

  if (application.status === 'rejected' || application.status === 'cancelled' || paymentMeta.isFailed) {
    return {
      bg: 'bg-red-50',
      border: 'border-red-100',
      text: 'text-red-700',
      icon: XCircle,
    };
  }

  return {
    bg: 'bg-slate-100',
    border: 'border-slate-200',
    text: 'text-slate-600',
    icon: FileText,
  };
}

function DocumentPreview({ label, url }: { label: string; url?: string | null }) {
  const { t } = useLanguage();

  if (!url) {
    return (
      <div style={{ border: '1px dashed #bccbb9', borderRadius: 10, padding: 18, color: '#3d4a3d', fontWeight: 700 }}>
        {label}: {t('tenant.detail.fileUnavailable')}
      </div>
    );
  }

  const isPdf = url.toLowerCase().includes('.pdf');

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <strong style={{ color: '#3d4a3d' }}>{label}</strong>
      {isPdf ? (
        <Link href={url} target="_blank" style={{ color: '#006e2f', fontWeight: 800 }}>
          {t('tenant.detail.openPdf')}
        </Link>
      ) : (
        <img src={url} alt={label} style={{ width: '100%', maxHeight: 260, objectFit: 'cover', borderRadius: 10, background: '#dee8ff' }} />
      )}
    </div>
  );
}

function TenantNotice({ message }: { message: string }) {
  if (!message) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
      <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
      <p className="m-0 leading-6">{message}</p>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Home;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#e7eeff] bg-[#f9f9ff] p-4">
      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#006e2f] shadow-sm">
        <Icon size={18} />
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#3d4a3d]">{label}</p>
      <div className="mt-1 text-sm font-bold text-[#111c2d]">{value}</div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#e7eeff] py-3 last:border-b-0">
      <span className="text-sm text-[#3d4a3d]">{label}</span>
      <span className="text-right text-sm font-bold text-[#111c2d]">{value}</span>
    </div>
  );
}

function TenantDocumentPreview({ label, url }: { label: string; url?: string | null }) {
  const { t } = useLanguage();

  if (!url) {
    return (
      <div className="rounded-xl border border-dashed border-[#bccbb9] bg-[#f9f9ff] p-4">
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7eeff] text-[#3d4a3d]">
          <FileText size={18} />
        </div>
        <p className="font-bold text-[#111c2d]">{label}</p>
        <p className="mt-1 text-sm text-[#3d4a3d]">{t('tenant.detail.fileUnavailable')}</p>
      </div>
    );
  }

  const isPdf = url.toLowerCase().includes('.pdf');

  return (
    <div className="rounded-xl border border-[#e7eeff] bg-[#f9f9ff] p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-[#111c2d]">{label}</p>
          <p className="mt-1 text-sm text-[#3d4a3d]">{isPdf ? t('tenant.detail.documentPdf') : t('tenant.detail.documentPreview')}</p>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#006e2f] shadow-sm">
          <FileText size={18} />
        </span>
      </div>
      {isPdf ? (
        <Link
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#006e2f] px-4 text-sm font-bold text-white transition hover:bg-[#005321]"
        >
          {t('tenant.detail.openPdf')}
          <ExternalLink size={16} />
        </Link>
      ) : (
        <img
          src={url}
          alt={label}
          className="h-48 w-full rounded-xl object-cover"
        />
      )}
    </div>
  );
}

function TenantRentalApplicationDetailView({
  application,
  onPay,
  isPaying,
  paymentMessage,
}: {
  application: RentalApplication;
  onPay?: () => void;
  isPaying: boolean;
  paymentMessage: string;
}) {
  const { locale, t } = useLanguage();
  const room = application.room;
  const tenant = application.tenant;
  const payment = application.payment;
  const facilities = room?.facilities ?? [];
  const images = room?.images ?? [];
  const canPay = isAwaitingPayment(application);
  const tone = tenantPaymentTone(application);
  const ToneIcon = tone.icon;
  const monthlyPrice = typeof room?.price === 'number' ? room.price : null;
  const paymentBreakdown = getRentalPaymentBreakdown({
    monthlyPrice,
    duration: application.duration,
    subtotalAmount: payment?.subtotal_amount,
    discountAmount: payment?.discount_amount,
    grossAmount: payment?.gross_amount,
  });
  const durationMonths = paymentBreakdown.durationMonths;
  const subtotalAmount = payment || monthlyPrice !== null ? paymentBreakdown.subtotalAmount : null;
  const discountAmount = payment || monthlyPrice !== null ? paymentBreakdown.discountAmount : null;
  const totalAmount = payment || monthlyPrice !== null ? paymentBreakdown.grossAmount : null;
  const roomImage = room?.thumbnail || room?.image_url || fallbackImageUrl;
  const isPaid = application.payment_status === 'paid';

  return (
    <div
      className="space-y-6"
      style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif' }}
    >
      <Link
        href="/tenant/rental-applications"
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#d8e3fb] bg-white px-3 text-sm font-bold text-[#111c2d] shadow-sm transition hover:bg-[#f0f3ff]"
      >
        <ArrowLeft size={17} />
        {t('common.back')}
      </Link>

      <section className="rounded-2xl border border-white bg-white p-5 shadow-sm sm:p-6 lg:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-[#006e2f]">
              <ReceiptText size={14} />
              {t('tenant.detail.title')}
            </div>
            <h1
              className="m-0 text-3xl font-extrabold tracking-tight text-[#111c2d] sm:text-4xl"
              style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif' }}
            >
              {t('tenant.detail.applicationNumber', { id: application.id })}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[#3d4a3d]">
              <span className="inline-flex items-center gap-2">
                <Home size={16} className="text-[#006e2f]" />
                {room?.room_name || t('tenant.applications.roomUnavailable')}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin size={16} className="text-[#006e2f]" />
                {room?.branch?.branch_name || t('tenant.applications.branchUnset')}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <RentalApplicationStatusBadge status={application.status} />
            {isPaid && (
              <span className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
                <CheckCircle2 size={14} />
                {t('status.paid')}
              </span>
            )}
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${tone.bg} ${tone.border} ${tone.text}`}>
              <ToneIcon size={14} />
              {paymentStatusLabel(application, t)}
            </span>
          </div>
        </div>
      </section>

      <TenantNotice message={paymentMessage} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)] lg:items-start">
        <section className="overflow-hidden rounded-2xl border border-white bg-white shadow-sm">
          <img
            src={roomImage}
            alt={room?.room_name || t('common.room')}
            className="h-64 w-full object-cover sm:h-80"
          />
          <div className="p-5 sm:p-6">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2
                  className="m-0 text-xl font-extrabold text-[#111c2d]"
                  style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif' }}
                >
                  {t('tenant.detail.roomDetail')}
                </h2>
                <p className="mt-1 text-sm text-[#3d4a3d]">
                  {t('tenant.detail.roomSummary')}
                </p>
              </div>
              {monthlyPrice !== null && (
                <p
                  className="m-0 text-2xl font-extrabold tracking-tight text-[#006e2f]"
                  style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif' }}
                >
                  {formatRupiah(monthlyPrice)}
                  <span className="ml-1 text-sm font-semibold text-[#3d4a3d]">{t('tenant.applications.perMonth')}</span>
                </p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoItem icon={Building2} label={t('common.room')} value={room?.room_name || '-'} />
              <InfoItem icon={MapPin} label={t('owner.applications.branch')} value={room?.branch?.branch_name || t('tenant.applications.branchUnset')} />
              <InfoItem icon={CalendarDays} label={t('owner.applications.moveInDate')} value={formatDate(application.move_in_date, locale)} />
              <InfoItem icon={Clock3} label={t('tenant.detail.rentalDuration')} value={application.duration} />
            </div>

            {facilities.length > 0 && (
              <div className="mt-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-[#3d4a3d]">{t('tenant.detail.facilities')}</p>
                <div className="flex flex-wrap gap-2">
                  {facilities.map((facility) => (
                    <span
                      key={facility.id}
                      className="rounded-full bg-[#f0f3ff] px-3 py-1.5 text-xs font-bold text-[#3d4a3d]"
                    >
                      {facility.facility_name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <section className="rounded-2xl border border-white bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#3d4a3d]">{t('tenant.detail.summary')}</p>
                <h2
                  className="mt-1 text-xl font-extrabold text-[#111c2d]"
                  style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif' }}
                >
                  {t('tenant.detail.paymentSummary')}
                </h2>
              </div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-[#006e2f]">
                <CreditCard size={20} />
              </span>
            </div>

            <div className="rounded-xl bg-[#f9f9ff] px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#3d4a3d]">{t('tenant.detail.estimatedTotal')}</p>
              <p
                className="mt-1 text-3xl font-extrabold tracking-tight text-[#006e2f]"
                style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif' }}
              >
                {totalAmount !== null ? formatRupiah(totalAmount) : '-'}
              </p>
            </div>

            <div className="mt-3">
              <SummaryRow label={t('tenant.detail.monthlyPrice')} value={monthlyPrice !== null ? formatRupiah(monthlyPrice) : '-'} />
              <SummaryRow label={t('tenant.detail.duration')} value={t('tenant.detail.months', { count: durationMonths })} />
              <SummaryRow label={t('tenant.detail.subtotal')} value={subtotalAmount !== null ? formatRupiah(subtotalAmount) : '-'} />
              <SummaryRow label={t('tenant.detail.discount')} value={discountAmount !== null ? (discountAmount > 0 ? `-${formatRupiah(discountAmount)}` : formatRupiah(0)) : '-'} />
              <SummaryRow label={t('tenant.detail.paymentAmount')} value={totalAmount !== null ? formatRupiah(totalAmount) : '-'} />
              <SummaryRow label={t('tenant.detail.orderId')} value={payment?.order_id || '-'} />
              <SummaryRow label={t('owner.applications.moveInDate')} value={formatDate(application.move_in_date, locale)} />
              <SummaryRow label={t('tenant.detail.paymentDate')} value={formatDate(payment?.paid_at ?? application.paid_at, locale)} />
              <SummaryRow label={t('owner.applications.paymentStatus')} value={paymentStatusLabel(application, t)} />
            </div>

            {canPay && onPay ? (
              <button
                type="button"
                disabled={isPaying}
                onClick={onPay}
                className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#006e2f] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#005321] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isPaying ? <Loader2 className="animate-spin" size={18} /> : <CreditCard size={18} />}
                {isPaying ? t('common.processing') : t('tenant.applications.payNow')}
              </button>
            ) : (
              <div className={`mt-5 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-semibold ${tone.bg} ${tone.border} ${tone.text}`}>
                <ToneIcon className="mt-0.5 shrink-0" size={18} />
                <p className="m-0 leading-6">{paymentStatusLabel(application, t)}</p>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-white bg-[#f0f3ff] p-5 shadow-sm sm:p-6">
            <div className="mb-3 flex items-center gap-2 text-[#006e2f]">
              <AlertCircle size={18} />
              <p className="text-sm font-bold">{t('tenant.detail.ownerNotes')}</p>
            </div>
            <p className="m-0 text-sm leading-6 text-[#3d4a3d]">
              {application.owner_notes || t('tenant.detail.noOwnerNotes')}
            </p>
          </section>
        </aside>
      </div>

      {images.length > 0 && (
        <section className="rounded-2xl border border-white bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2
              className="m-0 text-xl font-extrabold text-[#111c2d]"
              style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif' }}
            >
              {t('tenant.detail.roomGallery')}
            </h2>
            <span className="text-sm font-bold text-[#3d4a3d]">{t('tenant.detail.photos', { count: images.length })}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {images.map((image) => (
              <img
                key={image.id}
                src={image.image_url}
                alt={room?.room_name || t('common.room')}
                className="h-36 w-full rounded-xl object-cover"
              />
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-2xl border border-white bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-[#006e2f]">
              <UserRound size={20} />
            </span>
            <div>
              <h2
                className="m-0 text-xl font-extrabold text-[#111c2d]"
                style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif' }}
              >
                {t('tenant.detail.tenantData')}
              </h2>
              <p className="mt-1 text-sm text-[#3d4a3d]">{t('tenant.detail.tenantProfileDescription')}</p>
            </div>
          </div>
          <div className="grid gap-3">
            <InfoItem icon={UserRound} label={t('auth.fullName')} value={tenant?.full_name || '-'} />
            <InfoItem icon={Mail} label="Email" value={tenant?.email || '-'} />
            <InfoItem icon={Phone} label="WhatsApp" value={tenant?.whatsapp || '-'} />
            <InfoItem icon={Briefcase} label={t('tenant.detail.occupation')} value={tenant?.pekerjaan || '-'} />
            <InfoItem icon={MapPin} label={t('tenant.detail.address')} value={tenant?.address || '-'} />
          </div>
        </section>

        <section className="rounded-2xl border border-white bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-[#006e2f]">
              <FileText size={20} />
            </span>
            <div>
              <h2
                className="m-0 text-xl font-extrabold text-[#111c2d]"
                style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif' }}
              >
                {t('tenant.detail.documents')}
              </h2>
              <p className="mt-1 text-sm text-[#3d4a3d]">{t('tenant.detail.documentDescription')}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TenantDocumentPreview label="KTP" url={application.ktp_file_url} />
            <TenantDocumentPreview label="KK" url={application.kk_file_url} />
          </div>
        </section>
      </div>

      <Link
        href="/tenant/rental-applications"
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#d8e3fb] bg-white px-4 text-sm font-bold text-[#111c2d] shadow-sm transition hover:bg-[#f0f3ff]"
      >
        {t('tenant.detail.backToList')}
        <ChevronRight size={17} />
      </Link>
    </div>
  );
}

export default function RentalApplicationDetailView({
  application,
  onPay,
  isPaying = false,
  paymentMessage = '',
  variant = 'default',
}: {
  application: RentalApplication;
  onPay?: () => void;
  isPaying?: boolean;
  paymentMessage?: string;
  variant?: 'default' | 'tenant';
}) {
  const { locale, t } = useLanguage();
  const room = application.room;
  const tenant = application.tenant;
  const facilities = room?.facilities ?? [];
  const images = room?.images ?? [];
  const canPay = isAwaitingPayment(application);

  if (variant === 'tenant') {
    return (
      <TenantRentalApplicationDetailView
        application={application}
        onPay={onPay}
        isPaying={isPaying}
        paymentMessage={paymentMessage}
      />
    );
  }

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontSize: 'clamp(26px, 4vw, 36px)' }}>
            {t('tenant.detail.applicationNumber', { id: application.id })}
          </h1>
          <p style={{ margin: '6px 0 0', color: '#3d4a3d' }}>{room?.room_name || t('tenant.applications.roomUnavailable')}</p>
        </div>
        <RentalApplicationStatusBadge status={application.status} />
      </div>

      {paymentMessage && (
        <p style={{ margin: 0, padding: 14, borderRadius: 10, background: '#dcfce7', color: '#166534', fontWeight: 800 }}>
          {paymentMessage}
        </p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
        <section style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 12px 36px rgba(17,28,45,0.05)' }}>
          <img src={room?.thumbnail || room?.image_url || fallbackImageUrl} alt={room?.room_name || t('common.room')} style={{ width: '100%', height: 210, objectFit: 'cover', borderRadius: 10, marginBottom: 16 }} />
          <h2 style={{ margin: 0, fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontSize: 22 }}>{t('tenant.detail.roomDetail')}</h2>
          <p style={{ color: '#3d4a3d' }}>{room?.branch?.branch_name || t('tenant.applications.branchUnset')}</p>
          <p style={{ color: '#3d4a3d' }}>{t('owner.applications.moveInDate')}: <strong>{formatDate(application.move_in_date, locale)}</strong></p>
          <p style={{ color: '#3d4a3d' }}>{t('tenant.detail.duration')}: <strong>{application.duration}</strong></p>
          <p style={{ color: '#3d4a3d' }}>{t('owner.applications.paymentStatus')}: <strong>{paymentStatusLabel(application, t)}</strong></p>
          {canPay && onPay && (
            <button
              type="button"
              disabled={isPaying}
              onClick={onPay}
              style={{ border: 'none', background: '#006e2f', color: '#fff', borderRadius: 8, padding: '11px 16px', fontWeight: 800, cursor: isPaying ? 'not-allowed' : 'pointer', opacity: isPaying ? 0.7 : 1, marginTop: 6 }}
            >
              {isPaying ? t('common.processing') : t('tenant.applications.payNow')}
            </button>
          )}
          {facilities.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              {facilities.map((facility) => (
                <span key={facility.id} style={{ background: '#f0f3ff', color: '#3d4a3d', borderRadius: 999, padding: '5px 10px', fontSize: 12, fontWeight: 700 }}>
                  {facility.facility_name}
                </span>
              ))}
            </div>
          )}
        </section>

        <section style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 12px 36px rgba(17,28,45,0.05)' }}>
          <h2 style={{ margin: '0 0 14px', fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontSize: 22 }}>{t('tenant.detail.tenantData')}</h2>
          <p><strong>{t('auth.fullName')}:</strong> {tenant?.full_name || '-'}</p>
          <p><strong>Email:</strong> {tenant?.email || '-'}</p>
          <p><strong>WhatsApp:</strong> {tenant?.whatsapp || '-'}</p>
          <p><strong>{t('tenant.detail.occupation')}:</strong> {tenant?.pekerjaan || '-'}</p>
          <p><strong>{t('tenant.detail.address')}:</strong> {tenant?.address || '-'}</p>
        </section>
      </div>

      {images.length > 0 && (
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {images.map((image) => (
            <img key={image.id} src={image.image_url} alt={room?.room_name || t('common.room')} style={{ height: 130, width: '100%', objectFit: 'cover', borderRadius: 10 }} />
          ))}
        </section>
      )}

      <section style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 12px 36px rgba(17,28,45,0.05)' }}>
        <h2 style={{ margin: '0 0 16px', fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontSize: 22 }}>{t('tenant.detail.documents')}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
          <DocumentPreview label="KTP" url={application.ktp_file_url} />
          <DocumentPreview label="KK" url={application.kk_file_url} />
        </div>
      </section>

      <section style={{ background: '#f0f3ff', borderRadius: 12, padding: 20, color: '#3d4a3d' }}>
        <strong>{t('tenant.detail.ownerNotes')}</strong>
        <p style={{ margin: '8px 0 0' }}>{application.owner_notes || t('tenant.detail.noOwnerNotes')}</p>
      </section>
    </div>
  );
}
