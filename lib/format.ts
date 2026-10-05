const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatINR(value: number): string {
  return inr.format(value);
}

/** Signed amount for profit/loss, e.g. "+₹4,200" or "−₹1,050". */
export function formatSignedINR(value: number): string {
  if (value === 0) return inr.format(0);
  return `${value > 0 ? "+" : "−"}${inr.format(Math.abs(value))}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "2026-10-05" → "5 Oct 2026" (or "5 Oct" when `withYear` is false). */
export function formatDate(isoDate: string, withYear = true): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return withYear ? `${d} ${MONTHS[m - 1]} ${y}` : `${d} ${MONTHS[m - 1]}`;
}

/** "2026-10" → "October 2026" */
export function formatMonth(monthKey: string, short = false): string {
  const [y, m] = monthKey.split("-").map(Number);
  return short ? MONTHS[m - 1] : `${MONTHS_LONG[m - 1]} ${y}`;
}

/** Today's date in India as "YYYY-MM-DD", regardless of server timezone. */
export function todayIST(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

/** Today's date in the device's timezone as "YYYY-MM-DD". */
export function todayLocal(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function fullAddress(order: { address: string; city: string; state: string; pincode: string }): string {
  const parts = [order.address.replace(/\s*\n\s*/g, ", "), order.city, order.state].filter(Boolean);
  return `${parts.join(", ")}${order.pincode ? ` – ${order.pincode}` : ""}`;
}
