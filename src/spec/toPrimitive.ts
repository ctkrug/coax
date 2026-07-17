import { Tracer } from "./trace";

export type PreferredType = "default" | "string" | "number";

/**
 * ECMA-262 7.1.1 ToPrimitive ( input [ , preferredType ] )
 *
 * Only implements the ordinary-object path (OrdinaryToPrimitive, 7.1.1.1):
 * no Symbol.toPrimitive support yet, which covers every plain object/array
 * value the oracle's operand editor can currently produce.
 */
export function toPrimitive(
  input: unknown,
  preferredType: PreferredType = "default",
  tracer?: Tracer,
): unknown {
  if (typeof input !== "object" || input === null) {
    tracer?.record({
      operation: "ToPrimitive",
      specSection: "7.1.1",
      input,
      output: input,
      detail: "Input is already a primitive; returned unchanged.",
    });
    return input;
  }

  const hint = preferredType === "default" ? "number" : preferredType;
  const methodNames = hint === "string" ? ["toString", "valueOf"] : ["valueOf", "toString"];

  for (const name of methodNames) {
    const obj = input as Record<string, unknown>;
    const method = obj[name];
    if (typeof method === "function") {
      const result = (method as () => unknown).call(input);
      if (typeof result !== "object" || result === null) {
        tracer?.record({
          operation: "OrdinaryToPrimitive",
          specSection: "7.1.1.1",
          input,
          output: result,
          detail: `Called ${name}() (hint: ${hint}); it returned a primitive, so that value is used.`,
        });
        return result;
      }
      tracer?.record({
        operation: "OrdinaryToPrimitive",
        specSection: "7.1.1.1",
        input,
        output: undefined,
        detail: `Called ${name}() (hint: ${hint}); it returned an object, so it is skipped.`,
      });
    }
  }

  throw new TypeError("Cannot convert object to primitive value");
}
