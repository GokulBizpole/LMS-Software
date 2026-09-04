# Partner-Side Mobile-Responsive Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every partner-role page (`client/app/(partner)/partner/**`) usable at 320px–414px (phone) and tablet widths without horizontal overflow, while leaving the admin side (`Sidebar.tsx`, `DashboardLayout.tsx`, admin pages) pixel-identical at every width.

**Architecture:** Reuses the sidebar/header drawer mechanism from the approved design spec, scoped to the partner layout only. `PartnerSidebar` becomes an off-canvas drawer below `lg` (1024px) via new optional `isOpen`/`onClose` props that are inert when omitted. `Header` (shared with admin) gains an optional `onMenuClick` prop that only renders a hamburger button when passed — `DashboardLayout` never passes it, so the admin header is untouched. `PartnerLayout` owns the open/close state. Everything else is Tailwind class changes (padding, min-width, flex-wrap) on partner pages and the handful of shared display components (tables, `FilterPopover`) partner pages actually render.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4 (CSS-first config, default breakpoints: `sm:640px md:768px lg:1024px`).

**Spec:** `docs/superpowers/specs/2026-09-02-mobile-responsive-pass-design.md` (full-app spec; this plan implements the partner-side subset of it — Foundation + Page sweep for `partner/*` only, skipping admin pages, `PartnerReportTable`/`PartnerTable` which are admin-only, and the discretionary Modal touch-target tweak since `Modal.tsx` is desktop-fine already and out of the strict "no overflow" goal).

## Global Constraints

- Preserve desktop (`≥1024px`) visuals, layout, colors, typography, and all business/API logic exactly as they are today — verify after each task.
- No changes to API calls, data fetching, validation, or business logic.
- No column-hiding/reflow logic in tables — only `overflow-x-auto` + `min-w` on the `<table>`.
- No changes to `client/components/layout/Sidebar.tsx`, `client/components/layout/DashboardLayout.tsx`, or any `client/app/(dashboard)/**` admin page.
- There is no test runner in `client/` (`package.json` scripts are `dev`, `build`, `start`, `lint` only). Verification for every task is: `npm run build` inside `client/` (must stay clean) + a manual check in the browser via `npm run dev`, using devtools responsive mode at 375px width (phone) and confirming no horizontal scrollbar, then at 1280px width confirming the page is unchanged from before the task.

---

## File Structure

- Modify: `client/app/globals.css` — add the `overflow-x: hidden` safety net.
- Modify: `client/components/ui/FilterPopover.tsx` — clamp the popover panel width so it can't overflow a narrow viewport.
- Modify: `client/components/tables/CustomerTable.tsx`, `client/components/tables/LoanTable.tsx`, `client/components/tables/PaymentTable.tsx` — add `min-w` to each `<table>` so columns scroll instead of squashing.
- Modify: `client/components/layout/PartnerSidebar.tsx` — add optional `isOpen`/`onClose` props; off-canvas drawer + backdrop below `lg`; unchanged (static) at `≥lg`.
- Modify: `client/components/layout/Header.tsx` — add optional `onMenuClick` prop; renders a hamburger button (`lg:hidden`) only when the prop is passed.
- Modify: `client/components/layout/PartnerLayout.tsx` — add `mobileNavOpen` state wiring `PartnerSidebar`/`Header`; tighten `<main>` padding on phones.
- Modify: `client/app/(partner)/partner/customers/page.tsx`, `payments/page.tsx`, `loans/page.tsx`, `reports/loans/page.tsx`, `reports/outstanding/page.tsx`, `reports/collections/page.tsx` — header row (`title + action button`) stacks on phones instead of squeezing.
- Modify: `client/app/(partner)/partner/reports/loans/page.tsx` — additionally fix the search-input + `FilterPopover` row so it wraps instead of overflowing.
- Modify: `client/app/(partner)/partner/investments/page.tsx` — add `min-w` to its inline loan-usage `<table>`.

---

### Task 1: Global overflow safety net

**Files:**
- Modify: `client/app/globals.css`

