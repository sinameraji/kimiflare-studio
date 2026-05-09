# KimiFlare Studio — MVP Execution Plan

> From prototype → focused MVP. Cut 80% of UI surface. Add 3 high-leverage features. Ship the Mission Report.

---

## Milestone 0: Foundation Cleanup
**Goal:** Remove everything that is not in the essential 20%. Strip the chrome.

### M0.1 — Delete RightPanel
- **File:** `src/components/RightPanel.tsx`
- **Action:** Delete entirely.
- **Rationale:** Decision Journal, Cost Tracker (redundant), System Diagram (fake placeholder), Quick Actions (need backend).
- **Acceptance:** App compiles without `RightPanel` import.

### M0.2 — Delete BottomBar
- **File:** `src/components/BottomBar.tsx`
- **Action:** Delete entirely.
- **Rationale:** Connection status, tool count, timer are non-actionable. Cost is shown in Plan header.
- **Acceptance:** App compiles without `BottomBar` import.

### M0.3 — Simplify LeftRail → MissionQueue
- **File:** `src/components/LeftRail.tsx`
- **Action:** Strip down to a minimal mission queue sidebar.
- **Remove:** Project Selector, Agent Cabinet (5 fake agents), Risk Radar (duplicates CenterStage), Model footer.
- **Keep:** Slim sidebar (~200px) showing a list of missions with status dots.
- **Acceptance:** Sidebar shows only mission list. No fake agent pulses.

### M0.4 — Simplify WelcomeScreen
- **File:** `src/components/WelcomeScreen.tsx`
- **Action:** Remove Features grid (4 marketing cards) and Recent Missions list (static fake data).
- **Keep:** Hero headline, tagline, "Start a Mission" CTA button.
- **Acceptance:** WelcomeScreen is a single centered hero with one primary action.

### M0.5 — Clean App.tsx Layout
- **File:** `src/App.tsx`
- **Action:** Remove `BottomBar` import and JSX. Remove `RightPanel` import and JSX.
- **New layout:** `LeftRail` + `CenterStage` (or `WelcomeScreen`) only. No bottom bar.
- **Acceptance:** Full-height two-pane layout. No 32px bottom bar.

---

## Milestone 1: The Single-Column Mission Document
**Goal:** Redesign CenterStage as a spacious, editorial single-column document.

### M1.1 — New CenterStage Shell
- **File:** `src/components/CenterStage.tsx`
- **Action:** Replace the cramped 3-panel layout with a centered content column.
- **Specs:**
  - Max-width: `840px`, centered with `mx-auto`.
  - Generous padding: `px-8 py-10`.
  - Body text: `text-sm` (14px) minimum, headings `text-xl` to `text-2xl`.
  - Background: `bg-studio-bg` (warm cream) as the canvas.
- **Acceptance:** CenterStage content is centered, readable, with breathing room.

### M1.2 — Phase Stepper (Replace Tabs)
- **File:** `src/components/CenterStage.tsx`
- **Action:** Replace horizontal phase tabs with a horizontal stepper.
- **Design:**
  - 4 steps: Intent → Plan → Execute → Verify.
  - Completed steps: filled circle + label.
  - Current step: filled circle in `studio-primary` + bold label.
  - Future steps: empty circle + muted label.
  - Connecting lines between steps.
- **Acceptance:** Stepper clearly shows mission progress. Clicking a completed step navigates back.

### M1.3 — Sticky Approval Bar
- **File:** `src/components/CenterStage.tsx`
- **Action:** Extract the approval slider + action buttons into a sticky bottom bar within CenterStage.
- **Specs:**
  - Position: `sticky bottom-0` inside the scrollable content area.
  - Background: `bg-studio-bg/95 backdrop-blur-sm` with top border.
  - Contains: Approval slider + "Request Changes" / "Execute Plan" buttons.
- **Acceptance:** Approval controls are always visible when scrolling through a Plan.

### M1.4 — Remove Collapsible Sections
- **File:** `src/components/CenterStage.tsx`
- **Action:** Delete `CollapsibleSection` component and all usages.
- **Remove:** Approach (was collapsed), Architecture Delta (was collapsed), Alternatives (was collapsed).
- **Acceptance:** No collapsed content. All remaining sections are always visible.

