import { describe, expect, it } from "vitest";
import { formatValue } from "../src/ui/format";

describe("formatValue", () => {
  it.each([
    [undefined, "undefined"],
    [null, "null"],
    [NaN, "NaN"],
    [-0, "-0"],
    [0, "0"],
    [42, "42"],
    ["hi", '"hi"'],
    [true, "true"],
    [[], "[]"],
    [[1, "a"], '[1, "a"]'],
    [{}, "{}"],
    [{ a: 1 }, "{a: 1}"],
    [[[1], { b: 2 }], "[[1], {b: 2}]"],
  ])("formats %p as %s", (value, expected) => {
    expect(formatValue(value)).toBe(expected);
  });

  it("falls back to String() for out-of-grammar types like Symbol and function", () => {
    const sym = Symbol("s");
    expect(formatValue(sym)).toBe(String(sym));
    const fn = () => {};
    expect(formatValue(fn)).toBe(String(fn));
  });
});
