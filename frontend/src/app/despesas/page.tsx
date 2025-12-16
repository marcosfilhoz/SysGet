"use client";

import { useEffect, useMemo, useState } from "react";
import { api, type Expense, type Responsible } from "@/lib/api";
import { Card, SectionTitle } from "@/components/ui";
import { errorMessage } from "@/lib/errors";
import { formatDateUS, formatUSD } from "@/lib/format";

function todayISODate(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function DespesasPage() {
  const [responsibles, setResponsibles] = useState<Responsible[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [spentAt, setSpentAt] = useState(todayISODate());
  const [responsibleId, setResponsibleId] = useState("");
  const [status, setStatus] = useState<"open" | "paid">("open");

  const total = useMemo(() => expenses.reduce((acc, e) => acc + Number(e.amount), 0), [expenses]);

  async function reload() {
    setLoading(true);
    setError(null);
    try {
      const [r1, r2] = await Promise.all([api.listResponsibles(), api.listExpenses()]);
      setResponsibles(r1.data);
      setExpenses(r2.data);
    } catch (e: unknown) {
      setError(errorMessage(e, "Erro ao carregar despesas"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    if (!amount.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await api.createExpense({
        description: description.trim(),
        amount: amount.trim(),
        spent_at: spentAt,
        status,
        responsible_id: responsibleId || undefined,
      });
      setDescription("");
      setAmount("");
      setResponsibleId("");
      setSpentAt(todayISODate());
      setStatus("open");
      await reload();
    } catch (err: unknown) {
      setError(errorMessage(err, "Erro ao salvar"));
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Excluir despesa?")) return;
    setError(null);
    try {
      await api.deleteExpense(id);
      await reload();
    } catch (err: unknown) {
      setError(errorMessage(err, "Erro ao excluir"));
    }
  }

  async function onToggleStatus(expense: Expense) {
    const next = expense.status === "open" ? "paid" : "open";
    setError(null);
    try {
      await api.setExpenseStatus(expense.id, next);
      await reload();
    } catch (err: unknown) {
      setError(errorMessage(err, "Erro ao atualizar status"));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Despesas</h1>
          <p className="mt-1 text-sm text-zinc-600">Lançamento e listagem das despesas.</p>
        </div>
        <div className="text-sm text-zinc-700">
          Total (lista): <span className="font-semibold tabular-nums">{formatUSD(total)}</span>
        </div>
      </div>

      {error ? (
        <Card>
          <div className="text-sm text-red-600">{error}</div>
        </Card>
      ) : null}

      <Card>
        <SectionTitle>Nova despesa</SectionTitle>
        <form onSubmit={onCreate} className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <label className="text-xs font-medium text-zinc-600">Descrição</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/20"
              placeholder="Ex.: Mercado"
            />
          </div>

          <div className="lg:col-span-1">
            <label className="text-xs font-medium text-zinc-600">Valor ($)</label>
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/20"
              placeholder="Ex.: 25.90"
            />
          </div>

          <div className="lg:col-span-1">
            <label className="text-xs font-medium text-zinc-600">Data</label>
            <input
              type="date"
              value={spentAt}
              onChange={(e) => setSpentAt(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/20"
            />
          </div>

          <div className="lg:col-span-1">
            <label className="text-xs font-medium text-zinc-600">Responsável</label>
            <select
              value={responsibleId}
              onChange={(e) => setResponsibleId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/20"
            >
              <option value="">—</option>
              {responsibles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-1">
            <label className="text-xs font-medium text-zinc-600">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "open" | "paid")}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/20"
            >
              <option value="open">Em aberto</option>
              <option value="paid">Pago</option>
            </select>
          </div>

          <div className="lg:col-span-6">
            <button
              disabled={saving}
              className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {saving ? "Salvando…" : "Adicionar"}
            </button>
          </div>
        </form>
      </Card>

      <Card>
        <SectionTitle>Lista</SectionTitle>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="py-2 pr-4">Data</th>
                <th className="py-2 pr-4">Descrição</th>
                <th className="py-2 pr-4">Responsável</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Valor</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td className="py-3 text-zinc-500" colSpan={6}>
                    Carregando…
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td className="py-3 text-zinc-500" colSpan={6}>
                    Nenhuma despesa cadastrada.
                  </td>
                </tr>
              ) : (
                expenses.map((e) => {
                  const rel = e.responsible;
                  const responsible = Array.isArray(rel) ? rel[0] : rel;
                  const responsibleName =
                    responsible && typeof responsible === "object" && "name" in responsible
                      ? String((responsible as { name?: unknown }).name ?? "—")
                      : "—";
                  const canDelete = e.status === "open";
                  return (
                    <tr key={e.id}>
                      <td className="py-3 pr-4 tabular-nums">{formatDateUS(e.spent_at)}</td>
                      <td className="py-3 pr-4 font-medium">{e.description}</td>
                      <td className="py-3 pr-4">{responsibleName}</td>
                      <td className="py-3 pr-4">
                        <button
                          onClick={() => onToggleStatus(e)}
                          className={
                            e.status === "paid"
                              ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                              : "rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100"
                          }
                        >
                          {e.status === "paid" ? "Pago" : "Em aberto"}
                        </button>
                      </td>
                      <td className="py-3 pr-4 font-medium tabular-nums">{formatUSD(Number(e.amount))}</td>
                      <td className="py-3 pr-4 text-right">
                        <button
                          onClick={() => onDelete(e.id)}
                          disabled={!canDelete}
                          title={!canDelete ? "Só é possível excluir despesas em aberto" : "Excluir"}
                          className={
                            canDelete
                              ? "rounded-lg px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                              : "cursor-not-allowed rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400"
                          }
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}


