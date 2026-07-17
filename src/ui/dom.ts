type Props = Record<string, string> & { className?: string };

/** Minimal, XSS-safe element builder: text children always go through textContent, never innerHTML. */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Props = {},
  children: (Node | string)[] = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === "className") {
      node.className = value;
    } else if (key.startsWith("aria-") || key === "role" || key.startsWith("data-")) {
      node.setAttribute(key, value);
    } else {
      (node as unknown as Record<string, unknown>)[key] = value;
    }
  }
  for (const child of children) {
    node.append(typeof child === "string" ? document.createTextNode(child) : child);
  }
  return node;
}
