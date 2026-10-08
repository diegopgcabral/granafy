"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Icon } from "@/components/financial/icons";
import {
  addMonths,
  formatCycleReference,
  getCurrentCycleReference,
  isMonthReference,
} from "@/lib/financial/month";

export function MonthSelector({ cycleStartDay }: { cycleStartDay: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryMonth = searchParams.get("month");
  const month = isMonthReference(queryMonth)
    ? queryMonth
    : getCurrentCycleReference(new Date(), cycleStartDay);

  function changeMonth(amount: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", addMonths(month, amount));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center rounded-xl border border-white/5 bg-[#191c21] p-1 shadow-lg shadow-black/20">
      <button
        aria-label="Ciclo anterior"
        className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white"
        onClick={() => changeMonth(-1)}
        type="button"
      >
        <Icon className="size-4" name="chevronLeft" />
      </button>
      <div className="flex min-w-48 justify-center px-3 py-0.5 text-center">
        <div className="leading-tight">
          <p className="text-[10px] font-semibold tracking-[0.12em] text-emerald-300 uppercase">
            Ciclo financeiro
          </p>
          <p className="mt-0.5 text-xs font-medium text-slate-100">
            {formatCycleReference(month, cycleStartDay)}
          </p>
        </div>
      </div>
      <button
        aria-label="Próximo ciclo"
        className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white"
        onClick={() => changeMonth(1)}
        type="button"
      >
        <Icon className="size-4" name="chevronRight" />
      </button>
    </div>
  );
}
