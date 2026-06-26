# Findr UX Audit Report — 2026-06-25

## Executive Summary

Findr has a well-structured dark-theme design system and covers the core event-discovery workflow end-to-end. The most critical gaps cluster around four areas: (1) contrast ratios across multiple dark-background pages fail WCAG AA for body text at the most common opacity values used (`rgba(248,250,252,0.4–0.6)`); (2) the EventComponent card — the single most-repeated UI element — lacks keyboard accessibility (click handler on a non-interactive `<div>`); (3) the registration modal imposes strict under-communicated password requirements causing high drop-off; and (4) the AdminDashboard uses `window.prompt()` and `alert()` which break the design system entirely. Secondary concerns include redundant pages (EventsPage and ExplorePage have 90% feature overlap), interest input on Profile is a free-text comma-separated field rather than chip UI, and zero empty-state feedback on the Map page.

---

## Page-by-Page Findings

### 1. Landing Page — Score: 7/10
**User story:** Guest browses events without logging in; Guest signs up

- **Hero subtitle opacity** — `opacity: 0.9` white text on `#667eea–#764ba2` gradient → ~3.8:1, fails 4.5:1. **High / WCAG AA**
- **"Learn More" label mismatch** — Three buttons labeled "Learn More", "Join the Community", "Discover Now" all navigate identically. Misleading. **High / Learnability**
- **Feature card padding** — `.feature { padding: 100px }` overflows at 768–900px viewport width. **Medium / Mobile**
- **No guest exploration path** — Primary CTA immediately gates behind sign-in. **Medium / Learnability**
- **Video missing captions** — `<video src={LEBRON}>` has no `<track>` element. WCAG 1.2.2 Level A failure. **Medium / Accessibility**
- **Footer link color** — `#1a73e8` on `#f1f3f4` → ~3.55:1, fails 4.5:1 for 1rem text. **Medium / WCAG AA**

### 2. Events Page — Score: 8/10
**User story:** Authenticated user finds an event by interest

- **Hero paragraph contrast** — `rgba(248,250,252,0.6)` on `#13101f` → ~4.2:1, fails 4.5:1. **High / WCAG AA**
- **Sidebar heading contrast** — `rgba(248,250,252,0.45)` on `#0d0d14` → ~3.1:1. **High / WCAG AA**
- **Sort pill inactive contrast** — `rgba(248,250,252,0.65)` → ~4.0:1. **Medium / WCAG AA**
- **Results meta contrast** — `rgba(248,250,252,0.45)` → ~3.1:1. **Medium / WCAG AA**
- **No nudge when "For You" hidden** — Users with no interests never see the sort option with no prompt to set interests. **Medium / Learnability**
- **Mobile filter: no close affordance inside panel** — No overlay or close button inside open sidebar. **Medium / Mobile**

### 3. Explore Page — Score: 6/10
**User story:** Authenticated user finds an event by interest

- **Functionally duplicates Events page** — 90% feature overlap. Creates cognitive load. **Critical / Cognitive load**
- **Not linked from Navbar** — `/explore` is unreachable from navigation. **Critical / Navigation**
- **Hero paragraph contrast** — `rgba(248,250,252,0.55)` on `#0d0d14` → ~3.5:1. **High / WCAG AA**
- **Count/empty text contrast** — `rgba(248,250,252,0.4)` → ~2.8:1. Severely failing. **High / WCAG AA**
- **No "Clear filters" CTA on empty state** — EventsPage has it, Explore does not. **Medium / Feedback**
- **Emoji in Near Me button lacks aria-label** — "📍 Near me" announced verbatim. **Medium / Accessibility**

### 4. Home / Map Page — Score: 7/10
**User story:** Authenticated user finds an event on map; Creates an event

- **No map loading/empty state** — Blank map with no skeleton or "no events" message. **High / Feedback**
- **Create Event button overflows on mobile** — Long label "Sign In to create event" wraps or overflows. **Medium / Mobile**
- **Panel toggle not discoverable** — No visual affordance that an event list exists behind the hamburger. **Medium / Learnability**

### 5. Clubs Page — Score: 7.5/10
**User story:** Club leader registers a club; User joins a club

