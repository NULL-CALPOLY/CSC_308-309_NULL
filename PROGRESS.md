PHASES 0,1,2 COMPLETE — Phase 3 IN PROGRESS

# Findr Overhaul — PROGRESS (autonomous build memory)

Read this first on any restart. Update + `git commit` after every task.
NOTE: this orchestration branch holds stale app code; ALWAYS branch feature work from `origin/main`.

## Shipped (DONE — do not rebuild)
- **Phase 0** — security foundation: helmet, rate limiting, body sanitization, 2dsphere geo
  indexes (#118); route auth + ownership guards, `/users/me`, `/events/nearby`, 2-events/day
  cap (#119); prod-503 hotfix — backend deps must live in `backend/package.json` (#120).
- **Phase 1** — public `LandingEventPreview` + public `/explore` page (search/interest/date
  filters, sort incl. "For you" via `/users/me` interests) (#121).
- **Phase 2** — dynamic interests backend (#123), onboarding typeahead + user-suggested tags
  (#124), city geocode at signup + `useNearbyEvents` + Explore "Near me" (#125), Google OAuth→JWT
  (#122). All merged, main green, prod verified.

## Phase 3 — Map overhaul (IN PROGRESS)
Locked UX (from roadmap): Airbnb/Zillow split-view — map + linked side-list, two-way highlight,
clustering on desktop, mobile bottom-sheet. Explore page handles pure list/filter browsing.
- **3A. Markers + clustering + same-venue overlap** — NOT STARTED — independent of 3B's start but
  3B depends on it. Files: `MainMapComponent.jsx`/`.css`, new marker SVG asset(s), frontend deps
  (`react-leaflet-cluster` + `leaflet.markercluster`), test mock for react-leaflet-cluster +
  jest moduleNameMapper. leaflet.markercluster `spiderfyOnMaxZoom` handles same-venue overlap.
- **3B. Linked split-view + mobile bottom-sheet** — NOT STARTED — depends on 3A. Lift
  `selectedEventId` to `HomePage.jsx`; pass to `MainMapComponent` (highlight + flyTo on select)
  and `EventColumn` (highlight card + scroll-into-view; click card → select). Mobile bottom-sheet
  layout for the event column. Files: `HomePage.jsx`/`.css`, `MainMapComponent.jsx`,
  `EventColumn.jsx`/`.css`, `EventComponent.jsx` (selected styling).

Versions: react 18, react-leaflet 4.2.1, leaflet 1.9.4 → use react-leaflet-cluster ^2.
react-leaflet test mock at tests/__mocks__/react-leaflet.js (exports MapContainer/TileLayer/
Marker/Popup/useMap). MainMapComponent.test uses getByRole('button') expecting ONE button (locate)
— don't add map buttons in 3A.

Order: 3A → 3B (sequential; both funnel through MainMapComponent so not parallelizable).

## Phase 2 — onboarding + dynamic interests (✅ COMPLETE — all merged, main green)
- **A. Dynamic interest system (backend)** — ✅ DONE (PR #123, merge 207bee4). normalizedName +
  category, dedupe on POST, `GET /interests/search?q=`, seedInterests.js.
- **B. Onboarding interest picker (frontend)** — ✅ DONE (PR #124, merge 7fe8fcf). UseInterests
  `searchInterests`/`createInterest`; RegistrationModal typeahead + "Add '<query>'" user-suggested tags.
- **C. City + bounded location loading** — ✅ DONE (PR #125, merge 30a4301). Geocode city at signup
  → location point; `useNearbyEvents` hook; Explore "📍 Near me" toggle + radius using saved
  location or browser geolocation.
- **D. Google OAuth → JWT unification** — ✅ DONE (PR #122, merge 4485706). Callback issues JWT +
  refresh cookie, redirects with `#token=`; UseAuth consumes hash token; SignInModal Google button.

Main verified GREEN via CI Testing on every merge commit (A, D, B, C). Known non-blocker: the Azure
"Build and Deploy Job" (Static Web Apps PR-preview) intermittently fails on a staging-env QUOTA limit
("maximum number of staging environments") — the Vite build compiles fine; not a code issue. Merge
gate = `build` (full Jest) + `ai-review` green.

Execution: A + D ran in parallel via isolated-worktree subagents; B then C ran sequentially (shared
RegistrationModal). The deferred Phase-0 OAuth unification was completed here as D.

### Phase 1 follow-up still open (for a later phase)
Make `/events/:id` publicly viewable (auth-gate only RSVP/comments) so landing/Explore cards open
without an account.

Already-present (don't redo): registration modal already collects `city` and `interests`;
UserSchema already has `city`, `interests[]`, `location` (2dsphere partial). `/events/nearby`
exists from Phase 0. Explore "For you" already reads `/users/me` interests.

## Conventions / how to verify (unattended)
- Frontend unit tests: `npx jest --config=jest.config.cjs --selectProjects unit-frontend` (sandboxed OK, ~4s).
- Backend integration tests need real mongod, which the sandbox blocks → run with the Bash tool's
  `dangerouslyDisableSandbox: true` AND `--runInBand`. They auto-background if slow; a fast
  fallback is a foreground node smoke script (set `NODE_ENV=test`, connect via `Model.base.connect(uri)`
  because models load mongoose from `backend/node_modules`).
- Build: `npm run build --prefix frontend`.
- Lint changed files: `npx eslint <files>` — warnings (unused-import) are pre-existing/ok; zero
  error-severity lines required.
- **Deploy gotcha:** any new `import` under `backend/` → `cd backend && npm install <pkg> --save`
  (root package.json is NOT installed in prod; would 503).
- gh auth: `export GH_TOKEN=$(printf 'protocol=https\nhost=github.com\n\n' | git credential fill 2>/dev/null | sed -n 's/^password=//p')` then run gh with `dangerouslyDisableSandbox`.
- Never commit code to main directly; feature branches + PR; merge only when tests+build green;
  if main goes red after a merge, `git revert` and mark BLOCKED.

## Decisions
- Interest gating/auth model & map UX & org flow: see memory roadmap. Google OAuth restricted to
  verified-student badge is Phase 5; D here only unifies the token mechanism.