**Interfaces:** None — pure CSS, no consumers.

- [ ] **Step 1: Add the backstop rule**

In `client/app/globals.css`, change:

```css
body {
  font-family: var(--font-sans);
  color: var(--text-primary);
  background: var(--background);
}
```

to:

```css
html, body {
  overflow-x: hidden;
}

body {
  font-family: var(--font-sans);
  color: var(--text-primary);
  background: var(--background);
}
```

- [ ] **Step 2: Verify no visual change**

Run `npm run dev` in `client/`, open any existing page (e.g. `/dashboard`) at 1280px width. Expected: pixel-identical to before — this rule only clips overflow that doesn't currently exist.

- [ ] **Step 3: Commit**

```bash
git add client/app/globals.css
git commit -m "Add overflow-x safety net for mobile layouts"
```

---

### Task 2: Clamp FilterPopover width

**Files:**
- Modify: `client/components/ui/FilterPopover.tsx:99`

**Interfaces:** None — internal className only, no prop/signature changes.

- [ ] **Step 1: Replace the fixed width**

In `client/components/ui/FilterPopover.tsx`, change line 99 from:

```tsx
        <div className="absolute right-0 z-40 mt-2 w-[340px] rounded-2xl border border-[#DAD7CA] bg-white p-5 shadow-xl">
```

to:

```tsx
        <div className="absolute right-0 z-40 mt-2 w-[calc(100vw-2rem)] max-w-[340px] rounded-2xl border border-[#DAD7CA] bg-white p-5 shadow-xl">
```

- [ ] **Step 2: Verify**

`npm run dev`, open `/partner/reports/loans`, click "Filter" at 1280px width — panel is still exactly 340px wide, unchanged. Then switch devtools to a 375px viewport, click "Filter" again — panel now fits within the screen with margin on both sides instead of being clipped.

- [ ] **Step 3: Commit**

```bash
git add client/components/ui/FilterPopover.tsx
git commit -m "Clamp FilterPopover width to the viewport on narrow screens"
```

---

### Task 3: Table min-widths (Customer/Loan/Payment)

**Files:**
- Modify: `client/components/tables/CustomerTable.tsx:45`
- Modify: `client/components/tables/LoanTable.tsx:45`
- Modify: `client/components/tables/PaymentTable.tsx:40`

**Interfaces:** None — internal className only on each `<table>` element, which already sits inside an `overflow-x-auto` wrapper `<div>` in all three files.

- [ ] **Step 1: CustomerTable (8 columns)**

In `client/components/tables/CustomerTable.tsx`, change:

```tsx
      <table className="w-full text-sm">
```

to:

```tsx
      <table className="w-full min-w-[820px] text-sm">
```

- [ ] **Step 2: LoanTable (9 columns)**

In `client/components/tables/LoanTable.tsx`, change:

```tsx
      <table className="w-full text-sm">
```

to:

```tsx
      <table className="w-full min-w-[960px] text-sm">
```

- [ ] **Step 3: PaymentTable (12 columns)**

In `client/components/tables/PaymentTable.tsx`, change:

```tsx
      <table className="w-full text-sm">
```

to:

```tsx
      <table className="w-full min-w-[1200px] text-sm">
```

- [ ] **Step 4: Verify**

