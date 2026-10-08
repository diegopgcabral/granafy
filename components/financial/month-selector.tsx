"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Icon } from "@/components/financial/icons";
import {
  addMonths,
  formatMonthReference,
  getCurrentMonthReference,
  isMonthReference,
} from "@/lib/financial/month";

export function MonthSelector() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryMonth = searchParams.get("month");
  const month = isMonthReference(queryMonth)
    ? queryMonth
    : getCurrentMonthReference();

  function changeMonth(amount: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", addMonths(month, amount));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center rounded-xl border border-white/5 bg-[#191c21] p-1 shadow-lg shadow-black/20">
      <button
        aria-label="Mês anterior"
        className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white"
        onClick={() => changeMonth(-1)}
        type="button"
      >
        <Icon className="size-4" name="chevronLeft" />
      </button>
      <div className="flex min-w-40 items-center justify-center gap-2 px-3 text-sm font-medium text-slate-100">
        <Icon className="size-4 text-emerald-400" name="calendar" />
        <span>{formatMonthReference(month)}</span>
      </div>
      <button
        aria-label="Próximo mês"
        className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white"
        onClick={() => changeMonth(1)}
        type="button"
      >
        <Icon className="size-4" name="chevronRight" />
      </button>
    </div>
  );
}
