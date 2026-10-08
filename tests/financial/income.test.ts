import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateIncomeTotal,
  numericAmountToCents,
} from "@/lib/financial/income";

test("adds income amounts precisely in cents", () => {
  assert.equal(
    calculateIncomeTotal([
      { amount: "0.10" },
      { amount: "0.20" },
      { amount: "1250.05" },
    ]),
    125_035n,
  );
});

test("converts numeric database amounts to cents", () => {
  assert.equal(numericAmountToCents(1200.5), 120_050n);
});
