# Design direction

## 1. Aesthetic direction

**Blueprint/technical.** The Oracle reads like an engineering schematic for
the ECMAScript spec: deep navy drafting-table backgrounds, cyan linework,
grid paper, and warm grease-pencil amber for annotations and callouts. The
point of the whole product is "this isn't folklore, it's a knowable
algorithm" — the visual language should feel like reading a wiring diagram,
not a meme card. This is a deliberate departure from the generic
dark-gray-cards-plus-one-accent look: everything is drawn with linework,
grid structure, and numbered callouts rather than soft flat panels.

## 2. Tokens

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0b1220` | page background (deep navy, blueprint-paper) |
| `--surface-1` | `#111c33` | panel background (operand cards, trace panel) |
| `--surface-2` | `#16233f` | raised surface (active/focused panel, header bar) |
| `--text` | `#e7edf7` | primary text, blue-white |
| `--text-muted` | `#8291b3` | secondary text, spec-section labels |
| `--accent` | `#4fd1ff` | blueprint cyan — linework, active states, links |
| `--accent-support` | `#ffb454` | grease-pencil amber — annotations, callout numbers |
| `--success` | `#5fd68a` | true/positive result badges |
| `--danger` | `#ff6b6b` | TypeError / false / negative result badges |
| Display font | **Space Grotesk** (Google Fonts) | wordmark, headings — geometric, technical, slightly mechanical |
| UI/mono font | **JetBrains Mono** (Google Fonts) | operand inputs, values, spec-step trace — everything that IS a value gets set in mono |
| Fallbacks | `system-ui, sans-serif` / `ui-monospace, monospace` | |
| Spacing unit | 8px scale (8/16/24/32/48/64) | |
| Corner radius | 4px (panels), 2px (inputs/badges) — sharp, drafted, not soft/bubbly | |
| Shadow/glow | soft cyan glow (`0 0 24px rgba(79,209,255,0.15)`) on focused/active panels; no drop shadows elsewhere — panels sit flat on the blueprint grid | |
| Motion | UI transitions 150–200ms ease-out; trace steps reveal in a 90ms stagger cascade so the algorithm visibly "unfolds" | |

## 3. Layout intent

**Hero: the operand editor + the trace panel, side by side.** The core
interaction — type two values, see the operators fire, read the trace — gets
the overwhelming majority of the screen. There is no marketing hero above
it; the tool IS the landing page.

- **1440×900 desktop:** two-column schematic layout. Left column (~35%
  width): two stacked operand cards (Operand A / Operand B), each a
  labeled input with a live-parsed-value readout, plus an operator strip
  (`==`, `+`, `Boolean()`, `` `${}` ``) styled as toggle switches. Right
  column (~65% width): the trace panel — a vertical numbered schematic of
  every abstract-operation step, each step a callout box connected to the
  next by a thin cyan connector line, terminating in a large result badge.
  This fills well over 60vh.
- **390×844 phone:** single column, operand cards stacked full-width at
  top, operator strip becomes a horizontal scrollable row of toggle chips,
  trace panel below with the same numbered-callout treatment but
  full-width cards instead of a connected column (no room for the
  connector lines at this width — replaced by a simple numbered rail on
  the left edge of each card).

## 4. Signature detail

A **hand-drafted wordmark**: "Type Coercion **Oracle**" set in Space
Grotesk, with a custom monogram glyph — `≟` (question-equals) — drawn as an
animated blueprint linework icon that "draws itself" (stroke-dasharray
animation) on first load, echoing the trace-steps-unfolding motion used
throughout the app. The page background is a faint fixed cyan grid
(blueprint graph paper, ~24px cells, 4% opacity) that never moves, giving
every surface a sense of sitting on a drafting table.

## 5. Interaction feedback (dev tool, not a game — no SFX/juice plan needed)

This is a precision tool, not a playful toy, so the full D1.5 juice plan
(synth SFX, particles, win celebration) does not apply. The interaction
feedback that DOES matter, since the wow moment depends on it reading as
"alive":

- Typing an operand re-evaluates live (debounced ~120ms) — no submit button.
- Each trace step reveals with a 90ms-staggered fade+slide-up cascade so
  swapping `[] + {}` for `{} + []` visibly re-derives a *different* trace,
  not just a different final number.
- The result badge (success green / danger red for thrown TypeErrors)
  pulses once on change — a single 150ms scale pop, not a loop.
- Respects `prefers-reduced-motion`: cascade and pulse collapse to an
  instant state change, connector-line draw-on becomes static.
