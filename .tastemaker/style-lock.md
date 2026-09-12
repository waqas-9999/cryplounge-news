# Style lock — Newsroom Intelligence (admin)

Scope: `/admin/newsroom-intelligence` only. The rest of the admin keeps its existing light/dark Tailwind styling.

## Design read
- Surface: data view / operational canvas (app shell). Audience: editors and super admins. Visitor mode: monitoring, then drilling in.
- Lane: newsroom intelligence terminal. Dials: variance low, motion low-medium (data-driven only), density high, art direction: one cinematic object (the globe).
- Thesis: the globe is the instrument, not the backdrop. Everything else is a quiet instrument panel around it.

## Mode
Single committed dark look (not theme-toggled): this page is a control room.

## Color contract (checked with check_contrast.py --matrix)
- bg `#07080A`, surface `#0F1115`, border `#262A31` (hairline, decorative only), text `#E8EAED`, muted `#8B929C` (6.0:1 on surface), faint `#767D88` (4.55:1, minimum for any text).
- Brand accent: CrypLounge gold `#EFB81A` (existing admin map accent) — LIVE/brand mark and selection only.
- Stage semantics (all ≥4.5:1 on surface): DISCOVERED `#6E9BF5`, RESEARCH `#4FC3D9`, VERIFICATION `#E0A33A`, IMAGE `#D46FA8` (sparingly), FILING `#9B8CF0`, DRAFT `#C9CDD3`, PUBLISHED `#4CC38A`, HELD `#767D88`, REJECTED `#E5605A`.
- Legal text pairings: text/bg, text/surface, muted/surface, faint/surface, every stage color/surface. Border/bg is decorative: never the only state signal.

## Type
Existing stack: Inter (UI), system monospace for timestamps, ids and metrics only. Operational labels: 10–11px uppercase, tracking 0.08em. Numbers: tabular-nums.

## Density & spacing
4px base. Panel padding 12–16px; gap between floating instruments ≥16px (external ≥ internal). Radius 6px on instruments, 999px only on dots.

## Motion
App-shell track. Canvas: slow auto-rotation, pulse on real event arrival, particles only on real corroboration arcs. DOM: panel fade/slide 180ms ease-out, event arrival 220ms. prefers-reduced-motion: no rotation, no pulses, no slides.

## Assets
No photography/illustration: the Earth is rendered from bundled `world-atlas` land geometry. Icons: lucide-react (already in repo).
