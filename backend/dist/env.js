"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
const zod_1 = require("zod");
const EnvSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().int().positive().default(3333),
    CORS_ORIGIN: zod_1.z.string().default("*"),
    SUPABASE_URL: zod_1.z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: zod_1.z.string().min(20),
});
exports.env = EnvSchema.parse(process.env);
//# sourceMappingURL=env.js.map