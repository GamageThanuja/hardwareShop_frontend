# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: inventory.spec.ts >> Stock management >> view stock levels for all products
- Location: tests/e2e/inventory.spec.ts:306:2

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e5]:
      - list [ref=e7]:
        - listitem [ref=e8]:
          - link "BoltForge Hardware" [ref=e9] [cursor=pointer]:
            - /url: /dashboard/default
            - img [ref=e10]
            - generic [ref=e12]: BoltForge Hardware
      - generic [ref=e13]:
        - generic [ref=e14]:
          - generic [ref=e15]: Overview
          - list [ref=e17]:
            - listitem [ref=e18]:
              - link "Dashboard" [ref=e19] [cursor=pointer]:
                - /url: /dashboard/default
                - img [ref=e20]
                - generic [ref=e25]: Dashboard
        - generic [ref=e26]:
          - generic [ref=e27]: Inventory
          - list [ref=e29]:
            - listitem [ref=e30]:
              - link "Products" [ref=e31] [cursor=pointer]:
                - /url: /dashboard/products
                - img [ref=e32]
                - generic [ref=e36]: Products
            - listitem [ref=e37]:
              - link "Categories" [ref=e38] [cursor=pointer]:
                - /url: /dashboard/categories
                - img [ref=e39]
                - generic [ref=e42]: Categories
            - listitem [ref=e43]:
              - link "Warehouses" [ref=e44] [cursor=pointer]:
                - /url: /dashboard/warehouses
                - img [ref=e45]
                - generic [ref=e48]: Warehouses
            - listitem [ref=e49]:
              - link "Stock" [ref=e50] [cursor=pointer]:
                - /url: /dashboard/stock
                - img [ref=e51]
                - generic [ref=e55]: Stock
        - generic [ref=e56]:
          - generic [ref=e57]: Procurement
          - list [ref=e59]:
            - listitem [ref=e60]:
              - link "Suppliers" [ref=e61] [cursor=pointer]:
                - /url: /dashboard/suppliers
                - img [ref=e62]
                - generic [ref=e67]: Suppliers
            - listitem [ref=e68]:
              - link "Purchase Orders" [ref=e69] [cursor=pointer]:
                - /url: /dashboard/purchase-orders
                - img [ref=e70]
                - generic [ref=e74]: Purchase Orders
            - listitem [ref=e75]:
              - link "Purchase Returns" [ref=e76] [cursor=pointer]:
                - /url: /dashboard/purchase-returns
                - img [ref=e77]
                - generic [ref=e80]: Purchase Returns
        - generic [ref=e81]:
          - generic [ref=e82]: Sales
          - list [ref=e84]:
            - listitem [ref=e85]:
              - link "Customers" [ref=e86] [cursor=pointer]:
                - /url: /dashboard/customers
                - img [ref=e87]
                - generic [ref=e92]: Customers
            - listitem [ref=e93]:
              - link "Sales Orders" [ref=e94] [cursor=pointer]:
                - /url: /dashboard/sales-orders
                - img [ref=e95]
                - generic [ref=e98]: Sales Orders
            - listitem [ref=e99]:
              - link "Sales Returns" [ref=e100] [cursor=pointer]:
                - /url: /dashboard/sales-returns
                - img [ref=e101]
                - generic [ref=e104]: Sales Returns
            - listitem [ref=e105]:
              - link "Payments" [ref=e106] [cursor=pointer]:
                - /url: /dashboard/payments
                - img [ref=e107]
                - generic [ref=e109]: Payments
        - generic [ref=e110]:
          - generic [ref=e111]: Analytics
          - list [ref=e113]:
            - listitem [ref=e114]:
              - link "Reports" [ref=e115] [cursor=pointer]:
                - /url: /dashboard/reports
                - img [ref=e116]
                - generic [ref=e118]: Reports
        - generic [ref=e119]:
          - generic [ref=e120]: Admin
          - list [ref=e122]:
            - listitem [ref=e123]:
              - link "Users" [ref=e124] [cursor=pointer]:
                - /url: /dashboard/users
                - img [ref=e125]
                - generic [ref=e137]: Users
      - list [ref=e139]:
        - listitem [ref=e140]:
          - button "AU Admin User admin@example.com" [ref=e141]:
            - generic [ref=e143]: AU
            - generic [ref=e144]:
              - generic [ref=e145]: Admin User
              - generic [ref=e146]: admin@example.com
            - img [ref=e147]
    - main [ref=e151]:
      - generic [ref=e153]:
        - generic [ref=e154]:
          - button "Toggle Sidebar" [ref=e155]:
            - img
            - generic [ref=e156]: Toggle Sidebar
          - button "Search ⌘ J" [ref=e157]:
            - img
            - text: Search
            - generic [ref=e158]:
              - generic [ref=e159]: ⌘
              - text: J
          - generic [ref=e160]:
            - heading "Command Palette" [level=2] [ref=e161]
            - paragraph [ref=e162]: Search for a command to run...
        - generic [ref=e163]:
          - button [ref=e164]:
            - img
          - 'button "Current theme: light. Click to cycle themes" [ref=e165]':
            - img
      - generic [ref=e167]:
        - generic [ref=e169]:
          - heading "Stock" [level=1] [ref=e170]
          - paragraph [ref=e171]: View and manage inventory stock levels
        - generic [ref=e172]:
          - tablist [ref=e173]:
            - tab "By Warehouse" [selected] [ref=e174]
            - tab "Transactions" [ref=e175]
            - tab "Transfer" [ref=e176]
          - tabpanel "By Warehouse" [ref=e177]:
            - generic [ref=e178]:
              - combobox [ref=e179]:
                - generic: Select warehouse
                - img
              - paragraph [ref=e180]: Select a warehouse to view its stock.
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e186] [cursor=pointer]:
    - img [ref=e187]
  - alert [ref=e190]
