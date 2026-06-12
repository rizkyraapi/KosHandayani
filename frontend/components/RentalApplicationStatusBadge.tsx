import type { RentalApplicationStatus } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';

const styles: Record<RentalApplicationStatus, { labelKey: string; bg: string; color: string; dot: string }> = {
  pending: { labelKey: 'status.pending', bg: '#fef3c7', color: '#b45309', dot: '#f59e0b' },
  approved: { labelKey: 'status.approved', bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
  rejected: { labelKey: 'status.rejected', bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444' },
};

export default function RentalApplicationStatusBadge({ status }: { status: RentalApplicationStatus }) {
  const { t } = useLanguage();
  const style = styles[status] ?? styles.pending;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 999,
        padding: '4px 10px',
        background: style.bg,
        color: style.color,
        fontSize: 12,
        fontWeight: 800,
        gap: 6,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 999, background: style.dot }} />
      {t(style.labelKey)}
    </span>
  );
}
