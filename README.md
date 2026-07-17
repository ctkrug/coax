# Type Coercion Oracle

Type any two JavaScript values and watch exactly what `==`, `+`, `Boolean()`, and
template-literal coercion do to them — with the real ECMAScript spec steps printed
underneath, not a meme table of the ten famous gotchas.

## Why

Every "JS is weird" post shows you `[] + {}` and `{} + []` and tells you to
memorize the answer. None of them show you the algorithm that produces it. This
tool implements the actual spec abstract operations — `ToPrimitive`, `ToNumber`,
`ToString`, the Abstract Equality Comparison — so you can drop in the two values
you're actually debugging (not a canned list) and see the trace that explains
the result. It's meant to sit open in a tab while you're mid-debug, not to be
browsed once for the novelty.

## The wow moment

Type `[]` and `{}` into the two operand slots, hit `+`, then swap the operand
order. Two different results pop out, each with its own step-by-step trace
through `ToPrimitive` → `ToNumber`/`ToString` → the `+` operator's algorithm.
Coercion stops being folklore and starts being a knowable, steppable algorithm.

## Features

- **Operand editor** — type any two JS literal values (numbers, strings,
  booleans, `null`/`undefined`/`NaN`/`Infinity`, nested arrays/objects) into
  the two operand slots. Parsed by a restricted literal grammar — never
  `eval` — so unsupported syntax shows an inline error instead of crashing.
- **Operator oracle** — evaluate `==`, `+`, `Boolean(x)` (per operand), and
  template-literal interpolation (`` `${a}${b}` ``) against the two operands.
- **Spec step trace** — a rendered, numbered trace of the abstract operations
  invoked (`ToPrimitive`, `OrdinaryToPrimitive`, `ToNumber`, `ToString`,
  `ToBoolean`, the Abstract Equality Comparison algorithm), each step showing
  its spec section, a plain-English detail, and its output value.
- **The parsing-quirk callout** — when operand A is `{}` and the operator is
  `+`, a side panel explains why `{} + []` typed at a console top level
  (statement context, `{}` parses as an empty block) disagrees with the same
  values evaluated as an expression — and shows both results.

## Planned next

- **Shareable permalink** — encode the current operand pair + operator in the
  URL so a trace can be linked directly into a PR comment or Slack thread.
- **Preset gotcha gallery** — an optional, secondary list of the classic
  gotchas (`[] + []`, `'5' + 3`, `1 == '1'`, ...) as quick-load examples, not
  the primary interface.

## Usage

```
npm install
npm run dev        # local dev server
npm test            # vitest
npm run typecheck
npm run lint
npm run build        # static output in dist/, subpath-relative
```

Open the dev server and type into Operand A / Operand B — the trace updates
live, no submit button.

## Stack

Client-only TypeScript, static-site output (no server, no backend). Built and
tested with the Node.js toolchain; ships as a single deployable `dist/`
directory suitable for hosting behind any static file server or CDN subpath.

## Status

Core oracle functionally complete: all four operators, the hardened
ToPrimitive/ToNumber/ToString/ToBoolean/equality engine, the safe literal
parser, and the blueprint design direction are all in place. See
[`docs/VISION.md`](docs/VISION.md) for the design rationale,
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the module map, and
[`docs/BACKLOG.md`](docs/BACKLOG.md) for what's left (permalinks, preset
gallery, a11y/responsive hardening pass).
