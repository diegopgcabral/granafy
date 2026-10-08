import { amountToCents, type ExpenseStatus } from "@/lib/financial/contracts";

export type ExpenseListItem = {
  id: string;
  description: string;
  referenceAmount: string | number;
  paidAmount: string | number;
  dueDate: string;
  paidAt: string | null;
  category: string;
  status: ExpenseStatus;
  notes: string | null;
};

function toCents(value: string | number) {
  return amountToCents(String(value));
}

export function calculateExpenseTotals(expenses: ExpenseListItem[]) {
  return expenses.reduce(
    (totals, expense) => ({
      plannedCents:
        totals.plannedCents +
        (expense.status === "CANCELLED"
          ? 0n
          : toCents(expense.referenceAmount)),
      paidCents: totals.paidCents + toCents(expense.paidAmount),
    }),
    { plannedCents: 0n, paidCents: 0n },
  );
}

export function formatExpenseStatus(status: ExpenseStatus) {
  return {
    PENDING: "Pendente",
    PARTIAL: "Parcial",
    PAID: "Paga",
    CANCELLED: "Cancelada",
  }[status];
}
