import assert from "node:assert/strict";
import test from "node:test";

import {
  createExpenseSchema,
  createIncomeSchema,
} from "@/lib/financial/contracts";
import { calculateMonthlySummary } from "@/lib/financial/monthly-summary";

test("accepts a valid income with a precise decimal amount", () => {
  const result = createIncomeSchema.safeParse({
    description: "Salário",
    amount: "20000.50",
    receivedOn: "2026-10-05",
    category: "Salário",
  });

  assert.equal(result.success, true);
});

test("rejects an income with a zero amount", () => {
  const result = createIncomeSchema.safeParse({
    description: "Salário",
    amount: "0",
    receivedOn: "2026-10-05",
    category: "Salário",
  });

  assert.equal(result.success, false);
});

test("rejects an expense payment larger than its reference amount", () => {
  const result = createExpenseSchema.safeParse({
    description: "Condomínio",
    referenceAmount: "850.00",
    paidAmount: "900.00",
    paidAt: "2026-10-10",
    dueDate: "2026-10-10",
    category: "Moradia",
    status: "PAID",
  });

  assert.equal(result.success, false);
});

test("requires a consistent partial payment", () => {
  const validResult = createExpenseSchema.safeParse({
    description: "Cartão",
    referenceAmount: "4200.00",
    paidAmount: "2100.00",
    paidAt: "2026-10-08",
    dueDate: "2026-10-10",
    category: "Cartão",
    status: "PARTIAL",
  });
  const invalidResult = createExpenseSchema.safeParse({
    description: "Cartão",
    referenceAmount: "4200.00",
    paidAmount: "2100.00",
    dueDate: "2026-10-10",
    category: "Cartão",
    status: "PENDING",
  });

  assert.equal(validResult.success, true);
  assert.equal(invalidResult.success, false);
});

test("calculates monthly balances in cents", () => {
  const summary = calculateMonthlySummary({
    incomeCents: 2_000_000n,
    plannedExpenseCents: 600_000n,
    paidExpenseCents: 450_000n,
  });

  assert.deepEqual(summary, {
    incomeCents: 2_000_000n,
    plannedExpenseCents: 600_000n,
    paidExpenseCents: 450_000n,
    balanceCents: 1_550_000n,
    pendingExpenseCents: 150_000n,
  });
});
