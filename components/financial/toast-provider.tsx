"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { Icon } from "@/components/financial/icons";

type ToastKind = "success" | "error";
type Toast = { id: number; kind: ToastKind; message: string };
type ToastContextValue = {
  notify: (kind: ToastKind, message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((items) => items.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    (kind: ToastKind, message: string) => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((items) => [...items, { id, kind, message }]);
      window.setTimeout(() => dismiss(id), 5000);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed top-4 right-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3"
      >
        {toasts.map((toast) => {
          const success = toast.kind === "success";
          return (
            <div
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-2xl backdrop-blur-xl ${
                success
                  ? "border-emerald-400/30 bg-[#15251f]/95 text-emerald-100"
                  : "border-red-300/30 bg-[#311b20]/95 text-red-100"
              }`}
              key={toast.id}
              role={success ? "status" : "alert"}
            >
              <span
                className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  success
                    ? "bg-emerald-400 text-[#003822]"
                    : "bg-red-300 text-[#5a1018]"
                }`}
              >
                {success ? "✓" : "!"}
              </span>
              <p className="flex-1 text-sm leading-5">{toast.message}</p>
              <button
                aria-label="Fechar notificação"
                className="-mt-1 -mr-1 rounded-lg p-1 opacity-70 transition hover:bg-white/10 hover:opacity-100"
                onClick={() => dismiss(toast.id)}
                type="button"
              >
                <Icon className="size-4" name="close" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast deve ser usado dentro de ToastProvider.");
  }
  return context;
}
