export default function ExpensesPage() {
  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Despesas
        </h1>
        <p className="text-sm leading-6 text-slate-400">
          Lançamentos do mês selecionado.
        </p>
      </div>
      <div className="rounded-2xl border border-white/5 bg-[#191c21]/80 p-6 text-center shadow-xl shadow-black/10 sm:p-10">
        <p className="text-base font-semibold text-white">
          Nenhuma despesa neste mês
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
          O cadastro de despesas será adicionado em uma etapa própria.
        </p>
      </div>
    </section>
  );
}
