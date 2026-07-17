/**
 * A single recorded step in an abstract-operation trace, e.g. one call to
 * ToPrimitive or ToNumber, annotated with the spec section it implements.
 */
export interface TraceStep {
  operation: string;
  specSection: string;
  input: unknown;
  output: unknown;
  detail: string;
}

export class Tracer {
  readonly steps: TraceStep[] = [];

  record(step: TraceStep): void {
    this.steps.push(step);
  }
}
