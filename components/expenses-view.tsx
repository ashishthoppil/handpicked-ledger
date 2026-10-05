"use client";

import { useMemo, useState, useTransition } from "react";
import { Pencil, Plus, Receipt, Search, Trash2 } from "lucide-react";
import { deleteExpense, saveExpense } from "@/app/actions";
import { formatDate, formatINR, todayLocal } from "@/lib/format";
import type { Expense } from "@/lib/types";
import { PageHeader } from "./app-shell";
import { buttonClass, cn, EmptyState, Field, inputClass, Sheet, Stat } from "./ui";

const PAGE = 50;

export function ExpensesView({ expenses, thisMonth }: { expenses: Expense[]; thisMonth: string }) {
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editor, setEditor] = useState<{ key: number; expense: Expense | null } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  const names = useMemo(() => [...new Set(expenses.map((e) => e.name))].slice(0, 50), [expenses]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? expenses.filter((e) => e.name.toLowerCase().includes(q)) : expenses;
  }, [expenses, query]);

  const month = useMemo(() => {
    const list = expenses.filter((e) => e.date.startsWith(thisMonth));
    return { count: list.length, total: list.reduce((sum, e) => sum + e.amount, 0) };
  }, [expenses, thisMonth]);

  function openEditor(expense: Expense | null) {
    setEditor({ key: Date.now(), expense });
    setSheetOpen(true);
  }

  function remove(expense: Expense) {
    if (!window.confirm(`Delete “${expense.name}”?`)) return;
    setDeletingId(expense.id);
    startTransition(async () => {
      const result = await deleteExpense(expense.id);
      setDeletingId(null);
      if (!result.ok) window.alert(result.error);
    });
  }

  const visible = filtered.slice(0, limit);
  const newButton = (
    <button type="button" onClick={() => openEditor(null)} className={buttonClass.primary}>
      <Plus className="size-[18px]" /> New expense
    </button>
  );

  return (
    <>
      <PageHeader title="Expense" subtitle="Everything you spend on the business" action={newButton} />

      <div className="mb-5 grid grid-cols-2 gap-3">
        <Stat label="This month" value={formatINR(month.total)} tone="expense" />
        <Stat label="Entries this month" value={String(month.count)} />
      </div>

      {expenses.length > 0 && (
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setLimit(PAGE); }}
            placeholder="Search expenses"
            className="h-11 w-full rounded-xl border border-line bg-surface pl-10 pr-3 text-[16px] outline-none transition placeholder:text-muted/70 focus:border-foreground/30 focus:ring-4 focus:ring-foreground/5"
          />
        </div>
      )}

      {expenses.length === 0 ? (
        <EmptyState
          icon={<Receipt className="size-6" />}
          title="No expenses yet"
          text="Record packaging, courier charges, stock purchases and anything else you spend."
          action={newButton}
        />
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">No expenses match “{query}”.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Expense</th>
                <th className="px-4 py-3 text-right font-medium">Price</th>
                <th className="w-0 px-2 py-3 font-medium"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((expense) => (
                <tr key={expense.id} className={cn("transition hover:bg-background/60", deletingId === expense.id && "opacity-40")}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{expense.name}</p>
                    <p className="text-xs text-muted">{formatDate(expense.date)}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-rose-600 dark:text-rose-400">
                    {formatINR(expense.amount)}
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center justify-end">
                      <button type="button" onClick={() => openEditor(expense)} className={buttonClass.icon} aria-label="Edit expense">
                        <Pencil className="size-4" />
                      </button>
                      <button type="button" onClick={() => remove(expense)} className={cn(buttonClass.icon, "hover:text-rose-600")} aria-label="Delete expense">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > limit && (
        <div className="mt-4 text-center">
          <button type="button" onClick={() => setLimit((n) => n + PAGE)} className={buttonClass.secondary}>
            Show more ({filtered.length - limit} left)
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => openEditor(null)}
        className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-4 z-10 flex size-14 items-center justify-center rounded-2xl bg-foreground text-background shadow-lg shadow-black/20 transition active:scale-95 md:hidden"
        aria-label="New expense"
      >
        <Plus className="size-6" />
      </button>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editor?.expense ? "Edit expense" : "New expense"}>
        {editor && <ExpenseForm key={editor.key} expense={editor.expense} names={names} onDone={() => setSheetOpen(false)} />}
      </Sheet>
    </>
  );
}

function ExpenseForm({ expense, names, onDone }: { expense: Expense | null; names: string[]; onDone: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await saveExpense(form);
      if (result.ok) onDone();
      else setError(result.error);
    });
  }

  return (
    <form onSubmit={submit}>
      {expense && <input type="hidden" name="id" value={expense.id} />}
      <div className="space-y-4 px-5 pb-4 pt-2 md:px-6">
        <Field label="Expense name">
          <input name="name" required list="expense-options" autoComplete="off" defaultValue={expense?.name} className={inputClass} placeholder="e.g. Courier charges" />
          <datalist id="expense-options">
            {names.map((n) => <option key={n} value={n} />)}
          </datalist>
        </Field>
        <Field label="Price">
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">₹</span>
            <input name="amount" required inputMode="decimal" defaultValue={expense?.amount} className={`${inputClass} pl-8`} placeholder="0" />
          </div>
        </Field>
        <Field label="Date">
          <input name="date" type="date" required defaultValue={expense?.date ?? todayLocal()} className={`${inputClass} min-h-[50px]`} />
        </Field>
      </div>
      <div className="border-t border-line px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 md:px-6 md:pb-5">
        {error && <p className="mb-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>}
        <button type="submit" disabled={pending} className={`${buttonClass.primary} w-full`}>
          {pending ? "Saving…" : expense ? "Save changes" : "Add expense"}
        </button>
      </div>
    </form>
  );
}
