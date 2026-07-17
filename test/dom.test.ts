// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { el } from "../src/ui/dom";

describe("el()", () => {
  it("creates an element of the requested tag", () => {
    const node = el("div");
    expect(node.tagName).toBe("DIV");
  });

  it("sets className via the className prop key", () => {
    const node = el("div", { className: "foo bar" });
    expect(node.className).toBe("foo bar");
  });

  it("sets aria-*, role, and data-* props as real attributes", () => {
    const node = el("div", { "aria-label": "Operand", role: "alert", "data-operand": "a" });
    expect(node.getAttribute("aria-label")).toBe("Operand");
    expect(node.getAttribute("role")).toBe("alert");
    expect(node.getAttribute("data-operand")).toBe("a");
  });

  it("sets other props directly as element properties", () => {
    const node = el("input", { type: "text", value: "hello", id: "operand-a" });
    expect(node.type).toBe("text");
    expect(node.value).toBe("hello");
    expect(node.id).toBe("operand-a");
  });

  it("appends string children as text nodes via textContent, never innerHTML", () => {
    const node = el("p", {}, ["<script>alert(1)</script>"]);
    expect(node.childNodes).toHaveLength(1);
    expect(node.childNodes[0].nodeType).toBe(Node.TEXT_NODE);
    expect(node.textContent).toBe("<script>alert(1)</script>");
    expect(node.innerHTML).not.toContain("<script>");
  });

  it("appends element children in order alongside string children", () => {
    const child = el("span", {}, ["inner"]);
    const node = el("div", {}, ["before ", child, " after"]);
    expect(node.textContent).toBe("before inner after");
    expect(node.children).toHaveLength(1);
    expect(node.children[0]).toBe(child);
  });

  it("defaults to no props and no children when omitted", () => {
    const node = el("section");
    expect(node.attributes).toHaveLength(0);
    expect(node.childNodes).toHaveLength(0);
  });
});
