export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3333";

export type Responsible = {
  id: string;
  name: string;
  created_at: string;
};

export type Expense = {
  id: string;
  responsible_id: string | null;
  description: string;
  amount: number;
  status: "open" | "paid";
  spent_at: string; // YYYY-MM-DD
  created_at: string;
  responsible?: unknown;
};

export type DashboardData = {
  range: { from: string; to: string };
  total: number;
  count: number;
  byResponsible: Record<string, number>;
  recent: Expense[];
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    let msg = `Erro HTTP ${res.status}`;
    try {
      const body: unknown = await res.json();
      if (body && typeof body === "object" && "error" in body) {
        const maybeError = (body as { error?: unknown }).error;
        if (typeof maybeError === "string" && maybeError.trim()) msg = maybeError;
      }
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  return (await res.json()) as T;
}

export const api = {
  listResponsibles: () => request<{ data: Responsible[] }>("/responsibles"),
  createResponsible: (payload: { name: string }) =>
    request<{ data: Responsible }>("/responsibles", { method: "POST", body: JSON.stringify(payload) }),
  deleteResponsible: (id: string) => request<void>(`/responsibles/${id}`, { method: "DELETE" }),

  listExpenses: (params?: { from?: string; to?: string; responsibleId?: string }) => {
    const qs = new URLSearchParams();
    if (params?.from) qs.set("from", params.from);
    if (params?.to) qs.set("to", params.to);
    if (params?.responsibleId) qs.set("responsibleId", params.responsibleId);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request<{ data: Expense[] }>(`/expenses${suffix}`);
  },
  createExpense: (payload: {
    description: string;
    amount: number | string;
    status?: "open" | "paid";
    spent_at: string;
    responsible_id?: string;
  }) => request<{ data: Expense }>("/expenses", { method: "POST", body: JSON.stringify(payload) }),
  deleteExpense: (id: string) => request<void>(`/expenses/${id}`, { method: "DELETE" }),
  setExpenseStatus: (id: string, status: "open" | "paid") =>
    request<{ data: Expense }>(`/expenses/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),

  dashboard: (params?: { from?: string; to?: string }) => {
    const qs = new URLSearchParams();
    if (params?.from) qs.set("from", params.from);
    if (params?.to) qs.set("to", params.to);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request<{ data: DashboardData }>(`/dashboard${suffix}`);
  },
};


