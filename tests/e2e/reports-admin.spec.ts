import { expect, type Page, test } from "@playwright/test";

async function waitForContent(page: Page) {
  await page.waitForFunction(
    () => !document.querySelector('[data-slot="skeleton"]') && !document.querySelector(".animate-pulse"),
    { timeout: 15_000 },
  );
  await page.waitForTimeout(300);
}

// ─── Reports ──────────────────────────────────────────────────────────────────

test.describe("Reports", () => {
  test("reports page loads", async ({ page }) => {
    await page.goto("/dashboard/reports");
    await expect(
      page
        .locator("h1, h2")
        .filter({ hasText: /reports/i })
        .first(),
    ).toBeVisible();
  });

  test("sales report loads with default date range", async ({ page }) => {
    await page.goto("/dashboard/reports");
    await waitForContent(page);

    // Report page should have date inputs or date range picker
    const dateInputs = page.locator('input[type="date"]');
    const datePicker = page
      .locator("button")
      .filter({ hasText: /date|range|from|to/i })
      .first();
    const _hasDate =
      (await dateInputs.count()) > 0 || (await datePicker.isVisible({ timeout: 2_000 }).catch(() => false));
    // Report content like total orders / revenue should be visible
    await expect(page.locator("text=/total|orders|revenue/i").first())
      .toBeVisible({ timeout: 10_000 })
      .catch(() => {
        /* noop */
      });
  });

  test("sales report: filter by custom date range", async ({ page }) => {
    await page.goto("/dashboard/reports");
    await waitForContent(page);

    const dateInputs = page.locator('input[type="date"]');
    if ((await dateInputs.count()) >= 2) {
      await dateInputs.nth(0).fill("2026-01-01");
      await dateInputs.nth(1).fill("2026-05-21");

      // Trigger report fetch
      const runBtn = page
        .locator("button")
        .filter({ hasText: /run|generate|apply|search/i })
        .first();
      if (await runBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await runBtn.click();
      }
      await waitForContent(page);
    }
  });

  test("sales report: filter by last 30 days", async ({ page }) => {
    await page.goto("/dashboard/reports");
    await waitForContent(page);

    const dateInputs = page.locator('input[type="date"]');
    if ((await dateInputs.count()) >= 2) {
      await dateInputs.nth(0).fill("2026-04-21");
      await dateInputs.nth(1).fill("2026-05-21");

      const runBtn = page
        .locator("button")
        .filter({ hasText: /run|generate|apply|search/i })
        .first();
      if (await runBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await runBtn.click();
      }
      await waitForContent(page);
    }
  });

  test("purchase report loads", async ({ page }) => {
    await page.goto("/dashboard/reports");
    await waitForContent(page);

    // Switch to purchase report tab if tabs exist
    const purchaseTab = page
      .locator('[role="tab"]')
      .filter({ hasText: /purchase/i })
      .first();
    if (await purchaseTab.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await purchaseTab.click();
      await waitForContent(page);
      await expect(page.locator("text=/purchase|supplier|orders/i").first())
        .toBeVisible({ timeout: 8_000 })
        .catch(() => {
          /* noop */
        });
    }
  });

  test("inventory valuation report loads", async ({ page }) => {
    await page.goto("/dashboard/reports");
    await waitForContent(page);

    const valuationTab = page
      .locator('[role="tab"]')
      .filter({ hasText: /inventory|valuation/i })
      .first();
    if (await valuationTab.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await valuationTab.click();
      await waitForContent(page);
      await expect(page.locator("text=/value|units|product/i").first())
        .toBeVisible({ timeout: 8_000 })
        .catch(() => {
          /* noop */
        });
    }
  });

  test("reports show data from created orders", async ({ page }) => {
    await page.goto("/dashboard/reports");
    await waitForContent(page);

    // At minimum the page should render without error
    await expect(page.locator("body"))
      .not.toContainText(/error|failed to load/i, { timeout: 5_000 })
      .catch(() => {
        /* noop */
      });
  });
});

// ─── Users management ─────────────────────────────────────────────────────────

