"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { SESSION_COOKIE, SESSION_MAX_AGE, sessionToken } from "@/lib/session";
import type { ActionResult } from "@/lib/types";

class InvalidInput extends Error {}

function text(form: FormData, name: string, label: string, { required = true, max = 200 } = {}): string {
  const value = String(form.get(name) ?? "").trim();
  if (required && !value) throw new InvalidInput(`${label} is required.`);
  if (value.length > max) throw new InvalidInput(`${label} is too long.`);
  return value;
}

function amount(form: FormData, name: string, label: string, { integer = false } = {}): number {
  const raw = String(form.get(name) ?? "").replace(/[,\s₹]/g, "");
  const value = Number(raw);
  if (!raw || !Number.isFinite(value) || value < 0) throw new InvalidInput(`Enter a valid ${label.toLowerCase()}.`);
  if (integer && (!Number.isInteger(value) || value < 1)) throw new InvalidInput(`${label} must be a whole number.`);
  if (value > 1e9) throw new InvalidInput(`${label} is too large.`);
  return integer ? value : Math.round(value * 100) / 100;
}

function date(form: FormData): string {
  const value = String(form.get("date") ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) {
    throw new InvalidInput("Pick a valid date.");
  }
  return value;
}

function optionalId(form: FormData): number | null {
  const raw = form.get("id");
  if (!raw) return null;
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) throw new InvalidInput("Invalid record.");
  return id;
}

async function run(fn: () => Promise<void>): Promise<ActionResult> {
  await requireSession();
  try {
    await fn();
  } catch (error) {
    if (error instanceof InvalidInput) return { ok: false, error: error.message };
    console.error(error);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

// ── Orders ────────────────────────────────────────────────────────────────

export async function saveOrder(form: FormData): Promise<ActionResult> {
  return run(async () => {
    const id = optionalId(form);
    const mobile = text(form, "mobile", "Mobile number", { max: 20 }).replace(/[\s-]/g, "");
    if (!/^\+?\d{10,13}$/.test(mobile)) throw new InvalidInput("Enter a valid mobile number.");
    const pincode = text(form, "pincode", "Pincode", { max: 6 }).replace(/\s/g, "");
    if (!/^\d{6}$/.test(pincode)) throw new InvalidInput("Pincode must be 6 digits.");

    const values = [
      date(form),
      text(form, "customerName", "Customer name", { max: 120 }),
      text(form, "address", "Address", { max: 500 }),
      text(form, "city", "City / District", { max: 80 }),
      text(form, "state", "State", { max: 80 }),
      pincode,
      mobile,
      text(form, "product", "Product", { max: 160 }),
      amount(form, "qty", "Quantity", { integer: true }),
      amount(form, "rate", "Per piece rate"),
    ];

    if (id) {
      await query(
        `UPDATE orders SET order_date = $1, customer_name = $2, address = $3, city = $4, state = $5,
                pincode = $6, mobile = $7, product = $8, qty = $9, rate = $10
          WHERE id = $11`,
        [...values, id],
      );
    } else {
      await query(
        `INSERT INTO orders (order_date, customer_name, address, city, state, pincode, mobile, product, qty, rate)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        values,
      );
    }
  });
}

export async function deleteOrder(id: number): Promise<ActionResult> {
  return run(async () => {
    if (!Number.isInteger(id)) throw new InvalidInput("Invalid record.");
    await query(`DELETE FROM orders WHERE id = $1`, [id]);
  });
}

// ── Expenses ──────────────────────────────────────────────────────────────

export async function saveExpense(form: FormData): Promise<ActionResult> {
  return run(async () => {
    const id = optionalId(form);
    const values = [date(form), text(form, "name", "Expense name", { max: 160 }), amount(form, "amount", "Price")];
    if (id) {
      await query(`UPDATE expenses SET expense_date = $1, name = $2, amount = $3 WHERE id = $4`, [...values, id]);
    } else {
      await query(`INSERT INTO expenses (expense_date, name, amount) VALUES ($1, $2, $3)`, values);
    }
  });
}

export async function deleteExpense(id: number): Promise<ActionResult> {
  return run(async () => {
    if (!Number.isInteger(id)) throw new InvalidInput("Invalid record.");
    await query(`DELETE FROM expenses WHERE id = $1`, [id]);
  });
}

// ── Capital ───────────────────────────────────────────────────────────────

export async function saveCapital(form: FormData): Promise<ActionResult> {
  return run(async () => {
    const value = amount(form, "capital", "Capital");
    await query(
      `INSERT INTO settings (key, value, updated_at) VALUES ('capital', $1, now())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
      [String(value)],
    );
  });
}

// ── Session ───────────────────────────────────────────────────────────────

export async function login(_prev: { error: string } | null, form: FormData): Promise<{ error: string } | null> {
  const passcode = process.env.APP_PASSCODE;
  if (!passcode) return { error: "APP_PASSCODE is not set on the server." };

  const attempt = String(form.get("passcode") ?? "");
  const token = await sessionToken(passcode);
  if ((await sessionToken(attempt)) !== token) {
    await new Promise((resolve) => setTimeout(resolve, 800)); // slow down guessing
    return { error: "Incorrect passcode." };
  }

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  const next = String(form.get("next") ?? "");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/income");
}

export async function logout(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
