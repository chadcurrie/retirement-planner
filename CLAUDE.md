# Retirement Planner — Claude Context

This file is the AI handoff document. Keep it current. A new Claude session on any account
should be able to read this and immediately continue productive work.

---

## What this is

A personal retirement savings and drawdown planner. The core value: a single chart showing
nest egg balance across a lifetime — curving up during accumulation, then down during drawdown.
Unlike rigid W-2-oriented tools, this lets the user model arbitrary financial phases
(entrepreneurship, consulting, sabbaticals) and point-in-time events (windfalls, inheritances).

The chart is always visible. Every change updates it in real time.

---

## Tech stack and why

| Tool | Choice | Reason |
|---|---|---|
| Framework | Vite + React + TypeScript | Static output for GitHub Pages, large ecosystem |
| Styling | Tailwind CSS v4 | Utility-first, mobile-first, NOT "AI proto" aesthetic |
| Components | shadcn/ui (add as needed) | High-quality, owned — run `npx shadcn@latest add <component>` |
| Charts | Recharts | React-native, pairs well with Tailwind |
| State | Zustand with `persist` middleware | Auto-syncs to localStorage, zero boilerplate |
| Persistence | localStorage + JSON export/import | Static-site-friendly, no backend needed |

---

## Key design decisions

**Real vs nominal dollars**: All user inputs and the chart Y-axis are in TODAY'S dollars
(real terms). The engine converts nominal return → real return internally by subtracting
inflationRate. A toggle to show nominal (future) dollars exists for reference, but real is
the default. Rationale: "$120k/year spending" means the same thing in any year on the chart.

**Inflation**: Single global `inflationRate` on the Profile (default 3%). Not per-phase.
Real return = nominalReturnRate - inflationRate, computed in `simulate()`.

**Phase model**: Contiguous age ranges with income, spending, and a nominal return rate.
Net annual nest egg change = income - spending + (balance × realReturnRate).
Gaps between phases are allowed but the UI should flag them.

**Events**: Point-in-time or recurring additions/subtractions (Social Security, windfalls,
large purchases). Recurring events handle "SS starts at 67, +$24k/year" elegantly.

**No auth, no backend**: GitHub Pages static deployment. All data in localStorage.
JSON export/import handles cross-device and backup.

---

## File map

```
src/
  data/
    types.ts          ← All TypeScript interfaces (Profile, Phase, PlanEvent, etc.)
    defaults.ts       ← Default starter plan loaded on first visit
  lib/
    simulation.ts     ← Pure simulation engine — no React, fully testable
                        simulate(), findDepletionAge(), findPeakBalance()
  store/
    planStore.ts      ← Zustand store with localStorage persistence
                        Actions: updateProfile, addPhase, updatePhase, removePhase,
                                 addEvent, updateEvent, removeEvent, toggleNominal,
                                 importPlan, exportPlan, resetToDefaults
  components/
    ui/               ← shadcn-generated components (add with `npx shadcn@latest add`)
  features/           ← Domain feature components (chart, phase editor, event editor, etc.)
  hooks/              ← Custom React hooks
  App.tsx             ← Layout shell: sticky chart panel (right/top) + scrollable controls
```

---

## Simulation engine contract

`simulate(profile, phases, events)` returns `SimulationDataPoint[]`:
- `balance`: real (today's dollars)
- `balanceNominal`: nominal (future dollars) — same data, inflated for toggle view
- `annualContribution`: income - spending for this year (positive = saving, negative = drawing)
- `activePhase`: name of the active phase (for chart tooltips)

Balance is capped at 0 (never goes negative). `findDepletionAge()` returns the age it
first hits zero, or null if it never does.

---

## Layout contract

The chart must always be visible. On desktop: right panel (sticky, full height).
On mobile: chart renders at top, controls scroll below. This is the core UX constraint —
every layout decision should preserve it.

---

## Current state

- [x] Project scaffolded (Vite + React + TypeScript + Tailwind v4)
- [x] TypeScript types defined (src/data/types.ts)
- [x] Default starter plan (src/data/defaults.ts)
- [x] Simulation engine (src/lib/simulation.ts)
- [x] Zustand store with localStorage persistence (src/store/planStore.ts)
- [x] Layout shell — chart fixed at top, editor scrolls below (src/App.tsx)
- [x] GitHub Actions deploy workflow
- [x] Chart component — Recharts AreaChart, real/nominal toggle, stat chips (src/features/chart/)
- [x] Profile editor (src/features/editor/ProfileEditor.tsx)
- [x] Phase list + editor with timeline bars (src/features/editor/PhaseCard.tsx)
- [x] Event list + editor with timeline dots (src/features/editor/EventCard.tsx)
- [x] Import/export UI (header buttons in App.tsx)
- [x] Design token system — light/dark mode, rebrandable (src/index.css + src/lib/tokens.ts)
- [x] Dark mode toggle with localStorage persistence (src/hooks/useDarkMode.ts)
- [ ] Mobile polish / responsive refinement
- [ ] Number input UX (format large numbers, handle empty-field editing more gracefully)
- [ ] Phase color bands on the chart (match timeline bar colors)
- [ ] Scenario notes / description field

---

## GitHub Pages deployment

Before first deploy, update `vite.config.ts`:
```ts
base: '/your-repo-name/',
```
Then push to `main` — GitHub Actions handles the rest.
Enable Pages in repo Settings → Pages → Source: GitHub Actions.

---

## Theming and dark mode

**Token system** — all colors and fonts are CSS custom properties in `src/index.css`.
Never use hardcoded Tailwind color classes (gray-200, blue-600, etc.) in components.
Use the semantic utility classes instead:

| Semantic class      | Meaning                         |
|---------------------|---------------------------------|
| `bg-canvas`         | Page background                 |
| `bg-surface`        | Card / panel background         |
| `bg-subtle`         | Input bg, hover states          |
| `border-border`     | Default border                  |
| `text-ink`          | Primary text                    |
| `text-ink-2`        | Secondary / label text          |
| `text-ink-3`        | Muted / placeholder text        |
| `bg-brand`          | Primary action background       |
| `text-brand`        | Brand-colored text              |
| `bg-brand-subtle`   | Chip / badge background         |
| `text-brand-on`     | Text on brand-subtle bg         |
| `bg-success-subtle` | Success chip background         |
| `text-success`      | Success text                    |
| `bg-warn-subtle`    | Warning chip background         |
| `text-warn`         | Warning text                    |
| `text-danger`       | Error / destructive text        |

**To rebrand:** Edit the 3 hex values under `/* Brand */` in `:root` in `src/index.css`,
and update the matching values in `src/lib/tokens.ts` (used by Recharts).

**To change font:** Add a font @import at the top of `src/index.css`, then change `--font-ui`.

**Dark mode:** Toggle `.dark` class on `<html>`. `src/hooks/useDarkMode.ts` handles this
with localStorage persistence. Dark token values are in the `.dark` block in `index.css`.

**Chart colors** (`src/lib/tokens.ts`): Recharts is SVG-based and can't read CSS classes.
Chart colors are stored as hex constants in `chartColors` — keep them in sync with `index.css`.
Phase timeline bar colors are in `PHASE_COLORS` (decorative, not semantic tokens).

---

## What NOT to build (deliberate scope limits)

- Auth or user accounts
- Tax modeling (Roth vs traditional, marginal rates) — future v2
- Monte Carlo / probabilistic projections — future v2
- Multiple saved scenarios — future v2 (data model supports it via JSON export)
- Backend of any kind
