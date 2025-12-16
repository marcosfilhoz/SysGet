"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responsiblesRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const supabase_1 = require("../supabase");
const http_1 = require("../utils/http");
exports.responsiblesRouter = (0, express_1.Router)();
const ResponsibleCreateSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1),
});
exports.responsiblesRouter.get("/", async (_req, res) => {
    const { data, error } = await supabase_1.supabase.from("responsibles").select("*").order("created_at", { ascending: false });
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json({ data });
});
exports.responsiblesRouter.post("/", async (req, res) => {
    const parsed = ResponsibleCreateSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: (0, http_1.zodErrorToMessage)(parsed.error) });
    const payload = {
        name: parsed.data.name,
    };
    const { data, error } = await supabase_1.supabase.from("responsibles").insert(payload).select("*").single();
    if (error)
        return res.status(500).json({ error: error.message });
    return res.status(201).json({ data });
});
exports.responsiblesRouter.put("/:id", async (req, res) => {
    const IdSchema = zod_1.z.string().uuid();
    const idParsed = IdSchema.safeParse(req.params.id);
    if (!idParsed.success)
        return res.status(400).json({ error: "id inválido" });
    const parsed = ResponsibleCreateSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: (0, http_1.zodErrorToMessage)(parsed.error) });
    const payload = {
        name: parsed.data.name,
    };
    const { data, error } = await supabase_1.supabase.from("responsibles").update(payload).eq("id", idParsed.data).select("*").single();
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json({ data });
});
exports.responsiblesRouter.delete("/:id", async (req, res) => {
    const IdSchema = zod_1.z.string().uuid();
    const idParsed = IdSchema.safeParse(req.params.id);
    if (!idParsed.success)
        return res.status(400).json({ error: "id inválido" });
    const { error } = await supabase_1.supabase.from("responsibles").delete().eq("id", idParsed.data);
    if (error)
        return res.status(500).json({ error: error.message });
    return res.status(204).send();
});
//# sourceMappingURL=responsibles.js.map