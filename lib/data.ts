import "server-only";
import { requireSession } from "./auth";
import { query } from "./db";
import { todayIST } from "./format";
import type { Capital, Expense, Order } from "./types";

export async function getOrders(): Promise<Order[]> {
  await requireSession();
  return query<Order>(
    `SELECT id, order_date::text AS date, customer_name AS "customerName", address, city, state,
            pincode, mobile, product, qty, rate::float8 AS rate, (qty * rate)::float8 AS total,
            (dispatched_at AT TIME ZONE 'Asia/Kolkata')::date::text AS "dispatchedAt"
       FROM orders
      ORDER BY order_date DESC, id DESC`,
  );
}

export async function getExpenses(): Promise<Expense[]> {
  await requireSession();
  return query<Expense>(
    `SELECT id, expense_date::text AS date, name, amount::float8 AS amount
       FROM expenses
      ORDER BY expense_date DESC, id DESC`,
  );
}

/**
 * Capital is the amount last set by hand plus every order minus every expense
 * entered after that moment. Edits and deletes of those entries flow through too.
 */
export async function getCapital(): Promise<Capital> {
  await requireSession();
  const [row] = await query<{ base: number; setOn: string | null; income: number; expense: number }>(
    `WITH anchor AS (
       SELECT value::numeric AS base, updated_at FROM settings WHERE key = 'capital'
     ), since AS (
       SELECT COALESCE((SELECT updated_at FROM anchor), '-infinity'::timestamptz) AS at
     )
     SELECT COALESCE((SELECT base FROM anchor), 0)::float8 AS base,
            (SELECT (updated_at AT TIME ZONE 'Asia/Kolkata')::date::text FROM anchor) AS "setOn",
            COALESCE((SELECT SUM(qty * rate) FROM orders, since WHERE created_at > since.at), 0)::float8 AS income,
            COALESCE((SELECT SUM(amount) FROM expenses, since WHERE created_at > since.at), 0)::float8 AS expense`,
  );
  const change = row.income - row.expense;
  return { amount: row.base + change, base: row.base, setOn: row.setOn, change };
}

export type MonthRow = { month: string; income: number; expense: number; profit: number };

export type Report = {
  today: string;
  month: { key: string; income: number; expense: number; profit: number; orders: number };
  year: { key: string; income: number; expense: number; profit: number; orders: number };
  average: { months: number; since: string | null; income: number; profit: number };
  yearMonths: MonthRow[];
};

export async function getReport(): Promise<Report> {
  await requireSession();
  const [incomeRows, expenseRows] = await Promise.all([
    query<{ month: string; total: number; orders: number }>(
      `SELECT to_char(order_date, 'YYYY-MM') AS month, SUM(qty * rate)::float8 AS total, COUNT(*)::int AS orders
         FROM orders GROUP BY 1`,
    ),
    query<{ month: string; total: number }>(
      `SELECT to_char(expense_date, 'YYYY-MM') AS month, SUM(amount)::float8 AS total
         FROM expenses GROUP BY 1`,
    ),
  ]);

  const today = todayIST();
  const monthKey = today.slice(0, 7);
  const yearKey = today.slice(0, 4);

  const income = new Map(incomeRows.map((r) => [r.month, r]));
  const expense = new Map(expenseRows.map((r) => [r.month, r.total]));
  const sum = (filter: (month: string) => boolean) => {
    let inc = 0, exp = 0, orders = 0;
    for (const r of incomeRows) if (filter(r.month)) { inc += r.total; orders += r.orders; }
    for (const r of expenseRows) if (filter(r.month)) exp += r.total;
    return { income: inc, expense: exp, profit: inc - exp, orders };
  };

  // Average over every month from the first recorded entry up to this month.
  const allMonths = [...income.keys(), ...expense.keys()].filter((m) => m <= monthKey).sort();
  const since = allMonths[0] ?? null;
  const months = since ? monthsBetween(since, monthKey) : 0;
  const total = sum((m) => m <= monthKey);

  // This year's months, newest first, starting from the first recorded entry.
  const currentMonth = Number(monthKey.slice(5, 7));
  const firstMonth = since?.startsWith(yearKey) ? Number(since.slice(5, 7)) : 1;
  const yearMonths: MonthRow[] = [];
  for (let m = currentMonth; m >= firstMonth; m--) {
    const key = `${yearKey}-${String(m).padStart(2, "0")}`;
    const inc = income.get(key)?.total ?? 0;
    const exp = expense.get(key) ?? 0;
    yearMonths.push({ month: key, income: inc, expense: exp, profit: inc - exp });
  }

  return {
    today,
    month: { key: monthKey, ...sum((m) => m === monthKey) },
    year: { key: yearKey, ...sum((m) => m.startsWith(yearKey)) },
    average: {
      months,
      since,
      income: months ? total.income / months : 0,
      profit: months ? total.profit / months : 0,
    },
    yearMonths,
  };
}

function monthsBetween(from: string, to: string): number {
  const [fy, fm] = from.split("-").map(Number);
  const [ty, tm] = to.split("-").map(Number);
  return (ty - fy) * 12 + (tm - fm) + 1;
}
