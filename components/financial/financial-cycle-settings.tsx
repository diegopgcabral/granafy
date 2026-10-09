"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  saveFinancialCycle,
  type SettingsActionState,
} from "@/app/(financial)/settings/actions";
import { useToast } from "@/components/financial/toast-provider";

const initialState: SettingsActionState = {};

export function FinancialCycleSettings({ initialDay }: { initialDay: number }) {
  const [day, setDay] = useState(initialDay);
  const [state, action, pending] = useActionState(
    saveFinancialCycle,
    initialState,
  );
  const router = useRouter();
  const { notify } = useToast();
  useEffect(() => {
    if (state.error) notify("error", state.error);
    if (state.success) {
      notify("success", "Ciclo financeiro salvo.");
      router.refresh();
    }
  }, [notify, router, state.error, state.success]);
  return (
    <form
      action={action}
      className="relative overflow-hidden rounded-2xl bg-[#191c21] p-6 shadow-xl shadow-black/20 sm:p-8"
    >
      <div
        aria-hidden="true"
        className="absolute -top-20 -right-20 size-72 rounded-full bg-emerald-400/10 blur-3xl"
      />
      <div className="relative space-y-7">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-emerald-300 uppercase">
            Preferências do sistema
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Configurações
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Personalize como o NexSaldo organiza sua vida financeira.
          </p>
        </div>
        <div className="rounded-xl bg-[#111319]/80 p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Ciclo financeiro
              </h2>
              <p className="mt-1 max-w-xl text-sm leading-6 text-slate-400">
                Escolha o dia em que seu ciclo mensal começa. Receitas e
                despesas serão agrupadas por esse período.
              </p>
            </div>
            <span className="h-fit rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
              Principal critério de agrupamento
            </span>
          </div>
          <div className="mt-6 grid grid-cols-7 gap-2">
            {Array.from({ length: 31 }, (_, index) => index + 1).map((item) => (
              <label
                className={`cursor-pointer rounded-lg py-2 text-center text-sm transition ${day === item ? "bg-[#00e599] font-semibold text-[#003822]" : "bg-[#272a30] text-slate-300 hover:bg-[#36393f]"}`}
                key={item}
              >
                <input
                  checked={day === item}
                  className="sr-only"
                  name="startDay"
                  onChange={() => setDay(item)}
                  type="radio"
                  value={item}
                />
                {String(item).padStart(2, "0")}
              </label>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-[#1d2025] p-5">
          <p className="text-xs font-semibold tracking-[0.12em] text-emerald-300 uppercase">
            Como funciona
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Com início no dia <strong>{day}</strong>, o ciclo de Outubro, por
            exemplo, vai do dia {day} de setembro até o dia {day - 1 || 28} de
            outubro.
          </p>
        </div>
        <div className="flex justify-end">
          <button
            className="rounded-xl bg-[#00e599] px-5 py-2.5 text-sm font-semibold text-[#003822] shadow-[0_0_20px_rgba(0,229,153,0.24)] disabled:opacity-60"
            disabled={pending}
            type="submit"
          >
            {pending ? "Salvando…" : "Salvar configurações"}
          </button>
        </div>
      </div>
    </form>
  );
}
