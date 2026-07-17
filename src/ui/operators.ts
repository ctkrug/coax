import { Tracer, TraceStep } from "../spec/trace";
import { looselyEquals } from "../spec/equality";
import { plus, templateConcat } from "../spec/operators";
import { toBoolean } from "../spec/toBoolean";
import { formatValue } from "./format";

export type OperatorId = "eq" | "plus" | "bool" | "template";

export const OPERATORS: { id: OperatorId; label: string }[] = [
  { id: "eq", label: "==" },
  { id: "plus", label: "+" },
  { id: "bool", label: "Boolean()" },
  { id: "template", label: "`${}`" },
];

export interface OperatorOutcome {
  badges: { label: string; value: string; kind: "success" | "danger" | "neutral" }[];
  steps: TraceStep[];
}

/** Runs the selected operator against both operands, merging per-operand traces where relevant. */
export function evaluateOperator(operatorId: OperatorId, a: unknown, b: unknown): OperatorOutcome {
  switch (operatorId) {
    case "eq": {
      const tracer = new Tracer();
      const result = looselyEquals(a, b, tracer);
      return {
        badges: [{ label: "A == B", value: String(result), kind: result ? "success" : "danger" }],
        steps: tracer.steps,
      };
    }
    case "plus": {
      const tracer = new Tracer();
      const result = plus(a, b, tracer);
      return {
        badges: [{ label: "A + B", value: formatValue(result), kind: "neutral" }],
        steps: tracer.steps,
      };
    }
    case "bool": {
      const tracerA = new Tracer();
      const tracerB = new Tracer();
      const resultA = toBoolean(a, tracerA);
      const resultB = toBoolean(b, tracerB);
      return {
        badges: [
          { label: "Boolean(A)", value: String(resultA), kind: resultA ? "success" : "danger" },
          { label: "Boolean(B)", value: String(resultB), kind: resultB ? "success" : "danger" },
        ],
        steps: [...tracerA.steps, ...tracerB.steps],
      };
    }
    case "template": {
      const tracer = new Tracer();
      const result = templateConcat(a, b, tracer);
      return {
        badges: [{ label: "`${A}${B}`", value: JSON.stringify(result), kind: "neutral" }],
        steps: tracer.steps,
      };
    }
  }
}
