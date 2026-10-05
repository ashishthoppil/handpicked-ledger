"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export { cn };

export const inputClass =
  "w-full rounded-xl border border-line bg-background/60 px-3.5 py-3 text-[16px] leading-6 outline-none transition placeholder:text-muted/60 focus:border-foreground/30 focus:bg-surface focus:ring-4 focus:ring-foreground/5";

export const buttonClass = {
  primary:
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-[15px] font-medium text-background transition hover:opacity-90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
  secondary:
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 text-[15px] font-medium transition hover:bg-background active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
  icon: "inline-flex size-9 items-center justify-center rounded-lg text-muted transition hover:bg-background hover:text-foreground active:scale-95 disabled:opacity-40",
};

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between gap-2 text-[13px] font-medium text-muted">
        {label}
        {hint && <span className="text-[12px] font-normal text-muted/70">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

/** Opens/closes a native <dialog> as a modal in sync with `open`. */
function useModal(open: boolean) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return ref;
}

/** Bottom sheet on phones, centred dialog on larger screens. */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useModal(open);
  return (
    <dialog
      ref={ref}
      className="sheet"
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-label={title}
    >
      <div className="flex max-h-[92dvh] flex-col md:max-h-[88dvh]">
        <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-line md:hidden" />
        <div className="flex shrink-0 items-center justify-between px-5 pb-2 pt-3 md:px-6 md:pt-5">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <button type="button" onClick={onClose} className={buttonClass.icon} aria-label="Close">
            <X className="size-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </dialog>
  );
}

export function Drawer({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  const ref = useModal(open);
  return (
    <dialog
      ref={ref}
      className="drawer"
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-label="Menu"
    >
      {children}
    </dialog>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-surface/50 px-6 py-14 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-background text-muted">{icon}</div>
      <p className="font-medium">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-muted">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Stat({ label, value, tone }: { label: string; value: string; tone?: "income" | "expense" }) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-4 py-3.5">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p
        className={cn(
          "mt-1 truncate text-xl font-semibold tracking-tight md:text-2xl",
          tone === "income" && "text-emerald-600 dark:text-emerald-400",
          tone === "expense" && "text-rose-600 dark:text-rose-400",
        )}
      >
        {value}
      </p>
    </div>
  );
}
