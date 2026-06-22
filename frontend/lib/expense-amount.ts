export function parseExpenseAmount(value: string | number | null | undefined): number {
  const digits = String(value ?? '').replace(/\D/g, '');

  if (!digits) return 0;

  const amount = Number.parseInt(digits, 10);

  return Number.isSafeInteger(amount) && amount > 0 ? amount : 0;
}

export function formatExpenseAmountInput(value: string | number | null | undefined): string {
  const amount = parseExpenseAmount(value);

  return amount > 0 ? new Intl.NumberFormat('id-ID').format(amount) : '';
}
