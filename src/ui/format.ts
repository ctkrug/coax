/**
 * Renders a parsed JS value back to literal source, for readouts and trace
 * steps. Safe against unbounded recursion because every value passed in
 * comes from parseLiteral, whose grammar cannot produce cycles.
 */
export function formatValue(value: unknown): string {
  if (value === undefined) return "undefined";
  if (value === null) return "null";
  if (typeof value === "number") {
    if (Number.isNaN(value)) return "NaN";
    if (Object.is(value, -0)) return "-0";
    return String(value);
  }
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "boolean") return String(value);

  if (Array.isArray(value)) {
    return `[${value.map((v) => formatValue(v)).join(", ")}]`;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    return `{${entries.map(([k, v]) => `${k}: ${formatValue(v)}`).join(", ")}}`;
  }
  return String(value);
}
