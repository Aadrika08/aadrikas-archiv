import { expect, test } from '@playwright/test';

test('opens mobile navigation and closes it after selecting a route', async ({ page }) => {
  await page.goto('/');
  const menu = page.locator('details[data-mobile-menu]');
  await expect(menu).toBeVisible();
  await expect(menu).not.toHaveAttribute('open', '');
  await page.getByText('MENU +', { exact: true }).click();
  await expect(menu).toHaveAttribute('open', '');
  const mobileNav = page.getByRole('navigation', { name: 'Mobile navigation' });
  await expect(mobileNav).toBeVisible();
  await mobileNav.getByRole('link', { name: /Reading/ }).click();
  await expect(page).toHaveURL(/\/reading\/?$/);
  await expect(menu).not.toHaveAttribute('open', '');
});
