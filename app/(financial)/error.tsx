"use client";

export default function FinancialError({ reset }: { reset: () => void }) {
  return (
    <div className="rounded-2xl border border-red-400/15 bg-red-950/20 p-6">
      <h1 className="text-lg font-semibold text-white">
        Não foi possível carregar esta área
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Tente novamente em instantes.
      </p>
      <button
        className="mt-4 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-white/5"
        onClick={reset}
        type="button"
      >
        Tentar novamente
      </button>
    </div>
  );
}
