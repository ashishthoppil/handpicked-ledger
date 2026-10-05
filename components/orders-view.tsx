"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import { CircleCheck, Package, Pencil, Phone, Plus, Printer, Search, Trash2, Truck } from "lucide-react";
import { deleteOrder, setDispatched } from "@/app/actions";
import { formatDate, formatINR, fullAddress, todayLocal } from "@/lib/format";
import type { Order } from "@/lib/types";
import { PageHeader } from "./app-shell";
import { useLabelFormat, useLabelPrinter } from "./label-printer";
import { OrderForm } from "./order-form";
import { buttonClass, cn, EmptyState, Sheet, Stat } from "./ui";

const PAGE = 50;

type View = "all" | "pending";

export function OrdersView({ orders: savedOrders, thisMonth }: { orders: Order[]; thisMonth: string }) {
  const [orders, applyDispatch] = useOptimistic(
    savedOrders,
    (state, change: { id: number; dispatchedAt: string | null }) =>
      state.map((o) => (o.id === change.id ? { ...o, dispatchedAt: change.dispatchedAt } : o)),
  );
  const [view, setView] = useState<View>("all");
  // Orders dispatched while viewing "Not dispatched" stay visible until the filter changes.
  const [justDispatched, setJustDispatched] = useState<number[]>([]);
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editor, setEditor] = useState<{ key: number; order: Order | null } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [, startTransition] = useTransition();
  const { print, portal } = useLabelPrinter();

  const products = useMemo(() => [...new Set(orders.map((o) => o.product))].slice(0, 50), [orders]);

  const pendingCount = useMemo(() => orders.filter((o) => !o.dispatchedAt).length, [orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter(
      (o) =>
        (view === "all" || !o.dispatchedAt || justDispatched.includes(o.id)) &&
        (!q ||
          [o.customerName, o.product, o.mobile, o.address, o.city, o.state, o.pincode].some((v) =>
            v.toLowerCase().includes(q),
          )),
    );
  }, [orders, query, view, justDispatched]);

  const month = useMemo(() => {
    const list = orders.filter((o) => o.date.startsWith(thisMonth));
    return { count: list.length, total: list.reduce((sum, o) => sum + o.total, 0) };
  }, [orders, thisMonth]);

  function openEditor(order: Order | null) {
    setEditor({ key: Date.now(), order });
    setSheetOpen(true);
  }

  function remove(order: Order) {
    if (!window.confirm(`Delete the order for ${order.customerName}?`)) return;
    setDeletingId(order.id);
    startTransition(async () => {
      const result = await deleteOrder(order.id);
      setDeletingId(null);
      if (!result.ok) window.alert(result.error);
    });
  }

  function toggleDispatch(order: Order) {
    const dispatched = !order.dispatchedAt;
    if (!dispatched && !window.confirm(`Mark the order for ${order.customerName} as not dispatched?`)) return;
    if (dispatched) setJustDispatched((ids) => [...ids, order.id]);
    startTransition(async () => {
      applyDispatch({ id: order.id, dispatchedAt: dispatched ? todayLocal() : null });
      const result = await setDispatched(order.id, dispatched);
      if (!result.ok) window.alert(result.error);
    });
  }

  function changeView(next: View) {
    setView(next);
    setJustDispatched([]);
    setLimit(PAGE);
  }

  const visible = filtered.slice(0, limit);
  const newButton = (
    <button type="button" onClick={() => openEditor(null)} className={buttonClass.primary}>
      <Plus className="size-[18px]" /> New order
    </button>
  );

  return (
    <>
      <PageHeader title="Income" subtitle="Orders and courier labels" action={newButton} />

      <div className="mb-5 grid grid-cols-2 gap-3">
        <Stat label="This month" value={formatINR(month.total)} tone="income" />
        <Stat label="Orders this month" value={String(month.count)} />
      </div>

      {orders.length > 0 && (
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative lg:flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setLimit(PAGE); }}
              placeholder="Search name, product, phone, pincode"
              className="h-11 w-full rounded-xl border border-line bg-surface pl-10 pr-3 text-[16px] outline-none transition placeholder:text-muted/70 focus:border-foreground/30 focus:ring-4 focus:ring-foreground/5"
            />
          </div>
          <div className="flex gap-3">
            <DispatchFilter view={view} onChange={changeView} total={orders.length} pending={pendingCount} />
            <LabelFormatToggle />
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <EmptyState
          icon={<Package className="size-6" />}
          title="No orders yet"
          text="Add your first order to start tracking income and printing courier labels."
          action={newButton}
        />
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">
          {query ? `No orders match “${query}”.` : "All caught up — every order has been dispatched."}
        </p>
      ) : (
        <>
          {/* Phone: cards */}
          <ul className="space-y-3 md:hidden">
            {visible.map((order) => (
              <li key={order.id} className={cn("rounded-2xl border border-line bg-surface p-4 transition", deletingId === order.id && "opacity-40")}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{order.customerName}</p>
                    <p className="mt-0.5 truncate text-sm text-muted">
                      {order.product} × {order.qty} · {formatDate(order.date, false)}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold text-emerald-600 dark:text-emerald-400">{formatINR(order.total)}</p>
                </div>
                <p className="mt-2.5 line-clamp-2 text-sm leading-snug text-muted">{fullAddress(order)}</p>
                <a href={`tel:${order.mobile}`} className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-medium">
                  <Phone className="size-3.5 text-muted" /> {order.mobile}
                </a>
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
                  <DispatchButton order={order} onToggle={toggleDispatch} />
                  <RowActions order={order} onPrint={print} onEdit={openEditor} onDelete={remove} />
                </div>
              </li>
            ))}
          </ul>

          {/* Laptop: table */}
          <div className="hidden overflow-hidden rounded-2xl border border-line bg-surface md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="whitespace-nowrap border-b border-line text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="py-3 pl-4 pr-3 font-medium">Customer Name</th>
                    <th className="px-3 py-3 font-medium">Product</th>
                    <th className="px-3 py-3 text-right font-medium">Qty</th>
                    <th className="px-3 py-3 text-right font-medium">Total price</th>
                    <th className="px-3 py-3 font-medium">Address</th>
                    <th className="px-3 py-3 font-medium">Mobile No.</th>
                    <th className="px-3 py-3 font-medium">Dispatch</th>
                    <th className="px-3 py-3 font-medium"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {visible.map((order) => (
                    <tr key={order.id} className={cn("align-top transition hover:bg-background/60", deletingId === order.id && "opacity-40")}>
                      <td className="py-3.5 pl-4 pr-3">
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-xs text-muted">{formatDate(order.date)}</p>
                      </td>
                      <td className="px-3 py-3.5">{order.product}</td>
                      <td className="px-3 py-3.5 text-right tabular-nums">{order.qty}</td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-right font-medium tabular-nums">{formatINR(order.total)}</td>
                      <td className="max-w-60 px-3 py-3.5 text-muted"><p className="line-clamp-2">{fullAddress(order)}</p></td>
                      <td className="whitespace-nowrap px-3 py-3.5 tabular-nums">{order.mobile}</td>
                      <td className="px-3 py-2.5">
                        <DispatchButton order={order} onToggle={toggleDispatch} />
                      </td>
                      <td className="px-3 py-2.5">
                        <RowActions order={order} onPrint={print} onEdit={openEditor} onDelete={remove} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filtered.length > limit && (
            <div className="mt-4 text-center">
              <button type="button" onClick={() => setLimit((n) => n + PAGE)} className={buttonClass.secondary}>
                Show more ({filtered.length - limit} left)
              </button>
            </div>
          )}
        </>
      )}

      <button
        type="button"
        onClick={() => openEditor(null)}
        className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-4 z-10 flex size-14 items-center justify-center rounded-2xl bg-foreground text-background shadow-lg shadow-black/20 transition active:scale-95 md:hidden"
        aria-label="New order"
      >
        <Plus className="size-6" />
      </button>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editor?.order ? "Edit order" : "New order"}>
        {editor && <OrderForm key={editor.key} order={editor.order} products={products} onDone={() => setSheetOpen(false)} />}
      </Sheet>

      {portal}
    </>
  );
}

