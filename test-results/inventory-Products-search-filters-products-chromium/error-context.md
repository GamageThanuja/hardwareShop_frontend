# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: inventory.spec.ts >> Products >> search filters products
- Location: tests/e2e/inventory.spec.ts:230:2

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('tbody tr').first()
Expected pattern: /drill/i
Received string:  "No results found."
Timeout: 12000ms

Call log:
  - Expect "to.have.text" with timeout 12000ms
  - waiting for locator('tbody tr').first()
    28 × locator resolved to <tr data-slot="table-row" class="border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted">…</tr>
       - unexpected value "No results found."

```

```yaml
- row "No results found.":
  - cell "No results found."
```

# Test source

```ts
  140 |       await dialog.locator('input').nth(1).fill(wh.address);
  141 |       await dialog.locator('input').nth(2).fill(wh.city);
  142 |       await dialog.locator('input').nth(3).fill(wh.country);
  143 | 
  144 |       await dialog.locator('button[type="submit"]').click();
  145 |       await expectToast(page, /created/i);
  146 |       const whClosed = await dialog.waitFor({ state: "hidden", timeout: 5_000 }).then(() => true).catch(() => false);
  147 |       if (!whClosed) {
  148 |         await page.keyboard.press("Escape");
  149 |         await dialog.waitFor({ state: "hidden", timeout: 3_000 }).catch(() => {});
  150 |       }
  151 |     }
  152 |   });
  153 | 
  154 |   test("edit a warehouse city", async ({ page }) => {
  155 |     await page.goto("/dashboard/warehouses");
  156 |     await waitForTable(page);
  157 | 
  158 |     const row = page.locator("tbody tr").filter({ hasText: "North Store" }).first();
  159 |     await row.locator("button").filter({ hasText: /edit/i }).click();
  160 | 
  161 |     const dialog = page.locator('[role="dialog"]');
  162 |     await expect(dialog).toBeVisible();
  163 | 
  164 |     const cityInput = dialog.locator('input').nth(2);
  165 |     await cityInput.clear();
  166 |     await cityInput.fill("Kurunegala");
  167 |     await dialog.locator('button[type="submit"]').click();
  168 |     await expectToast(page, /updated/i);
  169 |   });
  170 | });
  171 | 
  172 | // ─── Products ─────────────────────────────────────────────────────────────────
  173 | 
  174 | test.describe("Products", () => {
  175 |   const products = [
  176 |     { sku: "PWR-DRL-001", name: "Cordless Drill 18V", unitPrice: "12500", costPrice: "9800", reorderLevel: "5", reorderQty: "20" },
  177 |     { sku: "PWR-SAW-001", name: "Circular Saw 7.25in", unitPrice: "18500", costPrice: "14200", reorderLevel: "3", reorderQty: "10" },
  178 |     { sku: "HND-HAM-001", name: "Claw Hammer 16oz", unitPrice: "950", costPrice: "650", reorderLevel: "10", reorderQty: "50" },
  179 |     { sku: "HND-SCR-001", name: "Flathead Screwdriver Set", unitPrice: "1250", costPrice: "850", reorderLevel: "8", reorderQty: "30" },
  180 |     { sku: "ELC-CBL-001", name: "Electrical Wire 2.5mm", unitPrice: "4500", costPrice: "3200", reorderLevel: "5", reorderQty: "15" },
  181 |   ];
  182 | 
  183 |   test("page loads with Products heading", async ({ page }) => {
  184 |     await page.goto("/dashboard/products");
  185 |     await expect(page.locator("h1, h2").filter({ hasText: /products/i }).first()).toBeVisible();
  186 |   });
  187 | 
  188 |   test("create multiple products", async ({ page }) => {
  189 |     test.setTimeout(120_000);
  190 |     await page.goto("/dashboard/products");
  191 | 
  192 |     for (const [i, prod] of products.entries()) {
  193 |       await page.locator("button").filter({ hasText: /new product/i }).click();
  194 |       const dialog = page.locator('[role="dialog"]');
  195 |       await expect(dialog).toBeVisible({ timeout: 8_000 });
  196 | 
  197 |       // SKU and Name are the first two text inputs
  198 |       const textInputs = dialog.locator('input:not([type="number"])');
  199 |       await textInputs.nth(0).fill(prod.sku);
  200 |       await textInputs.nth(1).fill(prod.name);
  201 | 
  202 |       // Select category
  203 |       const combos = dialog.locator('[role="combobox"]');
  204 |       const comboCount = await combos.count();
  205 |       if (comboCount > 0) {
  206 |         await combos.nth(0).click();
  207 |         const opts = page.locator('[role="option"]');
  208 |         const optCount = await opts.count();
  209 |         if (optCount > 0) await opts.nth(i % optCount).click();
  210 |       }
  211 | 
  212 |       // Numeric fields: unitPrice, costPrice, reorderLevel, reorderQty
  213 |       const numInputs = dialog.locator('input[type="number"]');
  214 |       const numCount = await numInputs.count();
  215 |       if (numCount >= 1) await numInputs.nth(0).fill(prod.unitPrice);
  216 |       if (numCount >= 2) await numInputs.nth(1).fill(prod.costPrice);
  217 |       if (numCount >= 3) await numInputs.nth(2).fill(prod.reorderLevel);
  218 |       if (numCount >= 4) await numInputs.nth(3).fill(prod.reorderQty);
  219 | 
  220 |       await dialog.locator('button[type="submit"]').click();
  221 |       await expectToast(page, /created/i);
  222 |       const prodClosed = await dialog.waitFor({ state: "hidden", timeout: 5_000 }).then(() => true).catch(() => false);
  223 |       if (!prodClosed) {
  224 |         await page.keyboard.press("Escape");
  225 |         await dialog.waitFor({ state: "hidden", timeout: 3_000 }).catch(() => {});
  226 |       }
  227 |     }
  228 |   });
  229 | 
  230 |   test("search filters products", async ({ page }) => {
  231 |     await page.goto("/dashboard/products");
  232 |     await waitForTable(page);
  233 | 
  234 |     await page.locator('input[placeholder*="Search"]').fill("Drill");
  235 |     await page.waitForTimeout(800);
  236 | 
  237 |     const rows = page.locator("tbody tr");
  238 |     const count = await rows.count();
  239 |     expect(count).toBeGreaterThan(0);
> 240 |     await expect(rows.first()).toContainText(/drill/i);
      |                               ^ Error: expect(locator).toContainText(expected) failed
  241 |   });
  242 | 
  243 |   test("edit product price", async ({ page }) => {
  244 |     await page.goto("/dashboard/products");
  245 |     await waitForTable(page);
  246 | 
  247 |     const row = page.locator("tbody tr").filter({ hasText: "Claw Hammer" }).first();
  248 |     await row.locator("button").filter({ hasText: /edit/i }).click();
  249 | 
  250 |     const dialog = page.locator('[role="dialog"]');
  251 |     await expect(dialog).toBeVisible();
  252 | 
  253 |     const numInputs = dialog.locator('input[type="number"]');
  254 |     await numInputs.nth(0).fill("1100");
  255 |     await dialog.locator('button[type="submit"]').click();
  256 |     await expectToast(page, /updated/i);
  257 |   });
  258 | 
  259 |   test("cannot create product with duplicate SKU", async ({ page }) => {
  260 |     await page.goto("/dashboard/products");
  261 |     await waitForTable(page);
  262 | 
  263 |     await page.locator("button").filter({ hasText: /new product/i }).click();
  264 |     const dialog = page.locator('[role="dialog"]');
  265 |     await expect(dialog).toBeVisible();
  266 | 
  267 |     const textInputs = dialog.locator('input:not([type="number"])');
  268 |     await textInputs.nth(0).fill("HND-HAM-001"); // duplicate SKU
  269 |     await textInputs.nth(1).fill("Duplicate Hammer");
  270 | 
  271 |     const combos = dialog.locator('[role="combobox"]');
  272 |     if (await combos.first().isVisible({ timeout: 2_000 }).catch(() => false)) {
  273 |       await combos.first().click();
  274 |       await page.locator('[role="option"]').first().click();
  275 |     }
  276 | 
  277 |     const numInputs = dialog.locator('input[type="number"]');
  278 |     if (await numInputs.count() >= 2) {
  279 |       await numInputs.nth(0).fill("1000");
  280 |       await numInputs.nth(1).fill("700");
  281 |     }
  282 | 
  283 |     await dialog.locator('button[type="submit"]').click();
  284 |     // Backend should reject duplicate SKU → error toast
  285 |     const errorToast = page.locator("[data-sonner-toast]").first();
  286 |     await expect(errorToast).toBeVisible({ timeout: 10_000 });
  287 |   });
  288 | 
  289 |   test("pagination controls are present", async ({ page }) => {
  290 |     await page.goto("/dashboard/products");
  291 |     await waitForTable(page);
  292 |     // Pagination or row count is displayed
  293 |     const paginator = page.locator("text=/page|showing/i").first();
  294 |     await expect(paginator).toBeVisible({ timeout: 5_000 }).catch(() => {});
  295 |   });
  296 | });
  297 | 
  298 | // ─── Stock ────────────────────────────────────────────────────────────────────
  299 | 
  300 | test.describe("Stock management", () => {
  301 |   test("stock page loads", async ({ page }) => {
  302 |     await page.goto("/dashboard/stock");
  303 |     await expect(page.locator("h1, h2").filter({ hasText: /stock/i }).first()).toBeVisible();
  304 |   });
  305 | 
  306 |   test("view stock levels for all products", async ({ page }) => {
  307 |     await page.goto("/dashboard/stock");
  308 |     await waitForTable(page);
  309 | 
  310 |     // Table should be visible OR a no-data message
  311 |     const table = page.locator("table");
  312 |     const noData = page.getByText(/no data|no stock|empty/i).first();
  313 |     const hasTable = await table.isVisible({ timeout: 10_000 }).catch(() => false);
  314 |     const hasNoData = await noData.isVisible({ timeout: 2_000 }).catch(() => false);
  315 |     expect(hasTable || hasNoData).toBe(true);
  316 |   });
  317 | 
  318 |   test("create inventory adjustment — add stock", async ({ page }) => {
  319 |     await page.goto("/dashboard/stock");
  320 |     await waitForTable(page);
  321 | 
  322 |     const adjustBtn = page.locator("button").filter({ hasText: /adjust|add stock|new transaction|record/i }).first();
  323 |     if (await adjustBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
  324 |       await adjustBtn.click();
  325 |       const dialog = page.locator('[role="dialog"]');
  326 |       await expect(dialog).toBeVisible();
  327 | 
  328 |       const combos = dialog.locator('[role="combobox"]');
  329 |       if (await combos.nth(0).isVisible({ timeout: 2_000 }).catch(() => false)) {
  330 |         await combos.nth(0).click();
  331 |         await page.locator('[role="option"]').first().click();
  332 |       }
  333 |       if (await combos.nth(1).isVisible({ timeout: 2_000 }).catch(() => false)) {
  334 |         await combos.nth(1).click();
  335 |         await page.locator('[role="option"]').first().click();
  336 |       }
  337 | 
  338 |       const qtyInput = dialog.locator('input[type="number"]').first();
  339 |       await qtyInput.fill("50");
  340 | 
```