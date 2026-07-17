import { describe, expect, it } from "vitest";
import { Tracer } from "../src/spec/trace";
import { toNumber } from "../src/spec/toNumber";
import { toStringSpec } from "../src/spec/toStringSpec";

describe("ToNumber", () => {
  it("converts an empty array to 0 via ToPrimitive -> ''", () => {
    expect(toNumber([])).toBe(0);
  });

  it("converts a plain object to NaN via ToPrimitive -> '[object Object]'", () => {
    expect(toNumber({})).toBe(NaN);
  });

  it("converts a single-element array by unwrapping its element", () => {
    expect(toNumber([5])).toBe(5);
  });

  it("converts null to 0 and undefined to NaN", () => {
    expect(toNumber(null)).toBe(0);
    expect(toNumber(undefined)).toBe(NaN);
  });

  it("records a trace with at least one ToNumber step", () => {
    const tracer = new Tracer();
    toNumber("42", tracer);
    expect(tracer.steps.some((s) => s.operation === "ToNumber")).toBe(true);
  });
});

describe("ToString", () => {
  it("stringifies an empty array to the empty string", () => {
    expect(toStringSpec([])).toBe("");
  });

  it("stringifies a plain object to '[object Object]'", () => {
    expect(toStringSpec({})).toBe("[object Object]");
  });

  it("stringifies negative zero to '0'", () => {
    expect(toStringSpec(-0)).toBe("0");
  });
});
