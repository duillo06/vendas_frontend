import { defineConfig, devices } from "@playwright/test";

const apiPort = process.env.VITE_API_PORT || "8011";
const adminURL = process.env.E2E_ADMIN_URL || "http://127.0.0.1:5175";
const storeURL = process.env.E2E_STORE_URL || "http://demo.localhost:5174";
// Vite 8 / rolldown precisa Node ≥20.19 — nvm 22 no PATH se o shell usar o Node do Cursor
const nodeBin = process.env.E2E_NODE_BIN || `${process.env.HOME}/.nvm/versions/node/v22.23.2/bin`;
const withNode = `PATH=${nodeBin}:$PATH`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never", outputFolder: "e2e-report" }]],
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    ...devices["Desktop Chrome"],
  },
  projects: [
    {
      name: "security-admin",
      testMatch: /security\/.*admin.*\.spec\.ts/,
      use: { baseURL: adminURL },
    },
    {
      name: "security-store",
      testMatch: /security\/.*store.*\.spec\.ts/,
      use: { baseURL: storeURL },
    },
  ],
  webServer: [
    {
      command: `${withNode} VITE_API_PORT=${apiPort} npm run dev:admin`,
      url: adminURL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: `${withNode} VITE_API_PORT=${apiPort} npm run dev`,
      url: "http://127.0.0.1:5174",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
