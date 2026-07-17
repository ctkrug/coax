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

  it("records the same-reference-required detail for two same-type objects", () => {
    const tracer = new Tracer();
    looselyEquals({}, {}, tracer);
    expect(tracer.steps[0].detail).toMatch(/same reference/);
  });

  it("null == null and undefined == undefined compare equal via the same-type path", () => {
    const tracer = new Tracer();
    expect(looselyEquals(null, null, tracer)).toBe(true);
    expect(looselyEquals(undefined, undefined, new Tracer())).toBe(true);
    expect(tracer.steps[0].specSection).toBe("7.2.13 step 1");
  });

  it("coerces an object operand via ToPrimitive when compared to a number or string on the left", () => {
    const withValueOf = { valueOf: () => 1 };
    expect(looselyEquals(1, withValueOf)).toBe(true);
    expect(looselyEquals("1", withValueOf)).toBe(true);

    const tracer = new Tracer();
    looselyEquals(1, withValueOf, tracer);
    expect(tracer.steps.some((s) => s.specSection === "7.2.13 step 11")).toBe(true);
  });
});
