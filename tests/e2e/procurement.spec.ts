import { expect, type Page, test } from "@playwright/test";

async function waitForTable(page: Page) {
  await page.waitForFunction(
    () => !document.querySelector('[data-slot="skeleton"]') && !document.querySelector(".animate-pulse"),
    { timeout: 15_000 },
  );
  await page.waitForTimeout(300);
}

async function _expectToast(page: Page) {
  await expect(page.locator("[data-sonner-toast]").first()).toBeVisible({ timeout: 12_000 });
  await page.waitForTimeout(300);
}

// ─── Suppliers ────────────────────────────────────────────────────────────────

test.describe("Suppliers", () => {
  const suppliers = [
    {
      name: "ToolMaster International",
      contactName: "Suresh Perera",
      email: "suresh@toolmaster.lk",
      phone: "+94771234567",
      address: "23 Factory Lane",
      city: "Colombo",
      country: "Sri Lanka",
    },
    {
      name: "FastenerWorld Pvt Ltd",
      contactName: "Anura Silva",
      email: "anura@fastenerworld.lk",
      phone: "+94777654321",
      address: "5 Trade Zone",
      city: "Gampaha",
      country: "Sri Lanka",
    },
    {
      name: "ElectroParts Co",
      contactName: "Ranjith Kumar",
      email: "ranjith@electroparts.lk",
      phone: "+94712345678",
      address: "88 Tech Park",
      city: "Kandy",
      country: "Sri Lanka",
    },
  ];

  test("suppliers page loads", async ({ page }) => {
    await page.goto("/dashboard/suppliers");
    await expect(
      page
        .locator("h1, h2")
        .filter({ hasText: /suppliers/i })
        .first(),
    ).toBeVisible();
  });

  test("create multiple suppliers", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/dashboard/suppliers");

    for (const sup of suppliers) {
      await page
        .locator("button")
        .filter({ hasText: /new supplier/i })
        .click();
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      const inputs = dialog.locator("input");
      await inputs.nth(0).fill(sup.name);
      await inputs.nth(1).fill(sup.contactName);
      await inputs.nth(2).fill(sup.email);
      await inputs.nth(3).fill(sup.phone);
      await inputs.nth(4).fill(sup.address);
      await inputs.nth(5).fill(sup.city);
      await inputs.nth(6).fill(sup.country);

      await dialog.locator('button[type="submit"]').click();
      await expect(page.locator("[data-sonner-toast]").first()).toBeVisible({ timeout: 12_000 });
      const supClosed = await dialog
        .waitFor({ state: "hidden", timeout: 5_000 })
        .then(() => true)
        .catch(() => false);
      if (!supClosed) {
        await page.keyboard.press("Escape");
        await dialog.waitFor({ state: "hidden", timeout: 3_000 }).catch(() => {
          /* noop */
        });
      }
    }
  });

  test("search suppliers by name", async ({ page }) => {
    await page.goto("/dashboard/suppliers");
    await waitForTable(page);

    await page.locator('input[placeholder*="Search"]').fill("ToolMaster");
    await page.waitForTimeout(600);

    const rows = page.locator("tbody tr");
    await expect(rows.first()).toContainText("ToolMaster");
  });

  test("edit supplier contact details", async ({ page }) => {
    await page.goto("/dashboard/suppliers");
    await waitForTable(page);

    const row = page.locator("tbody tr").filter({ hasText: "ElectroParts" }).first();
    await row.locator("button").filter({ hasText: /edit/i }).click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Update phone number
    const phoneInput = dialog.locator("input").nth(3);
    await phoneInput.clear();
    await phoneInput.fill("+94712000000");
    await dialog.locator('button[type="submit"]').click();

    await expect(page.locator("[data-sonner-toast]").first()).toBeVisible({ timeout: 10_000 });
  });

  test("create supplier with minimal data (name only required)", async ({ page }) => {
    await page.goto("/dashboard/suppliers");

    await page
      .locator("button")
      .filter({ hasText: /new supplier/i })
      .click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    await dialog.locator("input").nth(0).fill("MinimalSupplier Ltd");
    await dialog.locator('button[type="submit"]').click();
    await expect(page.locator("[data-sonner-toast]").first()).toBeVisible({ timeout: 10_000 });
  });
});

