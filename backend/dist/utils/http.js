"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDateParam = parseDateParam;
exports.zodErrorToMessage = zodErrorToMessage;
function parseDateParam(value) {
    if (typeof value !== "string" || value.trim() === "")
        return undefined;
    const v = value.trim();
    const ok = /^\d{4}-\d{2}-\d{2}$/.test(v);
    return ok ? v : undefined;
}
function zodErrorToMessage(err) {
    return err.issues.map((i) => `${i.path.join(".") || "campo"}: ${i.message}`).join("; ");
}
//# sourceMappingURL=http.js.map