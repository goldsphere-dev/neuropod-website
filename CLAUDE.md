# NeuroPod Landing Page — Claude Code Instructions

## Project Overview
NeuroPod is a neuroscience-based AI trading discipline platform.
Static HTML/CSS/JS landing page (no build step, no framework).
- **Repo**: `goldsphere-dev/neuropod-website` on GitHub
- **Active branch**: `feature/pre-launch-1pager`
- **Live domain**: `www.myneuropod.com`
- **Waitlist endpoint**: `https://www.myneuropod.com/subscribe`

## Files
- `index.html` — single-page HTML
- `assets/css/main.css` — all styles
- `assets/js/main.js` — scroll, parallax, gauge animation, form submit, toast

## Brand / Design Tokens
| Token | Value | Usage |
|---|---|---|
| `--navy` | `#0d1a30` | page background |
| `--navy-mid` | `#0f1e36` | card/section bg |
| `--navy-light` | `#1a2d4a` | borders, hover states |
| `--accent` (cyan) | `#00d4ff` | primary accent, CTAs |
| `--amber` | `#f59e0b` | secondary accent, alternating cards |
| `--violet` | `#818cf8` | tertiary accent (peek-badge--indigo) |
| `--white` | `#f0f6ff` | headings |
| `--text` | `#c8d8f0` | body text |
| `--text-muted` | `#7a9cc0` | secondary text |
| `--text-dim` | `#4a6a8a` | footnotes/labels |

## Typography
- **Headings**: Space Grotesk (800 weight, `letter-spacing: -0.03em`)
- **Body/Nav**: DM Sans (400/500)
- **Monospace labels**: JetBrains Mono

## Section Structure (in order)
1. `#hero` — neural SVG bg, gauge, hero form, scroll indicator
2. Trust strip — marquee of feature claims (black bg, seamless loop)
3. `#problem` — problem cards with cyan/amber hover glows
4. `#solution` — feature items + timeline
5. `#how-it-works` — 3 peek cards (cards 1&3 cyan, card 2 amber)
6. `#science` — 3 science stat cards with gradient text + glow animation
7. `#who` — who-card grid + who-qualifier amber accent box
8. `#cta` — waitlist CTA form with amber badge
9. Footer — gradient top border (cyan→amber)

## Key Design Decisions (DO NOT change without reading this)

### Gradient text + glow
Use `filter: drop-shadow()` — **never** `text-shadow` on gradient text.
`-webkit-text-fill-color: transparent` makes `text-shadow` render as a solid coloured block at peak opacity. Always use `filter: drop-shadow` with moderate values: `6px/0.45` rest → `14px/0.75` peak.

### Diagonal section dividers
`clip-path: polygon()` on `::before` pseudo-elements (not the section itself).
Putting `clip-path` on the section itself breaks `backdrop-filter` on children.

### Seamless marquee
Content is doubled in HTML. `animation: marquee-scroll 40s linear infinite` on the inner wrapper. `translateX(-50%)` animates exactly one copy width.

### Gauge arc gradient
SVG `linearGradient` with `y1="0%" y2="100%"` (vertical). Stops: `0%=#f59e0b` (amber, arc start/12 o'clock), `55%=#00e5c8`, `100%=#00d4ff` (cyan, arc tip).

### Footer gradient border
Uses explicit longhand (not shorthand `background`):
```css
background-image:
  linear-gradient(var(--navy-mid), var(--navy-mid)),
  linear-gradient(90deg, transparent 0%, rgba(0,212,255,0.25) 35%, rgba(245,158,11,0.25) 65%, transparent 100%);
background-origin: padding-box, border-box;
background-clip: padding-box, border-box;
```

### Peek cards (how-it-works)
- Odd cards (1st, 3rd): cyan default
- Even cards (2nd): amber — `.peek-card:nth-child(even)`

### Science stat cards
- Cards 1 & 3: cyan gradient text + `@keyframes cyan-pulse-glow`
- Card 2: amber gradient text + `@keyframes science-glow-pulse-amber`

### Section labels (.section-label)
All amber pill: `background: rgba(245,158,11,0.10)`, `border: 1px solid rgba(245,158,11,0.35)`.

### Nav
- Logo hover: `text-decoration: none`
- Nav link hover: `color: var(--amber)`, `background: rgba(245,158,11,0.06)`

## Neural Network SVG (in hero)
15 nodes, 6 animated signal paths with `filter="url(#signal-glow)"`.
Node radii (largest set): n1=11.25, n2/3/5=10.13, n4/6/7/8/10=9, n9/11–15=7.88.
`feGaussianBlur stdDeviation="5"`.

## Scroll Indicator
HTML already in `index.html` just before hero `</section>`:
```html
<div class="scroll-indicator" aria-hidden="true">
  <div class="scroll-line"></div>
</div>
```
JS fade-out on scroll > 100px is in `main.js` (end of file).

## Animations (keyframes in main.css)
| Name | Used on |
|---|---|
| `cyan-pulse-glow` | science stat cards 1 & 3 |
| `science-glow-pulse-amber` | science stat card 2 |
| `gauge-pulse` | gauge arc glow |
| `dot-cyan-pulse` | hero eyebrow dot |
| `scroll-drop` | scroll indicator line |
| `amber-border-pulse` | CTA section border |
| `marquee-scroll` | trust strip |

## Deployment Rules
- Never push directly to `master`
- Always use `feature/pre-launch-1pager` (or a new feature branch)
- No `Co-Authored-By` in commits (breaks Vercel)

## Current Build State (last updated: 2026-04-27)
All work is on `feature/pre-launch-1pager`. Latest commit: `11f4042`.
No open tasks — page is in polish/refinement phase.
