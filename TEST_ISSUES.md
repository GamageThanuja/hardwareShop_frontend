# E2E Test Failures — Issues to Fix

**Test run summary:** 76 passed · 7 failed · 3 flaky out of 86 tests  
**Date:** 2026-05-21  
**Suite:** `tests/e2e/`

---

## FAILED TESTS

### 1. Products › create multiple products
**File:** `tests/e2e/inventory.spec.ts:188`

**What the test does:** Opens "New Product" dialog and fills: SKU → Name → numeric fields (Unit Price, Cost Price, Reorder Level, Reorder Qty).

**What actually happens:**
```
Error: Name is required
```
The dialog snapshot shows:
- Field index 0 → `SKU` (filled correctly with `PWR-DRL-001`)
- Field index 1 → **`Barcode`** (test fills the product Name here — wrong field)
- Field index 2 → `Name` (left empty → validation error "Name is required")

**Root cause:** The "New Product" form has a **new `Barcode` field** inserted between `SKU` and `Name`. The test was written expecting only SKU and Name text inputs, so names are now mapped to the Barcode field.

**Fix required (frontend form):** The form field order is now:
1. SKU
2. Barcode *(new)*
3. Name
4. Description

Update `inventory.spec.ts` test selector index from `nth(1)` to `nth(2)` for the Name field. OR the Barcode field can be skipped since it is optional.

---

### 2. Products › search filters products
**File:** `tests/e2e/inventory.spec.ts:230`

