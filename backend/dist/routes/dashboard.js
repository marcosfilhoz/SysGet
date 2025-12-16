"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRouter = void 0;
const express_1 = require("express");
const http_1 = require("../utils/http");
const supabase_1 = require("../supabase");
exports.dashboardRouter = (0, express_1.Router)();
function todayISODate() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}
function firstDayOfMonthISODate() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${yyyy}-${mm}-01`;
}
exports.dashboardRouter.get("/", async (req, res) => {
    const from = (0, http_1.parseDateParam)(req.query.from) ?? firstDayOfMonthISODate();
    const to = (0, http_1.parseDateParam)(req.query.to) ?? todayISODate();
    const { data, error } = await supabase_1.supabase
        .from("expenses")
        .select("id,description,amount,status,spent_at,created_at,responsible:responsibles(id,name)")
        .gte("spent_at", from)
        .lte("spent_at", to)
        .order("spent_at", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(500);
    if (error)
        return res.status(500).json({ error: error.message });
    const expenses = data ?? [];
    const total = expenses.reduce((acc, e) => acc + Number(e.amount), 0);
    const byResponsible = {};
    for (const e of expenses) {
        const responsible = Array.isArray(e.responsible) ? e.responsible[0] : e.responsible;
        const respName = responsible?.name ?? "Sem responsável";
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
//# sourceMappingURL=dashboard.js.map