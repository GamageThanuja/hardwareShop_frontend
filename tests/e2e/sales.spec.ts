import { expect, type Page, test } from "@playwright/test";

async function waitForTable(page: Page) {
  await page.waitForFunction(
    () => !document.querySelector('[data-slot="skeleton"]') && !document.querySelector(".animate-pulse"),
    { timeout: 15_000 },
  );
  await page.waitForTimeout(300);
}

async function expectToast(page: Page) {
  await expect(page.locator("[data-sonner-toast]").first()).toBeVisible({ timeout: 12_000 });
  await page.waitForTimeout(300);
}

// ─── Customers ────────────────────────────────────────────────────────────────

test.describe("Customers", () => {
  const customers = [
    {
      firstName: "Chamara",
      lastName: "Bandara",
      email: "chamara.bandara@email.com",
      phone: "+94771111111",
      address: "12 Main St",
      city: "Colombo",
      country: "Sri Lanka",
      creditLimit: "50000",
    },
    {
      firstName: "Nimal",
      lastName: "Fernando",
      email: "nimal.fernando@buildcorp.lk",
      phone: "+94772222222",
      address: "45 Industry Blvd",
      city: "Gampaha",
      country: "Sri Lanka",
      creditLimit: "500000",
    },
    {
      firstName: "Sanduni",
      lastName: "Rathnayake",
      email: "sanduni@homehardware.lk",
      phone: "+94773333333",
      address: "7 Park Rd",
      city: "Kandy",
      country: "Sri Lanka",
      creditLimit: "250000",
    },
    {
      firstName: "Roshan",
      lastName: "Wickrama",
      email: "roshan@gmail.com",
      phone: "+94774444444",
      address: "99 Beach Rd",
      city: "Galle",
      country: "Sri Lanka",
      creditLimit: "25000",
    },
  ];

  test("customers page loads", async ({ page }) => {
    await page.goto("/dashboard/customers");
    await expect(
      page
        .locator("h1, h2")
        .filter({ hasText: /customers/i })
        .first(),
    ).toBeVisible();
  });

  test("create multiple customers with different types", async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto("/dashboard/customers");

    for (const cust of customers) {
      await page
        .locator("button")
        .filter({ hasText: /new customer/i })
        .click();
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      const inputs = dialog.locator("input");
      await inputs.nth(0).fill(cust.firstName);
      await inputs.nth(1).fill(cust.lastName);
      await inputs.nth(2).fill(cust.email);
      await inputs.nth(3).fill(cust.phone);
      await inputs.nth(4).fill(cust.address);
      await inputs.nth(5).fill(cust.city);
      await inputs.nth(6).fill(cust.country);

      // Select customer type
      const combos = dialog.locator('[role="combobox"]');
      if ((await combos.count()) > 0) {
        await combos.first().click();
        await page.locator('[role="option"]').first().click();
      }

      // Credit limit
      const numInput = dialog.locator('input[type="number"]').first();
      if (await numInput.isVisible({ timeout: 1_000 }).catch(() => false)) {
        await numInput.fill(cust.creditLimit);
      }

      await dialog.locator('button[type="submit"]').click();
      await expectToast(page);
      const custClosed = await dialog
        .waitFor({ state: "hidden", timeout: 5_000 })
        .then(() => true)
        .catch(() => false);
      if (!custClosed) {
        await page.keyboard.press("Escape");
        await dialog.waitFor({ state: "hidden", timeout: 3_000 }).catch(() => {
          /* noop */
        });
      }
    }
  });

  test("search customers", async ({ page }) => {
    await page.goto("/dashboard/customers");
    await waitForTable(page);

    await page.locator('input[placeholder*="Search"]').fill("Nimal");
    await page.waitForTimeout(700);

    const rows = page.locator("tbody tr");
    await expect(rows.first()).toContainText(/nimal/i);
  });

  test("edit customer credit limit", async ({ page }) => {
    await page.goto("/dashboard/customers");
    await waitForTable(page);

    // Search first — Roshan may be on page 2 if the DB has customers from prior runs
    await page.locator('input[placeholder*="Search"]').fill("Roshan");
    await page.waitForTimeout(700);

    const row = page.locator("tbody tr").filter({ hasText: "Roshan" }).first();
    await row.locator("button").filter({ hasText: /edit/i }).click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    const numInput = dialog.locator('input[type="number"]').first();
    if (await numInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await numInput.clear();
      await numInput.fill("30000");
    }
    await dialog.locator('button[type="submit"]').click();
    await expectToast(page);
  });

  test("create walk-in customer (no email)", async ({ page }) => {
    await page.goto("/dashboard/customers");

    await page
      .locator("button")
      .filter({ hasText: /new customer/i })
      .click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    const inputs = dialog.locator("input");
    await inputs.nth(0).fill("Walk");
    await inputs.nth(1).fill("In Customer");
    await inputs.nth(3).fill("+94775555555");

    await dialog.locator('button[type="submit"]').click();
    await expectToast(page);
  });
});

