import { defineConfig, devices } from "@playwright/test";
const remote = process.env.ECHO_BASE_URL;
export default defineConfig({
  timeout: 60_000,
  testDir: "./tests/e2e",
  fullyParallel: false,
  reporter: "list",
  use: {
    baseURL: remote ?? "http://127.0.0.1:5173",
    trace: "retain-on-failure",
  },
  webServer: remote
    ? undefined
    : {
        command: "npm run dev -- --port 5173 --strictPort",
        url: "http://127.0.0.1:5173",
        reuseExistingServer: true,
      },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "webkit" },
    },
  ],
});
