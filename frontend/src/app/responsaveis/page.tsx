"use client";

import { useEffect, useState } from "react";
import { api, type Responsible } from "@/lib/api";
import { Card, SectionTitle } from "@/components/ui";
import { errorMessage } from "@/lib/errors";

export default function ResponsaveisPage() {
  const [items, setItems] = useState<Responsible[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    setLoading(true);
    setError(null);
    try {
      const r = await api.listResponsibles();
      setItems(r.data);
    } catch (e: unknown) {
      setError(errorMessage(e, "Erro ao carregar responsáveis"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await api.createResponsible({ name: name.trim() });
      setName("");
      await reload();
    } catch (err: unknown) {
      setError(errorMessage(err, "Erro ao salvar"));
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Excluir responsável?")) return;
    setError(null);
    try {
      await api.deleteResponsible(id);
      await reload();
    } catch (err: unknown) {
      setError(errorMessage(err, "Erro ao excluir"));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Responsáveis</h1>
        <p className="mt-1 text-sm text-zinc-600">Cadastre quem é responsável por cada despesa.</p>
      </div>

      {error ? (
        <Card>
          <div className="text-sm text-red-600">{error}</div>
        </Card>
      ) : null}

      <Card>
        <SectionTitle>Novo responsável</SectionTitle>
        <form onSubmit={onCreate} className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-zinc-600">Nome</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/20"
              placeholder="Ex.: Marcos"
            />
          </div>
          <div className="sm:col-span-3">
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
                <th className="py-2 pr-4">Nome</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td className="py-3 text-zinc-500" colSpan={2}>
                    Carregando…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="py-3 text-zinc-500" colSpan={2}>
                    Nenhum responsável cadastrado.
                  </td>
                </tr>
              ) : (
                items.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3 pr-4 font-medium">{r.name}</td>
                    <td className="py-3 pr-4 text-right">
                      <button
                        onClick={() => onDelete(r.id)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                      >
                        Excluir
                      </button>
                    </td>
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