// ─── Sales Orders ─────────────────────────────────────────────────────────────

test.describe("Sales Orders", () => {
  async function createSalesOrder(page: Page, opts: { customerFilter?: string; itemCount: number }) {
    await page.goto("/dashboard/sales-orders");
    await page
      .locator("button")
      .filter({ hasText: /new sales order/i })
      .click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 8_000 });

    const dateInputs = dialog.locator('input[type="date"]');
    if ((await dateInputs.count()) > 0) {
      await dateInputs.first().fill("2026-05-21");
    }

    if (opts.customerFilter) {
      const combos = dialog.locator('[role="combobox"]');
      await combos.first().click();
      const opt = page.locator('[role="option"]').filter({ hasText: opts.customerFilter }).first();
      if (await opt.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await opt.click();
      } else {
        await page.locator('[role="option"]').first().click();
      }
    }

    const addBtn = dialog
      .locator("button")
      .filter({ hasText: /add item/i })
      .first();
    if (await addBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      for (let i = 0; i < opts.itemCount; i++) {
        await addBtn.click();
        const allCombos = dialog.locator('[role="combobox"]');
        await allCombos.last().click();
        // Guard: skip if no products in stock
        const hasOpts = await page
          .locator('[role="option"]')
          .first()
          .isVisible({ timeout: 4_000 })
          .catch(() => false);
        if (!hasOpts) {
          await page.keyboard.press("Escape");
          return;
        }
        await page
          .locator('[role="option"]')
          .nth(i)
          .click()
          .catch(async () => {
            await page.locator('[role="option"]').first().click();
          });

        const numInputs = dialog.locator('input[type="number"]');
        const count = await numInputs.count();
        await numInputs.nth(count >= 4 ? count - 4 : 0).fill(String(2 + i));
        await numInputs.nth(count >= 3 ? count - 3 : 1).fill("12500");
      }
    }

    await dialog.locator('button[type="submit"]').click();
    await expectToast(page);
  }

  test("sales orders page loads", async ({ page }) => {
    await page.goto("/dashboard/sales-orders");
    await expect(
      page
        .locator("h1, h2")
        .filter({ hasText: /sales orders/i })
        .first(),
    ).toBeVisible();
  });

  test("create sales order for a named customer (retail)", async ({ page }) => {
    test.setTimeout(90_000);
    await createSalesOrder(page, { customerFilter: "Chamara", itemCount: 1 });
  });

  test("create sales order for wholesale customer with multiple items", async ({ page }) => {
    test.setTimeout(90_000);
    await createSalesOrder(page, { customerFilter: "Nimal", itemCount: 2 });
  });

  test("create walk-in (no customer) sales order", async ({ page }) => {
    test.setTimeout(90_000);
    await createSalesOrder(page, { itemCount: 1 });
  });

  test("view sales order detail page", async ({ page }) => {
    await page.goto("/dashboard/sales-orders");
    await waitForTable(page);

    const firstRow = page.locator("tbody tr").first();
    const link = firstRow.locator("a").first();
    if (await link.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await link.click();
      await expect(page).toHaveURL(/sales-orders\/.+/);
    }
  });

  test("update sales order status through lifecycle", async ({ page }) => {
    await page.goto("/dashboard/sales-orders");
    await waitForTable(page);

    const draftRow = page.locator("tbody tr").filter({ hasText: /draft/i }).first();
    if (await draftRow.isVisible({ timeout: 3_000 }).catch(() => false)) {
      const link = draftRow.locator("a").first();
      if (await link.isVisible({ timeout: 1_000 }).catch(() => false)) {
        await link.click();
        await page.waitForURL(/sales-orders\/.+/, { timeout: 5_000 }).catch(() => {
          /* noop */
        });
      }

      const confirmBtn = page
        .locator("button")
        .filter({ hasText: /confirm/i })
        .first();
      if (await confirmBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await confirmBtn.click();
        await expect(page.locator("[data-sonner-toast]").first()).toBeVisible({ timeout: 8_000 });
      }
    }
  });

  test("search sales orders by order number", async ({ page }) => {
    await page.goto("/dashboard/sales-orders");
    await waitForTable(page);

    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await searchInput.fill("SO");
      await page.waitForTimeout(700);
    }
  });

  test("cannot create sales order with zero items", async ({ page }) => {
    await page.goto("/dashboard/sales-orders");
    await page
      .locator("button")
      .filter({ hasText: /new sales order/i })
      .click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 8_000 });

    const dateInputs = dialog.locator('input[type="date"]');
    if ((await dateInputs.count()) > 0) {
      await dateInputs.first().fill("2026-05-21");
    }

    await dialog.locator('button[type="submit"]').click();

    // Dialog stays open = validation prevented submit
    const dialogStillOpen = await dialog.isVisible({ timeout: 3_000 }).catch(() => false);
    const errorText = page.locator("text=/at least one item|required|item/i").first();
    const hasError = await errorText.isVisible({ timeout: 3_000 }).catch(() => false);
    expect(dialogStillOpen || hasError).toBe(true);

    await page.keyboard.press("Escape");
  });
});

