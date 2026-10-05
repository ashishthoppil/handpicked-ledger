"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";
import { logout } from "@/app/actions";
import type { Capital } from "@/lib/types";
import { CapitalField } from "./capital-field";
import { NAV_ITEMS } from "./nav";
import { cn } from "./ui";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-xl bg-foreground text-[15px] font-semibold tracking-tight text-background",
        className,
      )}
    >
      H
    </span>
  );
}

export function Sidebar({ capital, onNavigate }: { capital: Capital; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]">
      <div className="flex items-center gap-3 px-2">
        <BrandMark />
        <div className="leading-tight">
          <p className="font-semibold tracking-tight">Handpicked</p>
          <p className="text-xs text-muted">by Mariam · Ledger</p>
        </div>
      </div>

      <nav className="mt-8 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition",
                active ? "bg-foreground text-background" : "text-muted hover:bg-background hover:text-foreground",
              )}
            >
              <Icon className="size-[18px]" strokeWidth={2.2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3 pt-8">
        <CapitalField capital={capital} />
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-background hover:text-foreground"
          >
            <Lock className="size-4" /> Lock app
          </button>
        </form>
      </div>
    </div>
  );
}
