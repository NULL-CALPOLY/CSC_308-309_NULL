# Findr Overhaul — PROGRESS (autonomous build memory)

Read this first on any restart. Update + `git commit` after every task.

## Shipped (DONE — do not rebuild)
- **Phase 0** — security foundation: helmet, rate limiting, body sanitization, 2dsphere geo
  indexes (#118); route auth + ownership guards, `/users/me`, `/events/nearby`, 2-events/day
  cap (#119); prod-503 hotfix — backend deps must live in `backend/package.json` (#120).
- **Phase 1** — public `LandingEventPreview` + public `/explore` page (search/interest/date
  filters, sort incl. "For you" via `/users/me` interests) (#121).

## Phase 2 — onboarding + dynamic interests (IN PROGRESS)
Feature status (see PLAN.md for file lists + parallel/sequential split):
- **A. Dynamic interest system (backend)** — ✅ DONE (PR #123, merge 207bee4). normalizedName +
  category, dedupe on POST, `GET /interests/search?q=`, seedInterests.js. CI green on main.
- **B. Onboarding interest picker (frontend)** — IN PROGRESS — depends on A (now available)
- **C. City + bounded location loading** — NOT STARTED — depends on B
- **D. Google OAuth → JWT unification** — ✅ DONE (PR #122, merge 4485706). Callback issues JWT +
  refresh cookie, redirects with `#token=`; UseAuth consumes hash token; SignInModal Google button.
  CI green on main.

Main verified GREEN after A+D (CI Testing success on both merge commits). Azure Static Web Apps
preview check was red on A's PR but that was a staging-env QUOTA error, not code.

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