- **`.clubs-sub` contrast** — `rgba(255,255,255,0.5)` on `#080808` → ~3.85:1. **High / WCAG AA**
- **`.club-members` contrast** — `rgba(255,255,255,0.45)` → ~3.5:1. **High / WCAG AA**
- **No spinner on join/leave** — `'…'` is not screen-reader meaningful. **Medium / Feedback**
- **Leave has no confirmation** — Immediate API call with no "Are you sure?". **Medium / Error prevention**
- **Search input missing aria-label** — `placeholder` only, no `aria-label`. **Medium / Accessibility**
- **No club detail page** — Users can't learn about a club before joining. **Medium / Efficiency**
- **`Navbar page="/"` bug** — Clubs nav link never shows active state. **Low / Navigation**

### 6. Profile Page — Score: 6.5/10
**User story:** Authenticated user views and edits their profile

- **Interests as comma-separated plain text** — Inconsistent with chip UI everywhere else. **High / Consistency**
- **Error message placement** — Save errors appear far from the triggering field. **High / Feedback**
- **Unauthenticated dead-end** — "Please log in" with no sign-in button or redirect. **High / Error prevention**
- **No success feedback on save** — Silent return to read mode only. **Medium / Feedback**
- **`prefers-reduced-motion` missing** — Animated grid background runs unconditionally. **Medium / Accessibility**
- **"Delete Account" looks like "Edit Profile"** — Destructive action needs danger styling. **Medium / Error prevention**

### 7. EventDetails Page — Score: 7.5/10
**User story:** Authenticated user views event details; Joins/leaves; Edits event

- **`alert()` on attend/delete errors** — Breaks design system. **High / Feedback**
- **Comment area blank for unauthenticated** — No prompt to sign in. **Medium / Learnability**
- **Attend button `'…'` only** — No `aria-busy` or visible spinner. **Medium / Accessibility**
- **Cloudscape `Multiselect`** — Heavy AWS component visually jarring on dark theme. **Medium / Consistency**

### 8. EventComponent — Score: 5/10
**User story:** User finds and joins an event

- **Card `<div>` not keyboard-accessible** — No `role`, `tabIndex`, or `onKeyDown`. **Critical / Accessibility**
- **`alert()` on attend failure** — Breaks design system. **High / Feedback**
- **Address truncates silently** — No tooltip or expand affordance. **Medium / Learnability**

### 9. Navbar — Score: 8/10

- **Inactive link contrast fails WCAG** — `rgba(255,255,255,0.6)` on black → ~3.35:1. **High / WCAG AA**
- **Default nav link contrast** — `rgba(255,255,255,0.5)` → ~2.98:1. **High / WCAG AA**
- **Mobile menu: no focus trap** — Keyboard can escape the open menu. **High / Accessibility**
- **Hamburger missing `aria-controls`** — `aria-expanded` set but no `aria-controls`. **Medium / Accessibility**
- **Most pages pass `page="/"` to Navbar** — Logo links to landing page even from inner pages. **Medium / Navigation**

### 10. SignInModal — Score: 8/10

- **No focus management on open** — Focus not moved to first field. **High / Accessibility**
- **No focus trap** — Focus escapes modal. **High / Accessibility**
- **Error lacks `role="alert"`** — Screen readers won't announce errors. **Medium / Accessibility**
- **No "Forgot password?" link** — No password recovery path. **Medium / Error prevention**

### 11. RegistrationModal — Score: 6/10

- **Password requirements never shown before submit** — Users discover requirements via errors, one per attempt. **Critical / Error prevention**
- **Phone format non-obvious** — Format example shown but not validated until submit. **High / Feedback**
- **No focus trap or management** — Same as SignInModal. **High / Accessibility**
- **Mobile height overflow** — 9-field form may not scroll inside modal on short viewports. **High / Mobile**
- **Interests multiselect trigger is `<div>`** — Not keyboard-accessible. **Critical / Accessibility**

### 12. AdminDashboard — Score: 5/10

- **`window.prompt()` for rejection reason** — Native browser dialog, unstyled, inaccessible. **Critical / Feedback**
- **`alert()` for all errors** — Same. **High / Feedback**
- **No confirmation before Approve** — Irreversible action with no guard. **Medium / Error prevention**
- **No feedback after approve** — Card disappears silently. **Medium / Feedback**
- **No search/pagination** — Flat list unmanageable at scale. **Medium / Efficiency**

---

## Top 10 Issues (Prioritized)

