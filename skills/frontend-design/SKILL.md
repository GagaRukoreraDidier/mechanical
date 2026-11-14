---
name: frontend-design
description: E-Homework VJN-YEIP design system for the Next.js frontend — brand palette (Midnight Black #010313, Chrysocolla Blue #23A6BD), Outfit font, type scale, spacing, Tailwind class recipes and component styling. Use when creating, editing or restyling any page or component under frontend/src (any .tsx file), or when the user asks to make a screen match the design. Front-load keywords: design, colour, palette, theme, styling, font, Tailwind, button, card, table, sidebar, dashboard, make it look good.
---

# E-Homework design system

Shared class strings live in `frontend/src/lib/variants/ds.ts` — use them
instead of re-typing classes. Combine with `cn()` from `@/lib/utils`.
**Neither file exists yet — create them before importing from them.**

Key exports:

- Layout and text: `pageTitle`, `pageSubtitle`, `headingRow`, `headingLeft`,
  `headingActions`, `iconTileLg`, `iconTileCard`, `iconTileStat`, `iconTileInset`,
  `gridCards`, `twoColGrid`
- Surfaces: `card`, `cardHeaderBar`, `cardHeaderLeft`, `cardTitle`, `cardSubtitle`,
  `cardToolbar`, `insetTile`, `statCard`, `statLabel`, `statValue`, `statHint`
- Controls: `btnBase` + `btnPrimary` / `btnOutline` / `btnGhost` / `btnDanger`,
  `btnCompact`, `badgeBase` / `badgeTiny` + `badgeTones[tone]`, `searchInput`,
  `textInput`, tabs, tables, lists, `emptyState`, `link`, `linkSm`, `overline`,
  `sectionLabel`
- Status: `statusFor(value)` is the single threshold function; pair it with
  `statusColor`, `statusSoftBg`, `statusTone`. Chart colours come from `CHART_COLORS`.

App shell: `frontend/src/app/layout.tsx` provides the page background, padding
and font, so pages start directly with the heading row.

## Character of the design

- **Light, clean and calm.** A soft grey canvas with white cards floating on it.
- **One accent colour (Chrysocolla Blue)** carries all emphasis: primary
  actions, links, active states and icon tiles.
- **Dark surfaces only in the app shell** — sidebar, footer and auth heroes use
  Midnight Black. Content cards are never dark.
- **Small, precise typography** in one geometric font (Outfit), sized in exact pixels.
- **Hairline borders and soft shadows** separate things; no heavy boxes, no
  gradients on content, no glassmorphism.
- **Strong hierarchy through weight and colour,** not size jumps: bold dark
  titles, regular grey secondary text, tiny uppercase muted labels.
- **Generous but consistent spacing,** on a 4px rhythm.
- **Rounded, friendly shapes:** large radius on cards, medium on controls,
  fully round on badges and bars.
- **Subtle motion:** elements lift slightly on hover, and bars grow in. Nothing
  bouncy or slow.

---

# 1. Colour palette

## Brand anchors

| Name             | Hex       | Use                                              |
| ---------------- | --------- | ------------------------------------------------ |
| Midnight Black   | `#010313` | Dark surfaces, primary text, dark-shell base      |
| Chrysocolla Blue | `#23A6BD` | Accent fills: buttons, active states, icon tiles   |

### Accent tokens

| Token         | Hex       | Use                                                      |
| ------------- | --------- | -------------------------------------------------------- |
| accent        | `#23A6BD` | Fills — primary button, active tab, number badge          |
| accent-hover  | `#1a879c` | Hover/pressed fill                                        |
| accent-ink    | `#1a6c80` | **Accent text on white** — links, labels, icon-tile glyphs |
| accent-tint   | `#eefbfc` | Tinted background for icon tiles, chips, soft badges       |
| accent-border | `#23A6BD` | Outline controls, focus ring                               |
| accent-onDark | `#23A6BD` | Accent on Midnight Black (6.6:1)                           |

> **Contrast rule.** `#23A6BD` on white is only ~2.9:1 — never set body or
> link text in it. Use `#1a6c80` for accent text (5.9:1). White on `#23A6BD`
> is ~2.4:1 — never put white text on the accent fill; pair the fill with
> `#010313` (6.6:1). On Midnight Black, `#23A6BD` is fine at any size.

## Chrysocolla Blue scale

| Step | Hex       | Apply to                                             |
| ---- | --------- | ---------------------------------------------------- |
| 50   | `#eefbfc` | Tinted backgrounds, chips, info banners              |
| 100  | `#d2f4f7` | Hover fills on light surfaces                        |
| 200  | `#a9e9ef` | Borders on accent surfaces                           |
| 300  | `#73d9e4` | Disabled accent, decorative strokes                  |
| 400  | `#3ac2ce` | Hover state hint                                     |
| 500  | `#23A6BD` | **Primary fill**                                      |
| 600  | `#1a879c` | Primary hover / pressed                              |
| 700  | `#1a6c80` | **Accent text on light (AA-safe)**                    |
| 800  | `#1b5869` | Strong accent headings on light                      |
| 900  | `#1a4a59` | Accent emphasis                                       |
| 950  | `#0c2d38` | Accent on very dark surfaces                         |

## Midnight Black scale (dark shell + text)

| Step | Hex       | Apply to                                            |
| ---- | --------- | --------------------------------------------------- |
| 950  | `#010313` | **Darkest** — sidebar base, dark hero, primary text   |
| 900  | `#050819` | Sidebar gradient end, dark card base                 |
| 800  | `#0a1024` | Dark card elevated, input on dark                    |
| 700  | `#111a33` | Dark borders, dark hover                             |
| 600  | `#1a2542` | Dark dividers                                        |
| 500  | `#263254` | Muted dark text, placeholder on dark                 |
| 400  | `#3a4770` | Secondary text on dark                               |
| 300  | `#55608f` | Tertiary text on dark                                |
| 200  | `#7b83b0` | Disabled text on dark                                |
| 100  | `#b3b8d1` | Body text on dark (primary readable)                 |
| 50   | `#e6e8f1` | Headings on dark (highest contrast)                  |

Text roles on a Midnight surface: headings `#e6e8f1`, body `#b3b8d1`,
secondary `#55608f`, accent `#23A6BD`.

## Neutrals (light)

| Role                          | Hex       |
| ----------------------------- | --------- |
| Page background               | `#f5f6f8` |
| Surface (cards)               | `#ffffff` |
| Subtle surface (header rows, hover, inset tiles) | `#fafbfc` |
| Card border                   | `#ececf0` |
| Inner dividers                | `#f1f5f9` |
| Toolbar divider               | `#e6e8ec` |
| Input border                  | `#e5e7eb` |
| Neutral chip background       | `#f3f4f6` |
| Text primary                  | `#010313` |
| Text secondary                | `#6b7280` |
| Text muted / placeholder      | `#9ca3af` |
| Text on neutral chips         | `#4b5563` |

Focus ring: `ring-2 ring-[#23A6BD]/15`, deepening to `/30`.

## Tone pairs (background / text)

For badges, icon tiles and states.

| Tone              | Background | Text        |
| ----------------- | ---------- | ----------- |
| brand (accent)    | `#eefbfc`  | `#1a6c80`   |
| green (success)   | `#ecfdf5`  | `#047857`   |
| amber (warning)   | `#fef3c7`  | `#92400e`   |
| rose (danger)     | `#fff1f2`  | `#be123c`   |
| gray (neutral)    | `#f3f4f6`  | `#4b5563`   |
| blue (info)       | `#eff6ff`  | `#1d4ed8`   |
| violet (codes)    | `#f3e8ff`  | `#7c3aed`   |

## Status scale (percentages, scores, health)

| Level              | Solid      | Soft background (8%)             |
| ------------------ | ---------- | -------------------------------- |
| Excellent (≥ 100)  | `#23A6BD`  | `rgba(35,166,189,0.08)`          |
| Good (75–99)       | `#2e7d32`  | `rgba(46,125,50,0.08)`           |
| Warning (50–74)    | `#f9a825`  | `rgba(249,168,37,0.08)`          |
| Critical (< 50)    | `#d32f2f`  | `rgba(211,47,47,0.08)`           |

Use one threshold function everywhere (`statusFor` in `ds.ts`), so a colour, a
count and a filter always agree.

---

# 2. Font

- Family: **Poppins** (self-hosted via `@fontsource/poppins`, weights 400/500/600/700),
  fallback `sans-serif`. Use it everywhere.
- Do **not** use `next/font/google` for it — `fonts.gstatic.com` is blocked on this
  network and the build silently falls back to Arial. Import the CSS files in
  `frontend/src/app/layout.tsx`:
  `import '@fontsource/poppins/400.css';` (and 500/600/700).
- The family is wired as `"Poppins"` in both `globals.css` (`body`) and
  `tailwind.config.ts` (`fontFamily.sans`). Never set it via inline styles.
- Weights:
  - 400 body text;
  - 600 (`font-semibold`) titles, buttons, row titles;
  - 700 (`font-bold`) page titles, numbers, labels, badges.
- Numbers always use `tabular-nums` so number columns align.
- Size text with exact pixels (`text-[13px]`), never named sizes (`text-sm`).

## Type scale

| Role                        | Size                  | Weight    | Colour      | Extra                    |
| --------------------------- | --------------------- | --------- | ----------- | ------------------------ |
| Page title                  | 22px (26px from `sm`) | bold      | `#010313`   | —                        |
| Page subtitle               | 13px                  | regular   | `#6b7280`   | `mt-1`                   |
| Section / card title        | 14px                  | semibold  | `#010313`   | truncate                 |
| Card subtitle               | 12px                  | regular   | `#6b7280`   | —                        |
| Big number (KPI)            | 24px                  | bold      | `#010313`   | `leading-none`           |
| Medium number               | 20px                  | bold      | `#010313`   | `leading-tight`          |
| Body / item title           | 13px                  | semibold  | `#010313`   | `leading-snug`           |
| Secondary text              | 12px                  | regular   | `#6b7280`   | —                        |
| Caption / meta              | 11px                  | regular   | `#6b7280`   | —                        |
| Overline / column header    | 10px                  | bold      | `#9ca3af`   | UPPERCASE, `tracking-wide` (`tracking-widest` for section labels) |
| Code / ID                   | 11px                  | bold      | `#7c3aed`   | UPPERCASE                |
| Link                        | 12px (11px small)     | semibold  | `#1a6c80`   | `hover:underline`        |
| Button                      | 13px (12px compact)   | semibold  | —           | —                        |
| Badge                       | 10px (9px tiny)       | bold      | tone        | UPPERCASE                |

---

# 3. Spacing, radius, shadow

- **Rhythm:** multiples of 4px.
- **Page padding:** 16px, 24px from `sm`, 32px from `lg` (`p-4 sm:p-6 lg:p-8`).
- **Between page sections:** 20px (`mt-5` / `mb-5`).
- **Grid gaps:** 16px between cards (`gap-4`), 24px between big blocks (`gap-6`).
- **Inline gaps:** 6–12px (`gap-1.5` to `gap-3`).
- **Padding:** card header `px-4 py-3`; card body `p-4`; list/table cell
  `px-4 py-4`; column header `px-4 py-2.5`.

| Radius              | Used for                                   |
| ------------------- | ------------------------------------------ |
| 16px (`rounded-2xl`) | cards                                     |
| 12px (`rounded-xl`)  | large icon tiles, inset tiles             |
| 8px (`rounded-lg`)   | buttons, inputs, tabs, small icon tiles   |
| 6px (`rounded-md`)   | number badges                              |
| full                 | badges, progress bars, avatars             |

- **Shadows:** `shadow-sm` at rest, `hover:shadow-md` on interactive elements
  only. Never `shadow-xl` or larger.

---

# 4. Icons

- Outline icons (lucide), 1.5–2px stroke.
- Sizes: 16px in buttons and inputs (14px compact), 20px in big tiles.
- Icon tiles are a coloured square: tone background + tone text colour.

| Tile        | Size  | Radius        | Icon |
| ----------- | ----- | ------------- | ---- |
| large       | 44px  | `rounded-xl`  | 20px |
| card header | 32px  | `rounded-lg`  | 16px |
| stat card   | `p-2.5` | `rounded-xl` | 20px |
| inset       | 36px  | `rounded-lg`  | 16px |

---

# 5. Alignment and layout rules

- **Page structure, top to bottom:** back link (optional); heading row (icon
  tile + title/subtitle left, actions right); stat cards row; main content card(s).
- **Heading row:** stacked on mobile, and from `lg` a single row with
  `justify-between items-end`. Action groups use `flex-wrap gap-2`.
- **Text blocks are left-aligned. Numbers and values are right-aligned** in
  lists, and use `tabular-nums`.
- **Icon + text pairs:** `flex items-center gap-2.5`. Multi-line pairs use
  `items-start` with the icon nudged down `mt-0.5`.
- **Truncation:** `min-w-0` on flex children plus `truncate` (single line) or
  `line-clamp-2` (titles).
- **Lists** are separated by `divide-y divide-[#f1f5f9]`, not by individual
  borders. Rows highlight with `hover:bg-[#fafbfc]`.
- **Two-column blocks:** `grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]`.
  The right column is divided off with `lg:border-l lg:pl-8`.
- **Stat grids:** 1 column, 2 from `sm`, 4 from `xl` (or 3 from `sm`).
- **Tables appear from `lg` only.** Below that, show the same data as stacked cards.
- **Never nest bordered cards.** Inside a card, use inset tiles
  (`bg-[#fafbfc]` with an `#f1f5f9` border) or dividers.

---

# 6. Components

**Page**

```tsx
<div className="min-h-screen bg-[#f5f6f8] p-4 sm:p-6 lg:p-8 [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed">
```

**Back link:**
`mb-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#1a6c80] hover:underline`
with an arrow-left icon (16px).

**Page heading**

```tsx
<div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
  <div className="flex items-start gap-3">
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eefbfc] text-[#1a6c80]"><Icon className="h-5 w-5"/></div>
    <div>
      <h1 className="text-[22px] font-bold text-[#010313] sm:text-[26px]">Title</h1>
      <div className="mt-1 text-[13px] text-[#6b7280]">Subtitle</div>
    </div>
  </div>
  <div className="flex flex-wrap items-center gap-2">{actions}</div>
</div>
```

**Card:**
`overflow-hidden rounded-2xl border border-[#ececf0] bg-white shadow-sm`

**Card toolbar:**
`flex flex-col gap-3 border-b border-[#e6e8ec] px-4 py-3 lg:flex-row lg:items-center lg:justify-between`
— title or tabs on the left, search/filters on the right.

**Card with header bar**

```tsx
<section className="flex flex-col overflow-hidden rounded-2xl border border-[#ececf0] bg-white shadow-sm">
  <div className="flex items-start justify-between gap-3 border-b border-[#f1f5f9] px-4 py-3">
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#eefbfc] text-[#1a6c80]"><Icon className="h-4 w-4"/></span>
      <div className="min-w-0">
        <h2 className="truncate text-[14px] font-semibold text-[#010313]">Title</h2>
        <p className="truncate text-[12px] text-[#6b7280]">Subtitle</p>
      </div>
    </div>
    <button className="shrink-0 text-[11px] font-semibold text-[#1a6c80] hover:underline">View all</button>
  </div>
  <div className="flex-1">{body}</div>
</section>
```

**Stat card**

```tsx
<div className="flex items-center gap-3 rounded-2xl border border-[#ececf0] bg-white p-4 shadow-sm">
  <div className="rounded-xl p-2.5 bg-[#eefbfc] text-[#1a6c80]"><Icon className="h-5 w-5"/></div>
  <div className="min-w-0">
    <p className="text-[12px] text-[#6b7280]">Label</p>
    <p className="text-[24px] font-bold leading-none text-[#010313]">128
      <span className="ml-1.5 text-[12px] font-semibold text-[#6b7280]">hint</span></p>
  </div>
</div>
```

- **Clickable / filter version:** wrap in `<button aria-pressed>` with
  `rounded-2xl text-left hover:shadow-md`. When active, add `ring-2` in the tone
  colour at 35–45% opacity.
- **Status-coloured version:** a 4px top accent bar (`absolute inset-x-0 top-0 h-1`)
  in the solid status colour; the icon tile uses the soft background with the
  solid text colour; the label and number use the status colour; when active,
  the card background becomes the soft colour.
- **Inset version:** `flex items-center gap-3 rounded-xl border border-[#f1f5f9] bg-[#fafbfc] px-3.5 py-3`,
  with a 36px icon tile, an 11px label and a 20px number.

**Buttons** — base:

```
inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold
shadow-sm transition-all duration-200 ease-out disabled:opacity-60
enabled:hover:-translate-y-0.5 enabled:hover:shadow-md enabled:active:translate-y-0
enabled:hover:[&_svg]:scale-110
```

| Variant | Classes |
|---|---|
| Primary | `border border-[#23A6BD] bg-[#23A6BD] text-[#010313] hover:border-[#1a879c] hover:bg-[#1a879c]` |
| Outline | `border border-[#23A6BD] bg-white text-[#1a6c80] hover:bg-[#23A6BD] hover:text-[#010313]` |
| Ghost (default) | `border border-[#e5e7eb] bg-white text-[#1a6c80] hover:border-[#23A6BD] hover:bg-[#23A6BD] hover:text-[#010313]` |
| Danger | `border border-rose-200 bg-white text-rose-700 hover:bg-rose-600 hover:text-white` |

A loading button spins its icon (`animate-spin`) and changes its label to "…ing…".

**Badge:** `inline-flex w-fit shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase`
plus a tone pair. Tiny version: `px-1.5 py-px text-[9px]`.

**Search input**

```tsx
<div className="relative">
  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9ca3af]" />
  <input className="w-full sm:w-[260px] rounded-lg border border-[#e5e7eb] py-1.5 pl-8 pr-3 text-[12px] text-[#010313] placeholder:text-[#9ca3af] focus:border-[#23A6BD] focus:outline-none focus:ring-2 focus:ring-[#23A6BD]/15" />
</div>
```

**Select with icon:**
`inline-flex items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 shadow-sm`,
with a grey 16px icon. The select itself is
`bg-transparent text-[13px] font-semibold text-[#010313] focus:outline-none`.
Compact version: `px-2.5`, `text-[12px]`, no shadow.

**Tabs with counts**

- Container: `flex flex-wrap gap-1.5`.
- Tab: `rounded-lg px-3 py-1.5 text-[12px] font-semibold`, active
  `bg-[#23A6BD] text-[#010313]`, inactive `text-[#4b5563] hover:bg-[#23A6BD] hover:text-[#010313]`
  (the count chip follows with `group-hover:bg-white/20 group-hover:text-[#010313]`).
- Count: `rounded-full px-1.5 text-[10px] font-bold`, active `bg-white/20`,
  inactive `bg-[#f3f4f6] text-[#6b7280]`.

**Table**

- Header cell: `border-b border-[#eef0f3] bg-[#fafbfc] px-4 py-2.5 text-[10px] font-bold uppercase tracking-wide text-[#9ca3af]`.
- Body: `divide-y divide-[#f1f5f9]`. Rows: `align-top hover:bg-[#fafbfc]`.
  Cells: `px-4 py-4`.
- First column: a number badge (`h-6 w-6 rounded-md bg-[#eefbfc] text-[11px] font-bold text-[#1a6c80]`),
  then a stacked column with `space-y-1`: code (11px violet), title (13px
  semibold), meta (11px grey).
- Nested rows are indented with `pl-[52px]`. Expanded detail rows use
  `bg-[#fafbfc] px-6 pb-5 pt-1`.
- Row actions sit at the end of the last column, aligned to the top.

**Empty state:** `px-4 py-12 text-center text-[13px] text-[#9ca3af]`.

**Dark shell (sidebar / footer)** — Midnight Black only:

```tsx
<aside className="bg-gradient-to-b from-[#010313] to-[#050819] text-[#b3b8d1]">
  // active nav item:
  className="bg-[#23A6BD]/15 text-white"   // plus a left accent rule in #23A6BD
```

Headings on dark use `#e6e8f1`, body `#b3b8d1`, secondary `#55608f`,
accent `#23A6BD`. Replace the old per-role `slate-*`/`blue-*`/`teal-*`
gradients in `src/components/SidebarLayout.tsx` with this.

---

# 7. Data visuals

- **Progress bar:** track `h-1.5 rounded-full bg-[#f1f5f9]`, fill in the status
  colour. Value (13px bold, status colour) above, detail (11px grey) below.
- **Ring / donut** for one headline number. The stroke uses the status colour
  and the number sits in the centre.
- **Horizontal bar chart** for breakdowns, without an extra card: a
  three-column grid `[label 13rem | bar 1fr | value auto]`; bars `h-3 rounded-full`
  on a light track; dashed vertical guide lines at the thresholds; an axis
  underneath whose labels are coloured to match the thresholds.
- Show each metric in one visual form only, never both a ring and a bar for
  the same number.
- Show ALL-CAPS labels in Title Case.

---

# 8. Motion

- Hover: buttons lift 2px and gain `shadow-md`, and their icons scale to 110%.
  Cards only deepen their shadow.
- Bars grow from 0 over 0.6s ease-out, staggered by 60ms per item (`barGrow`
  in `ds.ts` plus an inline `animationDelay`).
- Fades and slides last at most 0.25s.

---

# 9. Don'ts

- No named Tailwind text sizes, no default grey/blue/teal palette ramps, and
  no second accent colour for primary actions.
- No white text on `#23A6BD`, and no `#23A6BD` text on white — use `#010313`
  and `#1a6c80` respectively.
- No gradients, glassmorphism, heavy shadows, or `rounded-3xl` on content.
  The only gradient allowed is the Midnight shell sidebar.
- No bordered card inside a bordered card.
- Never show colour alone for status; always pair it with a label or icon.
- Don't mix fonts.

---

# 10. Project setup state

Not yet migrated — do this first when a restyling task starts:

1. `frontend/src/app/layout.tsx` — replace `Inter` with `Outfit` via `next/font`.
2. `frontend/src/app/globals.css` — replace the old `#1a5fb4` / `#00b4d8`
   variables with `--accent: #23A6BD`, `--accent-ink: #1a6c80`,
   `--accent-tint: #eefbfc`, `--ink: #010313`, canvas `#f5f6f8`.
3. `frontend/tailwind.config.ts` — currently only exposes
   `background`/`foreground`; add the `brand` (50–950) and `ink` (50–950) ramps.
4. Create `frontend/src/lib/utils.ts` exporting `cn()` (clsx + tailwind-merge)
   and `frontend/src/lib/variants/ds.ts` with the exports listed at the top.
5. `frontend/src/components/SidebarLayout.tsx` — swap role gradients for the
   Midnight shell.
