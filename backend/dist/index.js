"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./env");
const responsibles_1 = require("./routes/responsibles");
const expenses_1 = require("./routes/expenses");
const dashboard_1 = require("./routes/dashboard");
const app = (0, express_1.default)();
const corsOrigin = env_1.env.CORS_ORIGIN.trim();
const corsOptions = {
    origin: corsOrigin === "*"
        ? true
        : corsOrigin
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: "1mb" }));
app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/responsibles", responsibles_1.responsiblesRouter);
app.use("/expenses", expenses_1.expensesRouter);
app.use("/dashboard", dashboard_1.dashboardRouter);
app.use((err, _req, res, _next) => {
    console.error(err);
    return res.status(500).json({ error: "Erro interno" });
});
app.listen(env_1.env.PORT, () => {
    console.log(`API listening on port ${env_1.env.PORT}`);
});
//# sourceMappingURL=index.js.map