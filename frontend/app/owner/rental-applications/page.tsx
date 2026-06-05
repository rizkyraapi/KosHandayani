'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import RentalApplicationStatusBadge from '@/components/RentalApplicationStatusBadge';
import { getOwnerRentalApplications, type RentalApplication } from '@/lib/api';

function formatDate(value?: string | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value));
}

function paymentStatusLabel(application: RentalApplication) {
  if (application.payment_status === 'paid') return 'Telah Dibayar';
  if (application.payment_status === 'failed') return 'Pembayaran Gagal';
  if (application.status === 'approved') return 'Menunggu Pembayaran';

  return 'Belum Dibayar';
}

function paymentStatusStyle(application: RentalApplication) {
  if (application.payment_status === 'paid') {
    return { background: '#dcfce7', color: '#15803d' };
  }

  if (application.payment_status === 'failed') {
    return { background: '#fee2e2', color: '#b91c1c' };
  }

  return { background: '#fef3c7', color: '#b45309' };
}

export default function Page() {
  const [applications, setApplications] = useState<RentalApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const loadApplications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await getOwnerRentalApplications();
      setApplications(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Gagal memuat data pengajuan.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadApplications);
  }, [loadApplications]);

  useEffect(() => {
    function refreshOnFocus() {
      if (document.visibilityState === 'visible') {
        void loadApplications();
      }
    }

    window.addEventListener('focus', refreshOnFocus);
    document.addEventListener('visibilitychange', refreshOnFocus);

    return () => {
      window.removeEventListener('focus', refreshOnFocus);
      document.removeEventListener('visibilitychange', refreshOnFocus);
    };
  }, [loadApplications]);

  const filteredApplications = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return applications.filter((application) => {
      const searchable = [
        application.tenant?.full_name,
        application.tenant?.email,
        application.room?.room_name,
        application.room?.branch?.branch_name,
        application.duration,
        application.status,
      ].filter(Boolean).join(' ').toLowerCase();

      return !keyword || searchable.includes(keyword);
    });
  }, [applications, search]);

  const stats = useMemo(() => ({
    total: applications.length,
    pending: applications.filter((item) => item.status === 'pending').length,
    approved: applications.filter((item) => item.status === 'approved').length,
    rejected: applications.filter((item) => item.status === 'rejected').length,
  }), [applications]);

  return (
    <main style={{ minHeight: '100vh', background: '#f9f9ff', padding: 32, color: '#111c2d', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 28 }}>
        <div>
          <p style={{ margin: '0 0 8px', color: '#006e2f', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Manajemen Properti
          </p>
          <h1 style={{ margin: 0, fontFamily: 'Manrope, sans-serif', fontSize: 'clamp(28px, 4vw, 36px)' }}>Pengajuan Sewa</h1>
          <p style={{ margin: '6px 0 0', color: '#3d4a3d' }}>Kelola semua pengajuan sewa tenant dari seluruh kamar.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Cari tenant atau kamar..."
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            style={{ width: 280, maxWidth: '100%', border: 'none', borderRadius: 12, background: '#f0f3ff', padding: '12px 14px', color: '#111c2d', outline: 'none' }}
          />
          <button
            type="button"
            onClick={() => void loadApplications()}
            disabled={isLoading}
            style={{ border: 'none', borderRadius: 12, background: '#006e2f', color: '#fff', padding: '12px 16px', fontWeight: 800, cursor: isLoading ? 'wait' : 'pointer', opacity: isLoading ? 0.75 : 1 }}
          >
            Refresh
          </button>
        </div>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 24 }}>
        <Stat label="Total Pengajuan" value={stats.total} />
        <Stat label="Pending" value={stats.pending} />
        <Stat label="Disetujui" value={stats.approved} />
        <Stat label="Ditolak" value={stats.rejected} />
      </section>

      <section style={{ background: '#fff', borderRadius: 12, boxShadow: '0 12px 36px rgba(17,28,45,0.05)', overflow: 'hidden' }}>
        {isLoading ? (
          <p style={{ padding: 24, color: '#3d4a3d', fontWeight: 700 }}>Memuat pengajuan...</p>
        ) : error ? (
          <p style={{ margin: 24, color: '#93000a', background: '#ffdad6', padding: 16, borderRadius: 10, fontWeight: 700 }}>{error}</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 860 }}>
              <thead>
                <tr style={{ background: '#f0f3ff', height: 54 }}>
                  {['Tenant', 'Kamar', 'Cabang', 'Tanggal Masuk', 'Durasi', 'Status Pengajuan', 'Pembayaran', 'Aksi'].map((heading) => (
                    <th key={heading} style={{ padding: '0 18px', color: '#3d4a3d', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: 28, textAlign: 'center', color: '#3d4a3d' }}>Tidak ada pengajuan ditemukan.</td>
                  </tr>
                ) : filteredApplications.map((application) => {
                  const paymentStyle = paymentStatusStyle(application);

                  return (
                    <tr key={application.id} style={{ borderTop: '1px solid #f0f3ff' }}>
                      <td style={{ padding: 18 }}>
                        <p style={{ margin: 0, fontWeight: 800 }}>{application.tenant?.full_name || '-'}</p>
                        <p style={{ margin: '3px 0 0', color: '#3d4a3d', fontSize: 12 }}>{application.tenant?.email || '-'}</p>
                      </td>
                      <td style={{ padding: 18 }}>{application.room?.room_name || '-'}</td>
                      <td style={{ padding: 18 }}>{application.room?.branch?.branch_name || '-'}</td>
                      <td style={{ padding: 18 }}>{formatDate(application.move_in_date)}</td>
                      <td style={{ padding: 18 }}>{application.duration}</td>
                      <td style={{ padding: 18 }}><RentalApplicationStatusBadge status={application.status} /></td>
                      <td style={{ padding: 18 }}>
                        <span style={{ display: 'inline-flex', borderRadius: 999, background: paymentStyle.background, color: paymentStyle.color, padding: '4px 10px', fontSize: 12, fontWeight: 800 }}>
                          {paymentStatusLabel(application)}
                        </span>
                      </td>
                      <td style={{ padding: 18 }}>
                        <Link href={`/owner/rental-applications/${application.id}`} style={{ color: '#006e2f', fontWeight: 800, textDecoration: 'none' }}>
                          Detail
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 12px 36px rgba(17,28,45,0.05)' }}>
      <p style={{ margin: 0, color: '#3d4a3d', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>{label}</p>
      <p style={{ margin: '8px 0 0', color: '#111c2d', fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 900 }}>{value}</p>
    </div>
  );
}
