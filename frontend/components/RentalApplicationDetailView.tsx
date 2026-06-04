'use client';

import Link from 'next/link';
import RentalApplicationStatusBadge from '@/components/RentalApplicationStatusBadge';
import type { RentalApplication } from '@/lib/api';

const fallbackImageUrl = 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=900';

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

function DocumentPreview({ label, url }: { label: string; url?: string | null }) {
  if (!url) {
    return (
      <div style={{ border: '1px dashed #bccbb9', borderRadius: 10, padding: 18, color: '#3d4a3d', fontWeight: 700 }}>
        {label}: file tidak tersedia
      </div>
    );
  }

  const isPdf = url.toLowerCase().includes('.pdf');

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <strong style={{ color: '#3d4a3d' }}>{label}</strong>
      {isPdf ? (
        <Link href={url} target="_blank" style={{ color: '#006e2f', fontWeight: 800 }}>
          Buka PDF
        </Link>
      ) : (
        <img src={url} alt={label} style={{ width: '100%', maxHeight: 260, objectFit: 'cover', borderRadius: 10, background: '#dee8ff' }} />
      )}
    </div>
  );
}

export default function RentalApplicationDetailView({
  application,
  onPay,
  isPaying = false,
  paymentMessage = '',
}: {
  application: RentalApplication;
  onPay?: () => void;
  isPaying?: boolean;
  paymentMessage?: string;
}) {
  const room = application.room;
  const tenant = application.tenant;
  const facilities = room?.facilities ?? [];
  const images = room?.images ?? [];
  const canPay = isAwaitingPayment(application);

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'Manrope, sans-serif', fontSize: 'clamp(26px, 4vw, 36px)' }}>
            Pengajuan #{application.id}
          </h1>
          <p style={{ margin: '6px 0 0', color: '#3d4a3d' }}>{room?.room_name || 'Kamar tidak tersedia'}</p>
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
          <img src={room?.thumbnail || room?.image_url || fallbackImageUrl} alt={room?.room_name || 'Kamar'} style={{ width: '100%', height: 210, objectFit: 'cover', borderRadius: 10, marginBottom: 16 }} />
          <h2 style={{ margin: 0, fontFamily: 'Manrope, sans-serif', fontSize: 22 }}>Detail Kamar</h2>
          <p style={{ color: '#3d4a3d' }}>{room?.branch?.branch_name || 'Cabang belum diatur'}</p>
          <p style={{ color: '#3d4a3d' }}>Tanggal masuk: <strong>{formatDate(application.move_in_date)}</strong></p>
          <p style={{ color: '#3d4a3d' }}>Durasi: <strong>{application.duration}</strong></p>
          <p style={{ color: '#3d4a3d' }}>Status pembayaran: <strong>{paymentStatusLabel(application)}</strong></p>
          {canPay && onPay && (
            <button
              type="button"
              disabled={isPaying}
              onClick={onPay}
              style={{ border: 'none', background: '#006e2f', color: '#fff', borderRadius: 8, padding: '11px 16px', fontWeight: 800, cursor: isPaying ? 'not-allowed' : 'pointer', opacity: isPaying ? 0.7 : 1, marginTop: 6 }}
            >
              {isPaying ? 'Memproses...' : 'Bayar Sekarang'}
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
          <h2 style={{ margin: '0 0 14px', fontFamily: 'Manrope, sans-serif', fontSize: 22 }}>Data Tenant</h2>
          <p><strong>Nama:</strong> {tenant?.full_name || '-'}</p>
          <p><strong>Email:</strong> {tenant?.email || '-'}</p>
          <p><strong>WhatsApp:</strong> {tenant?.whatsapp || '-'}</p>
          <p><strong>Pekerjaan:</strong> {tenant?.pekerjaan || '-'}</p>
          <p><strong>Alamat:</strong> {tenant?.address || '-'}</p>
        </section>
      </div>

      {images.length > 0 && (
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {images.map((image) => (
            <img key={image.id} src={image.image_url} alt={room?.room_name || 'Kamar'} style={{ height: 130, width: '100%', objectFit: 'cover', borderRadius: 10 }} />
          ))}
        </section>
      )}

      <section style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 12px 36px rgba(17,28,45,0.05)' }}>
        <h2 style={{ margin: '0 0 16px', fontFamily: 'Manrope, sans-serif', fontSize: 22 }}>Dokumen</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
          <DocumentPreview label="KTP" url={application.ktp_file_url} />
          <DocumentPreview label="KK" url={application.kk_file_url} />
        </div>
      </section>

      <section style={{ background: '#f0f3ff', borderRadius: 12, padding: 20, color: '#3d4a3d' }}>
        <strong>Catatan Owner</strong>
        <p style={{ margin: '8px 0 0' }}>{application.owner_notes || 'Belum ada catatan.'}</p>
      </section>
    </div>
  );
}
