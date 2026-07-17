---
title: "I built a tool that runs the JavaScript coercion spec so you can read it"
published: false
tags: javascript, webdev, typescript, showdev
---

Every article about JavaScript type coercion is the same ten-row table:
`[] + []`, `'5' + 3`, `1 == '1'`, `NaN === NaN`. They are memorable, and they
teach you nothing. The moment your bug involves a value that is not in the
famous ten, an object with a custom `valueOf`, a nested array, a string that
came out of a form field when you expected a number, the table is useless and
you are back to pasting into a scratch `node` REPL and guessing.

The rules behind all of it are not a secret. `ToPrimitive`, `ToNumber`,
`ToString`, `ToBoolean`, and the Abstract Equality Comparison are a short,
deterministic algorithm published in ECMA-262. Almost nobody reads it, because
the spec is dense and nobody had built a tool that turns "read the spec" into
"type two values and watch the spec run." So I built **Coax**.

You type two values, pick `==`, `+`, `Boolean()`, or a template literal, and it
prints the numbered trace of every abstract operation, each with its spec
section and output. Type `[]` and `{}`, hit `+`, then swap the operands. Two
different results, each with its own trace. Coercion stops being folklore.

Two decisions shaped the build.

## The trace is a data structure, not a string

The obvious way to build this is to have each function append formatted lines
to a string. I did the opposite. Every spec function takes an optional
`Tracer` and records structured `TraceStep` objects:

```ts
export interface TraceStep {
  operation: string;    // "ToPrimitive"
  specSection: string;  // "7.1.1"
  input: unknown;
  output: unknown;
  detail: string;
}
```

The functions know nothing about the DOM. `looselyEquals(x, y, tracer)` returns
a boolean and records steps; a separate renderer turns `TraceStep[]` into the
numbered callout column. Two things fall out of this for free. The engine is
trivially unit-testable without a browser, which is most of why core logic sits
at 100 percent line coverage. And a future shareable-permalink feature can
serialize the trace directly instead of scraping formatted text. Keeping the
"what happened" separate from the "how it looks" is the kind of decision that
costs nothing on day one and pays back every time you touch the code after.

## A restricted parser instead of eval

The operand inputs accept `[1, [2], {a: 'x'}]`, so I needed to turn text into
real JS values. `eval` was never on the table: it runs arbitrary code, and this
is a page you paste unknown values into. So the operands go through a small
recursive-descent parser that accepts exactly one grammar, primitives, nested
arrays, and plain objects, and rejects everything else with an inline
`ParseError`.

Writing your own parser means owning your own edge cases. Two were interesting.

The first was a stack overflow. Deeply nested input like 5000 open brackets
recurses once per level and blows the call stack, turning a `ParseError` into a
process-killing `RangeError`. The fix is a depth counter with a 500-level cap
that throws a normal parse error long before the stack runs out.

The second I only found while hardening for release, and it is the good kind of
bug. The keyword lookup used a plain object and checked membership with
`if (word in KEYWORD_VALUES)`. The `in` operator walks the prototype chain, so
typing `toString`, `constructor`, or `valueOf` returned an inherited function
from `Object.prototype` instead of a parse error. The parser that promised to
only ever produce literals was quietly leaking `Object.prototype` members into
the coercion engine. Switching the lookup to a `Map`, whose `has` only sees its
own keys, closed it. It is a good reminder that `in` and object-as-dictionary
are a trap whenever the keys come from user input.

## What I would do differently

The engine covers primitives, plain objects, and arrays. `Symbol.toPrimitive`,
`BigInt`, and exotic objects like Proxies are real spec paths I left out of v1,
and the UI notes the boundary rather than getting it subtly wrong. If I keep
going, the permalink feature is next, precisely because the trace is already a
serializable structure.

Live page: https://apps.charliekrug.com/type-coercion-oracle/
Code: https://github.com/ctkrug/type-coercion-oracle

If you have a coercion result that has always annoyed you, paste it in and read
the steps. I would like to know which one finally made sense.
