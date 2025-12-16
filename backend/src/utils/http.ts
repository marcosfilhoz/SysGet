import { z } from "zod";

export function parseDateParam(value: unknown): string | undefined {
  if (typeof value !== "string" || value.trim() === "") return undefined;
  const v = value.trim();
  const ok = /^\d{4}-\d{2}-\d{2}$/.test(v);
  return ok ? v : undefined;
}

export function zodErrorToMessage(err: z.ZodError): string {
  return err.issues.map((i) => `${i.path.join(".") || "campo"}: ${i.message}`).join("; ");
}



