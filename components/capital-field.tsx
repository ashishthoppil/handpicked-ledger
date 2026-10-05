"use client";

import { useState, useTransition } from "react";
import { Check, Pencil, Wallet, X } from "lucide-react";
import { saveCapital } from "@/app/actions";
import { formatDate, formatINR, formatSignedINR } from "@/lib/format";
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
          {error ? (
            <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">{error}</p>
          ) : (
            <p className="mt-2 text-xs text-muted">New income and expenses will adjust it from here.</p>
          )}
        </form>
      ) : (
        <>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{formatINR(capital.amount)}</p>
          <CapitalNote capital={capital} />
        </>
      )}
    </div>
  );
}

/** "Set ₹45,000 on 5 Oct" + the net change from entries since then. */
export function CapitalNote({ capital }: { capital: Capital }) {
  const changeClass =
    capital.change > 0 ? "text-emerald-600 dark:text-emerald-400" : capital.change < 0 ? "text-rose-600 dark:text-rose-400" : "";
  return (
    <div className="mt-0.5 space-y-0.5 text-xs text-muted">
      <p>{capital.setOn ? `Set to ${formatINR(capital.base)} on ${formatDate(capital.setOn, false)}` : "Income − expenses so far"}</p>
      {capital.setOn && capital.change !== 0 && (
        <p>
          <span className={changeClass}>{formatSignedINR(capital.change)}</span> from entries since
        </p>
      )}
    </div>
  );
}