---

## Milestone 2: The Plan Phase (MVP Core)
**Goal:** Build the single most important screen: the Plan review page.

### M2.1 — Mission Header
- **File:** `src/components/CenterStage.tsx`
- **Action:** Redesign the mission header at the top of the Plan phase.
- **Content:**
  - Small label: "Mission".
  - Large title: `sampleMission.title` (`text-2xl font-semibold`).
  - Status badge: "Pending Approval" (amber pill).
  - Meta row: Time estimate + Cost estimate, inline, right-aligned.
- **Acceptance:** Header is scannable in 2 seconds.

### M2.2 — Approach Section (Prominent)
- **File:** `src/components/CenterStage.tsx`
- **Action:** Render `samplePlan.approach` as a prominent, always-visible paragraph.
- **Specs:**
  - Section label: "Approach" (`text-[10px] uppercase tracking-widest`).
  - Body: `text-sm text-studio-text-secondary leading-relaxed`.
  - Card container: `bg-studio-surface rounded-xl p-6 border border-studio-elevated`.
- **Acceptance:** Approach is the first thing read after the header.

### M2.3 — Risk Assessment Cards
- **File:** `src/components/CenterStage.tsx`
- **Action:** Redesign risk list as a 3-column grid of cards.
- **Specs:**
  - Each card: `bg-studio-surface rounded-xl p-5 border`.
  - Border color matches risk level: `studio-success`, `studio-warning`, `studio-critical`.
  - Icon + Category name + Level badge + Description.
  - Cards are equal height.
- **Acceptance:** All 3 risks visible at a glance. No scrolling to compare.

### M2.4 — Cost Projection (Big Numbers)
- **File:** `src/components/CenterStage.tsx`
- **Action:** Render cost as a horizontal row of large metric cards.
- **Specs:**
  - 4 metrics: Tokens, API Cost, Infrastructure, Time Estimate.
  - Each: big number (`text-xl font-semibold`) + small label below.
  - Container: `bg-studio-surface rounded-xl p-6`.
- **Acceptance:** Cost is impossible to miss.

### M2.5 — Approval Slider + Buttons
- **File:** `src/components/CenterStage.tsx`
- **Action:** Polish the existing approval slider for the sticky bar.
- **Specs:**
  - Slider: `0–100`, styled with `accent-studio-primary`.
  - Labels below: "Reject" / "Constrained" / "Full Autonomy".
  - Dynamic text: "Send back for revision" / "Approve with step-by-step review" / "Approve — execute without interruption".
  - Buttons: "Request Changes" (secondary) + "Execute Plan" (primary, `bg-studio-primary`).
- **Acceptance:** Slider feels satisfying. Buttons are clearly primary/secondary.

---

## Milestone 3: Intent → Execute → Verify
**Goal:** Wire up the remaining three phases with minimal, clean UI.

### M3.1 — Intent Phase (Simplified Form)
- **File:** `src/components/CenterStage.tsx`
- **Action:** Reduce the Intent form to two fields.
- **Remove:** Confidence dropdown, Scope dropdown.
- **Keep:**
  - Goal: `textarea` (3 rows), placeholder: "What do you want to build or change?"
  - Constraints: `textarea` (2 rows), placeholder: "Non-negotiables..."
- **Add:** "Generate Plan" button (`bg-studio-primary`, full width).
- **Acceptance:** Form has 2 fields + 1 button. No dropdowns.

### M3.2 — Execute Phase (Clean Activity Stream)
- **File:** `src/components/CenterStage.tsx`
- **Action:** Redesign activity stream with more space per item.
- **Specs:**
  - Header: pulsing dot + "Executing".
  - Each item: icon (check/warning/info) + action text + time.
  - No agent name per item (MVP = single agent).
  - Final row: pulsing dot + "Working...".
  - Container: `bg-studio-surface rounded-xl p-6`.
- **Acceptance:** Stream is readable, not cramped. Clear what's done vs. in-progress.

