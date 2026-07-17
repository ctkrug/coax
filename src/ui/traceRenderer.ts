import { TraceStep } from "../spec/trace";
import { el } from "./dom";
import { formatValue } from "./format";

const STAGGER_MS = 90;

function prefersReducedMotion(): boolean {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Renders a numbered, connected callout for each trace step, with a staggered reveal cascade. */
export function renderTrace(steps: TraceStep[]): HTMLElement {
  const list = el("ol", { className: "trace-list" });
  const reduced = prefersReducedMotion();

  steps.forEach((step, index) => {
    const body = [
      el("div", { className: "trace-step__heading" }, [
        el("code", { className: "trace-step__op" }, [step.operation]),
        el("span", { className: "trace-step__spec" }, [step.specSection]),
      ]),
      el("p", { className: "trace-step__detail" }, [step.detail]),
    ];
    if (step.output !== undefined) {
      body.push(el("p", { className: "trace-step__output" }, ["→ ", el("code", {}, [formatValue(step.output)])]));
    }

    const item = el("li", { className: "trace-step" }, [
      el("span", { className: "trace-step__index" }, [String(index + 1)]),
      el("div", { className: "trace-step__body" }, body),
    ]);

    if (!reduced) {
      item.style.animationDelay = `${index * STAGGER_MS}ms`;
      item.classList.add("trace-step--animated");
    }

    list.append(item);
  });

  return list;
}
