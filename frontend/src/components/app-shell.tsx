"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/despesas", label: "Despesas" },
  { href: "/responsaveis", label: "Responsáveis" },
];

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur">
        <div className="container-page flex h-14 items-center justify-between">
          <Link href="/dashboard" className="font-semibold tracking-tight">
            SysGet
          </Link>
          <nav className="flex items-center gap-1">
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                    active ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="container-page py-6">{children}</main>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="container-page py-6 text-xs text-zinc-500">
          SysGet • Gestão de Despesas Pessoais
        </div>
      </footer>
    </div>
  );
}


