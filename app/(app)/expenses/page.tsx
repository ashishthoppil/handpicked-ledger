import type { Metadata } from "next";
import { ExpensesView } from "@/components/expenses-view";
import { getExpenses } from "@/lib/data";
import { todayIST } from "@/lib/format";

export const metadata: Metadata = { title: "Expense" };

export default async function ExpensesPage() {
  const expenses = await getExpenses();
  return <ExpensesView expenses={expenses} thisMonth={todayIST().slice(0, 7)} />;
}
