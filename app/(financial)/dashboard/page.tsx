import Link from "next/link";

export default function DashboardPage() {
  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Dashboard
        </h1>
        <p className="text-sm leading-6 text-slate-400">
          Acompanhe seu mês quando seus primeiros lançamentos forem cadastrados.
        </p>
      </div>
      <div className="rounded-2xl border border-white/5 bg-[#191c21]/80 p-6 shadow-xl shadow-black/10 sm:p-8">
        <div className="max-w-xl space-y-4">
          <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
            <svg
              aria-hidden="true"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path d="m12 2 2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6L12 2Z" />
            </svg>
          </span>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">
              Seu resumo mensal aparecerá aqui
            </h2>
            <p className="text-sm leading-6 text-slate-400">
              Cadastre receitas e despesas para visualizar os totais e o saldo
              do período selecionado.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              className="rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-[#003822] transition hover:bg-emerald-300"
              href="/income"
            >
              Ver receitas
            </Link>
            <Link
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
              href="/expenses"
            >
              Ver despesas
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
