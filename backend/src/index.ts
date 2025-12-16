import express from "express";
import cors from "cors";
import { env } from "./env";
import { responsiblesRouter } from "./routes/responsibles";
import { expensesRouter } from "./routes/expenses";
import { dashboardRouter } from "./routes/dashboard";

const app = express();

const corsOrigin = env.CORS_ORIGIN.trim();
const corsOptions: cors.CorsOptions = {
  origin:
    corsOrigin === "*"
      ? true
      : corsOrigin
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => {
  return res.json({
    name: "SysGet API",
    ok: true,
    endpoints: {
      health: "/health",
      dashboard: "/dashboard",
      responsibles: "/responsibles",
      expenses: "/expenses",
      expenseStatus: "/expenses/:id/status",
    },
  });
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/responsibles", responsiblesRouter);
app.use("/expenses", expensesRouter);
app.use("/dashboard", dashboardRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  return res.status(500).json({ error: "Erro interno" });
});

app.listen(env.PORT, () => {
  console.log(`API listening on port ${env.PORT}`);
});



