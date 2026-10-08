"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";

import {
  createExpense,
  deleteExpense,
  type ExpenseActionState,
  updateExpense,
} from "@/app/(financial)/expenses/actions";
import { createExpenseCategory } from "@/app/(financial)/settings/actions";
import { Icon } from "@/components/financial/icons";
import { useToast } from "@/components/financial/toast-provider";
import { amountToCents } from "@/lib/financial/contracts";
import {
  type ExpenseListItem,
  formatExpenseStatus,
} from "@/lib/financial/expense";
import { formatCents } from "@/lib/financial/income";

type Props = {
  categories: string[];
  expenses: ExpenseListItem[];
  month: string;
  totals: { plannedCents: bigint; paidCents: bigint };
};
const initialState: ExpenseActionState = {};
const statuses = ["PENDING", "PARTIAL", "PAID", "CANCELLED"] as const;

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(
    new Date(`${date}T12:00:00`),
  );
}
function cents(value: string | number) {
  return amountToCents(String(value));
}

function CurrencyInput({
  name,
  defaultValue,
  required = false,
}: {
  name: string;
  defaultValue?: string | number;
  required?: boolean;
}) {
  const format = (raw: string) =>
    new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(raw.replace(/\D/g, "") || "0") / 100);
  const [value, setValue] = useState(() =>
    defaultValue === undefined ? "" : format(String(defaultValue)),
  );
  return (
    <span className="relative block">
      <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-sm font-semibold text-emerald-300">
        R$
      </span>
      <input
        className="income-input font-semibold"
        inputMode="numeric"
        name={name}
        onChange={(event) => setValue(format(event.target.value))}
        placeholder="0,00"
        required={required}
        style={{ paddingLeft: "3rem" }}
        value={value}
      />
    </span>
  );
}

