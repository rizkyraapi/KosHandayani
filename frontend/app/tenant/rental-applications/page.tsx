'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import RentalApplicationStatusBadge from '@/components/RentalApplicationStatusBadge';
import { createPayment, getMyRentalApplications, type RentalApplication } from '@/lib/api';
import { payWithMidtransSnap } from '@/lib/midtrans';

const fallbackImageUrl = 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=700';

function formatDate(value?: string | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value));
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

export default function Page() {
  const [applications, setApplications] = useState<RentalApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [payingApplicationId, setPayingApplicationId] = useState<number | null>(null);

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
    try {
      setPayingApplicationId(application.id);
      setMessage('');
      setError('');

      const payment = await createPayment(application.id);
      await payWithMidtransSnap(payment.snap_token, {
        onSuccess: () => {
          setMessage('Pembayaran berhasil. Data pengajuan diperbarui.');
          void refreshApplications();
        },
        onPending: () => {
          setMessage('Pembayaran sedang diproses.');
          void refreshApplications();
        },
        onError: () => {
          setMessage('Pembayaran gagal diproses.');
          void refreshApplications();
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
    <main style={{ minHeight: '100vh', background: '#f9f9ff', padding: '32px 24px 72px', color: '#111c2d', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <h1 style={{ margin: 0, fontFamily: 'Manrope, sans-serif', fontSize: 'clamp(28px, 4vw, 36px)' }}>Pengajuan Sewa</h1>
        <p style={{ margin: '8px 0 28px', color: '#3d4a3d' }}>Pantau status pengajuan sewa yang sudah Anda kirim.</p>

        {message && (
          <p style={{ color: '#166534', background: '#dcfce7', padding: 16, borderRadius: 10, fontWeight: 700 }}>{message}</p>
        )}

        {isLoading ? (
          <p style={{ color: '#3d4a3d', fontWeight: 700 }}>Memuat pengajuan...</p>
        ) : error ? (
          <p style={{ color: '#93000a', background: '#ffdad6', padding: 16, borderRadius: 10, fontWeight: 700 }}>{error}</p>
        ) : applications.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 12, padding: 28, color: '#3d4a3d', boxShadow: '0 12px 36px rgba(17,28,45,0.05)' }}>
            Belum ada pengajuan sewa.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {applications.map((application) => {
              const room = application.room;
              const canPay = isAwaitingPayment(application);

              return (
                <div
                  key={application.id}
                  style={{ display: 'grid', gridTemplateColumns: '96px minmax(0, 1fr) auto', gap: 16, alignItems: 'center', background: '#fff', borderRadius: 12, padding: 14, textDecoration: 'none', color: 'inherit', boxShadow: '0 12px 36px rgba(17,28,45,0.05)' }}
                >
                  <Link href={`/tenant/rental-applications/${application.id}`} style={{ display: 'contents', textDecoration: 'none', color: 'inherit' }}>
                    <img src={room?.thumbnail || room?.image_url || fallbackImageUrl} alt={room?.room_name || 'Kamar'} style={{ width: 96, height: 72, objectFit: 'cover', borderRadius: 8 }} />
                    <div style={{ minWidth: 0 }}>
                      <h2 style={{ margin: 0, fontFamily: 'Manrope, sans-serif', fontSize: 18 }}>{room?.room_name || 'Kamar tidak tersedia'}</h2>
                      <p style={{ margin: '4px 0', color: '#3d4a3d' }}>{room?.branch?.branch_name || 'Cabang belum diatur'}</p>
                      <p style={{ margin: 0, color: '#3d4a3d', fontSize: 13 }}>
                        {application.duration} - Diajukan {formatDate(application.created_at)}
                      </p>
                      <p style={{ margin: '6px 0 0', color: '#006e2f', fontSize: 13, fontWeight: 800 }}>
                        {paymentStatusLabel(application)}
                      </p>
                    </div>
                  </Link>
                  <div style={{ display: 'grid', gap: 8, justifyItems: 'end' }}>
                    <RentalApplicationStatusBadge status={application.status} />
                    {canPay && (
                      <button
                        type="button"
                        disabled={payingApplicationId === application.id}
                        onClick={() => void handlePayment(application)}
                        style={{ border: 'none', background: '#006e2f', color: '#fff', borderRadius: 8, padding: '9px 12px', fontWeight: 800, cursor: payingApplicationId === application.id ? 'not-allowed' : 'pointer', opacity: payingApplicationId === application.id ? 0.7 : 1 }}
                      >
                        {payingApplicationId === application.id ? 'Memproses...' : 'Bayar Sekarang'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
