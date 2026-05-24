'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import RentalApplicationForm from '@/components/RentalApplicationForm';
import { useAuth } from '@/contexts/AuthContext';
import { getRoomById, type ApiRoom } from '@/lib/api';

const fallbackImageUrl = 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=900';

function formatRupiah(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);
}

export default function Page() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [room, setRoom] = useState<ApiRoom | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const roleError = !isAuthLoading && user && user.role !== 'tenant'
    ? 'Hanya tenant yang dapat membuat pengajuan sewa.'
    : '';

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (user.role !== 'tenant') {
      return;
    }

    if (!user.profile_completed) {
      router.replace('/tenant/profil');
      return;
    }

    let isMounted = true;

    async function loadRoom() {
      try {
        setIsLoading(true);
        setError('');
        const detail = await getRoomById(params.id);

        if (!detail.is_available || detail.room_status !== 'available') {
          setError('Kamar Tidak Tersedia');
        }

        if (isMounted) {
          setRoom(detail);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Gagal memuat detail kamar.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadRoom();

    return () => {
      isMounted = false;
    };
  }, [isAuthLoading, params.id, router, user]);

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9ff', color: '#111c2d', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />
      <main style={{ maxWidth: 1120, margin: '0 auto', padding: '48px 24px 72px' }}>
        <h1 style={{ margin: '0 0 10px', fontFamily: 'Manrope, sans-serif', fontSize: 'clamp(28px, 4vw, 38px)' }}>
          Formulir Pengajuan Sewa
        </h1>
        <p style={{ margin: '0 0 28px', color: '#3d4a3d' }}>
          Lengkapi data pengajuan dan dokumen pendukung untuk kamar pilihan Anda.
        </p>

        {isLoading || isAuthLoading ? (
          <p style={{ color: '#3d4a3d', fontWeight: 700 }}>Memuat formulir...</p>
        ) : (roleError || error) && !room ? (
          <p style={{ color: '#93000a', background: '#ffdad6', padding: 16, borderRadius: 10, fontWeight: 700 }}>{roleError || error}</p>
        ) : room ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 0.8fr) minmax(0, 1.2fr)', gap: 28, alignItems: 'start' }}>
            <aside style={{ background: '#fff', borderRadius: 12, padding: 18, boxShadow: '0 12px 36px rgba(17,28,45,0.05)' }}>
              <img
                src={room.thumbnail || fallbackImageUrl}
                alt={room.room_name}
                style={{ width: '100%', height: 210, objectFit: 'cover', borderRadius: 10, marginBottom: 16 }}
              />
              <h2 style={{ margin: 0, fontFamily: 'Manrope, sans-serif', fontSize: 24 }}>{room.room_name}</h2>
              <p style={{ margin: '8px 0 0', color: '#006e2f', fontWeight: 800 }}>{formatRupiah(room.price)} / bulan</p>
              <p style={{ margin: '8px 0 0', color: '#3d4a3d' }}>{room.branch?.branch_name || 'Cabang belum diatur'}</p>
              {error && <p style={{ margin: '16px 0 0', color: '#93000a', background: '#ffdad6', padding: 12, borderRadius: 8, fontWeight: 700 }}>{error}</p>}
            </aside>
            <section style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 12px 36px rgba(17,28,45,0.05)' }}>
              <RentalApplicationForm room={room} onSuccess={() => router.push('/tenant/rental-applications')} />
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
}
