import type { RentalApplicationStatus } from '@/lib/api';

const styles: Record<RentalApplicationStatus, { label: string; bg: string; color: string }> = {
  pending: { label: 'Pending', bg: '#fef3c7', color: '#b45309' },
  approved: { label: 'Approved', bg: '#dcfce7', color: '#15803d' },
  rejected: { label: 'Rejected', bg: '#fee2e2', color: '#b91c1c' },
};

export default function RentalApplicationStatusBadge({ status }: { status: RentalApplicationStatus }) {
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
        textTransform: 'capitalize',
      }}
    >
      {style.label}
    </span>
  );
}
