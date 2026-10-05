"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { buttonClass } from "@/components/ui";

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center rounded-2xl border border-line bg-surface px-6 py-14 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600">
        <TriangleAlert className="size-6" />
      </div>
      <p className="font-medium">Couldn’t load your data</p>
      <p className="mt-1 max-w-sm text-sm text-muted">Check your connection and try again. If this keeps happening, make sure the database is connected.</p>
      <button type="button" onClick={retry} className={`${buttonClass.primary} mt-5`}>
        Try again
      </button>
    </div>
  );
}
