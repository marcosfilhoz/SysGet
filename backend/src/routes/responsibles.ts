import { Router } from "express";
import { z } from "zod";
import { supabase } from "../supabase";
import { zodErrorToMessage } from "../utils/http";

export const responsiblesRouter = Router();

const ResponsibleCreateSchema = z.object({
  name: z.string().trim().min(1),
});

responsiblesRouter.get("/", async (_req, res) => {
  const { data, error } = await supabase.from("responsibles").select("*").order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ data });
});

responsiblesRouter.post("/", async (req, res) => {
  const parsed = ResponsibleCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: zodErrorToMessage(parsed.error) });

  const payload = {
    name: parsed.data.name,
  };

  const { data, error } = await supabase.from("responsibles").insert(payload).select("*").single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ data });
});

responsiblesRouter.put("/:id", async (req, res) => {
  const IdSchema = z.string().uuid();
  const idParsed = IdSchema.safeParse(req.params.id);
  if (!idParsed.success) return res.status(400).json({ error: "id inválido" });

  const parsed = ResponsibleCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: zodErrorToMessage(parsed.error) });

  const payload = {
    name: parsed.data.name,
  };

  const { data, error } = await supabase.from("responsibles").update(payload).eq("id", idParsed.data).select("*").single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ data });
});

responsiblesRouter.delete("/:id", async (req, res) => {
  const IdSchema = z.string().uuid();
  const idParsed = IdSchema.safeParse(req.params.id);
  if (!idParsed.success) return res.status(400).json({ error: "id inválido" });

  const { error } = await supabase.from("responsibles").delete().eq("id", idParsed.data);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});


