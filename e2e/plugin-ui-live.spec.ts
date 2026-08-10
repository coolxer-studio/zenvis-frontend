import { expect, test, type Frame, type Page } from '@playwright/test'

const baseUrl = process.env.ZENVIS_LIVE_BASE_URL
const bearerToken = process.env.ZENVIS_LIVE_BEARER_TOKEN
const screenshotDir = process.env.ZENVIS_LIVE_SCREENSHOT_DIR

test.skip(!baseUrl || !bearerToken, 'set ZENVIS_LIVE_BASE_URL and ZENVIS_LIVE_BEARER_TOKEN to run live UI checks')
test.use({ trace: 'off' })

const authorizeApiRequests = async (page: Page) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('__login__', JSON.stringify({
      expiredAt: Date.now() + 60 * 60 * 1000,
      value: 'ok',
    }))
  })
  await page.route('**/api/v1/**', async route => {
    await route.continue({
      headers: {
        ...route.request().headers(),
        authorization: `Bearer ${bearerToken}`,
      },
    })
  })
}

const assertPluginContract = async (frame: Frame, expectedText: string) => {
  await expect(frame.locator('html')).toHaveAttribute('data-zenvis-ui', '1')
  await expect(frame.locator('link[href*="plugin-ui/v1/zenvis-plugin-ui.css"]')).toHaveCount(1)
  await expect(frame.getByText(expectedText, { exact: false }).first()).toBeVisible()

  const contract = await frame.locator('html').evaluate(element => ({
    colorScheme: getComputedStyle(element).colorScheme,
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    runtimeVersion: (window as typeof window & {
      ZenVisPluginUI?: { version?: string }
    }).ZenVisPluginUI?.version,
  }))

  expect(contract.colorScheme).toBe('light')
  expect(contract.runtimeVersion).toMatch(/^1\./)
  expect(contract.scrollWidth).toBeLessThanOrEqual(contract.clientWidth + 2)
}

const openPlugin = async (page: Page, packageName: string, expectedText: string) => {
  await page.goto(`${baseUrl}/#/service/low-code-app/${packageName}`)
  await expect(page).toHaveURL(new RegExp(`/service/low-code-app/${packageName}(?:\\?|$)`))
  await expect(page.locator('[aria-label="切换暗色模式"]')).toHaveCount(0)
  await expect(page.locator('.plugin-frame__iframe')).toBeVisible()

  const isExpectedPluginFrame = (item: Frame) => {
    if (!item.url().includes('/amis/app.html')) return false
    return new URL(item.url()).searchParams.get('config') === packageName
  }
  await expect.poll(() => page.frames().some(isExpectedPluginFrame)).toBe(true)
  await expect(page.locator('.plugin-frame__loading')).toBeHidden()
  const frame = page.frames().find(isExpectedPluginFrame)
  expect(frame, `${packageName} iframe should be loaded`).toBeTruthy()
  await assertPluginContract(frame!, expectedText)
}

test('installed plugins consume the light-only ZenVis UI contract', async ({ page }) => {
  await authorizeApiRequests(page)
  await page.setViewportSize({ width: 1440, height: 900 })

  await openPlugin(page, 'com.coolxer.plugin.onesoc.app', 'OneSOC 安全运营态势中心')
  if (screenshotDir) {
    await page.screenshot({ path: `${screenshotDir}/zenvis-onesoc-light.png`, fullPage: true })
  }

  await page.setViewportSize({ width: 1280, height: 720 })
  await openPlugin(page, 'com.coolxer.plugin.lubinsun.app', 'Lubinsun 智能任务')
  if (screenshotDir) {
    await page.screenshot({ path: `${screenshotDir}/zenvis-lubinsun-light.png`, fullPage: true })
  }
})
