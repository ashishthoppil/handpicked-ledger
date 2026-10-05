import type { Metadata } from "next";
import { OrdersView } from "@/components/orders-view";
import { getOrders } from "@/lib/data";
import { todayIST } from "@/lib/format";

export const metadata: Metadata = { title: "Income" };

export default async function IncomePage() {
  const orders = await getOrders();
  return <OrdersView orders={orders} thisMonth={todayIST().slice(0, 7)} />;
}