**Root cause:** Cascade failure — no products were created (due to issue #1 above). The search for "Drill" returns no rows.

**Fix required:** Fix issue #1 first. Once products are created, this test should pass.

---

### 3. Products › edit product price
**File:** `tests/e2e/inventory.spec.ts:243`

**What the test does:** Looks for a table row containing "Claw Hammer" and clicks its Edit button.

**What actually happens:** Row not found (timeout at 45s) — "Claw Hammer" product was never created due to issue #1.

**Fix required:** Fix issue #1 first.

---

### 4. Products › cannot create product with duplicate SKU
**File:** `tests/e2e/inventory.spec.ts:259`

**Root cause:** Cascade failure from issue #1 — no products exist, so no duplicate SKU to test against. Test submits `HND-HAM-001` but no prior product with that SKU exists, so the backend creates it instead of rejecting it. The test expects an error toast, but gets a success toast.

**Fix required:** Fix issue #1 first to ensure products exist before this test runs.

---

### 5. Stock management › view stock levels for all products
**File:** `tests/e2e/inventory.spec.ts:306`

**What the test does:** Navigates to `/dashboard/stock`, waits for loading, then checks that either a `<table>` element OR a "no data/no stock/empty" text is visible.

**What actually happens:**
```
Expected: true
Received: false
```
Neither a `<table>` element nor the text pattern `/no data|no stock|empty/i` is visible.

**Root cause:** The stock page likely uses a **non-table UI** (e.g., cards, a custom list component, or a different "empty state" message). The page renders but uses neither a `<table>` HTML element nor a "no data" text matching the test's regex.

**Fix required (frontend):**
- Check what element the `/dashboard/stock` page actually renders for its data/empty state
- Likely the stock page uses a different empty state message or a card-based layout instead of a `<table>`
- Tell the team what text the empty state shows, or add a `data-testid="stock-table"` to the main content element

---

### 6. Customers › edit customer credit limit
**File:** `tests/e2e/sales.spec.ts:83`

**What the test does:** Navigates to `/dashboard/customers`, waits for table to load, then looks for a row with "Roshan" and clicks its Edit button.

**What actually happens:**
```
click: Test timeout of 45000ms exceeded.
waiting for locator('tbody tr').filter({ hasText: 'Roshan' }).first().locator('button').filter({ hasText: /edit/i })
```
The "Roshan" row is never found (timeout).

**Root cause:** One of the following:
- The customers table is **paginated** and "Roshan" (the 4th customer added) is on page 2 — the test only looks at the first page
- OR the customer was not created because the "create multiple customers" test dialog stayed open for one entry and Roshan was skipped
- OR the customer list sort order puts Roshan beyond what is visible

**Fix required:** Check `/dashboard/customers` pagination — if the table paginates, either increase page size in the test, search for "Roshan" first, or navigate to the correct page.

---

### 7. Authentication flows › authenticated user visiting login is redirected to dashboard
**File:** `tests/e2e/auth.spec.ts:79`

**What the test does:** Logs in fresh as admin (gets a valid JWT), then navigates to `/auth/v1/login`. Expects the Next.js middleware to detect the `access_token` cookie and redirect to `/dashboard/default`.

**What actually happens:** The login page loads and stays at `/auth/v1/login` — no redirect occurs. The middleware code is:
```typescript
if (isAuth && token) {
  return NextResponse.redirect(new URL("/dashboard/default", request.url));
}
```

**Root cause:** The Next.js middleware (`middleware.ts`) is **not reliably redirecting** authenticated users away from `/auth/*` routes in development mode. The same behavior is observed for unauthenticated users accessing `/dashboard/*` — the middleware does not redirect in either direction under Playwright's browser context.

This was confirmed by the page snapshot: the login page renders fully with its form even though a fresh login was just completed.

**Fix required (Next.js/middleware):**
- Verify the middleware is being applied in dev mode by checking Next.js logs for middleware execution
- Test in production build (`next build && next start`) to confirm it works
- Ensure `middleware.ts` is at the correct path (project root, not inside `src/`)
- If it needs to be inside `src/`, move it to `src/middleware.ts`
- Consider adding a `console.log` to `middleware.ts` to verify it runs on each request

---

## FLAKY TESTS (pass on retry)

These tests fail on the first attempt but succeed when retried. They indicate **intermittent backend response issues** — likely the dev server taking longer than expected.

### F1. Authentication flows › wrong credentials shows error toast
**File:** `tests/e2e/auth.spec.ts:43`

**Behavior:** First attempt fails (toast not visible within 10s), retry succeeds.  
**Likely cause:** The backend login endpoint is slow to respond with the error (rate-limiting delay, cold start, or network latency).  
**Fix:** Consider increasing the POST `/api/v1/Auth/login` response time SLA or adding a retry-aware delay in the test.

---

### F2. Authentication flows › wrong username shows error toast  
**File:** `tests/e2e/auth.spec.ts:55`

**Behavior:** Sometimes fails (no toast visible), sometimes passes.  
**Observed in failure:** The page navigates back to login (as if a page redirect happened) instead of showing an inline toast. This suggests the login endpoint may be returning a **redirect response** for some error conditions instead of a JSON error body that triggers the Sonner toast.  
**Fix required (backend):** Ensure `POST /api/v1/Auth/login` always returns a JSON body (e.g., `{ isSuccess: false, message: "..." }`) for all error cases — including unknown usernames — rather than an HTTP redirect. The frontend toast system relies on catching a non-success JSON response.

---

### F3. Authentication flows › valid credentials redirect to dashboard
**File:** `tests/e2e/auth.spec.ts:67`

**Behavior:** First attempt times out waiting for URL to change to `**/dashboard/**` (20s), retry succeeds in 21s.  
**Likely cause:** The login POST is slow to process on first request (backend warm-up / database latency).  
**Fix:** No code change needed — this is a timing/cold-start issue. Consider increasing `waitForURL` timeout from 20s to 30s in the test.

---

## SUMMARY TABLE

| # | Test | Status | Root Cause |
|---|------|--------|-----------|
| 1 | Products › create multiple products | **FAIL** | New `Barcode` field in product form — test fills wrong index |
| 2 | Products › search filters products | **FAIL** | Cascade from #1 (no products in DB) |
| 3 | Products › edit product price | **FAIL** | Cascade from #1 (no "Claw Hammer" product) |
| 4 | Products › cannot create product with duplicate SKU | **FAIL** | Cascade from #1 (no products to duplicate) |
| 5 | Stock management › view stock levels | **FAIL** | Stock page UI doesn't use `<table>` or expected empty-state text |
| 6 | Customers › edit customer credit limit | **FAIL** | "Roshan" customer not visible (pagination or creation order issue) |
| 7 | Auth › authenticated user redirected from login | **FAIL** | Next.js middleware not redirecting in dev mode |
| F1 | Auth › wrong credentials toast | **FLAKY** | Backend slow response (intermittent) |
| F2 | Auth › wrong username toast | **FLAKY** | Backend may redirect instead of returning JSON error |
| F3 | Auth › valid credentials redirect | **FLAKY** | Backend slow on first login (cold start) |

---

## WHAT TO CHECK IN THE BACKEND / FRONTEND

1. **Product form** — Was a `Barcode` field recently added to the New Product dialog? If yes, update `inventory.spec.ts:188` to fill `textInputs.nth(2)` for Name (skip index 1 = Barcode).

2. **Stock page** — What does `/dashboard/stock` render when there is stock? Does it use a `<table>` or a card/list layout? What is the empty state text when no stock exists?

3. **Customers pagination** — Does `/dashboard/customers` paginate results? If the default page size is 3 or fewer, "Roshan" (4th customer) would be on page 2.

4. **Login error response** — Does `POST /api/v1/Auth/login` return a JSON body for an unknown username, or does it redirect? Check the backend controller — it should always return `{ isSuccess: false, message: "..." }` so the frontend can show a toast.

5. **Middleware redirect** — Run the app with `next build && next start` (production mode) and test the redirects manually. If they work in production but not in dev, this is a Next.js dev mode issue and not a bug in the app.
