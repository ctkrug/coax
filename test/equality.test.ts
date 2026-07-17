import { describe, expect, it } from "vitest";
import { Tracer } from "../src/spec/trace";
import { looselyEquals } from "../src/spec/equality";

describe("Abstract Equality Comparison (==)", () => {
  it.each([
    [1, "1", true],
    ["1", 1, true],
    [null, undefined, true],
    [undefined, null, true],
    [0, false, true],
    [false, 0, true],
    ["", false, true],
    [NaN, NaN, false],
    [1, 2, false],
    [null, 0, false],
    [undefined, 0, false],
    [[], "", true],
    [[1], 1, true],
    [{}, "[object Object]", true],
    ["1", true, true],
  ])("%p == %p is %p", (x, y, expected) => {
    expect(looselyEquals(x, y)).toBe(expected);
  });

  it("treats two distinct object operands as unequal even with identical shape", () => {
    expect(looselyEquals({}, {})).toBe(false);
    expect(looselyEquals([], [])).toBe(false);
  });

  it("records a trace explaining the NaN-never-equals-NaN rule", () => {
    const tracer = new Tracer();
    looselyEquals(NaN, NaN, tracer);
    expect(tracer.steps[0].detail).toMatch(/NaN never equals/);
  });

  it("records at least one trace step for a cross-type comparison", () => {
    const tracer = new Tracer();
    looselyEquals(1, "1", tracer);
    expect(tracer.steps.length).toBeGreaterThan(1);
  });
});
