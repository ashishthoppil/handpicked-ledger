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
};

export type Expense = {
  id: number;
  date: string; // YYYY-MM-DD
  name: string;
  amount: number;
};

export type Capital = {
  amount: number;
  updatedAt: string | null; // YYYY-MM-DD
};

export type ActionResult = { ok: true } | { ok: false; error: string };
