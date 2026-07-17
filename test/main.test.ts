// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

async function mountApp(): Promise<void> {
  document.body.innerHTML = '<div id="app"></div>';
  vi.resetModules();
  await import("../src/main");
}

function setOperand(id: "operand-a" | "operand-b", value: string): void {
  const input = document.getElementById(id) as HTMLInputElement;
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function clickOperator(label: string): void {
  const buttons = [...document.querySelectorAll<HTMLButtonElement>(".operator-toggle")];
  const button = buttons.find((b) => b.textContent === label);
  if (!button) throw new Error(`no operator toggle labeled ${label}`);
  button.click();
}

describe("main app bootstrap", () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does nothing and does not throw when #app is missing from the page", async () => {
    document.body.innerHTML = "";
    vi.resetModules();
    await expect(import("../src/main")).resolves.toBeDefined();
  });

  it("renders both default operands and a result badge on load", async () => {
    await mountApp();
    const aInput = document.getElementById("operand-a") as HTMLInputElement;
    const bInput = document.getElementById("operand-b") as HTMLInputElement;
    expect(aInput.value).toBe("[]");
    expect(bInput.value).toBe("{}");

    const badge = document.querySelector(".result-badge__value");
    expect(badge?.textContent).toBe('"[object Object]"');
    expect(document.querySelectorAll(".trace-step")).not.toHaveLength(0);
  });

  it("shows an inline error on the invalid operand while the other stays interactive", async () => {
    await mountApp();
    setOperand("operand-a", "not valid js");

    const aError = document.getElementById("operand-a-error");
    expect(aError?.textContent).toMatch(/Unsupported expression|Unexpected/);
    expect(document.querySelector(".result-badge")).toBeNull();
    expect(document.querySelector(".trace-panel__empty")?.textContent).toMatch(/Fix the invalid operand/);

    const bReadout = document.querySelector(".operand-card[data-operand='b'] .operand-card__readout");
    expect(bReadout?.textContent).toBe("= {}");

    clickOperator("==");
    const buttons = [...document.querySelectorAll<HTMLButtonElement>(".operator-toggle")];
    const eqButton = buttons.find((b) => b.textContent === "==")!;
    expect(eqButton.getAttribute("aria-checked")).toBe("true");
  });

  it("clears the operand error once the input becomes valid again", async () => {
    await mountApp();
    setOperand("operand-a", "not valid js");
    expect(document.getElementById("operand-a-error")?.textContent).not.toBe("");

    setOperand("operand-a", "1");
    expect(document.getElementById("operand-a-error")?.textContent).toBe("");
    expect(document.querySelector(".result-badge")).not.toBeNull();
  });

  it("switches operator and re-renders without leaving a stale trace", async () => {
    await mountApp();
    setOperand("operand-a", "1");
    setOperand("operand-b", "'1'");

    clickOperator("==");
    expect(document.querySelector(".result-badge__value")?.textContent).toBe("true");

    clickOperator("+");
    expect(document.querySelector(".result-badge__value")?.textContent).toBe('"11"');
  });

  it("evaluates Boolean() independently per operand with two badges", async () => {
    await mountApp();
    setOperand("operand-a", "0");
    setOperand("operand-b", "1");
    clickOperator("Boolean()");

    const values = [...document.querySelectorAll(".result-badge__value")].map((n) => n.textContent);
    expect(values).toEqual(["false", "true"]);
  });

  it("shows the parsing-quirk callout only for {} + valid-B and hides it otherwise", async () => {
    await mountApp();
    setOperand("operand-a", "{}");
    setOperand("operand-b", "5");

    const callout = document.querySelector(".quirk-callout") as HTMLElement;
    expect(callout.hidden).toBe(false);
    expect(callout.textContent).toContain("[object Object]");
    expect(callout.textContent).toContain("5");

    setOperand("operand-a", "[]");
    expect(callout.hidden).toBe(true);
    expect(callout.childNodes).toHaveLength(0);
  });

  it("survives rapid successive input changes, ending on the last value", async () => {
    await mountApp();
    setOperand("operand-a", "1");
    setOperand("operand-a", "2");
    setOperand("operand-a", "3");

    const aReadout = document.querySelector(".operand-card[data-operand='a'] .operand-card__readout");
    expect(aReadout?.textContent).toBe("= 3");
  });

  it("re-mounting rebuilds fresh default state (module re-import, like a page refresh)", async () => {
    await mountApp();
    setOperand("operand-a", "999");

    await mountApp();
    const aInput = document.getElementById("operand-a") as HTMLInputElement;
    expect(aInput.value).toBe("[]");
  });
});