function ExpenseForm({
  expense,
  month,
  categories,
  onClose,
}: {
  expense?: ExpenseListItem;
  month: string;
  categories: string[];
  onClose: () => void;
}) {
  const action = expense ? updateExpense : createExpense;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [status, setStatus] = useState(expense?.status ?? "PENDING");
  const [category, setCategory] = useState(expense?.category ?? "");
  const [categoryOptions, setCategoryOptions] = useState(categories);
  const [categoryError, setCategoryError] = useState<string>();
  const [creatingCategory, startCreatingCategory] = useTransition();
  const router = useRouter();
  const { notify } = useToast();
  const normalizedCategory = category.trim().replace(/\s+/g, " ");
  const existingCategory = categoryOptions.find(
    (item) =>
      item.localeCompare(normalizedCategory, "pt-BR", {
        sensitivity: "accent",
      }) === 0,
  );
  const canCreateCategory = Boolean(normalizedCategory) && !existingCategory;

  function addCategory() {
    if (!canCreateCategory) return;
    setCategoryError(undefined);
    startCreatingCategory(async () => {
      const formData = new FormData();
      formData.set("name", normalizedCategory);
      const result = await createExpenseCategory({}, formData);
      if (result.error) {
        setCategoryError(result.error);
        notify("error", result.error);
        return;
      }
      setCategoryOptions((items) => [...items, normalizedCategory].sort());
      setCategory(normalizedCategory);
      notify("success", `Categoria “${normalizedCategory}” cadastrada.`);
      router.refresh();
    });
  }
  useEffect(() => {
    if (state.error) notify("error", state.error);
    if (state.success) {
      notify(
        "success",
        expense ? "Despesa atualizada." : "Despesa cadastrada.",
      );
      onClose();
    }
  }, [expense, notify, onClose, state.error, state.success]);
  return (
    <form
      action={formAction}
      className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-6"
    >
      <input name="month" type="hidden" value={month} />
      {expense ? <input name="id" type="hidden" value={expense.id} /> : null}
      <label className="space-y-1.5">
        <span className="income-label">Descrição da despesa</span>
        <input
          className="income-input"
          defaultValue={expense?.description}
          name="description"
          placeholder="Ex.: Fatura, aluguel, supermercado…"
          required
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="income-label">Valor previsto</span>
          <CurrencyInput
            defaultValue={expense?.referenceAmount}
            name="referenceAmount"
            required
          />
        </label>
        <label className="space-y-1.5">
          <span className="income-label">Valor pago</span>
          <CurrencyInput
            defaultValue={expense?.paidAmount ?? "0"}
            name="paidAmount"
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="income-label">Vencimento</span>
          <input
            className="income-input [color-scheme:dark]"
            defaultValue={expense?.dueDate}
            name="dueDate"
            type="date"
            required
          />
        </label>
        <label className="space-y-1.5">
          <span className="income-label">Data de pagamento</span>
          <input
            className="income-input [color-scheme:dark]"
            defaultValue={expense?.paidAt ?? ""}
            name="paidAt"
            type="date"
          />
        </label>
      </div>
      <label className="space-y-1.5">
        <span className="flex items-center justify-between gap-3">
          <span className="income-label">Categoria</span>
          <a
            className="text-xs text-emerald-300 hover:text-emerald-200"
            href="/settings"
          >
            Gerenciar categorias
          </a>
        </span>
        <input
          className="income-input"
          list="expense-categories"
          name="category"
          onChange={(event) => setCategory(event.target.value)}
          required
          value={category}
        />
        <datalist id="expense-categories">
          {categoryOptions.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>
        {canCreateCategory ? (
          <button
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 hover:text-emerald-200 disabled:opacity-60"
            disabled={creatingCategory}
            onClick={addCategory}
            type="button"
          >
            <Icon className="size-3.5" name="plus" />
            {creatingCategory
              ? "Criando categoria…"
              : `Criar “${normalizedCategory}” como nova categoria`}
          </button>
        ) : (
          <span className="block text-xs text-slate-500">
            Escolha uma categoria existente ou digite outra para criá-la.
          </span>
        )}
        {categoryError ? (
          <span className="block text-xs text-red-300">{categoryError}</span>
        ) : null}
      </label>
      <fieldset>
        <legend className="income-label mb-2">Status do pagamento</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {statuses.map((item) => (
            <label
              className={`cursor-pointer rounded-xl border p-3 text-center text-xs transition ${status === item ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-300" : "border-white/5 bg-[#111319] text-slate-400"}`}
              key={item}
            >
              <input
                checked={status === item}
                className="sr-only"
                name="status"
                onChange={() => setStatus(item)}
                type="radio"
                value={item}
              />
              <span>{formatExpenseStatus(item)}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="space-y-1.5">
        <span className="income-label">
          Observações{" "}
          <span className="font-normal text-slate-500">(opcional)</span>
        </span>
        <textarea
          className="income-input min-h-24 resize-none"
          defaultValue={expense?.notes ?? ""}
          name="notes"
        />
      </label>
      {state.error ? (
        <p className="text-sm text-red-300">{state.error}</p>
      ) : null}
      <div className="mt-auto flex justify-end gap-3 pt-2">
        <button
          className="rounded-xl bg-[#272a30] px-5 py-2.5 text-sm text-slate-200"
          onClick={onClose}
          type="button"
        >
          Cancelar
        </button>
        <button
          className="rounded-xl bg-[#00e599] px-6 py-2.5 text-sm font-semibold text-[#003822] disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "Salvando…" : "Salvar despesa"}
        </button>
      </div>
    </form>
  );
}

export function ExpenseManager({ categories, expenses, month, totals }: Props) {
  const [drawer, setDrawer] = useState(false);
  const [editing, setEditing] = useState<ExpenseListItem>();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"ALL" | ExpenseListItem["status"]>(
    "ALL",
  );
  const visible = useMemo(
    () =>
      expenses.filter(
        (item) =>
          (filter === "ALL" || item.status === filter) &&
          `${item.description} ${item.category}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [expenses, filter, query],
  );
  const open = (expense?: ExpenseListItem) => {
    setEditing(expense);
    setDrawer(true);
  };
  const close = () => {
    setDrawer(false);
    setEditing(undefined);
  };
  const remaining = totals.plannedCents - totals.paidCents;
  const paidPercent = totals.plannedCents
    ? Number((totals.paidCents * 100n) / totals.plannedCents)
    : 0;
  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-2 text-xs font-semibold tracking-[0.18em] text-emerald-300 uppercase">
            Gestão mensal
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Despesas
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Controle de pagamentos e compromissos do mês selecionado.
          </p>
        </div>
        <button
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#00e599] px-5 py-2.5 text-sm font-semibold text-[#003822] shadow-[0_0_24px_rgba(0,229,153,0.25)]"
          onClick={() => open()}
          type="button"
        >
          <Icon className="size-5" name="plus" />
          Nova despesa
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Metric
          label="Total previsto"
          value={totals.plannedCents}
          note={`${expenses.filter((item) => item.status !== "CANCELLED").length} compromissos mapeados`}
          color="text-white"
        />
        <Metric
          label="Total pago"
          value={totals.paidCents}
          note={`${paidPercent}% liquidado`}
          color="text-emerald-300"
        />
        <Metric
          label="Em aberto"
          value={remaining}
          note={`${expenses.filter((item) => item.status === "PENDING" || item.status === "PARTIAL").length} despesas pendentes`}
          color="text-sky-200"
        />
      </div>
      <div className="flex flex-col gap-3 rounded-xl bg-[#191c21]/80 p-4 md:flex-row md:items-center md:justify-between">
        <input
          className="income-input md:max-w-xs"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filtrar lançamentos…"
          value={query}
        />
        <div className="flex gap-2 overflow-x-auto">
          {(["ALL", ...statuses] as const).map((item) => (
            <button
              className={`rounded-lg px-3 py-1.5 text-xs whitespace-nowrap ${filter === item ? "bg-[#00e599] font-semibold text-[#003822]" : "bg-[#272a30] text-slate-400"}`}
              key={item}
              onClick={() => setFilter(item)}
              type="button"
            >
              {item === "ALL" ? "Todas" : formatExpenseStatus(item)}
            </button>
          ))}
        </div>
      </div>
      {visible.length === 0 ? (
        <div className="rounded-3xl bg-[#191c21] p-14 text-center">
          <h2 className="text-xl font-semibold text-white">
            Nenhuma despesa encontrada
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Cadastre um compromisso financeiro para começar.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-[#191c21] shadow-xl shadow-black/20">
          <table className="w-full min-w-225 text-left text-sm">
            <thead className="bg-[#272a30]/70 text-xs tracking-wider text-slate-400 uppercase">
              <tr>
                {[
                  "Descrição",
                  "Categoria",
                  "Vencimento",
                  "Previsto",
                  "Pago",
                  "Status",
                  "",
                ].map((title) => (
                  <th className="px-5 py-3.5 font-semibold" key={title}>
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((item) => (
                <tr
                  className="border-t border-white/5 transition hover:bg-[#1d2025]"
                  key={item.id}
                >
                  <td
                    className={`px-5 py-4 font-semibold ${item.status === "CANCELLED" ? "text-slate-500 line-through" : "text-white"}`}
                  >
                    {item.description}
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-md bg-[#272a30] px-2 py-1 text-xs text-slate-300">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-300">
                    {formatDate(item.dueDate)}
                  </td>
                  <td className="px-4 py-4 font-medium text-white">
                    {formatCents(cents(item.referenceAmount))}
                  </td>
                  <td className="px-4 py-4 font-medium text-emerald-300">
                    {formatCents(cents(item.paidAmount))}
                  </td>
                  <td className="px-4 py-4">
                    <Status status={item.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        aria-label={`Editar ${item.description}`}
                        className="rounded-lg p-2 text-slate-400 hover:bg-[#272a30] hover:text-white"
                        onClick={() => open(item)}
                        type="button"
                      >
                        <Icon className="size-4" name="edit" />
                      </button>
                      <DeleteExpenseButton expense={item} month={month} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {drawer ? (
        <div
          className="fixed inset-0 z-50 bg-[#0b0e13]/80 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <aside
            aria-modal="true"
            className="ml-auto flex h-full w-full max-w-xl flex-col bg-[#191c21] shadow-2xl"
            role="dialog"
          >
            <header className="flex items-center justify-between bg-[#1d2025] px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {editing ? "Editar lançamento" : "Nova despesa"}
                </h2>
                <p className="text-sm text-slate-400">
                  Preencha os dados do compromisso financeiro.
                </p>
              </div>
              <button
                aria-label="Fechar formulário"
                className="rounded-xl bg-[#272a30] p-2 text-slate-400"
                onClick={close}
                type="button"
              >
                <Icon className="size-5" name="close" />
              </button>
            </header>
            <ExpenseForm
              categories={categories}
              expense={editing}
              month={month}
              onClose={close}
            />
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function DeleteExpenseButton({
  expense,
  month,
}: {
  expense: ExpenseListItem;
  month: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { notify } = useToast();

  function remove() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", expense.id);
      formData.set("month", month);
      const result = await deleteExpense(formData);
      if (result?.error) {
        notify("error", result.error);
        return;
      }
      notify("success", "Despesa excluída.");
      router.refresh();
    });
  }

  return (
    <button
      aria-label={`Excluir ${expense.description}`}
      className="rounded-lg p-2 text-slate-400 hover:bg-red-400/10 hover:text-red-300 disabled:opacity-50"
      disabled={pending}
      onClick={remove}
      type="button"
    >
      <Icon className="size-4" name="trash" />
    </button>
  );
}

function Metric({
  label,
  value,
  note,
  color,
}: {
  label: string;
  value: bigint;
  note: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl bg-[#191c21] p-6 shadow-lg shadow-black/20">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-bold tracking-tight ${color}`}>
        {formatCents(value)}
      </p>
      <p className="mt-3 text-xs text-slate-400">{note}</p>
    </div>
  );
}
function Status({ status }: { status: ExpenseListItem["status"] }) {
  const colors = {
    PENDING: "bg-sky-300/15 text-sky-200",
    PARTIAL: "bg-amber-300/15 text-amber-200",
    PAID: "bg-emerald-400/15 text-emerald-300",
    CANCELLED: "bg-[#32353b] text-slate-400",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${colors[status]}`}
    >
      {formatExpenseStatus(status)}
    </span>
  );
}
