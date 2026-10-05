"use client";

import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { login } from "@/app/actions";
import { buttonClass, inputClass } from "@/components/ui";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, null);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="next" value={next} />
      <input
        name="passcode"
        type="password"
        required
        autoFocus
        autoComplete="current-password"
        placeholder="Passcode"
        aria-label="Passcode"
        className={`${inputClass} h-13 bg-surface text-center text-lg tracking-[0.3em] placeholder:tracking-normal`}
      />
      {state?.error && <p className="text-center text-sm text-rose-600 dark:text-rose-400">{state.error}</p>}
      <button type="submit" disabled={pending} className={`${buttonClass.primary} h-12 w-full`}>
        {pending ? "Checking…" : "Unlock"} {!pending && <ArrowRight className="size-4" />}
      </button>
    </form>
  );
}
