import type { Metadata } from "next";
import { BrandMark } from "@/components/sidebar";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Unlock" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  const configured = Boolean(process.env.APP_PASSCODE);

  return (
    <main className="flex min-h-dvh items-center justify-center px-5 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandMark className="size-14 rounded-2xl text-2xl!" />
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">Handpicked Ledger</h1>
          <p className="mt-1 text-sm text-muted">Enter your passcode to continue</p>
        </div>
        {configured ? (
          <LoginForm next={typeof next === "string" ? next : ""} />
        ) : (
          <p className="rounded-2xl border border-line bg-surface p-4 text-center text-sm text-muted">
            Set the <code className="font-mono text-foreground">APP_PASSCODE</code> environment variable on the server, then
            redeploy.
          </p>
        )}
      </div>
    </main>
  );
}
