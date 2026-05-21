import { expect, test as setup } from "@playwright/test";

import path from "node:path";

const AUTH_FILE = path.join(__dirname, ".auth/user.json");

setup("authenticate as admin", async ({ page }) => {
  await page.goto("/auth/v1/login");

  await page.fill("#login-username", "admin");
  await page.fill("#login-password", "Admin@Dev2026!");
  await page.click('button[type="submit"]');

  // Wait until redirected to dashboard
  await page.waitForURL("**/dashboard/**", { timeout: 20_000 });
  await expect(page).toHaveURL(/\/dashboard\//);

  await page.context().storageState({ path: AUTH_FILE });
});
