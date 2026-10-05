"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import type { Capital } from "@/lib/types";
import { NAV_ITEMS } from "./nav";
import { Sidebar } from "./sidebar";
import { buttonClass, cn, Drawer } from "./ui";

export function AppShell({ capital, children }: { capital: Capital; children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const current = NAV_ITEMS.find((item) => pathname.startsWith(item.href));

  return (
    <div className="min-h-dvh md:pl-[272px]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[272px] border-r border-line bg-surface md:block">
        <Sidebar capital={capital} />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 border-b border-line/60 bg-background/80 pt-[env(safe-area-inset-top)] backdrop-blur-xl md:hidden">
        <div className="flex h-14 items-center gap-2 px-2">
          <button type="button" onClick={() => setMenuOpen(true)} className={cn(buttonClass.icon, "size-10")} aria-label="Open menu">
            <Menu className="size-[22px]" />
          </button>
          <p className="text-[17px] font-semibold tracking-tight">{current?.label ?? "Ledger"}</p>
        </div>
      </header>

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)}>
        <Sidebar capital={capital} onNavigate={() => setMenuOpen(false)} />
      </Drawer>

      <main className="mx-auto w-full max-w-6xl px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-5 md:px-10 md:pb-16 md:pt-10">
        {children}
      </main>

      {/* Mobile tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line/60 bg-surface/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        <div className="mx-auto grid h-16 max-w-md grid-cols-3">
          {NAV_ITEMS.map(({ href, short, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition",
                  active ? "text-foreground" : "text-muted",
                )}
              >
                <span className={cn("flex h-7 w-12 items-center justify-center rounded-full transition", active && "bg-foreground/10")}>
                  <Icon className="size-[19px]" strokeWidth={active ? 2.4 : 2} />
                </span>
                {short}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

/** Page title row with an optional action (hidden on phones, where a floating button is used). */
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h1 className="hidden text-3xl font-semibold tracking-tight md:block">{title}</h1>
        {subtitle && <p className="text-sm text-muted md:mt-1">{subtitle}</p>}
      </div>
      {action && <div className="hidden md:block">{action}</div>}
    </div>
  );
}