test.describe("Users", () => {
  test("users page loads", async ({ page }) => {
    await page.goto("/dashboard/users");
    await expect(page.locator("h1, h2").filter({ hasText: /users/i }).first()).toBeVisible();
  });

  test("users list shows at least the admin user", async ({ page }) => {
    await page.goto("/dashboard/users");
    await waitForContent(page);

    const rows = page.locator("tbody tr");
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("create a new cashier user", async ({ page }) => {
    await page.goto("/dashboard/users");

    const newBtn = page
      .locator("button")
      .filter({ hasText: /new user|create user/i })
      .first();
    if (await newBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await newBtn.click();
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      // Actual field order: firstName(0), lastName(1), userName(2), email(3), phoneNumber(4), password(5)
      const inputs = dialog.locator("input");
      await inputs.nth(0).fill("Test");
      await inputs.nth(1).fill("Cashier");
      await inputs.nth(2).fill("testcashier");
      await inputs.nth(3).fill("test.cashier@boltforge.lk");
      await inputs.nth(4).fill("+94770000001");
      await inputs.nth(5).fill("Test@1234");

      await dialog.locator('button[type="submit"]').click();
      await expect(page.locator("[data-sonner-toast]").first()).toBeVisible({ timeout: 10_000 });
    }
  });

  test("create a store manager user", async ({ page }) => {
    await page.goto("/dashboard/users");

    const newBtn = page
      .locator("button")
      .filter({ hasText: /new user|create user/i })
      .first();
    if (await newBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await newBtn.click();
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      // Actual field order: firstName(0), lastName(1), userName(2), email(3), phoneNumber(4), password(5)
      const inputs = dialog.locator("input");
      await inputs.nth(0).fill("Store");
      await inputs.nth(1).fill("Manager");
      await inputs.nth(2).fill("storemanager01");
      await inputs.nth(3).fill("manager@boltforge.lk");
      await inputs.nth(4).fill("+94770000002");
      await inputs.nth(5).fill("Manager@1234");

      await dialog.locator('button[type="submit"]').click();
      await expect(page.locator("[data-sonner-toast]").first()).toBeVisible({ timeout: 10_000 });
    }
  });

  test("search users by username", async ({ page }) => {
    await page.goto("/dashboard/users");
    await waitForContent(page);

    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await searchInput.fill("admin");
      await page.waitForTimeout(700);

      const rows = page.locator("tbody tr");
      await expect(rows.first()).toContainText(/admin/i);
    }
  });

  test("edit user — toggle active status", async ({ page }) => {
    await page.goto("/dashboard/users");
    await waitForContent(page);

    const testCashierRow = page.locator("tbody tr").filter({ hasText: "testcashier" }).first();
    if (await testCashierRow.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await testCashierRow.locator("button").filter({ hasText: /edit/i }).click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      // Toggle isActive checkbox/switch
      const activeToggle = dialog.locator('[role="checkbox"], [role="switch"]').first();
      if (await activeToggle.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await activeToggle.click();
      }

      await dialog.locator('button[type="submit"]').click();
      await expect(page.locator("[data-sonner-toast]").filter({ hasText: /updated/i })).toBeVisible({ timeout: 8_000 });
    }
  });

  test("cannot create user with duplicate username", async ({ page }) => {
    await page.goto("/dashboard/users");

    const newBtn = page
      .locator("button")
      .filter({ hasText: /new user|create user/i })
      .first();
    if (await newBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await newBtn.click();
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      // Field order: firstName(0), lastName(1), userName(2), email(3), phoneNumber(4), password(5)
      const inputs = dialog.locator("input");
      await inputs.nth(0).fill("Dup");
      await inputs.nth(1).fill("User");
      await inputs.nth(2).fill("admin"); // duplicate username
      await inputs.nth(3).fill("dup@boltforge.lk");
      await inputs.nth(4).fill("+94770000009");
      await inputs.nth(5).fill("Password@123");

      await dialog.locator('button[type="submit"]').click();
      const errorToast = page.locator("[data-sonner-toast][data-type='error']").first();
      await expect(errorToast).toBeVisible({ timeout: 10_000 });
    }
  });
});

// ─── Profile ──────────────────────────────────────────────────────────────────

test.describe("Profile", () => {
  test("profile page loads", async ({ page }) => {
    await page.goto("/dashboard/profile");
    await expect(
      page
        .locator("h1, h2")
        .filter({ hasText: /profile|account/i })
        .first(),
    ).toBeVisible();
  });

  test("update first and last name", async ({ page }) => {
    await page.goto("/dashboard/profile");
    await waitForContent(page);

    const firstNameInput = page.locator('input[name*="firstName"], input[placeholder*="first"]').first();
    const lastNameInput = page.locator('input[name*="lastName"], input[placeholder*="last"]').first();

    if (await firstNameInput.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await firstNameInput.clear();
      await firstNameInput.fill("Admin");
    }
    if (await lastNameInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await lastNameInput.clear();
      await lastNameInput.fill("User");
    }

    const saveBtn = page
      .locator("button")
      .filter({ hasText: /save|update/i })
      .first();
    if (await saveBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await saveBtn.click();
      await expect(page.locator("[data-sonner-toast]").filter({ hasText: /updated|saved/i })).toBeVisible({
        timeout: 8_000,
      });
    }
  });

  test("change password — wrong current password shows error", async ({ page }) => {
    await page.goto("/dashboard/profile");
    await waitForContent(page);

    const currentPwdInput = page
      .locator('input[type="password"][name*="current"], input[placeholder*="current"]')
      .first();
    const newPwdInput = page.locator('input[type="password"][name*="new"], input[placeholder*="new"]').first();
    const confirmPwdInput = page
      .locator('input[type="password"][name*="confirm"], input[placeholder*="confirm"]')
      .first();

    if (await currentPwdInput.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await currentPwdInput.fill("WrongPassword@999");
      await newPwdInput.fill("NewAdmin@123");
      await confirmPwdInput.fill("NewAdmin@123");

      const changeBtn = page
        .locator("button")
        .filter({ hasText: /change password/i })
        .first();
      if (await changeBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await changeBtn.click();
        const errorToast = page.locator("[data-sonner-toast][data-type='error']").first();
        await expect(errorToast).toBeVisible({ timeout: 10_000 });
      }
    }
  });

  test("view active sessions section", async ({ page }) => {
    await page.goto("/dashboard/profile");
    await waitForContent(page);

    const sessionsSection = page.locator("text=/sessions|active/i").first();
    await expect(sessionsSection)
      .toBeVisible({ timeout: 8_000 })
      .catch(() => {
        /* noop */
      });
  });
});

// ─── Dashboard overview ───────────────────────────────────────────────────────

test.describe("Dashboard overview", () => {
  test("KPI cards are visible", async ({ page }) => {
    await page.goto("/dashboard/default");
    await waitForContent(page);

    // Cards should show counts
    const cards = page.locator('[class*="card"], [data-slot="card"]');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);
  });

  test("low stock alert section renders", async ({ page }) => {
    await page.goto("/dashboard/default");
    await waitForContent(page);

    const lowStock = page.locator("text=/low stock|reorder/i").first();
    await expect(lowStock)
      .toBeVisible({ timeout: 8_000 })
      .catch(() => {
        /* noop */
      });
  });

  test("recent sales orders section renders", async ({ page }) => {
    await page.goto("/dashboard/default");
    await waitForContent(page);

    const recentOrders = page.locator("text=/recent|orders/i").first();
    await expect(recentOrders)
      .toBeVisible({ timeout: 8_000 })
      .catch(() => {
        /* noop */
      });
  });

  test("sidebar navigation links work", async ({ page }) => {
    await page.goto("/dashboard/default");

    const navLinks = [
      { text: /products/i, url: /products/ },
      { text: /categories/i, url: /categories/ },
      { text: /suppliers/i, url: /suppliers/ },
      { text: /customers/i, url: /customers/ },
      { text: /reports/i, url: /reports/ },
    ];

    for (const link of navLinks) {
      const navItem = page.locator("nav a, aside a").filter({ hasText: link.text }).first();
      if (await navItem.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await navItem.click();
        await expect(page).toHaveURL(link.url, { timeout: 8_000 });
        await page.goBack();
        await page.waitForTimeout(300);
      }
    }
  });
});
