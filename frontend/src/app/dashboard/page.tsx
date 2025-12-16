"use client";

import { useEffect, useMemo, useState } from "react";
import { api, type DashboardData } from "@/lib/api";
import { Card, CardTitle, CardValue, SectionTitle } from "@/components/ui";
import { errorMessage } from "@/lib/errors";
import { formatDateUS, formatUSD } from "@/lib/format";

function todayISODate(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function firstDayOfMonthISODate(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}-01`;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(firstDayOfMonthISODate());
  const [to, setTo] = useState(todayISODate());

  async function load(range?: { from: string; to: string }) {
    setLoading(true);
    setError(null);
    try {
      const r = await api.dashboard(range);
      setData(r.data);
    } catch (e: unknown) {
      setError(errorMessage(e, "Erro ao carregar dashboard"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load({ from, to });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const topResponsibles = useMemo(() => {
    const entries = Object.entries(data?.byResponsible ?? {});
    entries.sort((a, b) => b[1] - a[1]);
    return entries.slice(0, 6);
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-600">
            {data ? (
              <>
                Período: <span className="font-medium">{formatDateUS(data.range.from)}</span> até{" "}
                <span className="font-medium">{formatDateUS(data.range.to)}</span>
              </>
            ) : (
              "Resumo do mês (padrão)."
            )}
          </p>
        </div>
      </div>

      <Card>
        <SectionTitle>Filtro de período</SectionTitle>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load({ from, to });
          }}
          className="mt-3 flex flex-wrap items-end gap-3"
        >
          <div>
            <label className="text-xs font-medium text-zinc-600">De</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1 w-44 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/20"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600">Até</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1 w-44 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/20"
            />
          </div>
          <button
            className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white"
            disabled={loading}
          >
            Aplicar
          </button>
        </form>
      </Card>

      {error ? (
        <Card>
          <div className="text-sm text-red-600">{error}</div>
          <div className="mt-2 text-xs text-zinc-500">
            Dica: confira `NEXT_PUBLIC_API_BASE_URL` no frontend e o CORS no backend.
          </div>
        </Card>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardTitle>Total gasto ($)</CardTitle>
          <CardValue>{loading ? "…" : formatUSD(data?.total ?? 0)}</CardValue>
        </Card>
        <Card>
          <CardTitle>Lançamentos</CardTitle>
          <CardValue>{loading ? "…" : String(data?.count ?? 0)}</CardValue>
        </Card>
        <Card>
          <CardTitle>Top responsável</CardTitle>
          <CardValue>
            {loading ? "…" : topResponsibles[0] ? `${topResponsibles[0][0]}` : "—"}
          </CardValue>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle>Período</SectionTitle>
          <div className="mt-3 text-sm text-zinc-700">
            {loading ? (
              <div className="text-zinc-500">Carregando…</div>
            ) : (
              <>
                <div>
                  De: <span className="font-medium tabular-nums">{data?.range.from}</span>
                </div>
                <div className="mt-1">
                  Até: <span className="font-medium tabular-nums">{data?.range.to}</span>
                </div>
              </>
            )}
          </div>
        </Card>

        <Card>
          <SectionTitle>Por responsável</SectionTitle>
          <div className="mt-3 space-y-2">
            {loading ? (
              <div className="text-sm text-zinc-500">Carregando…</div>
            ) : topResponsibles.length === 0 ? (
              <div className="text-sm text-zinc-500">Sem dados no período.</div>
            ) : (
              topResponsibles.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3 text-sm">
                  <div className="truncate text-zinc-700">{k}</div>
                  <div className="font-medium tabular-nums">{formatUSD(v)}</div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card>
        <SectionTitle>Recentes</SectionTitle>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="py-2 pr-4">Data</th>
                <th className="py-2 pr-4">Descrição</th>
                <th className="py-2 pr-4">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td className="py-3 text-zinc-500" colSpan={4}>
                    Carregando…
                  </td>
                </tr>
              ) : (data?.recent?.length ?? 0) === 0 ? (
                <tr>
                  <td className="py-3 text-zinc-500" colSpan={4}>
                    Sem lançamentos.
                  </td>
                </tr>
              ) : (
                data!.recent.map((e) => (
                  <tr key={e.id}>
                    <td className="py-3 pr-4 tabular-nums">{formatDateUS(e.spent_at)}</td>
                    <td className="py-3 pr-4">{e.description}</td>
                    <td className="py-3 pr-4 font-medium tabular-nums">{formatUSD(Number(e.amount))}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}


