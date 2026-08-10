import { existsSync } from 'node:fs'
import { defineConfig, devices } from '@playwright/test'

const macChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
  || (process.platform === 'darwin' && existsSync(macChrome) ? macChrome : undefined)
const liveBaseUrl = process.env.ZENVIS_LIVE_BASE_URL

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: liveBaseUrl || 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: executablePath ? { executablePath } : undefined,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        browserName: 'chromium',
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],
  webServer: liveBaseUrl ? undefined : {
    command: 'yarn server:dev --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'ignore',
  },
})
