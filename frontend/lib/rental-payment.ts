export const RENTAL_DURATION_DISCOUNTS: Record<number, number> = {
  1: 0,
  3: 100000,
  6: 200000,
  12: 300000,
};

type BreakdownInput = {
  monthlyPrice?: number | null;
  duration?: string | null;
  subtotalAmount?: number | null;
  discountAmount?: number | null;
  grossAmount?: number | null;
};

export type RentalPaymentBreakdown = {
  monthlyPrice: number;
  durationMonths: number;
  subtotalAmount: number;
  discountAmount: number;
  grossAmount: number;
};

function toNonNegativeAmount(value?: number | null): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }

  return Math.max(0, Math.round(value));
}

export function getDurationInMonths(duration?: string | null): number {
  const matches = duration?.match(/\d+/);
  const months = Number(matches?.[0] ?? 1);

  return Number.isFinite(months) ? Math.max(1, months) : 1;
}

export function getRentalDiscountAmount(durationMonths: number): number {
  return Math.max(0, RENTAL_DURATION_DISCOUNTS[durationMonths] ?? 0);
}

export function getRentalPaymentBreakdown(input: BreakdownInput): RentalPaymentBreakdown {
  const durationMonths = getDurationInMonths(input.duration);
  const monthlyPrice = toNonNegativeAmount(input.monthlyPrice) ?? 0;
  const fallbackSubtotal = monthlyPrice * durationMonths;
  const subtotalAmount = toNonNegativeAmount(input.subtotalAmount) ?? fallbackSubtotal;
  const fallbackDiscount = Math.min(subtotalAmount, getRentalDiscountAmount(durationMonths));
  const discountAmount = Math.min(subtotalAmount, toNonNegativeAmount(input.discountAmount) ?? fallbackDiscount);
  const grossAmount = toNonNegativeAmount(input.grossAmount) ?? Math.max(0, subtotalAmount - discountAmount);

  return {
    monthlyPrice,
    durationMonths,
    subtotalAmount,
    discountAmount,
    grossAmount,
  };
}
