import { Tracer } from "./trace";
import { toPrimitive } from "./toPrimitive";

/**
 * ECMA-262 7.1.17 ToString ( argument )
 *
 * Named toStringSpec (not toString) to avoid colliding with
 * Object.prototype.toString when imported alongside builtins.
 */
export function toStringSpec(argument: unknown, tracer?: Tracer): string {
  if (typeof argument === "object" && argument !== null) {
    const primitive = toPrimitive(argument, "string", tracer);
    return toStringSpec(primitive, tracer);
  }

  let result: string;
  if (argument === undefined) {
    result = "undefined";
  } else if (argument === null) {
    result = "null";
  } else if (typeof argument === "boolean") {
    result = argument ? "true" : "false";
  } else if (typeof argument === "number") {
    result = Object.is(argument, -0) ? "0" : String(argument);
  } else if (typeof argument === "string") {
    result = argument;
  } else {
    throw new TypeError("Cannot convert value to a string");
  }

  tracer?.record({
    operation: "ToString",
    specSection: "7.1.17",
    input: argument,
    output: result,
    detail: `Converted ${String(argument)} to string ${JSON.stringify(result)}.`,
  });
  return result;
}
