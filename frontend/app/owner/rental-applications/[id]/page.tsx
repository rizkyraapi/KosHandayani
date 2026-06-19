'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  ExternalLink,
  FileText,
  Home,
  History,
  ImageIcon,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ReceiptText,
  ShieldCheck,
  UserRound,
  WalletCards,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import RentalApplicationStatusBadge from '@/components/RentalApplicationStatusBadge';
import { ErrorState, LoadingState } from '@/components/UiState';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  getOwnerRentalApplication,
  updateOwnerRentalApplication,
  type RentalApplication,
} from '@/lib/api';
import { getAuthErrorMessage } from '@/lib/auth';
import type { Locale } from '@/lib/i18n';
import { getRentalPaymentBreakdown } from '@/lib/rental-payment';
import { useAutoRefresh } from '@/lib/use-auto-refresh';

const fallbackImageUrl =
  'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=1200';

type DecisionStatus = 'approved' | 'rejected';
type Translate = (key: string, params?: Record<string, string | number>) => string;

function formatDate(value?: string | null, locale: Locale = 'id') {
  if (!value) return '-';

  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

function formatRupiah(value?: number | null) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

function paymentStatusLabel(application: RentalApplication, t: Translate) {
  if (application.status === 'pending') return t('status.awaitingOwnerApproval');
  if (application.status === 'cancelled') return t('status.cancelled');
  if (application.status === 'rejected') return t('status.applicationRejected');
  if (application.payment_status === 'paid') return t('status.paymentSuccessful');
  if (application.payment_status === 'failed') return t('status.paymentFailed');
  if (application.status === 'approved') return t('status.pendingPayment');

  return application.payment_status
    ? t(`status.${application.payment_status}`)
    : t('common.none');
}

function paymentTone(application: RentalApplication) {
  if (application.payment_status === 'paid') {
    return {
      className: 'border-green-100 bg-green-50 text-green-700',
      icon: CheckCircle2,
    };
  }

  if (
    application.status === 'rejected'
    || application.status === 'cancelled'
    || application.payment_status === 'failed'
  ) {
    return {
      className: 'border-red-100 bg-red-50 text-red-700',
      icon: XCircle,
    };
  }

  if (application.status === 'approved') {
    return {
      className: 'border-emerald-100 bg-emerald-50 text-emerald-700',
      icon: CreditCard,
    };
  }

  return {
    className: 'border-amber-100 bg-amber-50 text-amber-700',
    icon: Clock3,
  };
}

function getCopy(locale: Locale) {
  if (locale === 'en') {
    return {
      eyebrow: 'Application review',
      subtitle: 'Review tenant data, documents, rental details, and record your decision in one place.',
      submittedAt: 'Submitted',
      roomSection: 'Room information',
      roomDescription: 'Room, branch, rental schedule, and facilities selected by the tenant.',
      tenantDescription: 'Contact and profile information linked to this application.',
      decisionTitle: 'Owner decision',
      decisionDescription: 'Add an internal note before approving or rejecting the application.',
      notesLabel: 'Owner note',
      notesPlaceholder: 'Add a clear note for the tenant (optional)...',
      approve: 'Approve application',
      reject: 'Reject application',
      updateHint: 'You can update the decision while the rental has not been paid.',
      lockedHint: 'This decision is locked because the application is cancelled or already paid.',
      summaryTitle: 'Application summary',
      paymentTitle: 'Rental cost summary',
      rentalTotal: 'Estimated rental total',
      applicationDate: 'Application date',
      successApproved: 'Application approved successfully.',
      successRejected: 'Application rejected successfully.',
      loadTitle: 'Loading application details',
      loadDescription: 'Fetching the latest status, payment, tenant, and document data.',
      errorTitle: 'Unable to load application details',
      facilities: 'Facilities',
      gallery: 'Room gallery',
      documents: 'Identity documents',
      documentDescription: 'Identity files submitted together with the rental application.',
      imageDocument: 'Image document',
      openDocument: 'Open document',
      noFacilities: 'No facilities have been added.',
    };
  }

  return {
    eyebrow: 'Peninjauan pengajuan',
    subtitle: 'Tinjau data penyewa, dokumen, detail sewa, dan catat keputusan dalam satu tempat.',
    submittedAt: 'Diajukan',
    roomSection: 'Informasi kamar',
    roomDescription: 'Kamar, cabang, jadwal sewa, dan fasilitas yang dipilih penyewa.',
    tenantDescription: 'Data kontak dan profil yang terhubung ke pengajuan ini.',
    decisionTitle: 'Keputusan owner',
    decisionDescription: 'Tambahkan catatan sebelum menyetujui atau menolak pengajuan.',
    notesLabel: 'Catatan owner',
    notesPlaceholder: 'Tambahkan catatan yang jelas untuk penyewa (opsional)...',
    approve: 'Setujui pengajuan',
    reject: 'Tolak pengajuan',
    updateHint: 'Keputusan masih dapat diperbarui selama sewa belum dibayar.',
    lockedHint: 'Keputusan dikunci karena pengajuan dibatalkan atau pembayaran sudah lunas.',
    summaryTitle: 'Ringkasan pengajuan',
    paymentTitle: 'Ringkasan biaya sewa',
    rentalTotal: 'Estimasi total sewa',
    applicationDate: 'Tanggal pengajuan',
    successApproved: 'Pengajuan berhasil disetujui.',
    successRejected: 'Pengajuan berhasil ditolak.',
    loadTitle: 'Memuat detail pengajuan',
    loadDescription: 'Mengambil status, pembayaran, data penyewa, dan dokumen terbaru.',
    errorTitle: 'Gagal mengambil detail pengajuan',
    facilities: 'Fasilitas',
    gallery: 'Galeri kamar',
    documents: 'Dokumen identitas',
    documentDescription: 'Berkas identitas yang dikirim bersama pengajuan sewa.',
    imageDocument: 'Dokumen gambar',
    openDocument: 'Buka dokumen',
    noFacilities: 'Belum ada fasilitas yang ditambahkan.',
  };
}

function Notice({
  type,
  children,
}: {
  type: 'success' | 'error';
  children: ReactNode;
}) {
  const Icon = type === 'success' ? CheckCircle2 : AlertCircle;
  const tone = type === 'success'
    ? 'border-green-100 bg-green-50 text-green-800'
    : 'border-red-100 bg-red-50 text-red-800';

  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-semibold ${tone}`}>
      <Icon className="mt-0.5 shrink-0" size={18} />
      <p className="m-0 leading-6">{children}</p>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#e7eeff] bg-[#f9f9ff] p-4">
      <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#006e2f] shadow-sm">
        <Icon size={18} />
      </span>
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#3d4a3d]">{label}</p>
      <div className="mt-1 break-words text-sm font-bold leading-6 text-[#111c2d]">{value}</div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#e7eeff] py-3 last:border-b-0">
      <span className="text-sm leading-6 text-[#3d4a3d]">{label}</span>
      <span className="max-w-[58%] break-words text-right text-sm font-bold leading-6 text-[#111c2d]">
        {value}
      </span>
    </div>
  );
}

function DocumentCard({
  label,
  url,
  locale,
}: {
  label: string;
  url?: string | null;
  locale: Locale;
}) {
  const { t } = useLanguage();
  const copy = getCopy(locale);

  if (!url) {
    return (
      <div className="rounded-xl border border-dashed border-[#bccbb9] bg-[#f9f9ff] p-4">
        <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7eeff] text-[#3d4a3d]">
          <FileText size={18} />
        </span>
        <p className="font-bold text-[#111c2d]">{label}</p>
        <p className="mt-1 text-sm text-[#3d4a3d]">{t('tenant.detail.fileUnavailable')}</p>
      </div>
    );
  }

  const isPdf = url.toLowerCase().includes('.pdf');

  return (
    <div className="overflow-hidden rounded-xl border border-[#e7eeff] bg-[#f9f9ff]">
      {!isPdf && (
        <Link href={url} target="_blank" rel="noreferrer" className="block overflow-hidden bg-[#e7eeff]">
          <Image
            src={url}
            alt={label}
            width={800}
            height={440}
            unoptimized
            className="h-44 w-full object-cover transition duration-300 hover:scale-[1.02]"
          />
        </Link>
      )}
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="font-bold text-[#111c2d]">{label}</p>
          <p className="mt-1 text-sm text-[#3d4a3d]">
            {isPdf ? t('tenant.detail.documentPdf') : copy.imageDocument}
          </p>
        </div>
        <Link
          href={url}
          target="_blank"
          rel="noreferrer"
          aria-label={`${copy.openDocument} ${label}`}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#d8e3fb] bg-white px-3 text-sm font-bold text-[#006e2f] transition hover:bg-[#f0f3ff]"
        >
          <ExternalLink size={16} />
          <span className="hidden sm:inline">{copy.openDocument}</span>
        </Link>
      </div>
    </div>
  );
}

function PageSkeleton({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-6">
      <LoadingState title={title} description={description} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)]">
        <div className="h-[520px] animate-pulse rounded-2xl bg-[#e7eeff]" />
        <div className="h-[520px] animate-pulse rounded-2xl bg-[#f0f3ff]" />
      </div>
    </div>
  );
}

export default function Page() {
  const params = useParams<{ id: string }>();
  const { locale, t } = useLanguage();
  const copy = useMemo(() => getCopy(locale), [locale]);
  const [application, setApplication] = useState<RentalApplication | null>(null);
  const [ownerNotes, setOwnerNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const hasLoadedRef = useRef(false);
  const notesDirtyRef = useRef(false);

  const loadApplication = useCallback(async () => {
    try {
      if (!hasLoadedRef.current) {
        setIsLoading(true);
      }

      setError('');
      const data = await getOwnerRentalApplication(params.id);
      setApplication(data);

      if (!notesDirtyRef.current) {
        setOwnerNotes(data.owner_notes ?? '');
      }
    } catch (loadError) {
      setError(getAuthErrorMessage(loadError, t('messages.loadApplicationDetailFailed')));
    } finally {
      hasLoadedRef.current = true;
      setIsLoading(false);
    }
  }, [params.id, t]);

  useEffect(() => {
    void Promise.resolve().then(loadApplication);
  }, [loadApplication]);

  useEffect(() => {
    if (!application) return;

    document.title = `${t('tenant.detail.applicationNumber', { id: application.id })} - KosHandayani`;
  }, [application, t]);

  useAutoRefresh(loadApplication);

  async function decide(status: DecisionStatus) {
    try {
      setIsSubmitting(true);
      setError('');
      setMessage('');

      const updated = await updateOwnerRentalApplication(params.id, {
        status,
        owner_notes: ownerNotes.trim() || undefined,
      });

      notesDirtyRef.current = false;
      setApplication(updated);
      setOwnerNotes(updated.owner_notes ?? '');
      setMessage(status === 'approved' ? copy.successApproved : copy.successRejected);
    } catch (submitError) {
      setError(getAuthErrorMessage(submitError, t('messages.loadApplicationDetailFailed')));
    } finally {
      setIsSubmitting(false);
    }
  }

  const room = application?.room;
  const tenant = application?.tenant;
  const payment = application?.payment;
  const facilities = room?.facilities ?? [];
  const images = room?.images ?? [];
  const monthlyPrice = payment?.monthly_price ?? (typeof room?.price === 'number' ? room.price : null);
  const breakdown = getRentalPaymentBreakdown({
    monthlyPrice,
    duration: application?.duration,
    subtotalAmount: payment?.subtotal_amount,
    discountAmount: payment?.discount_amount,
    grossAmount: payment?.gross_amount,
  });
  const hasAmount = Boolean(payment) || monthlyPrice !== null;
  const decisionLocked = application?.status === 'cancelled' || application?.payment_status === 'paid';
  const tone = application ? paymentTone(application) : null;
  const ToneIcon = tone?.icon ?? Clock3;

  return (
    <main
      className="min-h-screen bg-[#f9f9ff] px-4 py-6 text-[#111c2d] sm:px-6 lg:px-8 lg:py-8"
      style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif' }}
    >
      <div className="mx-auto max-w-7xl">
        {isLoading ? (
          <PageSkeleton title={copy.loadTitle} description={copy.loadDescription} />
        ) : error && !application ? (
          <div className="rounded-2xl border border-white bg-white p-5 shadow-sm sm:p-6">
            <ErrorState
              title={copy.errorTitle}
              description={error}
              onAction={() => void loadApplication()}
            />
          </div>
        ) : application ? (
          <div className="space-y-6">
            <Link
              href="/owner/rental-applications"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#d8e3fb] bg-white px-3 text-sm font-bold text-[#111c2d] shadow-sm transition hover:bg-[#f0f3ff]"
            >
              <ArrowLeft size={17} />
              {t('tenant.detail.backToList')}
            </Link>

            <header className="overflow-hidden rounded-2xl border border-white bg-white shadow-sm">
              <div className="bg-gradient-to-r from-green-50 via-white to-[#f0f3ff] p-5 sm:p-6 lg:p-7">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 max-w-3xl">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-[#006e2f] shadow-sm">
                      <ShieldCheck size={14} />
                      {copy.eyebrow}
                    </div>
                    <h1
                      className="m-0 text-3xl font-extrabold tracking-tight text-[#111c2d] sm:text-4xl"
                      style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif' }}
                    >
                      {t('tenant.detail.applicationNumber', { id: application.id })}
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[#3d4a3d] sm:text-base">
                      {copy.subtitle}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-[#3d4a3d]">
                      <span className="inline-flex items-center gap-2">
                        <UserRound size={16} className="text-[#006e2f]" />
                        {tenant?.full_name || tenant?.email || '-'}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Home size={16} className="text-[#006e2f]" />
                        {room?.room_name || t('tenant.applications.roomUnavailable')}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays size={16} className="text-[#006e2f]" />
                        {copy.submittedAt} {formatDate(application.created_at, locale)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:max-w-sm lg:justify-end">
                    <RentalApplicationStatusBadge status={application.status} />
                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${tone?.className}`}
                    >
                      <ToneIcon size={14} />
                      {paymentStatusLabel(application, t)}
                    </span>
                  </div>
                </div>
              </div>
            </header>

            {message && <Notice type="success">{message}</Notice>}
            {error && <Notice type="error">{error}</Notice>}

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.75fr)] lg:items-start">
              <div className="order-last space-y-6 lg:order-first">
                <section className="overflow-hidden rounded-2xl border border-white bg-white shadow-sm">
                  <div className="relative">
                    <Image
                      src={room?.thumbnail || room?.image_url || fallbackImageUrl}
                      alt={room?.room_name || t('common.room')}
                      width={1200}
                      height={800}
                      unoptimized
                      className="h-64 w-full object-cover sm:h-80"
                    />
                    {monthlyPrice !== null && (
                      <div className="absolute bottom-4 left-4 rounded-xl bg-[#111c2d]/85 px-4 py-3 text-white shadow-lg backdrop-blur-sm">
                        <p className="text-xs font-bold uppercase tracking-[0.08em] text-white/75">
                          {t('tenant.detail.monthlyPrice')}
                        </p>
                        <p
                          className="mt-1 text-xl font-extrabold"
                          style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif' }}
                        >
                          {formatRupiah(monthlyPrice)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="mb-5">
                      <h2
                        className="m-0 text-xl font-extrabold text-[#111c2d]"
                        style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif' }}
                      >
                        {copy.roomSection}
                      </h2>
                      <p className="mt-1 text-sm leading-6 text-[#3d4a3d]">{copy.roomDescription}</p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <InfoTile icon={Building2} label={t('common.room')} value={room?.room_name || '-'} />
                      <InfoTile
                        icon={MapPin}
                        label={t('owner.applications.branch')}
                        value={room?.branch?.branch_name || t('tenant.applications.branchUnset')}
                      />
                      <InfoTile
                        icon={CalendarDays}
                        label={t('owner.applications.moveInDate')}
                        value={formatDate(application.move_in_date, locale)}
                      />
                      <InfoTile
                        icon={Clock3}
                        label={t('tenant.detail.rentalDuration')}
                        value={application.duration}
                      />
                    </div>

                    <div className="mt-5">
                      <p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-[#3d4a3d]">
                        {copy.facilities}
                      </p>
                      {facilities.length > 0 ? (
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
                      ) : (
                        <p className="text-sm text-[#3d4a3d]">{copy.noFacilities}</p>
                      )}
                    </div>
                  </div>
                </section>

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
                      <p className="mt-1 text-sm text-[#3d4a3d]">{copy.tenantDescription}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <InfoTile icon={UserRound} label={t('auth.fullName')} value={tenant?.full_name || '-'} />
                    <InfoTile icon={Mail} label="Email" value={tenant?.email || '-'} />
                    <InfoTile icon={Phone} label="WhatsApp" value={tenant?.whatsapp || '-'} />
                    <InfoTile
                      icon={Briefcase}
                      label={t('tenant.detail.occupation')}
                      value={tenant?.pekerjaan || '-'}
                    />
                    <div className="sm:col-span-2">
                      <InfoTile
                        icon={MapPin}
                        label={t('tenant.detail.address')}
                        value={tenant?.address || '-'}
                      />
                    </div>
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
                        {copy.documents}
                      </h2>
                      <p className="mt-1 text-sm text-[#3d4a3d]">{copy.documentDescription}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <DocumentCard label="KTP" url={application.ktp_file_url} locale={locale} />
                    <DocumentCard label="KK" url={application.kk_file_url} locale={locale} />
                  </div>
                </section>

                <div className="grid gap-6 xl:grid-cols-2">
                  <section className="rounded-2xl border border-white bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-5 flex items-center gap-3">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-[#006e2f]">
                        <History size={20} />
                      </span>
                      <div>
                        <h2 className="text-xl font-extrabold text-[#111c2d]">Histori status</h2>
                        <p className="mt-1 text-sm text-[#3d4a3d]">Timeline perubahan state pengajuan.</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {(application.status_history || []).length === 0 ? (
                        <p className="rounded-xl bg-[#f9f9ff] p-4 text-sm text-[#3d4a3d]">Belum ada histori status.</p>
                      ) : application.status_history?.map((item, index) => (
                        <div key={item.key} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-[#006e2f]" />
                            {index < (application.status_history?.length || 0) - 1 && <span className="h-full w-px bg-[#d8e3fb]" />}
                          </div>
                          <div className="pb-5">
                            <p className="font-bold text-[#111c2d]">{item.label}</p>
                            <p className="mt-1 text-sm text-[#3d4a3d]">{formatDate(item.occurred_at, locale)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-white bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-5 flex items-center gap-3">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-[#006e2f]">
                        <WalletCards size={20} />
                      </span>
                      <div>
                        <h2 className="text-xl font-extrabold text-[#111c2d]">Histori pembayaran</h2>
                        <p className="mt-1 text-sm text-[#3d4a3d]">Initial rent dan renewal terkait pengajuan.</p>
                      </div>
                    </div>
                    <div className="grid gap-3">
                      {(application.payment_history || []).length === 0 ? (
                        <p className="rounded-xl bg-[#f9f9ff] p-4 text-sm text-[#3d4a3d]">Belum ada histori pembayaran.</p>
                      ) : application.payment_history?.map((historyPayment) => (
                        <div key={historyPayment.id} className="rounded-xl border border-[#e7eeff] bg-[#f9f9ff] p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="rounded-full bg-[#e7eeff] px-3 py-1 text-xs font-bold text-[#3d4a3d]">
                              {historyPayment.payment_category === 'renewal' ? 'Renewal' : 'Initial Rent'}
                            </span>
                            <span className="text-xs font-bold uppercase text-[#006e2f]">{historyPayment.transaction_status}</span>
                          </div>
                          <p className="mt-3 text-lg font-extrabold text-[#111c2d]">{formatRupiah(historyPayment.gross_amount)}</p>
                          <p className="mt-1 break-all text-sm text-[#3d4a3d]">{historyPayment.order_id}</p>
                          {historyPayment.period_start && (
                            <p className="mt-2 text-sm font-semibold text-[#3d4a3d]">
                              {formatDate(historyPayment.period_start, locale)} – {formatDate(historyPayment.period_end, locale)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                {images.length > 0 && (
                  <section className="rounded-2xl border border-white bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-[#006e2f]">
                          <ImageIcon size={20} />
                        </span>
                        <h2
                          className="m-0 text-xl font-extrabold text-[#111c2d]"
                          style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif' }}
                        >
                          {copy.gallery}
                        </h2>
                      </div>
                      <span className="text-sm font-bold text-[#3d4a3d]">
                        {t('tenant.detail.photos', { count: images.length })}
                      </span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {images.map((image) => (
                        <Image
                          key={image.id}
                          src={image.image_url}
                          alt={room?.room_name || t('common.room')}
                          width={600}
                          height={400}
                          unoptimized
                          className="h-40 w-full rounded-xl object-cover"
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>

              <div className="order-first space-y-4 lg:order-last lg:sticky lg:top-6">
                <section className="rounded-2xl border border-white bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#006e2f]">
                        {copy.summaryTitle}
                      </p>
                      <h2
                        className="mt-1 text-xl font-extrabold text-[#111c2d]"
                        style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif' }}
                      >
                        {copy.paymentTitle}
                      </h2>
                    </div>
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-[#006e2f]">
                      <ReceiptText size={20} />
                    </span>
                  </div>

                  <div className="rounded-xl bg-[#f9f9ff] px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#3d4a3d]">
                      {copy.rentalTotal}
                    </p>
                    <p
                      className="mt-1 text-3xl font-extrabold tracking-tight text-[#006e2f]"
                      style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif' }}
                    >
                      {hasAmount ? formatRupiah(breakdown.grossAmount) : '-'}
                    </p>
                  </div>

                  <div className="mt-3">
                    <SummaryRow
                      label={t('tenant.detail.monthlyPrice')}
                      value={monthlyPrice !== null ? formatRupiah(monthlyPrice) : '-'}
                    />
                    <SummaryRow
                      label={t('tenant.detail.duration')}
                      value={application.duration}
                    />
                    <SummaryRow
                      label={t('tenant.detail.subtotal')}
                      value={hasAmount ? formatRupiah(breakdown.subtotalAmount) : '-'}
                    />
                    <SummaryRow
                      label={t('tenant.detail.discount')}
                      value={hasAmount ? formatRupiah(breakdown.discountAmount) : '-'}
                    />
                    <SummaryRow
                      label={copy.applicationDate}
                      value={formatDate(application.created_at, locale)}
                    />
                    <SummaryRow
                      label={t('owner.applications.moveInDate')}
                      value={formatDate(application.move_in_date, locale)}
                    />
                    <SummaryRow
                      label={t('tenant.detail.orderId')}
                      value={payment?.order_id || '-'}
                    />
                    <SummaryRow
                      label={t('owner.applications.paymentStatus')}
                      value={paymentStatusLabel(application, t)}
                    />
                  </div>
                </section>

                <section className="rounded-2xl border border-white bg-[#f0f3ff] p-5 shadow-sm sm:p-6">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-[#006e2f]">
                      <ShieldCheck size={18} />
                      <h2
                        className="text-lg font-extrabold text-[#111c2d]"
                        style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif' }}
                      >
                        {copy.decisionTitle}
                      </h2>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#3d4a3d]">{copy.decisionDescription}</p>
                  </div>

                  <div className={`mb-4 flex items-start gap-3 rounded-xl border bg-white px-4 py-3 text-sm font-semibold ${tone?.className}`}>
                    <ToneIcon className="mt-0.5 shrink-0" size={18} />
                    <div>
                      <p className="font-bold">{paymentStatusLabel(application, t)}</p>
                      <p className="mt-1 font-normal leading-6">
                        {decisionLocked ? copy.lockedHint : copy.updateHint}
                      </p>
                    </div>
                  </div>

                  <label
                    htmlFor="owner-notes"
                    className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-[#3d4a3d]"
                  >
                    {copy.notesLabel}
                  </label>
                  <textarea
                    id="owner-notes"
                    value={ownerNotes}
                    disabled={decisionLocked || isSubmitting}
                    onChange={(event) => {
                      notesDirtyRef.current = true;
                      setOwnerNotes(event.currentTarget.value);
                    }}
                    placeholder={copy.notesPlaceholder}
                    rows={5}
                    className="w-full resize-y rounded-xl border border-[#bccbb9] bg-white px-4 py-3 text-sm leading-6 text-[#111c2d] outline-none transition placeholder:text-[#6d7b6c] focus:border-[#006e2f] focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-[#e7eeff] disabled:text-[#6d7b6c]"
                  />

                  {!decisionLocked && (
                    <div className="mt-4 grid gap-3">
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => void decide('approved')}
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#006e2f] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#005321] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                        {isSubmitting ? t('common.processing') : copy.approve}
                      </button>
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => void decide('rejected')}
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <XCircle size={18} />}
                        {isSubmitting ? t('common.processing') : copy.reject}
                      </button>
                    </div>
                  )}
                </section>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
