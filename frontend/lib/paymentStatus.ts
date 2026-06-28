import type { Payment, RentalApplication } from './api';

export type PaymentStatusKey =
  | 'paid'
  | 'pending'
  | 'failed'
  | 'challenge'
  | 'unknown';

export type PaymentStatusTone = 'green' | 'amber' | 'red' | 'orange' | 'slate';

export type PaymentStatusMeta = {
  key: PaymentStatusKey;
  labelKey: string;
  label: string;
  tone: PaymentStatusTone;
  icon: string;
  isPaid: boolean;
  isPending: boolean;
  isFailed: boolean;
  isActiveBill: boolean;
};

const SUCCESS_STATUSES = new Set(['settlement', 'capture', 'paid', 'success']);
const FAILED_STATUSES = new Set(['expire', 'cancel', 'deny', 'failure', 'failed']);
const PENDING_STATUSES = new Set(['pending', 'unpaid']);
const CHALLENGE_STATUSES = new Set(['challenge']);

function normalizeRawStatus(value?: string | null) {
  return (value || '').trim().toLowerCase();
}

export function getPaymentStatusKey(
  transactionStatus?: string | null,
  applicationPaymentStatus?: string | null,
): PaymentStatusKey {
  const applicationStatus = normalizeRawStatus(applicationPaymentStatus);
  const transaction = normalizeRawStatus(transactionStatus);

  if (SUCCESS_STATUSES.has(applicationStatus) || SUCCESS_STATUSES.has(transaction)) {
    return 'paid';
  }

  if (FAILED_STATUSES.has(applicationStatus) || FAILED_STATUSES.has(transaction)) {
    return 'failed';
  }

  if (CHALLENGE_STATUSES.has(applicationStatus) || CHALLENGE_STATUSES.has(transaction)) {
    return 'challenge';
  }

  if (PENDING_STATUSES.has(applicationStatus) || PENDING_STATUSES.has(transaction) || !transaction) {
    return 'pending';
  }

  return 'unknown';
}

export function getPaymentStatusMeta(
  transactionStatus?: string | null,
  applicationPaymentStatus?: string | null,
): PaymentStatusMeta {
  const key = getPaymentStatusKey(transactionStatus, applicationPaymentStatus);
  return getPaymentStatusMetaFromKey(key);
}

export function getPaymentStatusMetaFromKey(key: PaymentStatusKey): PaymentStatusMeta {
  const metaByKey: Record<PaymentStatusKey, Omit<PaymentStatusMeta, 'key' | 'isPaid' | 'isPending' | 'isFailed' | 'isActiveBill'>> = {
    paid: {
      labelKey: 'status.paymentSuccessful',
      label: 'Lunas',
      tone: 'green',
      icon: 'check_circle',
    },
    pending: {
      labelKey: 'status.pendingPayment',
      label: 'Menunggu Pembayaran',
      tone: 'amber',
      icon: 'schedule',
    },
    failed: {
      labelKey: 'status.paymentFailed',
      label: 'Gagal',
      tone: 'red',
      icon: 'cancel',
    },
    challenge: {
      labelKey: 'status.paymentReview',
      label: 'Perlu Ditinjau',
      tone: 'orange',
      icon: 'rule',
    },
    unknown: {
      labelKey: 'status.pendingPayment',
      label: 'Menunggu Pembayaran',
      tone: 'slate',
      icon: 'help',
    },
  };

  return {
    key,
    ...metaByKey[key],
    isPaid: key === 'paid',
    isPending: key === 'pending' || key === 'challenge' || key === 'unknown',
    isFailed: key === 'failed',
    isActiveBill: key !== 'paid',
  };
}

export function getPaymentMetaFromPayment(payment?: Pick<Payment, 'transaction_status' | 'rental_application'> | null) {
  return getPaymentStatusMeta(
    payment?.transaction_status,
    payment?.rental_application?.payment_status,
  );
}

export function getPaymentMetaFromApplication(application?: Pick<RentalApplication, 'payment_status' | 'status'> | null) {
  if (!application) {
    return getPaymentStatusMeta('pending');
  }

  if (application.payment_status === 'paid') {
    return getPaymentStatusMeta('settlement', application.payment_status);
  }

  if (application.payment_status === 'failed' || application.status === 'rejected' || application.status === 'cancelled') {
    return getPaymentStatusMeta('failure', application.payment_status);
  }

  return getPaymentStatusMeta('pending', application.payment_status);
}
