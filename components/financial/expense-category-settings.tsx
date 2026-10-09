"use client";

import {
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type MouseEvent,
} from "react";
import { useRouter } from "next/navigation";

import {
  activateExpenseCategory,
  createExpenseCategory,
  deactivateExpenseCategory,
  deleteExpenseCategory,
  updateExpenseCategoryIcon,
} from "@/app/(financial)/settings/actions";
import { ExpenseCategoryIcon } from "@/components/financial/expense-category-icon";
import { Icon } from "@/components/financial/icons";
import { useToast } from "@/components/financial/toast-provider";
import {
  expenseCategoryIconKeys,
  expenseCategoryIconLabels,
  type ExpenseCategoryIconKey,
} from "@/lib/financial/category";

type Category = {
  id: string;
  name: string;
  icon_key: string | null;
  is_active: boolean;
};

export function ExpenseCategorySettings({
  categories,
}: {
  categories: Category[];
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [iconPickerId, setIconPickerId] = useState<string>();
  const [actionMenu, setActionMenu] = useState<{
    category: Category;
    bottom?: number;
    right: number;
    top?: number;
  }>();
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "PAUSED">("ALL");
  const [isChanging, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const { notify } = useToast();

  function createCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await createExpenseCategory({}, formData);
      if (result.error) {
        notify("error", result.error);
        return;
      }
      formRef.current?.reset();
      setIsCreating(false);
      notify("success", "Categoria cadastrada.");
      router.refresh();
    });
  }

  function updateCategory(
    category: Category,
    operation: "activate" | "deactivate" | "delete",
  ) {
    const deleting = operation === "delete";
    setActionMenu(undefined);
    startTransition(async () => {
      const result = deleting
        ? await deleteExpenseCategory(category.id)
        : operation === "activate"
          ? await activateExpenseCategory(category.id)
          : await deactivateExpenseCategory(category.id);
      if (result.error) {
        notify("error", result.error);
        return;
      }
      notify(
        "success",
        deleting
          ? `Categoria “${category.name}” excluída.`
          : operation === "activate"
            ? `Categoria “${category.name}” ativada.`
            : `Categoria “${category.name}” pausada.`,
      );
      router.refresh();
    });
  }

  function toggleActionMenu(
    event: MouseEvent<HTMLButtonElement>,
    category: Category,
  ) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const right = window.innerWidth - bounds.right;
    const shouldOpenUpward = window.innerHeight - bounds.bottom < 116;

    setActionMenu((current) => {
      if (current?.category.id === category.id) return undefined;
      return shouldOpenUpward
        ? {
            category,
            bottom: window.innerHeight - bounds.top + 8,
            right,
          }
        : { category, right, top: bounds.bottom + 8 };
    });
  }

  function saveIcon(category: Category, iconKey: ExpenseCategoryIconKey) {
    startTransition(async () => {
      const result = await updateExpenseCategoryIcon(category.id, iconKey);
      if (result.error) {
        notify("error", result.error);
        return;
      }
      setIconPickerId(undefined);
      notify("success", `Ícone de “${category.name}” atualizado.`);
      router.refresh();
    });
  }

  const iconPickerCategory = categories.find(
    (category) => category.id === iconPickerId,
  );
  const activeCount = categories.filter(
    (category) => category.is_active,
  ).length;
  const pausedCount = categories.length - activeCount;
  const visibleCategories = categories.filter((category) => {
    if (filter === "ACTIVE") return category.is_active;
    if (filter === "PAUSED") return !category.is_active;
    return true;
  });

  return (
    <section className="relative overflow-hidden rounded-2xl bg-[#191c21] p-6 shadow-xl shadow-black/20 sm:p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-16 size-72 rounded-full bg-emerald-400/5 blur-3xl"
      />
      <div className="relative">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <span className="flex size-12 items-center justify-center rounded-xl bg-[#272a30] text-emerald-300 shadow-[0_0_18px_rgba(0,229,153,0.12)]">
              <Icon className="size-6" name="category" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold text-white">
                  Categorias de despesas
                </h2>
              </div>
              <p className="mt-1 text-sm text-slate-400">
                {activeCount} disponíveis em novos lançamentos
                {pausedCount
                  ? ` · ${pausedCount} pausada${pausedCount > 1 ? "s" : ""}`
                  : ""}
                .
              </p>
            </div>
          </div>
          <button
            className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-[#00e599] px-4 py-2.5 text-sm font-semibold text-[#003822] shadow-[0_0_20px_rgba(0,229,153,0.18)] transition hover:brightness-110"
            onClick={() => setIsCreating((open) => !open)}
            type="button"
          >
            <Icon className="size-4" name="plus" />
            Nova categoria
          </button>
        </div>

        {isCreating ? (
          <form
            className="mt-6 flex flex-col gap-3 rounded-xl border border-emerald-400/20 bg-[#111319]/80 p-4 sm:flex-row sm:items-end"
            onSubmit={createCategory}
            ref={formRef}
          >
            <label className="flex-1 space-y-1.5">
              <span className="income-label">Nome da categoria</span>
              <input
                autoFocus
                className="income-input"
                maxLength={100}
                name="name"
                placeholder="Ex.: Pet e veterinário"
                required
              />
            </label>
            <div className="flex gap-2">
              <button
                className="rounded-xl bg-[#272a30] px-4 py-2.5 text-sm text-slate-200"
                onClick={() => setIsCreating(false)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="rounded-xl bg-[#00e599] px-4 py-2.5 text-sm font-semibold text-[#003822] disabled:opacity-60"
                disabled={isChanging}
                type="submit"
              >
                {isChanging ? "Criando…" : "Criar categoria"}
              </button>
            </div>
          </form>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            {[
              ["ALL", `Todas (${categories.length})`],
              ["ACTIVE", `Ativas (${activeCount})`],
              ["PAUSED", `Pausadas (${pausedCount})`],
            ].map(([value, label]) => (
              <button
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  filter === value
                    ? "bg-[#272a30] text-emerald-300"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
                key={value}
                onClick={() => setFilter(value as "ALL" | "ACTIVE" | "PAUSED")}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-500">
            Pausadas não aparecem em despesas novas
          </span>
        </div>

        <ul className="category-scroll mt-2 max-h-[26.25rem] divide-y divide-white/5 overflow-y-auto pr-2">
          {visibleCategories.map((category) => (
            <li
              className={`flex items-center justify-between gap-4 rounded-xl px-2 py-3 transition hover:bg-white/[0.03] ${
                category.is_active ? "" : "opacity-75"
              }`}
              key={category.id}
            >
              <div className="flex min-w-0 items-center gap-4">
                <button
                  aria-label={`Alterar ícone de ${category.name}`}
                  className="rounded-xl transition hover:ring-2 hover:ring-emerald-300/60 focus:ring-2 focus:ring-emerald-300 focus:outline-none"
                  onClick={() => setIconPickerId(category.id)}
                  type="button"
                >
                  <ExpenseCategoryIcon
                    iconKey={category.icon_key}
                    name={category.name}
                  />
                </button>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-medium text-slate-100">
                      {category.name}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                        category.is_active
                          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                          : "border-red-400/25 bg-red-400/10 text-red-300"
                      }`}
                    >
                      {category.is_active ? "Ativa" : "Pausada"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {category.is_active
                      ? "Disponível em novos lançamentos"
                      : "Fora dos novos lançamentos"}
                  </p>
                </div>
              </div>

              <button
                aria-label={`Ações para ${category.name}`}
                className="flex size-9 cursor-pointer list-none items-center justify-center rounded-lg text-slate-400 transition hover:bg-[#272a30] hover:text-white [&::-webkit-details-marker]:hidden"
                onClick={(event) => toggleActionMenu(event, category)}
                type="button"
              >
                <Icon className="size-5" name="more" />
              </button>
            </li>
          ))}
        </ul>
      </div>
      {actionMenu ? (
        <>
          <button
            aria-label="Fechar ações da categoria"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setActionMenu(undefined)}
            type="button"
          />
          <div
            className="fixed z-50 w-48 rounded-xl border border-white/10 bg-[#272a30] p-1.5 shadow-2xl"
            style={{
              bottom: actionMenu.bottom,
              right: actionMenu.right,
              top: actionMenu.top,
            }}
          >
            {actionMenu.category.is_active ? (
              <button
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/5 disabled:opacity-50"
                disabled={isChanging}
                onClick={() =>
                  updateCategory(actionMenu.category, "deactivate")
                }
                type="button"
              >
                <Icon className="size-4" name="pause" />
                Pausar
              </button>
            ) : (
              <button
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-emerald-300 hover:bg-emerald-400/10 disabled:opacity-50"
                disabled={isChanging}
                onClick={() => updateCategory(actionMenu.category, "activate")}
                type="button"
              >
                <Icon className="size-4" name="plus" />
                Ativar
              </button>
            )}
            <button
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-300 hover:bg-red-400/10 disabled:opacity-50"
              disabled={isChanging}
              onClick={() => updateCategory(actionMenu.category, "delete")}
              type="button"
            >
              <Icon className="size-4" name="trash" />
              Excluir
            </button>
          </div>
        </>
      ) : null}
      {iconPickerCategory ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0e13]/80 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget)
              setIconPickerId(undefined);
          }}
          role="dialog"
        >
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1d2025] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-emerald-300 uppercase">
                  Ícone da categoria
                </p>
                <h3 className="mt-1 text-lg font-semibold text-white">
                  {iconPickerCategory.name}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Escolha um ícone para identificar esta categoria.
                </p>
              </div>
              <button
                aria-label="Fechar seleção de ícone"
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                onClick={() => setIconPickerId(undefined)}
                type="button"
              >
                <Icon className="size-5" name="close" />
              </button>
            </div>
            <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {expenseCategoryIconKeys.map((iconKey) => (
                <button
                  aria-label={`Usar ícone ${expenseCategoryIconLabels[iconKey]}`}
                  className={`flex flex-col items-center gap-1 rounded-xl p-2 text-[10px] transition hover:bg-white/5 disabled:opacity-50 ${
                    iconPickerCategory.icon_key === iconKey
                      ? "bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/50"
                      : "text-slate-400"
                  }`}
                  disabled={isChanging}
                  key={iconKey}
                  onClick={() => saveIcon(iconPickerCategory, iconKey)}
                  type="button"
                >
                  <ExpenseCategoryIcon iconKey={iconKey} name="" />
                  <span className="truncate">
                    {expenseCategoryIconLabels[iconKey]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
