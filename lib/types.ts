export type Order = {
  id: number;
  date: string; // YYYY-MM-DD
  customerName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  mobile: string;
  product: string;
  qty: number;
  rate: number;
  total: number;
  dispatchedAt: string | null; // YYYY-MM-DD, null until dispatched
};

export type Expense = {
  id: number;
  date: string; // YYYY-MM-DD
  name: string;
  amount: number;
};

export type Capital = {
  amount: number; // current capital = base + income − expenses entered since it was set
  base: number; // amount last set by hand
  setOn: string | null; // YYYY-MM-DD the base was set, null if never set
  change: number; // income − expenses entered since then
};

export type ActionResult = { ok: true } | { ok: false; error: string };
