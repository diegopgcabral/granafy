export type MonthlyTotals = {
  incomeCents: bigint;
  plannedExpenseCents: bigint;
  paidExpenseCents: bigint;
};

export type MonthlySummary = MonthlyTotals & {
  balanceCents: bigint;
  pendingExpenseCents: bigint;
};

export function calculateMonthlySummary({
  incomeCents,
  plannedExpenseCents,
  paidExpenseCents,
}: MonthlyTotals): MonthlySummary {
  return {
    incomeCents,
    plannedExpenseCents,
    paidExpenseCents,
    balanceCents: incomeCents - paidExpenseCents,
    pendingExpenseCents: plannedExpenseCents - paidExpenseCents,
  };
}