### M3.3 — Verify Phase (Minimal Success)
- **File:** `src/components/CenterStage.tsx`
- **Action:** Replace fake stats with a clean success state.
- **Remove:** "12/12 tests", "0 breaking", "$11.20 spent" fake metrics.
- **Keep:**
  - Large checkmark icon in success circle.
  - "Mission Complete" heading.
  - One-line subtitle: "All verification checks passed."
  - "View Mission Report" button (primary, leads to M5).
- **Acceptance:** Success state is celebratory but not cluttered with fake data.

---

## Milestone 4: High-Leverage Features
**Goal:** Add the 3 features that multiply the MVP's value.

### M4.1 — Architecture Diagram (Plan Diff)
- **New File:** `src/components/ArchitectureDiagram.tsx`
- **Action:** Build a real, structured architecture diagram component.
- **Specs:**
  - Rendered as HTML/CSS (divs, borders, arrows) — no SVG placeholder.
  - Two columns: "Before" and "After".
  - Each column: stacked boxes representing services/DBs.
  - Arrows between boxes show data flow.
  - Boxes have labels and subtle color coding (existing = gray, new = `studio-info`, removed = dashed gray).
- **Data:** Extend `samplePlan.architectureDelta` with structured nodes/edges instead of plain strings.
- **Placement:** Insert into Plan phase, below Approach, above Risks.
- **Acceptance:** Diagram is readable, not a fake placeholder. Before/After are visually comparable.

### M4.2 — Confidence Meter
- **File:** `src/components/CenterStage.tsx`
- **Action:** Add confidence indicators to Plan elements.
- **Specs:**
  - Each risk card gets a small confidence badge: "High confidence" / "Medium confidence" / "Guessing — input needed".
  - Low confidence items get an amber left border on the card.
  - Approach paragraph gets a single confidence label above it.
- **Data:** Extend `samplePlan.risks` and `samplePlan` with `confidence` field.
- **Acceptance:** User can instantly see what the agent is unsure about.

### M4.3 — Mission Queue (Real Sidebar)
- **File:** `src/components/LeftRail.tsx`
- **Action:** Replace the stripped sidebar with a functional Mission Queue.
- **Specs:**
  - List of missions: title + status dot + phase label.
  - Status: `queued` (gray), `in_progress` (pulsing amber), `completed` (green), `failed` (red).
  - Click a mission to load it in CenterStage.
  - "+ New Mission" button at bottom.
  - Width: `240px`.
- **Data:** Create `sampleMissions` array in `sample.ts` (3–4 items, varied statuses).
- **State:** Lift mission selection state to `App.tsx`.
- **Acceptance:** Clicking a mission switches context. New Mission button resets to WelcomeScreen.

---

## Milestone 5: The Virality Feature — Mission Report
**Goal:** Build the shareable, poster-grade completion card.

### M5.1 — MissionReport Component
- **New File:** `src/components/MissionReport.tsx`
- **Action:** Create a full-screen, centered report card.
- **Specs:**
  - Full-screen overlay: `fixed inset-0 bg-studio-bg z-50`.
  - Centered card: `max-w-2xl mx-auto`, generous vertical padding.
  - Content:
    1. "KIMIFLARE STUDIO" header (small, tracked).
    2. Mission title (large, bold).
    3. Architecture Before/After diagram (compact version of M4.1).
    4. Risk summary: "3 Risks Identified → 3 Risks Mitigated" with mini bar charts.
    5. Cost: "$12.45 spent · ~6 hours saved" (big numbers).
    6. "Autonomy Granted: 87%" — highlighted in a bordered box.
    7. Footer: "Directed by [User] via KimiFlare Studio".
  - MUJI palette: warm cream background, deep red accents, generous whitespace.
  - Typography: editorial, premium feel.
- **Acceptance:** Report looks like a designed poster, not a dashboard export.

### M5.2 — Trigger from Verify Phase
- **File:** `src/components/CenterStage.tsx`
- **Action:** "View Mission Report" button opens `MissionReport` overlay.
- **Acceptance:** Button works. Overlay can be closed (X button or Escape key).

