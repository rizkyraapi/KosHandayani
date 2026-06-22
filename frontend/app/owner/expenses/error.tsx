'use client';

import { RefreshCw } from 'lucide-react';
import {
  EmptyPanel,
  OwnerButton,
  OwnerCard,
  OwnerPage,
  OwnerPageHeader,
} from '@/components/owner/OwnerUi';

export default function ExpensesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const message = error?.message || 'Terjadi kendala saat menampilkan halaman pengeluaran.';

  return (
    <OwnerPage>
      <OwnerPageHeader
        eyebrow="Expense Management"
        title="Pengeluaran"
        description="Halaman pengeluaran tetap aman dan dapat dimuat ulang tanpa memengaruhi data transaksi."
      />
      <OwnerCard>
        <EmptyPanel
          title="Halaman pengeluaran tidak dapat ditampilkan"
          description={message}
        />
        <div className="mt-4 flex justify-center">
          <OwnerButton onClick={reset}>
            <RefreshCw size={17} />
            Muat ulang halaman
          </OwnerButton>
        </div>
      </OwnerCard>
    </OwnerPage>
  );
}
