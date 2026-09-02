# Mobile-Responsive Pass — Design Spec

Date: 2026-09-02

## Context

LMS Finance is a Next.js 16 (App Router) + React 19 + Tailwind CSS v4 web app, previously scoped internally as a desktop-only product intended to eventually be wrapped in Electron. The `electron/` directory exists but is empty and out of scope here. The web version is now also a real, permanent access path (staff will use it on tablets/phones via browser), so it needs to work correctly at mobile and tablet widths without changing the existing desktop experience.

Tailwind v4 is configured CSS-first (`client/app/globals.css`, `@import "tailwindcss"`), with no custom breakpoint overrides — all breakpoints are Tailwind defaults (`sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`, `2xl:1536px`).

## Goals

- Make every page, shared layout component, table, form, and modal usable at 320px–414px (phone) and tablet widths, without horizontal page overflow.
- Preserve desktop (`≥1024px`) visuals, layout, colors, typography, and all business/API logic exactly as they are today.
- Reuse existing components and patterns; avoid new abstractions where the current structure already supports the fix.

## Non-goals

- No changes to API calls, data fetching, validation, or any business logic.
- No changes to color tokens, typography scale, or the overall visual design system.
- No work on the empty `electron/` directory.
- No column-hiding/reflow logic in tables that would change what data is visible on desktop.

## Current state (audit findings)

- **Layout shell**: `DashboardLayout.tsx` / `PartnerLayout.tsx` render `<Sidebar>`/`<PartnerSidebar>` (fixed `w-55`, always visible, `shrink-0`) beside a `flex-1 min-w-0` content column, in a flex row. No collapse/hide/hamburger logic exists anywhere in the layout layer today — this is the single biggest gap.
- **Header.tsx**: `flex items-center justify-end gap-4 px-6`, no left-side slot. Only one existing responsive class in the whole layout system (`hidden sm:block` on the username text).
- **Tables** (`components/tables/*.tsx`, 7 files): all already wrapped in `overflow-x-auto`, no fixed/min-width columns — functional but not tuned for narrow-screen scrolling.
- **Modals** (`components/ui/Modal.tsx` + feature modals): already solid — `w-full` + `max-w-*` prop, `max-h-[90vh]`, internal scroll, and internal grids already use `grid-cols-1 sm:grid-cols-2`.
- **Forms**: shared field primitives in `components/ui/FormField.tsx`, laid out via the same `grid-cols-1 sm:grid-cols-2` pattern inside modals. `components/forms/*.tsx` are dead empty placeholders (not in use).
- **FilterPopover** (`components/ui/FilterPopover.tsx:99`): fixed `w-[340px]`, will overflow phones.
- **Dashboard/report grids**: already largely responsive (`grid-cols-1 sm:grid-cols-2/3/4`).
- **Page padding**: static `p-6` (and similar) throughout; not reduced for narrow viewports.
- Repo-wide: 54 responsive-prefix usages across 24 files under `app/`, 14 across 8 files under `components/` — concentrated in stat-card/form grids. No custom breakpoints to account for.

## Design

### 1. Sidebar/Header drawer mechanism (foundation)

- `Sidebar.tsx` and `PartnerSidebar.tsx` gain optional props `isOpen: boolean` and `onClose: () => void`.
  - At `≥lg` (1024px): renders exactly as today — static, always visible. New props are inert at this breakpoint.
  - Below `lg`: becomes a fixed off-canvas panel — `fixed inset-y-0 left-0 z-40 ... transition-transform`, `-translate-x-full` when closed, `translate-x-0` when open. A backdrop (`fixed inset-0 bg-black/40 z-30 lg:hidden`) renders alongside it when open and closes the drawer on click. Clicking a nav link also calls `onClose`.
- `Header.tsx` gets a hamburger `<button>` prepended, wrapped in `lg:hidden`, taking a new `onMenuClick: () => void` prop. Hidden at `≥lg`, so the existing `justify-end` desktop arrangement is unaffected.
- `DashboardLayout.tsx` and `PartnerLayout.tsx` each add local `const [mobileNavOpen, setMobileNavOpen] = useState(false)` and wire it to their Sidebar/Header. Duplicated per layout rather than extracted into a shared hook — two call sites, each already an independent near-duplicate file (YAGNI).
- Net effect: `≥1024px` is pixel-identical to today. Below that, a hamburger appears and the sidebar becomes a slide-in drawer instead of squeezing the content column.

### 2. Global safety net

- `globals.css`: add `overflow-x: hidden` on `html, body` as a backstop against stray horizontal overflow. No visible effect unless something is currently overflowing.

### 3. Page content spacing

- Replace static `p-6` (and equivalent `px-6`/`gap-6` etc. at the page-wrapper level) with `p-4 md:p-6` (or the equivalent gap/padding pairing) across pages and the `main` element in both layouts. At `≥768px` this is identical to current output; only phones get tighter spacing.

### 4. Tables

- Keep the existing `overflow-x-auto` wrapper pattern (already present in all 7 table components).
- Add a `min-w-[...]` to each `<table>` element (sized per its own column count) so columns keep readable width and reliably trigger horizontal scroll instead of visually compressing on narrow viewports. No column hiding or data reflow.

### 5. Modals

- Spot-check `Modal.tsx` and each feature modal for mobile padding and close-button tap-target size. Expect minimal changes given the existing `w-full`/`max-w-*`/`max-h-[90vh]`/internal-scroll/`grid-cols-1 sm:grid-cols-2` foundation is already sound.

### 6. FilterPopover

- Fix the fixed `w-[340px]` (`components/ui/FilterPopover.tsx:99`) with a viewport-clamped width (e.g. `max-w-[calc(100vw-2rem)]`) and confirm it doesn't get clipped off-screen near viewport edges.

### 7. Touch targets

- Where an interactive element is clearly under a comfortable tap size (dense icon buttons, tight action rows), bump it using mobile-only modifiers (e.g. `max-lg:h-11`) so desktop sizing is untouched.

### 8. Dashboard/report grids

- Audit shows most already use `grid-cols-1 sm:grid-cols-2/3/4`. Fix any stragglers found during the page sweep in §Rollout.

## Rollout plan

1. **Foundation**: Sidebar, PartnerSidebar, Header, DashboardLayout, PartnerLayout, `globals.css`, FilterPopover. Verify desktop (`≥1024px`) is unchanged and the drawer works at phone/tablet widths before moving on.
2. **Page sweep**, grouped by feature area (each group independent, can be parallelized):
   - Login / forgot-password
   - Dashboard (admin + partner)
   - Customers / Partners (list + `[id]` detail + modals)
   - Loans / Payments (including the one full-page `loans/create`)
   - Expenses / Notifications
   - Reports (all report sub-pages, admin + partner)
   - Settings / Profile
   - Partner-role remaining pages (investments, etc.)
   For each: fix padding, confirm grids stack, confirm tables scroll cleanly, confirm no fixed-width elements overflow, confirm touch targets.
3. **Verification**: `npm run build` in `client/` — fix any TypeScript/build errors introduced. Then a manual/checklist pass at 320px, 375px, 390px, 414px, a tablet width, and a desktop width (`≥1024px`) confirming visual parity with pre-change behavior.

## Risks / open questions

- None outstanding — sidebar/header mechanism and overall approach both explicitly approved.
