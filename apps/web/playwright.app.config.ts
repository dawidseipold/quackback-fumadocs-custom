import { defineConfig, devices } from '@playwright/test'

/**
 * End-to-end tests of the new UI (src/app). Quackback's own `e2e/` drives its old UI and is not run.
 * Against a running server with the demo seed: `bun run test:e2e:app` (BASE_URL defaults to :3000).
 */
export default defineConfig({
  testDir: './e2e-app',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['github']] : [['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // a sandbox without Playwright's download host can point at a preinstalled Chromium
    launchOptions: process.env.PW_CHROMIUM_PATH
      ? { executablePath: process.env.PW_CHROMIUM_PATH }
      : {},
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
    },
  ],
})
