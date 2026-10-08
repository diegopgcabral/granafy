import assert from "node:assert/strict";
import test from "node:test";

import {
  addMonths,
  formatMonthReference,
  isMonthReference,
} from "@/lib/financial/month";

test("moves a month reference across year boundaries", () => {
  assert.equal(addMonths("2026-12", 1), "2027-01");
  assert.equal(addMonths("2026-01", -1), "2025-12");
});

test("formats a valid reference in Portuguese", () => {
  assert.equal(formatMonthReference("2026-10"), "Outubro de 2026");
});

test("rejects invalid month references", () => {
  assert.equal(isMonthReference("2026-13"), false);
  assert.equal(isMonthReference("outubro"), false);
});
