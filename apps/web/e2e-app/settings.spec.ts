import { createHmac } from 'node:crypto'
import { expect, test, type Page } from '@playwright/test'

/** RFC 6238 code for a base32 secret (what an authenticator app shows). */
function totp(secret: string, at = Date.now()): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let bits = ''
  for (const ch of secret.replace(/=+$/, '').toUpperCase())
    bits += alphabet.indexOf(ch).toString(2).padStart(5, '0')
  const key = Buffer.from(bits.match(/.{8}/g)!.map((b) => parseInt(b, 2)))
  const counter = Buffer.alloc(8)
  counter.writeBigUInt64BE(BigInt(Math.floor(at / 30_000)))
  const mac = createHmac('sha1', key).update(counter).digest()
  const offset = mac[mac.length - 1] & 0xf
  const value = (mac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000
  return value.toString().padStart(6, '0')
}

async function signUp(page: Page, email: string, password: string) {
  await page.goto('/?auth=signup')
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Name').fill('Settings Tester')
  await dialog.getByLabel('Email').fill(email)
  await dialog.getByLabel('Password').fill(password)
  await dialog.getByRole('button', { name: 'Create account' }).click()
  await expect(dialog).toBeHidden()
}

test('settings: name, password and two-factor sign-in', async ({ page }) => {
  test.setTimeout(90_000)
  const email = `settings-${Date.now()}@example.com`
  await signUp(page, email, 'first-password-1')

  // profile: rename
  await page.getByRole('button', { name: 'Account menu' }).click()
  await page.getByRole('menuitem', { name: 'Settings' }).click()
  await expect(page).toHaveURL(/\/settings\/profile$/)
  await page.getByLabel('Name').fill('Renamed Tester')
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByRole('button', { name: 'Account menu' })).toContainText('Renamed Tester')

  // security: change password
  await page.getByRole('tab', { name: 'Security' }).click()
  await expect(page).toHaveURL(/\/settings\/security$/)
  await page.waitForLoadState('networkidle')
  const password = page.locator('form').filter({ hasText: 'Change password' })
  await password.getByLabel('Current password').fill('first-password-1')
  await password.getByLabel('New password').fill('second-password-2')
  await password.getByLabel('Repeat the password').fill('second-password-2')
  await password.getByRole('button', { name: 'Change password' }).click()
  await expect(page.getByRole('region', { name: 'Notifications' })).toContainText(
    'Password changed.'
  )

  // security: turn on two-factor
  const twoFactor = page.locator('form').filter({ hasText: 'Turn on' })
  await twoFactor.getByLabel('Current password').fill('second-password-2')
  await twoFactor.getByRole('button', { name: 'Turn on' }).click()
  const secret = (await page.locator('code').first().textContent())!.trim()
  await page.getByRole('textbox', { name: 'Two-factor code' }).first().click()
  await page.keyboard.type(totp(secret))
  await expect(page.getByRole('region', { name: 'Notifications' })).toContainText(
    'Two-factor authentication is on.'
  )

  // sign out, sign in with password + code
  await page.getByRole('button', { name: 'Account menu' }).click()
  await page.getByRole('menuitem', { name: 'Sign out' }).click()
  await page.goto('/?auth=signin')
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Email').fill(email)
  await dialog.getByLabel('Password').fill('second-password-2')
  await dialog.getByRole('button', { name: 'Sign in' }).click()
  await expect(dialog.getByText('Enter the 6-digit code')).toBeVisible()
  await dialog.getByRole('textbox').first().click()
  // a fresh window, so the code differs from the one used to turn it on
  await page.waitForTimeout(Math.max(0, 30_000 - (Date.now() % 30_000)) + 500)
  await page.keyboard.type(totp(secret))
  await expect(dialog).toBeHidden()
  await expect(page.getByRole('button', { name: 'Account menu' })).toContainText('Renamed Tester')
})

test('settings need an account', async ({ page }) => {
  await page.goto('/settings/profile')
  await expect(page).toHaveURL(/auth=signin/)
  await expect(page.getByRole('dialog')).toBeVisible()
})
