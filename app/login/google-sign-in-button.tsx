"use client";

import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export function GoogleSignInButton() {
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  async function signInWithGoogle() {
    setErrorMessage(undefined);
    setIsLoading(true);

    try {
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("next", "/dashboard");

      const { error } = await createClient().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callbackUrl.toString() },
      });

      if (!error) {
        return;
      }
    } catch {
      // Use the same message for provider and local configuration failures.
    }

    setErrorMessage("Não foi possível iniciar o login com Google.");
    setIsLoading(false);
  }

  return (
    <div className="space-y-3">
      <button
        className="w-full rounded-lg bg-emerald-400 px-4 py-3 font-medium text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isLoading}
        onClick={signInWithGoogle}
        type="button"
      >
        {isLoading ? "Redirecionando..." : "Entrar com Google"}
      </button>
      {errorMessage ? (
        <p aria-live="polite" className="text-sm text-red-300">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
