import { Router } from "express";
import { parseDateParam } from "../utils/http";
import { supabase } from "../supabase";

export const dashboardRouter = Router();

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

dashboardRouter.get("/", async (req, res) => {
  const from = parseDateParam(req.query.from) ?? firstDayOfMonthISODate();
  const to = parseDateParam(req.query.to) ?? todayISODate();

  const { data, error } = await supabase
    .from("expenses")
    .select("id,description,amount,status,spent_at,created_at,responsible:responsibles(id,name)")
    .gte("spent_at", from)
    .lte("spent_at", to)
    .order("spent_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) return res.status(500).json({ error: error.message });

  const expenses = data ?? [];

  const total = expenses.reduce((acc, e) => acc + Number(e.amount), 0);

  const byResponsible: Record<string, number> = {};

  for (const e of expenses) {
    const responsible = Array.isArray(e.responsible) ? e.responsible[0] : e.responsible;
    const respName = (responsible as any)?.name ?? "Sem responsável";
    byResponsible[respName] = (byResponsible[respName] ?? 0) + Number(e.amount);
  }

  const recent = expenses.slice(0, 8);

  return res.json({
    data: {
      range: { from, to },
      total,
      count: expenses.length,
      byResponsible,
      recent,
    },
  });
});


