"use client";

import { useState, useTransition } from "react";
import { saveOrder } from "@/app/actions";
import { formatINR, todayLocal } from "@/lib/format";
import type { Order } from "@/lib/types";
import { buttonClass, Field, inputClass } from "./ui";

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

export function OrderForm({ order, products, onDone }: { order: Order | null; products: string[]; onDone: () => void }) {
  const [qty, setQty] = useState(String(order?.qty ?? 1));
  const [rate, setRate] = useState(order ? String(order.rate) : "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const total = (Number(qty) || 0) * (Number(rate) || 0);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await saveOrder(form);
      if (result.ok) onDone();
      else setError(result.error);
    });
  }

  return (
    <form onSubmit={submit}>
      {order && <input type="hidden" name="id" value={order.id} />}

      <div className="space-y-4 px-5 pb-4 pt-2 md:px-6">
        <Field label="Customer Name">
          <input name="customerName" required autoComplete="off" autoCapitalize="words" defaultValue={order?.customerName} className={inputClass} placeholder="Full name" />
        </Field>

        <Field label="Mobile No.">
          <input name="mobile" type="tel" inputMode="tel" required autoComplete="off" defaultValue={order?.mobile} className={inputClass} placeholder="10-digit number" />
        </Field>

        <Field label="Address" hint="House, street, area">
          <textarea name="address" required rows={3} defaultValue={order?.address} className={`${inputClass} resize-none`} placeholder={"House name / No.\nStreet, area"} />
        </Field>

        <div className="grid grid-cols-[1fr_8.5rem] gap-3">
          <Field label="City / District">
            <input name="city" required autoCapitalize="words" defaultValue={order?.city} className={inputClass} />
          </Field>
          <Field label="Pincode">
            <input name="pincode" required inputMode="numeric" pattern="\d{6}" maxLength={6} title="6-digit pincode" defaultValue={order?.pincode} className={`${inputClass} tracking-wider`} />
          </Field>
        </div>

        <Field label="State">
          <input name="state" required list="state-options" autoComplete="off" defaultValue={order?.state ?? "Kerala"} className={inputClass} />
          <datalist id="state-options">
            {STATES.map((s) => <option key={s} value={s} />)}
          </datalist>
        </Field>

        <div className="h-px bg-line" />

        <Field label="Product">
          <input name="product" required list="product-options" autoComplete="off" defaultValue={order?.product} className={inputClass} placeholder="What did they order?" />
          <datalist id="product-options">
            {products.map((p) => <option key={p} value={p} />)}
          </datalist>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Qty">
            <input name="qty" required inputMode="numeric" pattern="\d+" value={qty} onChange={(e) => setQty(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Per piece rate">
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">₹</span>
              <input name="rate" required inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} className={`${inputClass} pl-8`} placeholder="0" />
            </div>
          </Field>
        </div>

        <Field label="Order date">
          <input name="date" type="date" required defaultValue={order?.date ?? todayLocal()} className={`${inputClass} min-h-[50px]`} />
        </Field>
      </div>

      <div className="sticky bottom-0 border-t border-line bg-surface/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:px-6 md:pb-5">
        {error && <p className="mb-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>}
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted">Total</p>
            <p className="truncate text-xl font-semibold tracking-tight">{formatINR(total)}</p>
          </div>
          <button type="submit" disabled={pending} className={`${buttonClass.primary} min-w-36`}>
            {pending ? "Saving…" : order ? "Save changes" : "Add order"}
          </button>
        </div>
      </div>
    </form>
  );
}
