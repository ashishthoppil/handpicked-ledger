import { AppShell } from "@/components/app-shell";
import { getCapital } from "@/lib/data";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const capital = await getCapital();
  return <AppShell capital={capital}>{children}</AppShell>;
}
