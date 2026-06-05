'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';
import RentalApplicationDetailView from '@/components/RentalApplicationDetailView';
import { createPayment, getMyRentalApplication, syncPaymentStatus, type RentalApplication } from '@/lib/api';
import { payWithMidtransSnap } from '@/lib/midtrans';
import { syncTenantDataAfterPayment } from '@/lib/tenant-data-sync';

export default function Page() {
  const params = useParams<{ id: string }>();
  const [application, setApplication] = useState<RentalApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');
  const [isPaying, setIsPaying] = useState(false);

  async function refreshApplication() {
    setIsLoading(true);
    setError('');
    const data = await getMyRentalApplication(params.id);
    setApplication(data);
    setIsLoading(false);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadApplication() {
      try {
        setIsLoading(true);
        setError('');
        const data = await getMyRentalApplication(params.id);
        if (isMounted) setApplication(data);
      } catch (loadError) {
        if (isMounted) setError(loadError instanceof Error ? loadError.message : 'Gagal memuat detail pengajuan.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadApplication();
    return () => {
      isMounted = false;
    };
  }, [params.id]);

  async function handlePayment() {
    if (!application) return;

    async function refreshAfterPayment(nextMessage: string) {
      setPaymentMessage(nextMessage);
      await syncTenantDataAfterPayment();
      await refreshApplication();
    }

    try {
      setIsPaying(true);
      setPaymentMessage('');
      setError('');

      const payment = await createPayment(application.id);
      await payWithMidtransSnap(payment.snap_token, {
        onSuccess: () => {
          void syncPaymentStatus(payment.order_id)
            .catch(() => null)
            .then(() => refreshAfterPayment('Pembayaran berhasil. Detail pengajuan diperbarui.'));
        },
        onPending: () => {
          void syncPaymentStatus(payment.order_id)
            .catch(() => null)
            .then(() => refreshAfterPayment('Pembayaran sedang diproses.'));
        },
        onError: () => {
          void refreshAfterPayment('Pembayaran gagal diproses.');
        },
        onClose: () => {
          setPaymentMessage('Pembayaran dibatalkan.');
        },
      });
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : 'Gagal membuka pembayaran.');
    } finally {
      setIsPaying(false);
    }
  }

  return (
    <main
      className="min-h-screen bg-[#f9f9ff] px-4 py-6 text-[#111c2d] sm:px-6 lg:px-8 lg:py-8"
      style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}
    >
      <div className="mx-auto max-w-6xl">
        {isLoading ? (
          <div className="rounded-2xl border border-white bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 text-sm font-bold text-[#3d4a3d]">
              <Loader2 className="animate-spin text-[#006e2f]" size={18} />
              Memuat detail pengajuan...
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
              <div className="h-80 animate-pulse rounded-2xl bg-[#e7eeff]" />
              <div className="h-80 animate-pulse rounded-2xl bg-[#f0f3ff]" />
            </div>
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            <AlertCircle className="mt-0.5 shrink-0" size={18} />
            <p className="m-0 leading-6">{error}</p>
          </div>
        ) : application ? (
          <RentalApplicationDetailView
            application={application}
            onPay={() => void handlePayment()}
            isPaying={isPaying}
            paymentMessage={paymentMessage}
            variant="tenant"
          />
        ) : null}
      </div>
    </main>
  );
}
