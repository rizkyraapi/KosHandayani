'use client';

import { useState } from 'react';
import { createRentalApplication, type ApiRoom } from '@/lib/api';
import { getAuthErrorMessage } from '@/lib/auth';
import { useLanguage } from '@/contexts/LanguageContext';
import { getRentalPaymentBreakdown } from '@/lib/rental-payment';

type FieldErrors = Record<string, string[]>;

type Props = {
  room: ApiRoom;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const durations = ['1 Bulan', '3 Bulan', '6 Bulan', '12 Bulan'];

function formatRupiah(price?: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price ?? 0);
}

function collectErrors(error: unknown): FieldErrors {
  const response = typeof error === 'object' && error !== null && 'response' in error
    ? (error as { response?: { data?: { errors?: FieldErrors; data?: { errors?: FieldErrors } } } }).response
    : undefined;

  return response?.data?.errors ?? response?.data?.data?.errors ?? {};
}

export default function RentalApplicationForm({ room, onSuccess, onCancel }: Props) {
  const { t } = useLanguage();
  const [moveInDate, setMoveInDate] = useState('');
  const [duration, setDuration] = useState(durations[0]);
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [kkFile, setKkFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid #bccbb9',
    borderRadius: 8,
    padding: '11px 12px',
    color: '#111c2d',
    background: '#f9f9ff',
    fontFamily: 'inherit',
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!ktpFile || !kkFile) {
      setErrors({
        ...(!ktpFile ? { ktp_file: ['File KTP wajib diunggah.'] } : {}),
        ...(!kkFile ? { kk_file: ['File KK wajib diunggah.'] } : {}),
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setErrors({});
      setMessage('');
      await createRentalApplication({
        room_id: room.id,
        move_in_date: moveInDate,
        duration,
        ktp_file: ktpFile,
        kk_file: kkFile,
      });
      setMessage(t('messages.applicationSubmitted'));
      onSuccess?.();
    } catch (submitError) {
      setErrors(collectErrors(submitError));
      setMessage(getAuthErrorMessage(submitError, t('messages.applicationSubmitFailed')));
    } finally {
      setIsSubmitting(false);
    }
  }

  const firstError = (field: string) => errors[field]?.[0];
  const paymentBreakdown = getRentalPaymentBreakdown({
    monthlyPrice: room.price,
    duration,
  });
  const discountLabel = paymentBreakdown.discountAmount > 0
    ? `-${formatRupiah(paymentBreakdown.discountAmount)}`
    : formatRupiah(0);

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 18 }}>
      <div style={{ border: '1px solid #e7eeff', borderRadius: 10, padding: 14, background: '#f9f9ff' }}>
        <p style={{ margin: '0 0 4px', color: '#3d4a3d', fontSize: 13, fontWeight: 700 }}>Kamar yang diajukan</p>
        <h3 style={{ margin: 0, color: '#111c2d', fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontSize: 20 }}>{room.room_name}</h3>
        <p style={{ margin: '6px 0 0', color: '#006e2f', fontWeight: 700 }}>
          {room.branch?.branch_name || 'Cabang belum diatur'} - {formatRupiah(room.price)} / bulan
        </p>
      </div>

      {message && (
        <p style={{ margin: 0, padding: 12, borderRadius: 8, background: Object.keys(errors).length ? '#ffdad6' : '#dcfce7', color: Object.keys(errors).length ? '#93000a' : '#166534', fontWeight: 700 }}>
          {message}
        </p>
      )}

      <label style={{ display: 'grid', gap: 7, color: '#3d4a3d', fontWeight: 700, fontSize: 14 }}>
        Tanggal Masuk
        <input
          type="date"
          value={moveInDate}
          disabled={isSubmitting}
          onChange={(event) => setMoveInDate(event.currentTarget.value)}
          style={inputStyle}
        />
        {firstError('move_in_date') && <span style={{ color: '#ba1a1a', fontSize: 12 }}>{firstError('move_in_date')}</span>}
      </label>

      <label style={{ display: 'grid', gap: 7, color: '#3d4a3d', fontWeight: 700, fontSize: 14 }}>
        Durasi Sewa
        <select
          value={duration}
          disabled={isSubmitting}
          onChange={(event) => setDuration(event.currentTarget.value)}
          style={inputStyle}
        >
          {durations.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        {firstError('duration') && <span style={{ color: '#ba1a1a', fontSize: 12 }}>{firstError('duration')}</span>}
      </label>

      <div style={{ border: '1px solid #d8e3fb', borderRadius: 12, background: '#f0f3ff', padding: 16, display: 'grid', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <p style={{ margin: 0, color: '#111c2d', fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontSize: 16, fontWeight: 800 }}>
            {t('tenant.detail.paymentSummary')}
          </p>
          <span style={{ color: '#006e2f', fontSize: 12, fontWeight: 800, background: '#dcfce7', borderRadius: 999, padding: '5px 10px' }}>
            {t('tenant.detail.total')}: {formatRupiah(paymentBreakdown.grossAmount)}
          </span>
        </div>
        {[
          { label: t('tenant.detail.monthlyPrice'), value: formatRupiah(paymentBreakdown.monthlyPrice), tone: '#111c2d' },
          { label: t('tenant.detail.duration'), value: t('tenant.detail.months', { count: paymentBreakdown.durationMonths }), tone: '#111c2d' },
          { label: t('tenant.detail.subtotal'), value: formatRupiah(paymentBreakdown.subtotalAmount), tone: '#111c2d' },
          { label: t('tenant.detail.discount'), value: discountLabel, tone: paymentBreakdown.discountAmount > 0 ? '#006e2f' : '#3d4a3d' },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, color: '#3d4a3d', fontSize: 13 }}>
            <span>{item.label}</span>
            <strong style={{ color: item.tone }}>{item.value}</strong>
          </div>
        ))}
      </div>

      <label style={{ display: 'grid', gap: 7, color: '#3d4a3d', fontWeight: 700, fontSize: 14 }}>
        Upload KTP
        <input
          type="file"
          accept="image/*,application/pdf"
          disabled={isSubmitting}
          onChange={(event) => setKtpFile(event.currentTarget.files?.[0] ?? null)}
          style={inputStyle}
        />
        {firstError('ktp_file') && <span style={{ color: '#ba1a1a', fontSize: 12 }}>{firstError('ktp_file')}</span>}
      </label>

      <label style={{ display: 'grid', gap: 7, color: '#3d4a3d', fontWeight: 700, fontSize: 14 }}>
        Upload KK
        <input
          type="file"
          accept="image/*,application/pdf"
          disabled={isSubmitting}
          onChange={(event) => setKkFile(event.currentTarget.files?.[0] ?? null)}
          style={inputStyle}
        />
        {firstError('kk_file') && <span style={{ color: '#ba1a1a', fontSize: 12 }}>{firstError('kk_file')}</span>}
      </label>

      {firstError('profile') && <p style={{ margin: 0, color: '#ba1a1a', fontWeight: 700 }}>{firstError('profile')}</p>}
      {firstError('room_id') && <p style={{ margin: 0, color: '#ba1a1a', fontWeight: 700 }}>{firstError('room_id')}</p>}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            style={{ border: 'none', background: '#e7eeff', color: '#3d4a3d', borderRadius: 8, padding: '12px 18px', fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{ border: 'none', background: 'linear-gradient(135deg, #006e2f, #22c55e)', color: '#fff', borderRadius: 8, padding: '12px 22px', fontWeight: 800, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
        >
          {isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan'}
        </button>
      </div>
    </form>
  );
}