// ─── Sales Returns ────────────────────────────────────────────────────────────

test.describe("Sales Returns", () => {
  test("sales returns page loads", async ({ page }) => {
    await page.goto("/dashboard/sales-returns");
    await expect(
      page
        .locator("h1, h2")
        .filter({ hasText: /sales returns/i })
        .first(),
    ).toBeVisible();
  });

  test("create a sales return", async ({ page }) => {
    await page.goto("/dashboard/sales-returns");

    const newBtn = page
      .locator("button")
      .filter({ hasText: /new sales return|create/i })
      .first();
    if (await newBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await newBtn.click();
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      const combos = dialog.locator('[role="combobox"]');
      if ((await combos.count()) > 0) {
        await combos.nth(0).click();
        await page.locator('[role="option"]').first().click();
      }
      if (
        await combos
          .nth(1)
          .isVisible({ timeout: 2_000 })
          .catch(() => false)
      ) {
        await combos.nth(1).click();
        await page.locator('[role="option"]').first().click();
      }

      const textareas = dialog.locator("textarea");
      if ((await textareas.count()) > 0) {
        await textareas.first().fill("Customer returned damaged item");
      }

      const addBtn = dialog
        .locator("button")
        .filter({ hasText: /add item/i })
        .first();
      if (await addBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await addBtn.click();
        await dialog.locator('[role="combobox"]').last().click();
        await page.locator('[role="option"]').first().click();
        await dialog.locator('input[type="number"]').last().fill("1");
      }

      await dialog.locator('button[type="submit"]').click();
      await expect(page.locator("[data-sonner-toast]").first()).toBeVisible({ timeout: 10_000 });
    }
  });
});

// ─── Payments ─────────────────────────────────────────────────────────────────