### M5.3 — Export to Image
- **New File:** `src/utils/exportImage.ts`
- **Action:** Implement PNG export of the Mission Report card.
- **Library:** `html-to-image` (lightweight, no canvas dependencies).
- **Function:** `exportMissionReport(element: HTMLElement): Promise<Blob>`.
- **UI:** "Copy Image" button in Mission Report. On click: render → copy to clipboard.
- **Acceptance:** User clicks "Copy Image", pastes into Twitter/Slack/Notion, image renders crisply.

### M5.4 — Share Sheet Integration
- **File:** `src/components/MissionReport.tsx`
- **Action:** Add "Share" button that triggers native share + pre-populated text.
- **Text template:** `"Just delegated a full [mission title] to my AI team. [N] risks mitigated, $[cost] spent, ~[hours] hours saved. [autonomy]% autonomy. This is what CTO work looks like now."`
- **Fallback:** If Web Share API unavailable, copy text + image to clipboard.
- **Acceptance:** One-click share on macOS. Fallback works on all platforms.

---

## Data Model Changes

### `src/data/sample.ts`

**Remove:**
- `sampleAgents` (M0.3)
- `sampleDecisions` (M0.1)
- `sampleRiskRadar` (M0.3)
- `sampleActivity` (keep but simplify for M3.2)

**Extend:**
- `samplePlan.architectureDelta` → structured nodes/edges for M4.1.
- `samplePlan.risks` → add `confidence: 'high' | 'medium' | 'low'` for M4.2.
- `sampleMission` → add `autonomyLevel: number`, `hoursSaved: number`, `risksMitigated: number` for M5.

**Add:**
- `sampleMissions: Mission[]` array for M4.3 Mission Queue.

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `html-to-image` | `^1.11.11` | Export Mission Report to PNG (M5.3) |

No other new dependencies. Reuse existing stack: React 19, Tailwind, Lucide icons.

---

## File Inventory

### Files to Delete
- `src/components/RightPanel.tsx`
- `src/components/BottomBar.tsx`

### Files to Modify
- `src/App.tsx` — layout cleanup, mission selection state.
- `src/components/LeftRail.tsx` — strip to Mission Queue.
- `src/components/CenterStage.tsx` — complete rewrite of layout and all phases.
- `src/components/WelcomeScreen.tsx` — strip to hero only.
- `src/data/sample.ts` — restructure data models.
- `tailwind.config.js` — add any new color tokens if needed (unlikely).

### Files to Create
- `src/components/ArchitectureDiagram.tsx` — M4.1
- `src/components/MissionReport.tsx` — M5.1
- `src/utils/exportImage.ts` — M5.3

---

## Acceptance Criteria (Overall MVP)

1. App opens to a clean WelcomeScreen with one CTA.
2. Starting a mission shows the Intent form (2 fields).
3. Generating a plan shows the Plan phase: Approach → Architecture Diagram → Risk Cards → Cost Metrics → Sticky Approval Bar.
4. Approving executes the mission; Execute phase shows a clean activity stream.
5. Completion shows a minimal Verify success state with "View Mission Report".
6. Mission Report is a full-screen, beautiful, shareable card.
7. Mission Queue sidebar shows multiple missions and allows switching.
8. No fake agent cabinet, no fake risk radar, no bottom bar, no right panel.
9. All text is readable (14px+). All sections have breathing room.
10. `npm run typecheck` passes. `npm run dev` runs without errors.

---

## Estimated Effort

| Milestone | Days | Notes |
|-----------|------|-------|
| M0: Foundation Cleanup | 0.5 | Deletion + compile fixes |
| M1: Single-Column Document | 1 | Layout + stepper + sticky bar |
| M2: Plan Phase | 1.5 | Cards, metrics, approval polish |
| M3: Intent/Execute/Verify | 1 | Simplify existing phases |
| M4: High-Leverage Features | 2 | Diagram, confidence, queue |
| M5: Mission Report | 1.5 | Component + export + share |
| **Total** | **~7.5 days** | Sequential, one developer |