```

# Test source

```ts
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
  240 |     await expect(rows.first()).toContainText(/drill/i);
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
> 315 |     expect(hasTable || hasNoData).toBe(true);
      |                                  ^ Error: expect(received).toBe(expected) // Object.is equality
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
  341 |       await dialog.locator('button[type="submit"]').click();
  342 |       const toast = page.locator("[data-sonner-toast]").first();
  343 |       await expect(toast).toBeVisible({ timeout: 10_000 });
  344 |     }
  345 |   });
  346 | 
  347 |   test("transfer stock between warehouses", async ({ page }) => {
  348 |     await page.goto("/dashboard/stock");
  349 |     await waitForTable(page);
  350 | 
  351 |     const transferBtn = page.locator("button").filter({ hasText: /transfer/i }).first();
  352 |     if (await transferBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
  353 |       await transferBtn.click();
  354 |       const dialog = page.locator('[role="dialog"]');
  355 |       // Dialog might not appear if transfer is handled differently (sheet/page navigation)
  356 |       if (await dialog.isVisible({ timeout: 5_000 }).catch(() => false)) {
  357 |         const combos = dialog.locator('[role="combobox"]');
  358 |         const comboCount = await combos.count();
  359 | 
  360 |         if (comboCount > 0) { await combos.nth(0).click(); await page.locator('[role="option"]').first().click(); }
  361 |         if (comboCount > 1) { await combos.nth(1).click(); await page.locator('[role="option"]').first().click(); }
  362 |         if (comboCount > 2) { await combos.nth(2).click(); await page.locator('[role="option"]').last().click(); }
  363 | 
  364 |         await dialog.locator('input[type="number"]').first().fill("5");
  365 |         await dialog.locator('button[type="submit"]').click();
  366 |         const toast = page.locator("[data-sonner-toast]").first();
  367 |         await expect(toast).toBeVisible({ timeout: 10_000 });
  368 |       }
  369 |     }
  370 |   });
  371 | });
  372 | 
```