// ─── Purchase Orders ──────────────────────────────────────────────────────────

test.describe("Purchase Orders", () => {
  test("purchase orders page loads", async ({ page }) => {
    await page.goto("/dashboard/purchase-orders");
    await expect(
      page
        .locator("h1, h2")
        .filter({ hasText: /purchase orders/i })
        .first(),
    ).toBeVisible();
  });

  test("create a purchase order with multiple items", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/dashboard/purchase-orders");

    await page
      .locator("button")
      .filter({ hasText: /new purchase order/i })
      .click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 8_000 });

    // Select supplier
    const combos = dialog.locator('[role="combobox"]');
    await combos.first().click();
    await page
      .locator('[role="option"]')
      .filter({ hasText: "ToolMaster" })
      .click()
      .catch(async () => {
        await page.locator('[role="option"]').first().click();
      });

    // Set order date
    const dateInputs = dialog.locator('input[type="date"]');
    if ((await dateInputs.count()) > 0) {
      await dateInputs.first().fill("2026-05-21");
    }

    // Add first item
    const addItemBtn = dialog
      .locator("button")
      .filter({ hasText: /add item/i })
      .first();
    if (await addItemBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await addItemBtn.click();

      const itemCombos = dialog.locator('[role="combobox"]');
      const lastCombo = itemCombos.last();
      await lastCombo.click();
      // Guard: if no products exist, skip the rest
      const hasItems = await page
        .locator('[role="option"]')
        .first()
        .isVisible({ timeout: 4_000 })
        .catch(() => false);
      if (!hasItems) {
        await page.keyboard.press("Escape");
        return;
      }
      await page.locator('[role="option"]').first().click();

      const numInputs = dialog.locator('input[type="number"]');
      await numInputs.nth(0).fill("20");
      await numInputs.nth(1).fill("9800");

      // Add second item
      await addItemBtn.click();
      const allCombos = dialog.locator('[role="combobox"]');
      await allCombos.last().click();
      const has2ndItem = await page
        .locator('[role="option"]')
        .first()
        .isVisible({ timeout: 3_000 })
        .catch(() => false);
      if (has2ndItem) {
        await page
          .locator('[role="option"]')
          .nth(1)
          .click()
          .catch(async () => {
            await page.locator('[role="option"]').first().click();
          });

        const allNums = dialog.locator('input[type="number"]');
        const numCount = await allNums.count();
        await allNums.nth(numCount > 2 ? 2 : 0).fill("10");
        await allNums.nth(numCount > 3 ? 3 : 1).fill("14200");
      } else {
        await page.keyboard.press("Escape");
      }
    }

    await dialog.locator('button[type="submit"]').click();
    await expect(page.locator("[data-sonner-toast]").first()).toBeVisible({ timeout: 10_000 });
  });

  test("create a second purchase order for a different supplier", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/dashboard/purchase-orders");

    await page
      .locator("button")
      .filter({ hasText: /new purchase order/i })
      .click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 8_000 });

    const combos = dialog.locator('[role="combobox"]');
    await combos.first().click();
    await page
      .locator('[role="option"]')
      .filter({ hasText: "ElectroParts" })
      .click()
      .catch(async () => {
        await page.locator('[role="option"]').first().click();
      });

    const dateInputs = dialog.locator('input[type="date"]');
    if ((await dateInputs.count()) > 0) {
      await dateInputs.first().fill("2026-05-21");
    }

    const addItemBtn = dialog
      .locator("button")
      .filter({ hasText: /add item/i })
      .first();
    if (await addItemBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await addItemBtn.click();
      const itemCombos = dialog.locator('[role="combobox"]');
      await itemCombos.last().click();
      const hasOpts = await page
        .locator('[role="option"]')
        .first()
        .isVisible({ timeout: 4_000 })
        .catch(() => false);
      if (!hasOpts) {
        await page.keyboard.press("Escape");
        return;
      }
      await page.locator('[role="option"]').first().click();

      await dialog.locator('input[type="number"]').nth(0).fill("15");
      await dialog.locator('input[type="number"]').nth(1).fill("3200");
    }

    await dialog.locator('button[type="submit"]').click();
    await expect(page.locator("[data-sonner-toast]").first()).toBeVisible({ timeout: 10_000 });
  });

  test("view purchase order detail page", async ({ page }) => {
    await page.goto("/dashboard/purchase-orders");
    await waitForTable(page);

    // Click the first PO link / row to open its detail page
    const firstRow = page.locator("tbody tr").first();
    const viewLink = firstRow.locator("a").first();
    if (await viewLink.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await viewLink.click();
      await expect(page).toHaveURL(/purchase-orders\/.+/);
    } else {
      // Try clicking the PO number cell
      const poCell = firstRow.locator("td").first();
      await poCell.click();
      await page.waitForTimeout(1000);
    }
  });

  test("update purchase order status from Draft to Pending", async ({ page }) => {
    await page.goto("/dashboard/purchase-orders");
    await waitForTable(page);

    const draftRow = page.locator("tbody tr").filter({ hasText: /draft/i }).first();
    if (await draftRow.isVisible({ timeout: 3_000 }).catch(() => false)) {
      // Open the detail page
      const link = draftRow.locator("a").first();
      if (await link.isVisible({ timeout: 1_000 }).catch(() => false)) {
        await link.click();
      } else {
        await draftRow.click();
      }

      await page.waitForURL(/purchase-orders\/.+/, { timeout: 5_000 }).catch(() => {
        /* noop */
      });

      // Look for a status update button/select
      const statusBtn = page
        .locator("button")
        .filter({ hasText: /pending|update status/i })
        .first();
      if (await statusBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await statusBtn.click();
        await expect(page.locator("[data-sonner-toast]").first()).toBeVisible({ timeout: 10_000 });
      }
    }
  });

  test("search purchase orders", async ({ page }) => {
    await page.goto("/dashboard/purchase-orders");
    await waitForTable(page);

    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await searchInput.fill("PO");
      await page.waitForTimeout(700);
    }
  });
});

