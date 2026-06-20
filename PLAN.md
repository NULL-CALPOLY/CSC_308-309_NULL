# PLAN — Phase 2 (onboarding + dynamic interests)

## Dependency classification
Verified against the code (registration already collects city+interests; UseAuth.register is the
shared signup path; UseInterests feeds the interest UI; GoogleAuthRoutes is self-contained).

### INDEPENDENT (run in parallel — disjoint files)
- **A. Dynamic interest system (backend)** — touches only `backend/InterestFIles/*` + a seed
  script + interest tests.
- **D. Google OAuth → JWT unification** — touches `backend/OAuth/GoogleAuthRoutes.js`,
  `frontend/src/Hooks/UseAuth.ts` (OAuth callback handling), `frontend/src/Components/Modals/SignInModal/SignInModal.jsx`
  (+ optional new GoogleSignInButton). Disjoint from A.

### SEQUENTIAL
- **B. Onboarding interest picker** — depends on A's interest API. Touches
  `frontend/src/Hooks/UseInterests.jsx` and `frontend/src/Components/Modals/RegistrationModal/RegistrationModal.jsx`
  (+ optional new InterestPicker component). Run AFTER A merges.
- **C. City + bounded location loading** — shares `RegistrationModal.jsx` with B and `UseAuth.ts`
  with D, so run LAST (branch from main after A, B, D merged). Touches `RegistrationModal.jsx`,
  `frontend/src/Hooks/UseAuth.ts`, `frontend/src/Hooks/UseEvents.jsx`, and the feed consumers
  (`HomePage`/`Explore`/`EventColumn`).

## Execution order
1. Parallel: **A** + **D** (subagents, isolated worktrees). Each: implement → tests + build green →
   PR → squash-merge → re-verify main → revert if red.
2. **B** (after A merged; branch from updated main).
3. **C** (after B + D merged; branch from updated main).

## Per-feature scope
### A. Dynamic interest system
- Extend `InterestSchema`: add `category` (String, optional), `normalizedName` (String, lowercase
  trimmed, unique sparse) for dedup; keep `name` as display. Don't break existing
  `{name, similarInterests}` tests.
- Services: `searchInterests(q)` (typeahead, case-insensitive prefix/substring, limit), and
  normalize-on-create (dedupe user-suggested tags by normalizedName; reuse existing if match).
- Routes: `GET /interests/search?q=` (typeahead), keep `/all`. `POST /interests` normalizes +
  dedupes (returns existing if duplicate). Optional `GET /interests/categories`.
- Seed script `backend/scripts/seedInterests.js` with base categories (no new deps; idempotent
  upsert by normalizedName). NOT run in CI; document usage.
- Update `tests/Integration/Interests/*` for new behavior; keep all green.

### D. Google OAuth → JWT
- In the Google callback, after resolving the user, sign the SAME access+refresh JWTs as standard
  auth (reuse a shared token helper; jsonwebtoken already in backend deps), set the `refreshToken`
  HttpOnly cookie, and redirect to the frontend with the access token (e.g. `?token=` or hash) for
  the SPA to store. Stop relying on passport session for app auth. Keep `/auth/google` entry.
- Frontend: handle the OAuth redirect token in `UseAuth` (read token → fetch `/users/me` → set
  user), add a "Continue with Google" button to `SignInModal`.
- No new backend deps.

### B. Onboarding interest picker
- `UseInterests`: add a debounced `searchInterests(q)` using A's `/interests/search`.
- RegistrationModal interest field: typeahead search + allow "add new interest" (POST /interests,
  which dedupes server-side) so users aren't limited to a fixed list. Chosen interests already feed
  the curated feed (Explore "For you").

### C. City + bounded location loading
- At signup, derive coordinates from the entered city (geocode once via existing Nominatim, or
  browser geolocation) and pass `location {latitude, longitude}` to `register` so the user gets a
  2dsphere point. (RegisterData already supports location.)
- Add a bounded feed: a hook/usage that calls `/events/nearby?lng&lat&radius` using the user's
  saved location (fallback to city geocode, fallback to all upcoming). Wire into Explore/Home.

## Conventions
See PROGRESS.md "Conventions / how to verify". Main must always end green. Retry a failure ≤4×,
else mark BLOCKED in PROGRESS.md and move on.
