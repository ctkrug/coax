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

## Planned features

- **Operand editor** — enter any two JS values (primitives, arrays, objects,
  `null`/`undefined`, `NaN`, `-0`, symbols where legal) as live-typed JS
  expressions, not a dropdown of preset gotchas.
- **Operator oracle** — evaluate `==`, `+`, `Boolean(x)` (unary, per operand),
  and template-literal interpolation (`` `${a}${b}` ``) against the two operands.
- **Spec step trace** — a rendered, numbered trace of the abstract operations
  invoked (`ToPrimitive`, `OrdinaryToPrimitive`, `ToNumber`, `ToString`,
  `ToBoolean`, the Abstract/Strict Equality Comparison algorithms) showing each
  intermediate value, annotated with the spec section it comes from.
- **Shareable permalink** — encode the current operand pair + operator in the
  URL so a trace can be linked directly into a PR comment or Slack thread.
- **Preset gotcha gallery** — an optional, secondary list of the classic
  gotchas (`[] + []`, `'5' + 3`, `1 == '1'`, ...) as quick-load examples, not
  the primary interface.

## Stack

Client-only TypeScript, static-site output (no server, no backend). Built and
tested with the Node.js toolchain; ships as a single deployable `dist/`
directory suitable for hosting behind any static file server or CDN subpath.

## Status

Early scaffold — see [`docs/VISION.md`](docs/VISION.md) for the full design
rationale and [`docs/BACKLOG.md`](docs/BACKLOG.md) for the build plan.
