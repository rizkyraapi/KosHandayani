'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import RentalApplicationStatusBadge from '@/components/RentalApplicationStatusBadge';
import { getOwnerRentalApplications, type RentalApplication } from '@/lib/api';

function formatDate(value?: string | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value));
}

export default function Page() {
  const pathname = usePathname();
  const [applications, setApplications] = useState<RentalApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadApplications() {
      try {
        setIsLoading(true);
        setError('');
        const data = await getOwnerRentalApplications();
        if (isMounted) setApplications(data);
      } catch (loadError) {
        if (isMounted) setError(loadError instanceof Error ? loadError.message : 'Gagal memuat data pengajuan.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadApplications();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredApplications = useMemo(() => {
    const keyword = search.toLowerCase();
    return applications.filter((application) => {
      const tenantName = application.tenant?.full_name?.toLowerCase() ?? '';
      const roomName = application.room?.room_name?.toLowerCase() ?? '';
      return tenantName.includes(keyword) || roomName.includes(keyword);
    });
  }, [applications, search]);
  const detailBasePath = pathname.startsWith('/owner/rental-applications')
    ? '/owner/rental-applications'
    : '/owner/tenants';

  return (
    <main style={{ minHeight: '100vh', background: '#f9f9ff', padding: 32, color: '#111c2d', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 28 }}>
        <div>
          <p style={{ margin: '0 0 8px', color: '#006e2f', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Manajemen Properti
          </p>
          <h1 style={{ margin: 0, fontFamily: 'Manrope, sans-serif', fontSize: 'clamp(28px, 4vw, 36px)' }}>Pengajuan Sewa</h1>
          <p style={{ margin: '6px 0 0', color: '#3d4a3d' }}>Kelola pengajuan sewa tenant dari seluruh kamar.</p>
        </div>
        <input
          type="text"
          placeholder="Cari tenant atau kamar..."
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          style={{ width: 280, maxWidth: '100%', border: 'none', borderRadius: 12, background: '#f0f3ff', padding: '12px 14px', color: '#111c2d', outline: 'none' }}
        />
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 24 }}>
        <Stat label="Total Pengajuan" value={applications.length} />
        <Stat label="Pending" value={applications.filter((item) => item.status === 'pending').length} />
        <Stat label="Disetujui" value={applications.filter((item) => item.status === 'approved').length} />
        <Stat label="Ditolak" value={applications.filter((item) => item.status === 'rejected').length} />
      </section>

      <section style={{ background: '#fff', borderRadius: 12, boxShadow: '0 12px 36px rgba(17,28,45,0.05)', overflow: 'hidden' }}>
        {isLoading ? (
          <p style={{ padding: 24, color: '#3d4a3d', fontWeight: 700 }}>Memuat pengajuan...</p>
        ) : error ? (
          <p style={{ margin: 24, color: '#93000a', background: '#ffdad6', padding: 16, borderRadius: 10, fontWeight: 700 }}>{error}</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f0f3ff', height: 54 }}>
                  {['Tenant', 'Kamar', 'Cabang', 'Tanggal Masuk', 'Durasi', 'Status', 'Aksi'].map((heading) => (
                    <th key={heading} style={{ padding: '0 18px', color: '#3d4a3d', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 28, textAlign: 'center', color: '#3d4a3d' }}>Tidak ada pengajuan ditemukan.</td>
                  </tr>
                ) : filteredApplications.map((application) => (
                  <tr key={application.id} style={{ borderTop: '1px solid #f0f3ff' }}>
                    <td style={{ padding: 18, fontWeight: 800 }}>{application.tenant?.full_name || '-'}</td>
                    <td style={{ padding: 18 }}>{application.room?.room_name || '-'}</td>
                    <td style={{ padding: 18 }}>{application.room?.branch?.branch_name || '-'}</td>
                    <td style={{ padding: 18 }}>{formatDate(application.move_in_date)}</td>
                    <td style={{ padding: 18 }}>{application.duration}</td>
                    <td style={{ padding: 18 }}><RentalApplicationStatusBadge status={application.status} /></td>
                    <td style={{ padding: 18 }}>
                      <Link href={`${detailBasePath}/${application.id}`} style={{ color: '#006e2f', fontWeight: 800, textDecoration: 'none' }}>
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
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
