"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expensesRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const supabase_1 = require("../supabase");
const http_1 = require("../utils/http");
exports.expensesRouter = (0, express_1.Router)();
const ExpenseSchema = zod_1.z.object({
    responsible_id: zod_1.z.string().uuid().optional().or(zod_1.z.literal("")),
    description: zod_1.z.string().trim().min(1),
    amount: zod_1.z.coerce.number().finite().min(0),
    status: zod_1.z.enum(["open", "paid"]).optional(),
    spent_at: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
exports.expensesRouter.get("/", async (req, res) => {
    const from = (0, http_1.parseDateParam)(req.query.from);
    const to = (0, http_1.parseDateParam)(req.query.to);
    const responsibleId = typeof req.query.responsibleId === "string" ? req.query.responsibleId : undefined;
    let query = supabase_1.supabase
        .from("expenses")
        .select("id,responsible_id,description,amount,status,spent_at,created_at,responsible:responsibles(id,name)");
    if (from)
        query = query.gte("spent_at", from);
    if (to)
        query = query.lte("spent_at", to);
    if (responsibleId)
        query = query.eq("responsible_id", responsibleId);
    const { data, error } = await query.order("spent_at", { ascending: false }).order("created_at", { ascending: false }).limit(500);
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json({ data });
});
exports.expensesRouter.post("/", async (req, res) => {
    const parsed = ExpenseSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: (0, http_1.zodErrorToMessage)(parsed.error) });
    const payload = {
        responsible_id: parsed.data.responsible_id ? parsed.data.responsible_id : null,
        description: parsed.data.description,
        amount: parsed.data.amount,
        status: parsed.data.status ?? "open",
        spent_at: parsed.data.spent_at,
    };
    const { data, error } = await supabase_1.supabase.from("expenses").insert(payload).select("*").single();
    if (error)
        return res.status(500).json({ error: error.message });
    return res.status(201).json({ data });
});
exports.expensesRouter.put("/:id", async (req, res) => {
    const IdSchema = zod_1.z.string().uuid();
    const idParsed = IdSchema.safeParse(req.params.id);
    if (!idParsed.success)
        return res.status(400).json({ error: "id inválido" });
    const parsed = ExpenseSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: (0, http_1.zodErrorToMessage)(parsed.error) });
    const payload = {
        responsible_id: parsed.data.responsible_id ? parsed.data.responsible_id : null,
        description: parsed.data.description,
        amount: parsed.data.amount,
        status: parsed.data.status ?? "open",
        spent_at: parsed.data.spent_at,
    };
    const { data, error } = await supabase_1.supabase.from("expenses").update(payload).eq("id", idParsed.data).select("*").single();
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json({ data });
});
exports.expensesRouter.delete("/:id", async (req, res) => {
    const IdSchema = zod_1.z.string().uuid();
    const idParsed = IdSchema.safeParse(req.params.id);
    if (!idParsed.success)
        return res.status(400).json({ error: "id inválido" });
    const { data: existing, error: fetchError } = await supabase_1.supabase
        .from("expenses")
        .select("id,status")
        .eq("id", idParsed.data)
        .maybeSingle();
    if (fetchError)
        return res.status(500).json({ error: fetchError.message });
    if (!existing)
        return res.status(404).json({ error: "Despesa não encontrada" });
    if (existing.status !== "open")
        return res.status(400).json({ error: "Só é possível excluir despesas em aberto" });
    const { error } = await supabase_1.supabase.from("expenses").delete().eq("id", idParsed.data);
    if (error)
        return res.status(500).json({ error: error.message });
    return res.status(204).send();
});
exports.expensesRouter.patch("/:id/status", async (req, res) => {
    const IdSchema = zod_1.z.string().uuid();
    const idParsed = IdSchema.safeParse(req.params.id);
    if (!idParsed.success)
        return res.status(400).json({ error: "id inválido" });
    const BodySchema = zod_1.z.object({ status: zod_1.z.enum(["open", "paid"]) });
    const parsed = BodySchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: (0, http_1.zodErrorToMessage)(parsed.error) });
    const { data, error } = await supabase_1.supabase
        .from("expenses")
        .update({ status: parsed.data.status })
        .eq("id", idParsed.data)
        .select("*")
        .single();
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json({ data });
});
//# sourceMappingURL=expenses.js.map