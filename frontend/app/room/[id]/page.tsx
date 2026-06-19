'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import RentalApplicationForm from '@/components/RentalApplicationForm';
import RoomCard from '@/components/RoomCard';
import { useAuth } from '@/contexts/AuthContext';
import { getRoomById, getRooms, type ApiRoom } from '@/lib/api';

const fallbackImageUrl = 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=1200';

function formatRupiah(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);
}

function getFacilityIcon(facilityName: string) {
  const normalized = facilityName.toLowerCase();

  if (normalized.includes('wi')) return 'wifi';
  if (normalized.includes('ac')) return 'ac_unit';
  if (normalized.includes('mandi')) return 'bathroom';
  if (normalized.includes('laundry')) return 'local_laundry_service';
  if (normalized.includes('heater')) return 'hot_tub';
  if (normalized.includes('meja')) return 'desk';
  if (normalized.includes('lemari')) return 'checkroom';

  return 'check_circle';
}

function statusLabel(status: ApiRoom['room_status']) {
  return {
    available: 'Available',
    occupied: 'Occupied',
    maintenance: 'Maintenance',
  }[status];
}

export default function Page() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [room, setRoom] = useState<ApiRoom | null>(null);
  const [relatedRooms, setRelatedRooms] = useState<ApiRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);
  const [profileWarning, setProfileWarning] = useState('');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadRoom() {
      try {
        setIsLoading(true);
        setError('');

        const detail = await getRoomById(params.id);
        const related = detail.branch_id
          ? await getRooms({ branch_id: detail.branch_id, exclude_id: detail.id, limit: 3 })
          : [];

        if (isMounted) {
          setRoom(detail);
          setRelatedRooms(related);
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

    loadRoom();

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  const galleryImages = useMemo(() => {
    if (!room) return [];

    const urls = [
      ...room.images.map((image) => image.image_url),
      room.thumbnail,
    ].filter((url): url is string => Boolean(url));

    return Array.from(new Set(urls));
  }, [room]);
  const visibleGalleryImages = galleryImages.length > 0
    ? [...galleryImages.slice(0, 4), ...Array(Math.max(0, 4 - galleryImages.length)).fill(fallbackImageUrl)]
    : [fallbackImageUrl, fallbackImageUrl, fallbackImageUrl, fallbackImageUrl];
  const remainingGalleryCount = Math.max(0, galleryImages.length - 4);

  const handleApplyClick = async () => {
    if (!room) return;

    setIsCheckingProfile(true);
    setProfileWarning('');

    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'tenant') {
      setProfileWarning('Hanya tenant yang dapat mengajukan sewa.');
      setIsCheckingProfile(false);
      return;
    }

    if (!user.profile_completed) {
      router.push('/tenant/profil');
      return;
    }

    setIsApplyModalOpen(true);
    setIsCheckingProfile(false);
  };

  if (isLoading) {
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f9f9ff', color: '#3d4a3d', fontFamily: 'Inter, sans-serif' }}>
        Memuat detail kamar...
      </main>
    );
  }

  if (error || !room) {
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f9f9ff', color: '#ba1a1a', fontFamily: 'Inter, sans-serif', padding: 24, textAlign: 'center' }}>
        {error || 'Kamar tidak ditemukan.'}
      </main>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9ff', color: '#111c2d', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        .room-detail-gallery {
          display: grid;
          grid-template-columns: minmax(0, 2fr) minmax(260px, 1fr);
          grid-template-rows: repeat(3, minmax(0, 1fr));
          gap: 12px;
          min-height: 440px;
        }

        @media (max-width: 760px) {
          .room-detail-gallery {
            grid-template-columns: 1fr;
            grid-template-rows: auto;
            min-height: 0;
          }

          .room-detail-gallery-main {
            grid-row: auto !important;
            min-height: 240px !important;
          }
        }
      `}</style>
      <Navbar />

      <main style={{ maxWidth: 1120, margin: '0 auto', padding: '24px 24px 72px' }}>
        <section className="room-detail-gallery" style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 34 }}>
          <img className="room-detail-gallery-main" src={visibleGalleryImages[0]} alt={room.room_name} style={{ gridRow: '1 / 4', width: '100%', height: '100%', objectFit: 'cover', minHeight: 440 }} />
          <div style={{ position: 'relative', minHeight: 138 }}>
            <img src={visibleGalleryImages[1]} alt={`${room.room_name} 2`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          <div style={{ position: 'relative', minHeight: 138 }}>
            <img src={visibleGalleryImages[2]} alt={`${room.room_name} 3`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          <div style={{ position: 'relative', minHeight: 138 }}>
            <img src={visibleGalleryImages[3]} alt={`${room.room_name} 4`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            {remainingGalleryCount > 0 && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(17,28,45,0.58)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 22, fontWeight: 800 }}>
                +{remainingGalleryCount} more
              </div>
            )}
          </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.7fr) minmax(300px, 0.8fr)', gap: 32, alignItems: 'start' }}>
          <section style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
            <header>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                <span style={{ padding: '6px 10px', borderRadius: 999, background: '#dcfce7', color: '#166534', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{statusLabel(room.room_status)}</span>
                <span style={{ padding: '6px 10px', borderRadius: 999, background: '#f0f3ff', color: '#3d4a3d', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{room.gender_type}</span>
              </div>
              <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 'clamp(30px, 4vw, 44px)', lineHeight: 1.12, margin: 0, fontWeight: 800, letterSpacing: '-0.02em' }}>{room.room_name}</h1>
              <p style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#3d4a3d', fontWeight: 500, fontSize: 15, lineHeight: 1.6, marginTop: 12 }}>
                <span className="material-symbols-outlined" style={{ color: '#006e2f' }}>location_on</span>
                {room.branch?.branch_name || 'Cabang belum diatur'}{room.branch?.city ? `, ${room.branch.city}` : ''}
              </p>
            </header>

            <section style={{ background: '#fff', borderRadius: 12, padding: 24, borderLeft: '4px solid #006e2f', boxShadow: '0 12px 36px rgba(17,28,45,0.05)' }}>
              <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 21, fontWeight: 700, letterSpacing: '-0.01em', margin: '0 0 12px' }}>Deskripsi Kamar</h2>
              <p style={{ color: '#3d4a3d', fontSize: 15, fontWeight: 400, lineHeight: 1.8, margin: 0 }}>{room.description || 'Belum ada deskripsi untuk kamar ini.'}</p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 23, fontWeight: 700, letterSpacing: '-0.01em', margin: '0 0 16px' }}>Fasilitas</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
                {room.facilities.length > 0 ? room.facilities.map((facility) => (
                  <div key={facility.id} style={{ minHeight: 82, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#fff', borderRadius: 10, color: '#3d4a3d' }}>
                    <span className="material-symbols-outlined" style={{ color: '#006e2f', fontSize: 28 }}>{getFacilityIcon(facility.facility_name)}</span>
                    <span style={{ fontWeight: 600, textAlign: 'center', fontSize: 13, lineHeight: 1.4 }}>{facility.facility_name}</span>
                  </div>
                )) : (
                  <p style={{ color: '#3d4a3d', fontSize: 15, fontWeight: 400 }}>Belum ada fasilitas yang dicatat.</p>
                )}
              </div>
            </section>
          </section>

          <aside style={{ position: 'sticky', top: 94 }}>
            <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', borderTop: '8px solid #006e2f', boxShadow: '0 20px 44px rgba(17,28,45,0.1)' }}>
              <div style={{ padding: 24 }}>
                <p style={{ color: '#3d4a3d', fontSize: 13, fontWeight: 500, lineHeight: 1.5, margin: '0 0 6px' }}>Harga per bulan</p>
                <h2 style={{ fontFamily: 'Manrope, sans-serif', color: '#006e2f', fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>{formatRupiah(room.price)}</h2>
                <div style={{ display: 'grid', gap: 10, marginTop: 22 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: 12, background: '#f0f3ff', borderRadius: 8 }}>
                    <span style={{ color: '#3d4a3d', fontSize: 14, fontWeight: 400 }}>Maksimal tamu</span>
                    <strong style={{ color: '#111c2d', fontSize: 14, fontWeight: 700 }}>{room.max_guest}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: 12, background: '#f0f3ff', borderRadius: 8 }}>
                    <span style={{ color: '#3d4a3d', fontSize: 14, fontWeight: 400 }}>Status</span>
                    <strong style={{ color: '#111c2d', fontSize: 14, fontWeight: 700 }}>{statusLabel(room.room_status)}</strong>
                  </div>
                </div>
                {profileWarning && <p style={{ margin: '16px 0 0', padding: 12, borderRadius: 8, color: '#93000a', background: '#ffdad6', fontSize: 14, fontWeight: 600, lineHeight: 1.5 }}>{profileWarning}</p>}
                <button
                  type="button"
                  onClick={handleApplyClick}
                  disabled={isAuthLoading || isCheckingProfile || room.room_status !== 'available' || user?.role === 'owner'}
                  style={{ width: '100%', minHeight: 50, border: 0, borderRadius: 10, marginTop: 20, background: room.room_status === 'available' && user?.role !== 'owner' ? 'linear-gradient(135deg, #006e2f, #22c55e)' : '#bccbb9', color: '#fff', fontWeight: 700, fontSize: 15, cursor: room.room_status === 'available' && user?.role !== 'owner' ? 'pointer' : 'not-allowed' }}
                >
                  {isCheckingProfile || isAuthLoading
                    ? 'Memeriksa Profil...'
                    : room.room_status !== 'available'
                      ? 'Kamar Tidak Tersedia'
                      : user?.role === 'owner'
                        ? 'Khusus Tenant'
                        : 'Ajukan Sewa'}
                </button>
              </div>
            </div>
          </aside>
        </div>

        <section style={{ marginTop: 56 }}>
          <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 700, letterSpacing: '-0.01em', margin: '0 0 18px' }}>Kamar Lain di Cabang Ini</h2>
          {relatedRooms.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              {relatedRooms.map((related) => (
                <RoomCard
                  key={related.id}
                  id={related.id}
                  name={related.room_name}
                  location={related.branch?.branch_name || 'Cabang belum diatur'}
                  price={formatRupiah(related.price)}
                  imageUrl={related.thumbnail || fallbackImageUrl}
                  genderType={related.gender_type}
                  status={related.room_status}
                  amenities={related.facilities.slice(0, 3).map((facility) => ({
                    icon: getFacilityIcon(facility.facility_name),
                    label: facility.facility_name,
                  }))}
                />
              ))}
            </div>
          ) : (
            <p style={{ color: '#3d4a3d' }}>Belum ada kamar terkait di cabang ini.</p>
          )}
        </section>
      </main>

      {isApplyModalOpen && room && (
        <div
          role="dialog"
          aria-modal="true"
          style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(17,28,45,0.48)', display: 'grid', placeItems: 'center', padding: 20 }}
          onClick={() => setIsApplyModalOpen(false)}
        >
          <div
            style={{ width: 'min(620px, 100%)', maxHeight: '90vh', overflowY: 'auto', background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 24px 60px rgba(17,28,45,0.24)' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
              <div>
                <h2 style={{ margin: 0, fontFamily: 'Manrope, sans-serif', fontSize: 24 }}>Formulir Pengajuan Sewa</h2>
                <p style={{ margin: '6px 0 0', color: '#3d4a3d' }}>Lengkapi tanggal masuk, durasi, dan dokumen pendukung.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(false)}
                aria-label="Tutup formulir"
                style={{ border: 'none', background: '#f0f3ff', color: '#3d4a3d', borderRadius: 8, width: 36, height: 36, cursor: 'pointer', fontWeight: 800 }}
              >
                X
              </button>
            </div>
            <RentalApplicationForm
              room={room}
              onCancel={() => setIsApplyModalOpen(false)}
              onSuccess={() => {
                setIsApplyModalOpen(false);
                router.push('/tenant/rental-applications?created=1');
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
