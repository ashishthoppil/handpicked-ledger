"use client";

import { useState, useTransition } from "react";
import { Check, Pencil, Wallet, X } from "lucide-react";
import { saveCapital } from "@/app/actions";
import { formatDate, formatINR } from "@/lib/format";
import type { Capital } from "@/lib/types";
import { buttonClass, cn } from "./ui";

export function CapitalField({ capital }: { capital: Capital }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await saveCapital(form);
      if (result.ok) {
        setEditing(false);
        setError(null);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="rounded-2xl border border-line bg-background/60 p-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-[13px] font-medium text-muted">
          <Wallet className="size-4" /> Current capital
        </span>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className={cn(buttonClass.icon, "-mr-1.5 size-8")}
            aria-label="Edit capital"
          >
            <Pencil className="size-4" />
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={submit} className="mt-2">
          <div className="flex items-center gap-1.5">
            <div className="relative min-w-0 flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">₹</span>
              <input
                name="capital"
                inputMode="decimal"
                autoFocus
                defaultValue={capital.amount || ""}
                placeholder="0"
                className="h-10 w-full rounded-lg border border-line bg-surface pl-7 pr-2 text-[16px] font-medium outline-none focus:border-foreground/30"
              />
            </div>
            <button type="submit" disabled={pending} className={cn(buttonClass.icon, "bg-foreground text-background hover:bg-foreground hover:text-background")} aria-label="Save capital">
              <Check className="size-4" />
            </button>
            <button type="button" onClick={() => { setEditing(false); setError(null); }} className={buttonClass.icon} aria-label="Cancel">
              <X className="size-4" />
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
        </form>
      ) : (
        <>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{formatINR(capital.amount)}</p>
          <p className="mt-0.5 text-xs text-muted">
            {capital.updatedAt ? `Updated ${formatDate(capital.updatedAt)}` : "Tap the pencil to set it"}
          </p>
        </>
      )}
    </div>
  );
}
