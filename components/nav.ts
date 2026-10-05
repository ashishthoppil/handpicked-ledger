import { ArrowDownLeft, ArrowUpRight, ChartPie } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/income", label: "Income", short: "Income", icon: ArrowDownLeft },
  { href: "/expenses", label: "Expense", short: "Expense", icon: ArrowUpRight },
  { href: "/reports", label: "Financial Reports", short: "Reports", icon: ChartPie },
] as const;
