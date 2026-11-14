import { expect, test, type Page } from '@playwright/test'

/** The "Sign in" button in the panel's top bar. */
const signInButton = (page: Page) =>
  page.locator('main header').getByRole('button', { name: 'Sign in' })

/** Main path #4: sign up, sign out, sign in (password), and the guard's redirect back. */
test('sign up, sign out and sign in again', async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`
  const password = 'e2e-password-123'

  await page.goto('/trainer/ideas')
  await signInButton(page).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(page).toHaveURL(/auth=signin/)

  // sign up
  await dialog.getByRole('tab', { name: 'Create account' }).click()
  await dialog.getByLabel('Name').fill('E2E Tester')
  await dialog.getByLabel('Email').fill(email)
  await dialog.getByLabel('Password').fill(password)
  await dialog.getByRole('button', { name: 'Create account' }).click()
  await expect(dialog).toBeHidden()
  await expect(page).toHaveURL(/\/trainer\/ideas$/)
  await expect(page.getByRole('button', { name: 'Account menu' })).toContainText('E2E Tester')

  // sign out
  await page.getByRole('button', { name: 'Account menu' }).click()
  await page.getByRole('menuitem', { name: 'Sign out' }).click()
  await expect(signInButton(page)).toBeVisible()

  // wrong password, then the right one
  await signInButton(page).click()
  await dialog.getByLabel('Email').fill(email)
  await dialog.getByLabel('Password').fill('nope-nope-nope')
  await dialog.getByRole('button', { name: 'Sign in' }).click()
  await expect(dialog.getByRole('alert')).toBeVisible()
  await dialog.getByLabel('Password').fill(password)
  await dialog.getByRole('button', { name: 'Sign in' }).click()
  await expect(dialog).toBeHidden()
  await expect(page.getByRole('button', { name: 'Account menu' })).toContainText('E2E Tester')
})

test('the team guard sends visitors to sign in and back', async ({ page }) => {
  await page.goto('/admin')
  await expect(page).toHaveURL(/auth=signin/)
  await expect(page).toHaveURL(/callbackUrl=%2Fadmin/)
  await expect(page.getByRole('dialog')).toBeVisible()

  await page.getByRole('dialog').getByLabel('Email').fill('demo@example.com')
  await page.getByRole('dialog').getByLabel('Password').fill('password')
  await page.getByRole('dialog').getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/admin$/)
  await expect(page.getByRole('heading', { name: 'Admin' })).toBeVisible()
})

test('old /auth/login links open the dialog', async ({ page }) => {
  await page.goto('/auth/login?callbackUrl=/trainer/docs')
  await expect(page).toHaveURL(/auth=signin/)
  await expect(page.getByRole('dialog')).toBeVisible()
})
