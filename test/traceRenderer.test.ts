// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderTrace } from "../src/ui/traceRenderer";
import { TraceStep } from "../src/spec/trace";

function mockMatchMedia(matches: boolean): void {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

const steps: TraceStep[] = [
  { operation: "ToPrimitive", specSection: "7.1.1", input: [], output: "", detail: "first step" },
  { operation: "ToNumber", specSection: "7.1.4", input: "", output: 0, detail: "second step" },
];

describe("renderTrace", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders an ordered list with one item per step", () => {
    mockMatchMedia(false);
    const list = renderTrace(steps);
    expect(list.tagName).toBe("OL");
    expect(list.querySelectorAll("li.trace-step")).toHaveLength(2);
  });

  it("numbers each step starting at 1", () => {
    mockMatchMedia(false);
    const list = renderTrace(steps);
    const indices = [...list.querySelectorAll(".trace-step__index")].map((n) => n.textContent);
    expect(indices).toEqual(["1", "2"]);
  });

  it("renders the operation and spec section for each step", () => {
    mockMatchMedia(false);
    const list = renderTrace(steps);
    expect(list.textContent).toContain("ToPrimitive");
    expect(list.textContent).toContain("7.1.1");
    expect(list.textContent).toContain("first step");
  });

  it("stages a staggered animation delay when motion is not reduced", () => {
    mockMatchMedia(false);
    const list = renderTrace(steps);
    const items = [...list.querySelectorAll("li.trace-step")] as HTMLElement[];
    expect(items[0].classList.contains("trace-step--animated")).toBe(true);
    expect(items[0].style.animationDelay).toBe("0ms");
    expect(items[1].style.animationDelay).toBe("90ms");
  });

  it("skips the animation class and delay when prefers-reduced-motion is set", () => {
    mockMatchMedia(true);
    const list = renderTrace(steps);
    const items = [...list.querySelectorAll("li.trace-step")] as HTMLElement[];
    items.forEach((item) => {
      expect(item.classList.contains("trace-step--animated")).toBe(false);
      expect(item.style.animationDelay).toBe("");
    });
  });

  it("renders an output line only when the step has a defined output", () => {
    mockMatchMedia(false);
    const withUndefinedOutput: TraceStep[] = [
      { operation: "Note", specSection: "1.1", input: undefined, output: undefined, detail: "no output here" },
    ];
    const list = renderTrace(withUndefinedOutput);
    expect(list.querySelector(".trace-step__output")).toBeNull();
  });

  it("renders an empty list for zero steps", () => {
    mockMatchMedia(false);
    const list = renderTrace([]);
    expect(list.children).toHaveLength(0);
  });
});