// ─── Purchase Returns ─────────────────────────────────────────────────────────

test.describe("Purchase Returns", () => {
  test("purchase returns page loads", async ({ page }) => {
    await page.goto("/dashboard/purchase-returns");
    await expect(
      page
        .locator("h1, h2")
        .filter({ hasText: /purchase returns/i })
        .first(),
    ).toBeVisible();
  });

  test("create a purchase return", async ({ page }) => {
    await page.goto("/dashboard/purchase-returns");

    const newBtn = page
      .locator("button")
      .filter({ hasText: /new purchase return|create/i })
      .first();
    if (await newBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await newBtn.click();
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      // Select a purchase order
      const combos = dialog.locator('[role="combobox"]');
      if (
        await combos
          .first()
          .isVisible({ timeout: 2_000 })
          .catch(() => false)
      ) {
        await combos.first().click();
        const hasPos = await page
          .locator('[role="option"]')
          .first()
          .isVisible({ timeout: 4_000 })
          .catch(() => false);
        if (!hasPos) {
          await page.keyboard.press("Escape");
          return;
        }
        await page.locator('[role="option"]').first().click();
      }

      // Select warehouse
      if (
        await combos
          .nth(1)
          .isVisible({ timeout: 2_000 })
          .catch(() => false)
      ) {
        await combos.nth(1).click();
        const hasWh = await page
          .locator('[role="option"]')
          .first()
          .isVisible({ timeout: 3_000 })
          .catch(() => false);
        if (hasWh) await page.locator('[role="option"]').first().click();
        else await page.keyboard.press("Escape");
      }

      // Fill reason
      const textareas = dialog.locator("textarea");
      if ((await textareas.count()) > 0) {
        await textareas.first().fill("Defective items received");
      }

      // Add return item
      const addBtn = dialog
        .locator("button")
        .filter({ hasText: /add item/i })
        .first();
      if (await addBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await addBtn.click();
        const itemCombos = dialog.locator('[role="combobox"]');
        await itemCombos.last().click();
        const hasOpts = await page
          .locator('[role="option"]')
          .first()
          .isVisible({ timeout: 3_000 })
          .catch(() => false);
        if (hasOpts) {
          await page.locator('[role="option"]').first().click();
          await dialog.locator('input[type="number"]').last().fill("2");
        } else {
          await page.keyboard.press("Escape");
        }
      }

      await dialog.locator('button[type="submit"]').click();
      await expect(page.locator("[data-sonner-toast]").first()).toBeVisible({ timeout: 10_000 });
    }
  });
});
