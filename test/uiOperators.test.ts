import { describe, expect, it } from "vitest";
import { evaluateOperator } from "../src/ui/operators";

describe("evaluateOperator", () => {
  it("eq: marks true results success and false results danger", () => {
    expect(evaluateOperator("eq", 1, "1").badges[0]).toMatchObject({ value: "true", kind: "success" });
    expect(evaluateOperator("eq", 1, 2).badges[0]).toMatchObject({ value: "false", kind: "danger" });
  });

  it("plus: the wow moment produces one neutral badge with the coerced string", () => {
    const outcome = evaluateOperator("plus", [], {});
    expect(outcome.badges[0]).toMatchObject({ value: '"[object Object]"', kind: "neutral" });
    expect(outcome.steps.length).toBeGreaterThan(0);
  });

  it("bool: produces two independent badges, one per operand", () => {
    const outcome = evaluateOperator("bool", 0, []);
    expect(outcome.badges).toHaveLength(2);
    expect(outcome.badges[0]).toMatchObject({ value: "false", kind: "danger" });
    expect(outcome.badges[1]).toMatchObject({ value: "true", kind: "success" });
  });

  it("template: quotes the concatenated string result", () => {
    const outcome = evaluateOperator("template", "a", 1);
    expect(outcome.badges[0].value).toBe('"a1"');
  });
});