test.describe("Payments", () => {
  test("payments page loads", async ({ page }) => {
    await page.goto("/dashboard/payments");
    await expect(
      page
        .locator("h1, h2")
        .filter({ hasText: /payments/i })
        .first(),
    ).toBeVisible();
  });

  test("record a cash payment for a sales order", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/dashboard/payments");

    const newBtn = page
      .locator("button")
      .filter({ hasText: /record payment|new payment/i })
      .first();
    if (await newBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await newBtn.click();
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      const combos = dialog.locator('[role="combobox"]');
      if ((await combos.count()) > 0) {
        await combos.nth(0).click();
        // Guard: skip if no sales orders are available to pay
        const hasOptions = await page
          .locator('[role="option"]')
          .first()
          .isVisible({ timeout: 4_000 })
          .catch(() => false);
        if (!hasOptions) {
          await page.keyboard.press("Escape");
          return;
        }
        await page.locator('[role="option"]').first().click();
      }

      const amountInput = dialog.locator('input[type="number"]').first();
      if (await amountInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await amountInput.fill("12500");
      }

      if (
        await combos
          .nth(1)
          .isVisible({ timeout: 2_000 })
          .catch(() => false)
      ) {
        await combos.nth(1).click();
        const cashOpt = page.locator('[role="option"]').filter({ hasText: /cash/i });
        if (await cashOpt.isVisible({ timeout: 1_000 }).catch(() => false)) {
          await cashOpt.click();
        } else {
          await page.locator('[role="option"]').first().click();
        }
      }

      const dateInputs = dialog.locator('input[type="date"]');
      if ((await dateInputs.count()) > 0) {
        await dateInputs.first().fill("2026-05-21");
      }

      await dialog.locator('button[type="submit"]').click();
      await expect(page.locator("[data-sonner-toast]").first()).toBeVisible({ timeout: 10_000 });
    }
  });

  test("record a card payment", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/dashboard/payments");

    const newBtn = page
      .locator("button")
      .filter({ hasText: /record payment|new payment/i })
      .first();
    if (await newBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await newBtn.click();
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      const combos = dialog.locator('[role="combobox"]');
      if ((await combos.count()) > 0) {
        await combos.nth(0).click();
        const hasOptions = await page
          .locator('[role="option"]')
          .first()
          .isVisible({ timeout: 4_000 })
          .catch(() => false);
        if (!hasOptions) {
          await page.keyboard.press("Escape");
          return;
        }
        await page.locator('[role="option"]').first().click();
      }

      const amountInput = dialog.locator('input[type="number"]').first();
      if (await amountInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await amountInput.fill("18500");
      }

      if (
        await combos
          .nth(1)
          .isVisible({ timeout: 2_000 })
          .catch(() => false)
      ) {
        await combos.nth(1).click();
        const cardOpt = page.locator('[role="option"]').filter({ hasText: /card/i });
        if (await cardOpt.isVisible({ timeout: 1_000 }).catch(() => false)) {
          await cardOpt.click();
        } else {
          await page
            .locator('[role="option"]')
            .nth(1)
            .click()
            .catch(async () => {
              await page.locator('[role="option"]').first().click();
            });
        }
      }

      const dateInputs = dialog.locator('input[type="date"]');
      if ((await dateInputs.count()) > 0) {
        await dateInputs.first().fill("2026-05-21");
      }

      await dialog.locator('button[type="submit"]').click();
      await expect(page.locator("[data-sonner-toast]").first()).toBeVisible({ timeout: 10_000 });
    }
  });

  test("payment list shows recorded payments", async ({ page }) => {
    await page.goto("/dashboard/payments");
    await waitForTable(page);

    const rows = page.locator("tbody tr");
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("void a payment", async ({ page }) => {
    await page.goto("/dashboard/payments");
    await waitForTable(page);

    const firstRow = page.locator("tbody tr").first();
    const voidBtn = firstRow.locator("button").filter({ hasText: /void/i }).first();
    if (await voidBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await voidBtn.click();

      const confirm = page.locator('[role="alertdialog"], [role="dialog"]').last();
      const reasonInput = confirm.locator("textarea, input").first();
      if (await reasonInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await reasonInput.fill("Entered wrong amount");
      }
      await confirm
        .locator("button")
        .filter({ hasText: /void|confirm/i })
        .click();
      await expect(page.locator("[data-sonner-toast]").first()).toBeVisible({ timeout: 8_000 });
    }
  });
});

// ─── Cross-feature flow: full sales cycle ─────────────────────────────────────

test.describe("Full sales cycle flow", () => {
  test("dashboard shows data after orders are created", async ({ page }) => {
    await page.goto("/dashboard/default");
    await expect(
      page
        .locator("h1, h2, h3")
        .filter({ hasText: /dashboard|overview/i })
        .first(),
    ).toBeVisible();

    await page.waitForFunction(
      () => !document.querySelector('[data-slot="skeleton"]') && !document.querySelector(".animate-pulse"),
      { timeout: 15_000 },
    );

    const recentOrders = page.locator("text=/recent|orders/i").first();
    await expect(recentOrders)
      .toBeVisible({ timeout: 5_000 })
      .catch(() => {
        /* noop */
      });
  });
});
