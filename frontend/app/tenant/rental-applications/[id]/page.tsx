'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import RentalApplicationDetailView from '@/components/RentalApplicationDetailView';
import { createPayment, getMyRentalApplication, type RentalApplication } from '@/lib/api';
import { payWithMidtransSnap } from '@/lib/midtrans';

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

    try {
      setIsPaying(true);
      setPaymentMessage('');
      setError('');

      const payment = await createPayment(application.id);
      await payWithMidtransSnap(payment.snap_token, {
        onSuccess: () => {
          setPaymentMessage('Pembayaran berhasil. Detail pengajuan diperbarui.');
          void refreshApplication();
        },
        onPending: () => {
          setPaymentMessage('Pembayaran sedang diproses.');
          void refreshApplication();
        },
        onError: () => {
          setPaymentMessage('Pembayaran gagal diproses.');
          void refreshApplication();
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
    <main style={{ minHeight: '100vh', background: '#f9f9ff', padding: '32px 24px 72px', color: '#111c2d', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        {isLoading ? (
          <p style={{ color: '#3d4a3d', fontWeight: 700 }}>Memuat detail pengajuan...</p>
        ) : error ? (
          <p style={{ color: '#93000a', background: '#ffdad6', padding: 16, borderRadius: 10, fontWeight: 700 }}>{error}</p>
        ) : application ? (
          <RentalApplicationDetailView application={application} onPay={() => void handlePayment()} isPaying={isPaying} paymentMessage={paymentMessage} />
        ) : null}
      </div>
    </main>
  );
}
