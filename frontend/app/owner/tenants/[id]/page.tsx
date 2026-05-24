'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import RentalApplicationDetailView from '@/components/RentalApplicationDetailView';
import {
  getOwnerRentalApplication,
  updateOwnerRentalApplication,
  type RentalApplication,
  type RentalApplicationStatus,
} from '@/lib/api';
import { getAuthErrorMessage } from '@/lib/auth';

export default function Page() {
  const params = useParams<{ id: string }>();
  const [application, setApplication] = useState<RentalApplication | null>(null);
  const [ownerNotes, setOwnerNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadApplication = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await getOwnerRentalApplication(params.id);
      setApplication(data);
      setOwnerNotes(data.owner_notes ?? '');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Gagal memuat detail pengajuan.');
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    void Promise.resolve().then(loadApplication);
  }, [loadApplication]);

  async function decide(status: Exclude<RentalApplicationStatus, 'pending'>) {
    try {
      setIsSubmitting(true);
      setError('');
      setMessage('');
      const updated = await updateOwnerRentalApplication(params.id, {
        status,
        owner_notes: ownerNotes || undefined,
      });
      setApplication(updated);
      setOwnerNotes(updated.owner_notes ?? '');
      setMessage(status === 'approved' ? 'Pengajuan berhasil disetujui.' : 'Pengajuan berhasil ditolak.');
      await loadApplication();
    } catch (submitError) {
      setError(getAuthErrorMessage(submitError, 'Gagal memperbarui pengajuan.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f9f9ff', padding: 32, color: '#111c2d', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gap: 24 }}>
        {isLoading ? (
          <p style={{ color: '#3d4a3d', fontWeight: 700 }}>Memuat detail pengajuan...</p>
        ) : error && !application ? (
          <p style={{ color: '#93000a', background: '#ffdad6', padding: 16, borderRadius: 10, fontWeight: 700 }}>{error}</p>
        ) : application ? (
          <>
            <RentalApplicationDetailView application={application} />

            <section style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 12px 36px rgba(17,28,45,0.05)' }}>
              <h2 style={{ margin: '0 0 14px', fontFamily: 'Manrope, sans-serif', fontSize: 22 }}>Keputusan Owner</h2>
              {message && <p style={{ color: '#166534', background: '#dcfce7', padding: 12, borderRadius: 8, fontWeight: 700 }}>{message}</p>}
              {error && <p style={{ color: '#93000a', background: '#ffdad6', padding: 12, borderRadius: 8, fontWeight: 700 }}>{error}</p>}
              <textarea
                value={ownerNotes}
                onChange={(event) => setOwnerNotes(event.currentTarget.value)}
                placeholder="Catatan owner opsional..."
                rows={4}
                style={{ width: '100%', border: '1px solid #bccbb9', borderRadius: 10, padding: 12, resize: 'vertical', fontFamily: 'inherit', marginBottom: 14 }}
              />
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => void decide('approved')}
                  style={{ border: 'none', background: '#006e2f', color: '#fff', borderRadius: 8, padding: '12px 18px', fontWeight: 800, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                >
                  {isSubmitting ? 'Memproses...' : 'Approve'}
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => void decide('rejected')}
                  style={{ border: 'none', background: '#ba1a1a', color: '#fff', borderRadius: 8, padding: '12px 18px', fontWeight: 800, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                >
                  {isSubmitting ? 'Memproses...' : 'Reject'}
                </button>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
