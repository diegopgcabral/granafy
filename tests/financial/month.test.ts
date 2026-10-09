import assert from "node:assert/strict";
import test from "node:test";

import {
  addMonths,
  formatMonthReference,
  formatCycleReference,
  getCurrentCycleReference,
  getCycleDateRange,
  getMonthDateRange,
  isMonthReference,
} from "@/lib/financial/month";

test("moves a month reference across year boundaries", () => {
  assert.equal(addMonths("2026-12", 1), "2027-01");
  assert.equal(addMonths("2026-01", -1), "2025-12");
});

test("gets an exclusive date range for a month", () => {
  assert.deepEqual(getMonthDateRange("2026-12"), {
    startsOn: "2026-12-01",
    endsBefore: "2027-01-01",
  });
});

test("groups dates by a financial cycle instead of a calendar month", () => {
  assert.deepEqual(getCycleDateRange("2026-10", 25), {
    startsOn: "2026-09-25",
    endsBefore: "2026-10-25",
  });
  assert.equal(
    formatCycleReference("2026-10", 25),
    "25 de set – 24 de out 2026",
  );
  assert.equal(
    getCurrentCycleReference(new Date("2026-10-26T12:00:00"), 25),
    "2026-11",
  );
});

test("formats a valid reference in Portuguese", () => {
  assert.equal(formatMonthReference("2026-10"), "Outubro de 2026");
});

test("rejects invalid month references", () => {
  assert.equal(isMonthReference("2026-13"), false);
  assert.equal(isMonthReference("outubro"), false);
});
