import type { PropsWithChildren } from "react";

export function Card({ children }: PropsWithChildren) {
  return <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">{children}</div>;
}

export function CardTitle({ children }: PropsWithChildren) {
  return <div className="text-sm font-medium text-zinc-600">{children}</div>;
}

export function CardValue({ children }: PropsWithChildren) {
  return <div className="mt-1 text-2xl font-semibold tracking-tight">{children}</div>;
}

export function SectionTitle({ children }: PropsWithChildren) {
  return <h2 className="text-base font-semibold tracking-tight text-zinc-900">{children}</h2>;
}