`npm run dev`. At 1280px width, open `/partner/customers`, `/partner/loans` (empty state won't show the table — use `/partner/reports/loans` or `/partner/reports/outstanding` instead, which render `LoanTable` with data), and `/partner/payments` — all three tables render identically to before (already wider than their min-width on desktop). At 375px width, the same three pages now scroll horizontally inside the table's rounded border instead of squashing columns illegibly, and the rest of the page (card padding, buttons) does not scroll horizontally.

- [ ] **Step 5: Commit**

```bash
git add client/components/tables/CustomerTable.tsx client/components/tables/LoanTable.tsx client/components/tables/PaymentTable.tsx
git commit -m "Give shared tables a min-width so columns scroll instead of squashing on phones"
```

---

### Task 4: PartnerSidebar off-canvas drawer

**Files:**
- Modify: `client/components/layout/PartnerSidebar.tsx`

**Interfaces:**
- Produces: `PartnerSidebar({ isOpen?: boolean; onClose?: () => void })` — both optional, default `isOpen = false`. When neither is passed, renders exactly as it does today (static, `lg:static` degrades to plain `static` behavior... see step 1 for the exact class list). Task 6 (`PartnerLayout`) will pass both.

- [ ] **Step 1: Add props and the off-canvas classes**

In `client/components/layout/PartnerSidebar.tsx`, change the function signature and the returned JSX from:

```tsx
export default function PartnerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-55 shrink-0 bg-[#ECE9DF] border-r border-[#C4C1B3] min-h-screen flex flex-col p-4">
```

to:

```tsx
export default function PartnerSidebar({
  isOpen = false,
  onClose,
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`w-55 shrink-0 bg-[#ECE9DF] border-r border-[#C4C1B3] min-h-screen flex flex-col p-4 fixed inset-y-0 left-0 z-40 transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
```

- [ ] **Step 2: Close the outer fragment and close-on-navigate**

Change the nav `<Link>` in the same file from:

```tsx
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-[#E6F1FB] text-[#185FA5] font-medium"
                  : "text-[#45443E] hover:bg-white"
              }`}
            >
```

to:

```tsx
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-[#E6F1FB] text-[#185FA5] font-medium"
                  : "text-[#45443E] hover:bg-white"
              }`}
            >
```

Then close the fragment: change the end of the file from:

```tsx
      </nav>
    </aside>
  );
}
```

to:

```tsx
      </nav>
      </aside>
    </>
  );
}
```

- [ ] **Step 3: Verify in isolation**

`PartnerSidebar` is not yet wired up (Task 6 does that), so at this point nothing in the app calls it with `isOpen`/`onClose` — it still renders with `isOpen` defaulting to `false`. Run `npm run build` in `client/` to confirm no TypeScript errors. The visual/behavioral check happens in Task 6 once `PartnerLayout` wires the state.

- [ ] **Step 4: Commit**

```bash
git add client/components/layout/PartnerSidebar.tsx
git commit -m "Make PartnerSidebar an off-canvas drawer below lg width"
```

---

### Task 5: Header hamburger button (opt-in)

**Files:**
- Modify: `client/components/layout/Header.tsx`

**Interfaces:**
- Produces: `Header({ onMenuClick?: () => void })`. When `onMenuClick` is omitted (as `DashboardLayout` will continue to call it), the header renders byte-for-byte as it does today. When passed, a hamburger button appears, `lg:hidden`, calling `onMenuClick` on click.

- [ ] **Step 1: Add the prop and import the icon**

In `client/components/layout/Header.tsx`, change the import line:

```tsx
import { Bell, LogOut } from "lucide-react";
```

to:

```tsx
import { Bell, LogOut, Menu } from "lucide-react";
```

Change the function signature from:

```tsx
export default function Header() {
```

to:

```tsx
export default function Header({ onMenuClick }: { onMenuClick?: () => void } = {}) {
```

- [ ] **Step 2: Render the button**

Change the opening of the returned JSX from:

```tsx
  return (
    <header className="h-16 border-b border-[#C4C1B3] bg-white flex items-center justify-end gap-4 px-6">
      {!isPartner && (
```

to:

```tsx
  return (
    <header className="h-16 border-b border-[#C4C1B3] bg-white flex items-center justify-end gap-4 px-6">
      {onMenuClick && (
        <button
          type="button"
          onClick={onMenuClick}
          className="mr-auto lg:hidden w-9 h-9 rounded-full border border-[#C4C1B3] flex items-center justify-center text-[#45443E] hover:bg-[#ECE9DF]"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
      )}

      {!isPartner && (
```

- [ ] **Step 3: Verify admin side is untouched**

`npm run build`. Then `npm run dev`, open `/dashboard` (admin) at both 1280px and 375px — no hamburger button appears at either width, because `DashboardLayout` never passes `onMenuClick`. The header is pixel-identical to before this task.

- [ ] **Step 4: Commit**

```bash
git add client/components/layout/Header.tsx
git commit -m "Add optional hamburger button to Header, opt-in via onMenuClick"
```

---

### Task 6: Wire the drawer into PartnerLayout

**Files:**
- Modify: `client/components/layout/PartnerLayout.tsx`

**Interfaces:**
- Consumes: `PartnerSidebar({ isOpen, onClose })` from Task 4, `Header({ onMenuClick })` from Task 5.

- [ ] **Step 1: Add state and wire it up**

In `client/components/layout/PartnerLayout.tsx`, change:

```tsx
  const router = useRouter();
  const [checked, setChecked] = useState(false);
```

to:

```tsx
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
```

Then change the final return block from:

```tsx
  return (
    <div className="flex min-h-screen bg-[#FFFFFF]">
      <PartnerSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
```

to:

```tsx
  return (
    <div className="flex min-h-screen bg-[#FFFFFF]">
      <PartnerSidebar isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
```

- [ ] **Step 2: Verify the full drawer behavior**

`npm run build`, then `npm run dev`, log in as a partner user, land on `/partner/dashboard`.
- At 1280px width: page looks exactly as before this whole plan — sidebar static and visible, no hamburger, `main` padding unchanged (24px ⇒ `p-6` is still what applies at `≥768px` since `md:p-6` kicks in there).
- At 375px width: sidebar is gone by default, a hamburger button appears in the header, page content has tighter padding. Click the hamburger — sidebar slides in from the left with a dark backdrop behind it. Click a nav link (e.g. "Loans") — the drawer closes and the app navigates to `/partner/loans`. Click the backdrop while the drawer is open — it closes without navigating.

- [ ] **Step 3: Commit**

```bash
git add client/components/layout/PartnerLayout.tsx
git commit -m "Wire the mobile nav drawer into PartnerLayout"
```

---

### Task 7: Partner page header rows stack on phones

**Files:**
- Modify: `client/app/(partner)/partner/customers/page.tsx:30`
- Modify: `client/app/(partner)/partner/payments/page.tsx:40`
- Modify: `client/app/(partner)/partner/loans/page.tsx:132`
- Modify: `client/app/(partner)/partner/reports/loans/page.tsx:146`
- Modify: `client/app/(partner)/partner/reports/outstanding/page.tsx:92`
- Modify: `client/app/(partner)/partner/reports/collections/page.tsx:95`

**Interfaces:** None — className-only change, same mechanical edit in all six files.

- [ ] **Step 1: Apply the same class change to all six files**

In each of the six files above, the page's title/subtitle-plus-action-button row currently reads:

```tsx
      <div className="flex items-center justify-between">
```

Change it to:

```tsx
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
```

This is the exact same pattern already used (and proven) at `client/app/(partner)/partner/customers/[id]/page.tsx:167`.

- [ ] **Step 2: Verify each page**

`npm run dev`. At 1280px width, open all six URLs (`/partner/customers`, `/partner/payments`, `/partner/loans`, `/partner/reports/loans`, `/partner/reports/outstanding`, `/partner/reports/collections`) — every header row is unchanged (title left, button right, single row), because `sm:flex-row sm:items-center sm:justify-between` reproduces the old layout at `≥640px`. At 375px width, the title block now stacks above the action button instead of the two being forced onto one row.

- [ ] **Step 3: Commit**

```bash
git add "client/app/(partner)/partner/customers/page.tsx" "client/app/(partner)/partner/payments/page.tsx" "client/app/(partner)/partner/loans/page.tsx" "client/app/(partner)/partner/reports/loans/page.tsx" "client/app/(partner)/partner/reports/outstanding/page.tsx" "client/app/(partner)/partner/reports/collections/page.tsx"
git commit -m "Stack partner page header rows on phone widths"
```

---

### Task 8: Fix the search + filter row on the loan report page

**Files:**
- Modify: `client/app/(partner)/partner/reports/loans/page.tsx:169-176`

**Interfaces:** None — className-only.

- [ ] **Step 1: Let the row wrap and the input shrink**

In `client/app/(partner)/partner/reports/loans/page.tsx`, change:

```tsx
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search loan, customer..."
          className="w-full max-w-sm rounded-lg border border-[#9C9A8D] px-3 py-2 text-sm"
        />
        <FilterPopover fields={filterFields} />
      </div>
```

to:

```tsx
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search loan, customer..."
          className="flex-1 min-w-0 max-w-sm rounded-lg border border-[#9C9A8D] px-3 py-2 text-sm"
        />
        <FilterPopover fields={filterFields} />
      </div>
```

- [ ] **Step 2: Verify**

`npm run dev`, open `/partner/reports/loans`. At 1280px width: search input is still 384px (`max-w-sm`) wide next to the Filter button, unchanged. At 375px width: input and Filter button share the row without causing horizontal scroll (input shrinks first since it's `flex-1 min-w-0`; if it ever can't fit, `flex-wrap` puts the Filter button on its own line).

- [ ] **Step 3: Commit**

```bash
git add "client/app/(partner)/partner/reports/loans/page.tsx"
git commit -m "Fix search+filter row overflow on the partner loan report page"
```

---

### Task 9: Investments page inline table min-width

**Files:**
- Modify: `client/app/(partner)/partner/investments/page.tsx:81`

**Interfaces:** None — className-only, same pattern as Task 3.

- [ ] **Step 1: Add the min-width**

In `client/app/(partner)/partner/investments/page.tsx`, change:

```tsx
            <table className="w-full text-sm">
```

to:

```tsx
            <table className="w-full min-w-[700px] text-sm">
```

- [ ] **Step 2: Verify**

`npm run dev`, open `/partner/investments` for a partner with disbursed loans. At 1280px: unchanged. At 375px: the "Investment usage history" table scrolls horizontally inside its own bordered box instead of squashing its 6 columns illegibly.

- [ ] **Step 3: Commit**

```bash
git add "client/app/(partner)/partner/investments/page.tsx"
git commit -m "Give the partner investments usage table a min-width"
```

---

### Task 10: Full partner-side verification pass

**Files:** None modified — verification only.

- [ ] **Step 1: Build check**

Run `npm run build` inside `client/`. Expected: succeeds with no new TypeScript or build errors.

- [ ] **Step 2: Phone-width sweep (375px, devtools responsive mode)**

Log in as a partner user and visit every partner route, confirming no horizontal page scrollbar and that the hamburger drawer opens/closes correctly from at least two of them:
`/partner/dashboard`, `/partner/customers`, `/partner/customers/[id]` (any existing customer), `/partner/loans`, `/partner/loans/[id]` (any existing loan), `/partner/payments`, `/partner/investments`, `/partner/reports`, `/partner/reports/loans`, `/partner/reports/collections`, `/partner/reports/outstanding`, `/partner/profile`.

- [ ] **Step 3: Also check 320px and 414px**

Repeat the sweep at 320px and 414px widths for the three or four pages with the densest tables (`/partner/reports/loans`, `/partner/payments`, `/partner/customers`) — these are the tightest phone sizes named in the spec's goals.

- [ ] **Step 4: Desktop parity check (1280px)**

Revisit the same full route list at 1280px width and confirm every page is visually identical to how it looked before this plan started (no drawer artifacts, no stray padding changes, sidebar static).

- [ ] **Step 5: Admin-side regression check**

Visit `/dashboard`, `/customers`, `/partners`, `/loans`, `/payments`, `/expenses`, `/reports`, `/settings` at both 1280px and 375px. Expected: identical to before this plan at every width — no hamburger button, no drawer, `Sidebar`/`DashboardLayout` untouched. This confirms the "partner side only" scope held.

- [ ] **Step 6: Final commit (if any fixes were needed during verification)**

If Steps 2–5 surface a real overflow, fix it with the same minimal-class-change approach used in the earlier tasks, then:

```bash
git add -A
git commit -m "Fix remaining overflow found during partner mobile verification pass"
```

If nothing needed fixing, skip this step — there is nothing to commit.
