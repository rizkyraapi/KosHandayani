'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getOwnerTenants, type OwnerTenantOccupancy } from '@/lib/api';

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

function paymentStatusLabel(status?: string | null) {
  const labels: Record<string, string> = {
    paid: 'Lunas',
    unpaid: 'Belum Bayar',
    pending: 'Menunggu',
    failed: 'Gagal',
  };

  return labels[status ?? ''] ?? '-';
}

function paymentStatusStyle(status?: string | null) {
  if (status === 'paid') {
    return { bg: '#afefb4', color: '#346e40' };
  }

  if (status === 'failed') {
    return { bg: '#ffdad6', color: '#ba1a1a' };
  }

  return { bg: '#dee8ff', color: '#3d4a3d' };
}

export default function Page() {
  const [occupancies, setOccupancies] = useState<OwnerTenantOccupancy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadTenants() {
      try {
        setIsLoading(true);
        setError('');
        const data = await getOwnerTenants();
        if (isMounted) setOccupancies(data);
      } catch (loadError) {
        if (isMounted) setError(loadError instanceof Error ? loadError.message : 'Gagal memuat data penyewa aktif.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadTenants();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredOccupancies = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return occupancies.filter((occupancy) => {
      const searchable = [
        occupancy.tenant?.full_name,
        occupancy.tenant?.email,
        occupancy.room?.room_name,
        occupancy.room?.branch?.branch_name,
        occupancy.payment?.order_id,
      ].filter(Boolean).join(' ').toLowerCase();

      return !keyword || searchable.includes(keyword);
    });
  }, [occupancies, search]);

  const paidCount = occupancies.filter((item) => item.payment_status === 'paid').length;
  const failedCount = occupancies.filter((item) => item.payment_status === 'failed').length;
  const totalRevenue = occupancies.reduce((total, item) => {
    if (item.payment_status !== 'paid') return total;
    return total + (item.payment?.gross_amount ?? 0);
  }, 0);

  return (
    <main style={{ minHeight: '100vh', background: '#f9f9ff', padding: 32, color: '#111c2d', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 28 }}>
        <div>
          <p style={{ margin: '0 0 8px', color: '#006e2f', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Manajemen Properti
          </p>
          <h1 style={{ margin: 0, fontFamily: 'Manrope, sans-serif', fontSize: 'clamp(28px, 4vw, 36px)' }}>Kelola Penyewa</h1>
          <p style={{ margin: '6px 0 0', color: '#3d4a3d' }}>Pantau penyewa aktif berdasarkan data okupansi kamar.</p>
        </div>
        <input
          type="text"
          placeholder="Cari tenant, kamar, atau order..."
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          style={{ width: 280, maxWidth: '100%', border: 'none', borderRadius: 12, background: '#f0f3ff', padding: '12px 14px', color: '#111c2d', outline: 'none' }}
        />
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 24 }}>
        <Stat label="Penyewa Aktif" value={occupancies.length} />
        <Stat label="Pembayaran Lunas" value={paidCount} />
        <Stat label="Pembayaran Gagal" value={failedCount} />
        <Stat label="Pendapatan Lunas" value={formatRupiah(totalRevenue)} />
      </section>

      <section style={{ background: '#fff', borderRadius: 12, boxShadow: '0 12px 36px rgba(17,28,45,0.05)', overflow: 'hidden' }}>
        {isLoading ? (
          <p style={{ padding: 24, color: '#3d4a3d', fontWeight: 700 }}>Memuat penyewa aktif...</p>
        ) : error ? (
          <p style={{ margin: 24, color: '#93000a', background: '#ffdad6', padding: 16, borderRadius: 10, fontWeight: 700 }}>{error}</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 860 }}>
              <thead>
                <tr style={{ background: '#f0f3ff', height: 54 }}>
                  {['Tenant', 'Kamar', 'Cabang', 'Mulai Sewa', 'Akhir Sewa', 'Status Bayar', 'Aksi'].map((heading) => (
                    <th key={heading} style={{ padding: '0 18px', color: '#3d4a3d', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOccupancies.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 28, textAlign: 'center', color: '#3d4a3d' }}>Tidak ada penyewa aktif ditemukan.</td>
                  </tr>
                ) : filteredOccupancies.map((occupancy) => {
                  const statusStyle = paymentStatusStyle(occupancy.payment_status);

                  return (
                    <tr key={occupancy.id} style={{ borderTop: '1px solid #f0f3ff' }}>
                      <td style={{ padding: 18 }}>
                        <p style={{ margin: 0, fontWeight: 800 }}>{occupancy.tenant?.full_name || '-'}</p>
                        <p style={{ margin: '3px 0 0', color: '#3d4a3d', fontSize: 12 }}>{occupancy.tenant?.email || '-'}</p>
                      </td>
                      <td style={{ padding: 18 }}>{occupancy.room?.room_name || '-'}</td>
                      <td style={{ padding: 18 }}>{occupancy.room?.branch?.branch_name || '-'}</td>
                      <td style={{ padding: 18 }}>{formatDate(occupancy.start_date)}</td>
                      <td style={{ padding: 18 }}>{formatDate(occupancy.end_date)}</td>
                      <td style={{ padding: 18 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 999, background: statusStyle.bg, color: statusStyle.color, padding: '5px 10px', fontSize: 12, fontWeight: 800 }}>
                          {paymentStatusLabel(occupancy.payment_status)}
                        </span>
                        {occupancy.payment && (
                          <p style={{ margin: '6px 0 0', color: '#006e2f', fontSize: 12, fontWeight: 800 }}>
                            {formatRupiah(occupancy.payment.gross_amount)}
                          </p>
                        )}
                      </td>
                      <td style={{ padding: 18 }}>
                        <Link href={`/owner/rental-applications/${occupancy.rental_application_id}`} style={{ color: '#006e2f', fontWeight: 800, textDecoration: 'none' }}>
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

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 12px 36px rgba(17,28,45,0.05)' }}>
      <p style={{ margin: 0, color: '#3d4a3d', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>{label}</p>
      <p style={{ margin: '8px 0 0', color: '#111c2d', fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 900 }}>{value}</p>
    </div>
  );
}
