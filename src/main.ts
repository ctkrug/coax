import { Tracer } from "./spec/trace";
import { toNumber } from "./spec/toNumber";

/**
 * Scaffold entrypoint: proves the spec engine and DOM wiring work end to
 * end. Replaced by the full operand-editor UI in the BUILD phase.
 */
function render(): void {
  const app = document.querySelector<HTMLDivElement>("#app");
  if (!app) return;

  const tracer = new Tracer();
  const result = toNumber([] as unknown, tracer);

  app.innerHTML = `
    <main>
      <h1>Type Coercion Oracle</h1>
      <p>Scaffold running. ToNumber([]) = ${result}</p>
      <ul>
        ${tracer.steps
          .map((s) => `<li><code>${s.operation}</code> (${s.specSection}): ${s.detail}</li>`)
          .join("")}
      </ul>
    </main>
  `;
}

render();