| Priority | Issue | Page | Severity | Suggested Fix |
|---|---|---|---|---|
| 1 | EventComponent `<div>` card — no keyboard/AT support | EventComponent | Critical | Add `role="article"`, `tabIndex={0}`, `onKeyDown` firing `onSelect` on Enter/Space |
| 2 | `window.prompt()` / `alert()` for admin + errors throughout | Admin, EventDetails, Clubs | Critical | Build `<Toast>` + `<ConfirmModal>` components; replace all call sites |
| 3 | Password requirements not shown until submit failure | RegistrationModal | Critical | Add inline real-time `<PasswordStrengthHint>` that validates as user types |
| 4 | Interests multiselect trigger is `<div>` (not keyboard-accessible) | RegistrationModal | Critical | Change to `<button type="button">` with `aria-haspopup="listbox"` |
| 5 | No focus trap / focus management in modals | SignInModal, RegistrationModal | High | Add focus-trap hook; `autoFocus` on first field on open |
| 6 | WCAG AA contrast failures — secondary/muted text on dark backgrounds | Events, Explore, Clubs, Navbar | High | Raise all `rgba(*,*,*,0.4–0.65)` to minimum `0.72` on dark backgrounds |
| 7 | Profile: unauthenticated dead-end with no sign-in path | Profile | High | Replace plain text with a centered card + "Sign In" button |
| 8 | Profile: interests edited as comma-separated text | Profile | High | Use chip UI matching RegistrationModal |
| 9 | Explore page unreachable from Navbar; duplicates Events page | Explore | Critical | Either merge Near Me into EventsPage or add Explore to Navbar |
| 10 | AdminDashboard rejection via `window.prompt()` | AdminDashboard | Critical | Build `<RejectModal>` with styled textarea + confirm/cancel buttons |

---

## WCAG Contrast Failures Summary

| Element | Effective Color | Background | Ratio | Status |
|---|---|---|---|---|
| `.ep-hero p` | ~`#9FA6B2` | `#13101f` | ~4.2:1 | **FAIL** |
| `.ep-sidebar-section h3` | ~`#787C85` | `#0d0d14` | ~3.1:1 | **FAIL** |
| `.ep-sort-pill` inactive | ~`#A3A9B5` | `#0d0d14` | ~4.0:1 | **FAIL** |
| `.ep-results-meta` | ~`#787C85` | `#0d0d14` | ~3.1:1 | **FAIL** |
| `.explore-hero p` | ~`#8A9097` | `#0d0d14` | ~3.5:1 | **FAIL** |
| `.explore-count` / `.explore-empty` | ~`#72757D` | `#0d0d14` | ~2.8:1 | **FAIL** |
| `.clubs-sub` | ~`#808080` | `#080808` | ~3.85:1 | **FAIL** |
| `.club-members` | ~`#737373` | `#080808` | ~3.5:1 | **FAIL** |
| `.navbar__explore-link` inactive | ~`#999999` | `#000000` | ~3.35:1 | **FAIL** |
| `.navbar__link` default | ~`#808080` | `#000000` | ~2.98:1 | **FAIL** |
| Landing `.hero-subtitle` | ~`#E6E6E6` | purple gradient mid | ~3.8:1 | **FAIL** |
| Landing footer links `#1a73e8` | `#1a73e8` | `#f1f3f4` | ~3.55:1 | **FAIL** |

**Global fix:** Pin `--text-muted` to a pre-calculated WCAG-passing value (e.g. `rgba(248,250,252,0.72)` = ~5.5:1 on `#0d0d14`) and replace all sub-threshold opacity values.

---

## Mobile Audit Notes

- **Landing feature cards at 768–900px**: `padding: 100px` on 500px-wide cards overflows viewport. Breakpoint should be `900px` not `768px`.
- **RegistrationModal at 375px**: 2-column `rmodal__grid` needs `@media (max-width: 480px) { grid-template-columns: 1fr }`.
- **EventsPage sidebar on mobile**: Inline expansion (no overlay) causes excessive scroll.
- **Navbar**: Hamburger collapses correctly at 768px. No critical mobile issues.
- **Map page**: Event column hidden on mobile; `col-open-btn` floats over map correctly.
- **Profile layout**: Likely has a responsive breakpoint (unconfirmed in first 100 lines) but needs verification at 375px.
