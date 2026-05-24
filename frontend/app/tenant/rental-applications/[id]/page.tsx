'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import RentalApplicationDetailView from '@/components/RentalApplicationDetailView';
import { getMyRentalApplication, type RentalApplication } from '@/lib/api';

export default function Page() {
  const params = useParams<{ id: string }>();
  const [application, setApplication] = useState<RentalApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <main style={{ minHeight: '100vh', background: '#f9f9ff', padding: '32px 24px 72px', color: '#111c2d', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        {isLoading ? (
          <p style={{ color: '#3d4a3d', fontWeight: 700 }}>Memuat detail pengajuan...</p>
        ) : error ? (
          <p style={{ color: '#93000a', background: '#ffdad6', padding: 16, borderRadius: 10, fontWeight: 700 }}>{error}</p>
        ) : application ? (
          <RentalApplicationDetailView application={application} />
        ) : null}
      </div>
    </main>
  );
}
