"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { createPortal, flushSync } from "react-dom";
import type { Order } from "@/lib/types";
import { labelPageClass, ShippingLabel } from "./shipping-label";

export type LabelFormat = "a4" | "thermal";

const FORMAT_KEY = "label-format";
const listeners = new Set<() => void>();

function readFormat(): LabelFormat {
  try {
    return localStorage.getItem(FORMAT_KEY) === "thermal" ? "thermal" : "a4";
  } catch {
    return "a4";
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Paper preference, remembered per device (the laptop that prints). */
export function useLabelFormat(): [LabelFormat, (format: LabelFormat) => void] {
  const format = useSyncExternalStore(subscribe, readFormat, () => "a4" as const);
  const setFormat = useCallback((next: LabelFormat) => {
    try {
      localStorage.setItem(FORMAT_KEY, next);
    } catch {}
    listeners.forEach((listener) => listener());
  }, []);
  return [format, setFormat];
}

/** Shrinks the receiver block until a long address fits inside the label. */
function fitToLabel(root: HTMLElement) {
  const body = root.querySelector<HTMLElement>("[data-fit]");
  if (!body) return;
  let fit = 1;
  body.style.setProperty("--fit", "1");
  while (body.scrollHeight > body.clientHeight + 1 && fit > 0.55) {
    fit -= 0.05;
    body.style.setProperty("--fit", fit.toFixed(2));
  }
}

export function useLabelPrinter() {
  const [format] = useLabelFormat();
  const [job, setJob] = useState<{ order: Order; root: HTMLElement } | null>(null);

  const print = useCallback((order: Order) => {
    let root = document.querySelector<HTMLElement>(".print-root");
    if (!root) {
      root = document.createElement("div");
      root.className = "print-root";
      document.body.appendChild(root);
    }
    const target = root;
    flushSync(() => setJob({ order, root: target }));
    fitToLabel(target);
    window.print();
  }, []);

  const pageRule =
    format === "thermal" ? "@page { size: 100mm 150mm; margin: 0; }" : "@page { size: A4 portrait; margin: 0; }";

  const portal =
    job &&
    createPortal(
      <>
        <style>{pageRule}</style>
        {format === "thermal" ? (
          <ShippingLabel receiver={job.order} />
        ) : (
          <div className={labelPageClass}>
            <ShippingLabel receiver={job.order} />
          </div>
        )}
      </>,
      job.root,
    );

  return { print, portal };
}