function RowActions({
  order,
  onPrint,
  onEdit,
  onDelete,
}: {
  order: Order;
  onPrint: (order: Order) => void;
  onEdit: (order: Order) => void;
  onDelete: (order: Order) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={() => onPrint(order)}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-[13px] font-medium transition hover:bg-foreground hover:text-background active:scale-95"
      >
        <Printer className="size-4" /> Print
      </button>
      <button type="button" onClick={() => onEdit(order)} className={buttonClass.icon} aria-label="Edit order">
        <Pencil className="size-4" />
      </button>
      <button type="button" onClick={() => onDelete(order)} className={cn(buttonClass.icon, "hover:text-rose-600")} aria-label="Delete order">
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

function DispatchButton({ order, onToggle }: { order: Order; onToggle: (order: Order) => void }) {
  const base =
    "inline-flex h-9 min-w-[7.5rem] items-center justify-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold transition active:scale-95";
  return order.dispatchedAt ? (
    <button
      type="button"
      onClick={() => onToggle(order)}
      title={`Dispatched on ${formatDate(order.dispatchedAt)}. Click to undo.`}
      className={cn(base, "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15 dark:text-emerald-400")}
    >
      <CircleCheck className="size-4" /> Dispatched
    </button>
  ) : (
    <button type="button" onClick={() => onToggle(order)} className={cn(base, "bg-rose-600 text-white hover:bg-rose-700")}>
      <Truck className="size-4" /> Dispatch
    </button>
  );
}

function DispatchFilter({
  view,
  onChange,
  total,
  pending,
}: {
  view: View;
  onChange: (view: View) => void;
  total: number;
  pending: number;
}) {
  const options: { value: View; label: string; count: number }[] = [
    { value: "all", label: "All", count: total },
    { value: "pending", label: "Not dispatched", count: pending },
  ];
  return (
    <div
      className="grid h-11 flex-1 grid-cols-2 items-center rounded-xl border border-line bg-surface p-1 lg:flex lg:flex-none"
      role="radiogroup"
      aria-label="Show orders"
    >
      {options.map(({ value, label, count }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={view === value}
          onClick={() => onChange(value)}
          className={cn(
            "flex h-full items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-[13px] font-medium transition",
            view === value ? "bg-foreground text-background" : "text-muted hover:text-foreground",
          )}
        >
          {label}
          <span
            className={cn(
              "min-w-5 rounded-full px-1.5 text-[11px] font-semibold leading-5 tabular-nums",
              value === "pending" && count > 0 ? "bg-rose-600 text-white" : view === value ? "bg-background/20" : "bg-background",
            )}
          >
            {count}
          </span>
        </button>
      ))}
    </div>
  );
}

function LabelFormatToggle() {
  const [format, setFormat] = useLabelFormat();
  return (
    <div className="hidden h-11 items-center rounded-xl border border-line bg-surface p-1 md:flex" role="radiogroup" aria-label="Label paper">
      <span className="px-2.5 text-xs text-muted">Label</span>
      {(["a4", "thermal"] as const).map((value) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={format === value}
          onClick={() => setFormat(value)}
          className={cn(
            "h-full rounded-lg px-3 text-[13px] font-medium transition",
            format === value ? "bg-foreground text-background" : "text-muted hover:text-foreground",
          )}
        >
          {value === "a4" ? "A4 sheet" : "4×6 thermal"}
        </button>
      ))}
    </div>
  );
}
