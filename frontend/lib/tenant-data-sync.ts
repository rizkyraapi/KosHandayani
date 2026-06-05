import { getMyPayments, getMyRentalApplications, getProfile } from './api';

export async function syncTenantDataAfterPayment() {
  await Promise.allSettled([
    getMyRentalApplications(),
    getMyPayments(),
    getProfile(),
  ]);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('tenant-data-sync'));
  }
}
