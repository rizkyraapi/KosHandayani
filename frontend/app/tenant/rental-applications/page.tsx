'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  FileText,
  Home,
  Loader2,
  MapPin,
  XCircle,
} from 'lucide-react';
import RentalApplicationStatusBadge from '@/components/RentalApplicationStatusBadge';
import { createPayment, getMyRentalApplications, syncPaymentStatus, type RentalApplication } from '@/lib/api';
import { payWithMidtransSnap } from '@/lib/midtrans';
import { syncTenantDataAfterPayment } from '@/lib/tenant-data-sync';

const fallbackImageUrl = 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=700';

function formatDate(value?: string | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value));
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

function paymentStatusLabel(application: RentalApplication) {
  if (application.status === 'pending') return 'Menunggu Persetujuan Owner';
  if (isAwaitingPayment(application)) return 'Menunggu Pembayaran';
  if (application.status === 'approved' && application.payment_status === 'paid') return 'Pembayaran Berhasil';
  if (application.payment_status === 'failed') return 'Pembayaran Gagal';
  if (application.status === 'rejected') return 'Pengajuan Ditolak';

  return application.payment_status ?? '-';
}

function paymentTone(application: RentalApplication) {
  if (application.status === 'pending') {
    return {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      icon: Clock3,
    };
  }

  if (isAwaitingPayment(application)) {
    return {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      icon: CreditCard,
    };
  }

  if (application.status === 'approved' && application.payment_status === 'paid') {
    return {
      bg: 'bg-green-50',
      text: 'text-green-700',
      icon: CheckCircle2,
    };
  }

  if (application.status === 'rejected' || application.payment_status === 'failed') {
    return {
      bg: 'bg-red-50',
      text: 'text-red-700',
      icon: XCircle,
    };
  }

  return {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    icon: FileText,
  };
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'green',
}: {
  label: string;
  value: number;
  icon: typeof FileText;
  tone?: 'green' | 'blue' | 'amber' | 'red';
}) {
  const tones = {
    green: 'bg-green-50 text-green-700',
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
  };

  return (
    <div className="rounded-2xl border border-white bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#3d4a3d]">{label}</p>
          <p
            className="mt-2 text-3xl font-extrabold tracking-tight text-[#111c2d]"
            style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif' }}
          >
            {value}
          </p>
        </div>
        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon size={19} />
        </span>
      </div>
    </div>
  );
}

function Notice({
  type,
  children,
}: {
  type: 'success' | 'error';
  children: React.ReactNode;
}) {
  const Icon = type === 'success' ? CheckCircle2 : AlertCircle;
  const tone = type === 'success'
    ? 'border-green-100 bg-green-50 text-green-800'
    : 'border-red-100 bg-red-50 text-red-800';

  return (
    <div className={`mb-5 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-semibold ${tone}`}>
      <Icon className="mt-0.5 shrink-0" size={18} />
      <p className="m-0 leading-6">{children}</p>
    </div>
  );
}

