import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false, // sequential — tests share backend state
  retries: 1,
  timeout: 45_000,
  expect: { timeout: 12_000 },
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],

  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    // Ignore HTTPS errors from self-signed localhost:7080 backend cert
    ignoreHTTPSErrors: true,
  },

  projects: [
    // Setup: log in and store auth cookies
    { name: "setup", testMatch: /auth\.setup\.ts/ },

    // All tests reuse the saved auth state
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/e2e/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],

  webServer: {
    command: "bun run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    env: { NODE_TLS_REJECT_UNAUTHORIZED: "0" },
    timeout: 60_000,
  },
});
