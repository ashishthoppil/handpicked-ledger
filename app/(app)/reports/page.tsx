import type { Metadata } from "next";
import { Wallet } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { cn } from "@/lib/cn";
import { getCapital, getReport } from "@/lib/data";
import { formatDate, formatINR, formatMonth, formatSignedINR } from "@/lib/format";

export const metadata: Metadata = { title: "Financial Reports" };

export default async function ReportsPage() {
  const [report, capital] = await Promise.all([getReport(), getCapital()]);
  const { month, year, average } = report;

  return (
    <>
      <PageHeader title="Financial Reports" subtitle={`As of ${formatDate(report.today)}`} />

      <div className="grid gap-4 md:grid-cols-2">
        <PeriodCard
          eyebrow="This month"
          period={formatMonth(month.key)}
          income={month.income}
          expense={month.expense}
          profit={month.profit}
          note={`${month.orders} ${month.orders === 1 ? "order" : "orders"}`}
        />
        <PeriodCard
          eyebrow="This year"
          period={year.key}
          income={year.income}
          expense={year.expense}
          profit={year.profit}
          note={`${year.orders} ${year.orders === 1 ? "order" : "orders"}`}
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[2fr_1fr]">
        <section className="rounded-3xl border border-line bg-surface p-5 md:p-6">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Monthly average</h2>
            <span className="text-xs text-muted">
              {average.months
                ? `${average.months} ${average.months === 1 ? "month" : "months"} since ${formatMonth(average.since!, true)} ${average.since!.slice(0, 4)}`
                : "No data yet"}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Figure label="Income" value={formatINR(average.income)} />
            <Figure label={average.profit < 0 ? "Loss" : "Profit"} value={formatSignedINR(average.profit)} tone={toneOf(average.profit)} />
          </div>
        </section>

        <section className="rounded-3xl border border-line bg-surface p-5 md:p-6">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            <Wallet className="size-3.5" /> Current capital
          </h2>
          <p className="mt-4 text-2xl font-semibold tracking-tight">{formatINR(capital.amount)}</p>
          <p className="mt-1 text-xs text-muted">
            {capital.updatedAt ? `Updated ${formatDate(capital.updatedAt)}` : "Set it from the sidebar"}
          </p>
        </section>
      </div>

      <section className="mt-4 overflow-hidden rounded-3xl border border-line bg-surface">
        <h2 className="px-5 pb-2 pt-5 text-xs font-semibold uppercase tracking-[0.12em] text-muted md:px-6">
          Month by month · {year.key}
        </h2>
        <table className="w-full text-sm">
          <thead className="text-xs text-muted">
            <tr>
              <th className="px-5 py-2 text-left font-medium md:px-6">Month</th>
              <th className="px-2 py-2 text-right font-medium">Income</th>
              <th className="px-2 py-2 text-right font-medium">Expense</th>
              <th className="px-5 py-2 text-right font-medium md:px-6">P / L</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line tabular-nums">
            {report.yearMonths.map((row) => (
              <tr key={row.month}>
                <td className="px-5 py-3 font-medium md:px-6">{formatMonth(row.month, true)}</td>
                <td className="px-2 py-3 text-right">{formatINR(row.income)}</td>
                <td className="px-2 py-3 text-right text-muted">{formatINR(row.expense)}</td>
                <td className={cn("px-5 py-3 text-right font-medium md:px-6", toneClass(toneOf(row.profit)))}>
                  {formatSignedINR(row.profit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

type Tone = "positive" | "negative" | "neutral";

function toneOf(value: number): Tone {
  return value > 0 ? "positive" : value < 0 ? "negative" : "neutral";
}

function toneClass(tone: Tone) {
  return tone === "positive" ? "text-emerald-600 dark:text-emerald-400" : tone === "negative" ? "text-rose-600 dark:text-rose-400" : "";
}

function PeriodCard({
  eyebrow,
  period,
  income,
  expense,
  profit,
  note,
}: {
  eyebrow: string;
  period: string;
  income: number;
  expense: number;
  profit: number;
  note: string;
}) {
  const tone = toneOf(profit);
  return (
    <section className="rounded-3xl border border-line bg-surface p-5 md:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{eyebrow}</h2>
        <span className="text-xs font-medium text-muted">{period}</span>
      </div>

      <p className="mt-5 text-sm text-muted">{profit < 0 ? "Loss" : "Profit"}</p>
      <p className={cn("text-4xl font-semibold tracking-tight", toneClass(tone))}>{formatSignedINR(profit)}</p>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-4">
        <Figure label="Income" value={formatINR(income)} hint={note} />
        <Figure label="Expense" value={formatINR(expense)} />
      </div>
    </section>
  );
}

function Figure({ label, value, hint, tone = "neutral" }: { label: string; value: string; hint?: string; tone?: Tone }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted">{label}</p>
      <p className={cn("mt-0.5 truncate text-lg font-semibold tracking-tight", toneClass(tone))}>{value}</p>
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}