function LoadingCards() {
  return (
    <div className="grid gap-4">
      {[1, 2, 3].map((item) => (
        <div key={item} className="rounded-2xl border border-white bg-white p-4 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-[112px_minmax(0,1fr)_180px] sm:items-center">
            <div className="h-24 animate-pulse rounded-xl bg-[#e7eeff]" />
            <div className="space-y-3">
              <div className="h-5 w-2/3 animate-pulse rounded bg-[#e7eeff]" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-[#f0f3ff]" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-[#f0f3ff]" />
            </div>
            <div className="h-11 animate-pulse rounded-xl bg-[#e7eeff]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Page() {
  const router = useRouter();
  const [applications, setApplications] = useState<RentalApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [payingApplicationId, setPayingApplicationId] = useState<number | null>(null);

  const summary = useMemo(() => ({
    total: applications.length,
    pending: applications.filter((application) => application.status === 'pending').length,
    approved: applications.filter((application) => application.status === 'approved').length,
    needPayment: applications.filter(isAwaitingPayment).length,
  }), [applications]);

  async function refreshApplications() {
    setIsLoading(true);
    setError('');
    const data = await getMyRentalApplications();
    setApplications(data);
    setIsLoading(false);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadApplications() {
      try {
        setIsLoading(true);
        setError('');
        const data = await getMyRentalApplications();
        if (isMounted) setApplications(data);
      } catch (loadError) {
        if (isMounted) setError(loadError instanceof Error ? loadError.message : 'Gagal memuat pengajuan sewa.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadApplications();
    return () => {
      isMounted = false;
    };
  }, []);

  async function handlePayment(application: RentalApplication) {
    async function refreshAfterPayment(nextMessage: string, shouldRedirect = false) {
      setMessage(nextMessage);
      await syncTenantDataAfterPayment();
      await refreshApplications();

      if (shouldRedirect) {
        router.push(`/tenant/rental-applications/${application.id}`);
      }
    }

    try {
      setPayingApplicationId(application.id);
      setMessage('');
      setError('');

      const payment = await createPayment(application.id);
      await payWithMidtransSnap(payment.snap_token, {
        onSuccess: () => {
          void syncPaymentStatus(payment.order_id)
            .catch(() => null)
            .then(() => refreshAfterPayment('Pembayaran berhasil. Data pengajuan diperbarui.', true));
        },
        onPending: () => {
          void syncPaymentStatus(payment.order_id)
            .catch(() => null)
            .then(() => refreshAfterPayment('Pembayaran sedang diproses.', true));
        },
        onError: () => {
          void refreshAfterPayment('Pembayaran gagal diproses.');
        },
        onClose: () => {
          setMessage('Pembayaran dibatalkan.');
        },
      });
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : 'Gagal membuka pembayaran.');
    } finally {
      setPayingApplicationId(null);
    }
  }

  return (
    <main
      className="min-h-screen bg-[#f9f9ff] px-4 py-6 text-[#111c2d] sm:px-6 lg:px-8 lg:py-8"
      style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}
    >
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 rounded-2xl border border-white bg-white/80 p-5 shadow-sm sm:p-6 lg:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-[#006e2f]">
                <FileText size={14} />
                Tenant Area
              </div>
              <h1
                className="m-0 text-3xl font-extrabold tracking-tight text-[#111c2d] sm:text-4xl"
                style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif' }}
              >
                Pengajuan Sewa
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#3d4a3d] sm:text-base">
                Pantau progres pengajuan kamar, cek detail dokumen, dan lanjutkan pembayaran dari satu tempat yang rapi.
              </p>
            </div>
            <Link
              href="/rooms"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#d8e3fb] bg-[#f0f3ff] px-4 text-sm font-bold text-[#111c2d] transition hover:border-[#bccbb9] hover:bg-[#e7eeff]"
            >
              <Home size={17} />
              Lihat Kamar
            </Link>
          </div>
        </header>

        {message && <Notice type="success">{message}</Notice>}
        {error && <Notice type="error">{error}</Notice>}

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Pengajuan" value={summary.total} icon={FileText} tone="blue" />
          <StatCard label="Menunggu Review" value={summary.pending} icon={Clock3} tone="amber" />
          <StatCard label="Disetujui" value={summary.approved} icon={CheckCircle2} tone="green" />
          <StatCard label="Perlu Dibayar" value={summary.needPayment} icon={CreditCard} tone="green" />
        </section>

        <section className="rounded-2xl border border-white bg-white p-4 shadow-sm sm:p-5 lg:p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                className="m-0 text-xl font-extrabold text-[#111c2d]"
                style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif' }}
              >
                Daftar Pengajuan
              </h2>
              <p className="mt-1 text-sm text-[#3d4a3d]">
                Status terbaru akan muncul otomatis setelah owner atau sistem pembayaran memperbarui data.
              </p>
            </div>
          </div>

          {isLoading ? (
            <LoadingCards />
          ) : applications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#bccbb9] bg-[#f9f9ff] px-5 py-12 text-center">
              <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e7eeff] text-[#006e2f]">
                <FileText size={26} />
              </span>
              <h3
                className="mt-4 text-xl font-extrabold text-[#111c2d]"
                style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif' }}
              >
                Belum ada pengajuan sewa
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#3d4a3d]">
                Setelah memilih kamar dan mengirim dokumen, status pengajuan akan tampil di sini.
              </p>
              <Link
                href="/rooms"
                className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#006e2f] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#005321]"
              >
                Cari Kamar
                <ChevronRight size={17} />
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {applications.map((application) => {
                const room = application.room;
                const canPay = isAwaitingPayment(application);
                const tone = paymentTone(application);
                const ToneIcon = tone.icon;
                const isPaying = payingApplicationId === application.id;

                return (
                  <article
                    key={application.id}
                    className="overflow-hidden rounded-2xl border border-[#eef2ff] bg-white shadow-sm transition hover:border-[#d8e3fb] hover:shadow-md"
                  >
                    <div className="grid gap-4 p-4 sm:grid-cols-[112px_minmax(0,1fr)] lg:grid-cols-[112px_minmax(0,1fr)_220px] lg:items-center">
                      <Link
                        href={`/tenant/rental-applications/${application.id}`}
                        className="block overflow-hidden rounded-xl bg-[#e7eeff]"
                        aria-label={`Detail ${room?.room_name || 'pengajuan sewa'}`}
                      >
                        <img
                          src={room?.thumbnail || room?.image_url || fallbackImageUrl}
                          alt={room?.room_name || 'Kamar'}
                          className="h-28 w-full object-cover transition duration-300 hover:scale-105 sm:h-24"
                        />
                      </Link>

                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <RentalApplicationStatusBadge status={application.status} />
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${tone.bg} ${tone.text}`}>
                            <ToneIcon size={13} />
                            {paymentStatusLabel(application)}
                          </span>
                        </div>

                        <Link
                          href={`/tenant/rental-applications/${application.id}`}
                          className="block text-[#111c2d] no-underline"
                        >
                          <h3
                            className="m-0 truncate text-lg font-extrabold tracking-tight"
                            style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif' }}
                          >
                            {room?.room_name || 'Kamar tidak tersedia'}
                          </h3>
                        </Link>

                        <div className="mt-2 grid gap-2 text-sm text-[#3d4a3d] sm:grid-cols-2">
                          <span className="flex min-w-0 items-center gap-2">
                            <MapPin className="shrink-0 text-[#006e2f]" size={16} />
                            <span className="truncate">{room?.branch?.branch_name || 'Cabang belum diatur'}</span>
                          </span>
                          <span className="flex items-center gap-2">
                            <Clock3 className="shrink-0 text-[#006e2f]" size={16} />
                            <span>{application.duration}</span>
                          </span>
                          <span className="flex items-center gap-2">
                            <CalendarDays className="shrink-0 text-[#006e2f]" size={16} />
                            <span>Diajukan {formatDate(application.created_at)}</span>
                          </span>
                          {typeof room?.price === 'number' && (
                            <span className="flex items-center gap-2 font-semibold text-[#111c2d]">
                              <CreditCard className="shrink-0 text-[#006e2f]" size={16} />
                              <span>{formatRupiah(room.price)} / bulan</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row lg:col-span-1 lg:flex-col">
                        {canPay && (
                          <button
                            type="button"
                            disabled={isPaying}
                            onClick={() => void handlePayment(application)}
                            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#006e2f] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#005321] disabled:cursor-not-allowed disabled:opacity-70 lg:flex-none"
                          >
                            {isPaying ? <Loader2 className="animate-spin" size={17} /> : <CreditCard size={17} />}
                            {isPaying ? 'Memproses...' : 'Bayar Sekarang'}
                          </button>
                        )}
                        <Link
                          href={`/tenant/rental-applications/${application.id}`}
                          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#d8e3fb] bg-[#f0f3ff] px-4 text-sm font-bold text-[#111c2d] transition hover:border-[#bccbb9] hover:bg-[#e7eeff] lg:flex-none"
                        >
                          Detail
                          <ChevronRight size={17} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
