import { Tracer } from "./trace";
import { toPrimitive } from "./toPrimitive";
import { toNumber } from "./toNumber";

type JsType = "undefined" | "null" | "boolean" | "number" | "string" | "object";

function jsTypeOf(value: unknown): JsType {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (typeof value === "string") return "string";
  return "object";
}

/**
 * ECMA-262 7.2.13 IsLooselyEqual ( x, y ) — the algorithm behind `==`.
 *
 * BigInt/Symbol steps are omitted (out of scope per docs/VISION.md); every
 * other step, including the NaN-never-equals-NaN carve-out and the
 * recursive ToNumber/ToPrimitive coercions, is implemented.
 */
export function looselyEquals(x: unknown, y: unknown, tracer?: Tracer): boolean {
  const xType = jsTypeOf(x);
  const yType = jsTypeOf(y);

  if (xType === yType) {
    const result = sameTypeEquals(x, y, xType);
    tracer?.record({
      operation: "IsLooselyEqual",
      specSection: "7.2.13 step 1",
      input: [x, y],
      output: result,
      detail:
        xType === "number" && (Number.isNaN(x) || Number.isNaN(y))
          ? "Both operands are Number and at least one is NaN; NaN never equals anything, including itself, so the result is false."
          : xType === "object"
            ? "Both operands are objects (or arrays); they are only equal if they are the same reference, which two independently entered operands never are, so the result is false."
            : `Both operands have type ${xType}; compared directly, giving ${result}.`,
    });
    return result;
  }

  if ((x === null && y === undefined) || (x === undefined && y === null)) {
    tracer?.record({
      operation: "IsLooselyEqual",
      specSection: "7.2.13 step 2-3",
      input: [x, y],
      output: true,
      detail: "One operand is null and the other undefined; the spec special-cases this pair as equal.",
    });
    return true;
  }

  if (xType === "number" && yType === "string") {
    return recurse(x, toNumber(y, tracer), "7.2.13 step 6", `y is a String; comparing x == ToNumber(y).`, tracer);
  }
  if (xType === "string" && yType === "number") {
    return recurse(toNumber(x, tracer), y, "7.2.13 step 7", `x is a String; comparing ToNumber(x) == y.`, tracer);
  }

  if (xType === "boolean") {
    return recurse(toNumber(x, tracer), y, "7.2.13 step 9", `x is a Boolean; comparing ToNumber(x) == y.`, tracer);
  }
  if (yType === "boolean") {
    return recurse(x, toNumber(y, tracer), "7.2.13 step 10", `y is a Boolean; comparing x == ToNumber(y).`, tracer);
  }

  if ((xType === "number" || xType === "string") && yType === "object") {
    const yPrim = toPrimitive(y, "default", tracer);
    return recurse(x, yPrim, "7.2.13 step 11", `y is an Object; comparing x == ToPrimitive(y).`, tracer);
  }
  if (xType === "object" && (yType === "number" || yType === "string")) {
    const xPrim = toPrimitive(x, "default", tracer);
    return recurse(xPrim, y, "7.2.13 step 12", `x is an Object; comparing ToPrimitive(x) == y.`, tracer);
  }

  tracer?.record({
    operation: "IsLooselyEqual",
    specSection: "7.2.13 step 13",
    input: [x, y],
    output: false,
    detail: `No coercion rule connects type ${xType} and type ${yType}; the result is false.`,
  });
  return false;
}

function recurse(
  x: unknown,
  y: unknown,
  specSection: string,
  detail: string,
  tracer?: Tracer,
): boolean {
  tracer?.record({ operation: "IsLooselyEqual", specSection, input: [x, y], output: undefined, detail });
  return looselyEquals(x, y, tracer);
}

function sameTypeEquals(x: unknown, y: unknown, type: JsType): boolean {
  switch (type) {
    case "undefined":
    case "null":
      return true;
    case "number":
      return (x as number) === (y as number);
    case "string":
    case "boolean":
      return x === y;
    case "object":
      return x === y;
  }
}
