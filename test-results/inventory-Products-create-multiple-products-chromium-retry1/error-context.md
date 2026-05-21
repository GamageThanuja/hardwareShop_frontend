# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: inventory.spec.ts >> Products >> create multiple products
- Location: tests/e2e/inventory.spec.ts:188:2

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-sonner-toast]').first()
Expected: visible
Timeout: 12000ms
Error: element(s) not found

Call log:
  - Expect "to.be.visible" with timeout 12000ms
  - waiting for locator('[data-sonner-toast]').first()

```

```yaml
- region "Notifications alt+T"
- dialog "New Product":
  - heading "New Product" [level=2]
  - group:
    - text: SKU
    - textbox "HW-001": PWR-DRL-001
  - group:
    - text: Barcode
    - textbox "Optional": Cordless Drill 18V
  - group:
    - text: Name
    - textbox "Product name"
    - alert: Name is required
  - group:
    - text: Description
    - textbox "Optional description"
  - group:
    - text: Category
    - combobox: Drills
  - group:
    - text: Supplier
    - combobox: Select supplier
  - group:
    - text: Unit Price
    - spinbutton: "12500"
  - group:
    - text: Cost Price
    - spinbutton: "9800"
  - group:
    - text: Unit
    - combobox: Piece
  - group:
    - text: Reorder Level
    - spinbutton: "5"
  - group:
    - text: Reorder Quantity
    - spinbutton: "20"
  - button "Cancel"
  - button "Create"
  - button "Close"
```

# Test source

```ts
  1   | import { test, expect, type Page } from "@playwright/test";
  2   | 
  3   | // ─── Helpers ─────────────────────────────────────────────────────────────────
  4   | 
  5   | async function waitForTable(page: Page) {
  6   |   await page.waitForFunction(
  7   |     () => !document.querySelector('[data-slot="skeleton"]') && !document.querySelector(".animate-pulse"),
  8   |     { timeout: 15_000 },
  9   |   );
  10  |   await page.waitForTimeout(400);
  11  | }
  12  | 
  13  | async function expectToast(page: Page, pattern: RegExp) {
  14  |   // .first() avoids strict-mode violation when multiple toasts stack
> 15  |   await expect(page.locator("[data-sonner-toast]").first()).toBeVisible({ timeout: 12_000 });
      |                                                            ^ Error: expect(locator).toBeVisible() failed
  16  | }
  17  | 
  18  | // ─── Categories ───────────────────────────────────────────────────────────────
  19  | 
  20  | test.describe("Categories", () => {
  21  |   const cats = [
  22  |     { name: "Power Tools", description: "Electric and battery powered tools" },
  23  |     { name: "Hand Tools", description: "Non-powered manual tools" },
  24  |     { name: "Fasteners", description: "Bolts, screws, nails and anchors" },
  25  |     { name: "Plumbing", description: "Pipes, fittings and plumbing supplies" },
  26  |     { name: "Electrical", description: "Wiring and electrical components" },
  27  |   ];
  28  | 
  29  |   test("page loads and shows Categories heading", async ({ page }) => {
  30  |     await page.goto("/dashboard/categories");
  31  |     await expect(page.locator("h1, h2").filter({ hasText: /categories/i }).first()).toBeVisible();
  32  |   });
  33  | 
  34  |   test("create multiple top-level categories", async ({ page }) => {
  35  |     test.setTimeout(120_000);
  36  |     await page.goto("/dashboard/categories");
  37  | 
  38  |     for (const cat of cats) {
  39  |       await page.locator("button").filter({ hasText: /new category/i }).click();
  40  |       const dialog = page.locator('[role="dialog"]');
  41  |       await expect(dialog).toBeVisible();
  42  | 
  43  |       await dialog.locator('input[placeholder="Category name"]').fill(cat.name);
  44  |       await dialog.locator('input[placeholder="Optional"]').fill(cat.description);
  45  |       await dialog.locator('button[type="submit"]').click();
  46  | 
  47  |       await expectToast(page, /created/i);
  48  |       // Wait for dialog to close; on error (e.g. duplicate), dismiss it manually
  49  |       const closed = await dialog.waitFor({ state: "hidden", timeout: 5_000 }).then(() => true).catch(() => false);
  50  |       if (!closed) {
  51  |         await page.keyboard.press("Escape");
  52  |         await dialog.waitFor({ state: "hidden", timeout: 3_000 }).catch(() => {});
  53  |       }
  54  |     }
  55  |   });
  56  | 
  57  |   test("create a subcategory under Power Tools", async ({ page }) => {
  58  |     await page.goto("/dashboard/categories");
  59  |     await waitForTable(page);
  60  | 
  61  |     await page.locator("button").filter({ hasText: /new category/i }).click();
  62  |     const dialog = page.locator('[role="dialog"]');
  63  |     await expect(dialog).toBeVisible();
  64  | 
  65  |     await dialog.locator('input[placeholder="Category name"]').fill("Drills");
  66  |     await dialog.locator('input[placeholder="Optional"]').fill("Corded and cordless drills");
  67  | 
  68  |     await dialog.locator('[role="combobox"]').first().click();
  69  |     await page.locator('[role="option"]').filter({ hasText: "Power Tools" }).click();
  70  | 
  71  |     await dialog.locator('button[type="submit"]').click();
  72  |     await expectToast(page, /created/i);
  73  |   });
  74  | 
  75  |   test("search narrows the category list", async ({ page }) => {
  76  |     await page.goto("/dashboard/categories");
  77  |     await waitForTable(page);
  78  | 
  79  |     await page.locator('input[placeholder*="Search"]').fill("Power");
  80  |     await page.waitForTimeout(700);
  81  | 
  82  |     const rows = page.locator("tbody tr");
  83  |     await expect(rows.first()).toContainText("Power");
  84  |   });
  85  | 
  86  |   test("edit a category name and description", async ({ page }) => {
  87  |     await page.goto("/dashboard/categories");
  88  |     await waitForTable(page);
  89  | 
  90  |     const row = page.locator("tbody tr").filter({ hasText: "Fasteners" }).first();
  91  |     await row.locator("button").filter({ hasText: /edit/i }).click();
  92  | 
  93  |     const dialog = page.locator('[role="dialog"]');
  94  |     await expect(dialog).toBeVisible();
  95  | 
  96  |     const nameInput = dialog.locator('input[placeholder="Category name"]');
  97  |     await nameInput.clear();
  98  |     await nameInput.fill("Fasteners & Fixings");
  99  |     await dialog.locator('button[type="submit"]').click();
  100 |     await expectToast(page, /updated/i);
  101 |   });
  102 | 
  103 |   test("delete a category", async ({ page }) => {
  104 |     await page.goto("/dashboard/categories");
  105 |     await waitForTable(page);
  106 | 
  107 |     const row = page.locator("tbody tr").filter({ hasText: "Fasteners & Fixings" }).first();
  108 |     await row.locator("button").filter({ hasText: /delete/i }).click();
  109 | 
  110 |     const confirm = page.locator('[role="alertdialog"], [role="dialog"]').last();
  111 |     await confirm.locator("button").filter({ hasText: /delete/i }).click();
  112 |     await expectToast(page, /deleted/i);
  113 |   });
  114 | });
  115 | 
```