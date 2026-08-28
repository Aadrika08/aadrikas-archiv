import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = ['/', '/research', '/resume', '/reading', '/writing', '/guestbook', '/about', '/contact'];
const navLabels = ['Home', 'Research', 'Resume', 'Reading', 'Writing', 'Guestbook', 'About', 'Contact'];

test.describe('archive navigation and content', () => {
  test('renders each primary route and desktop navigation', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Primary navigation' });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('link')).toHaveCount(navLabels.length);

    for (const [index, label] of navLabels.entries()) {
      const link = nav.getByRole('link', { name: new RegExp(`^${label}\\s+0${index + 1}$`, 'i') });
      await expect(link).toHaveAttribute('href', routes[index]!);
    }

    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('main#main-content')).toBeVisible();
      await expect(page).not.toHaveTitle(/404/);
    }
  });

  test('lists all published writing and opens an article route', async ({ page }) => {
    await page.goto('/writing');
    const writingLinks = page.locator('main#main-content a.row-link');
    await expect(writingLinks).toHaveCount(9);
    await expect(writingLinks.first()).toHaveAttribute('href', /^\/writing\/.+/);
    await writingLinks.first().click();
    await expect(page.locator('article.post-page')).toBeVisible();
    await expect(page.getByRole('link', { name: /all writing/i })).toHaveAttribute('href', '/writing');
  });

  test('supports the wrong and successful word-game states', async ({ page }) => {
    await page.goto('/');
    const game = page.locator('form.word-game');
    await expect(game).toBeVisible();
    await game.getByRole('textbox', { name: 'Your guess' }).fill('drifting');
    await game.getByRole('button', { name: 'reveal' }).click();
    await expect(page.getByText('not quite — keep wandering.')).toBeVisible();
    await game.getByRole('textbox', { name: 'Your guess' }).fill('WANDERING');
    await game.getByRole('button', { name: 'reveal' }).click();
    await expect(page.getByText('CORRECT — A SMALL REWARD')).toBeVisible();
    await expect(page.getByText(/Adrianne Lenker/)).toBeVisible();
  });

  test('persists dark theme across navigation', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: /switch to dark theme/i });
    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page).toHaveTitle(/aadrika's archive/i);
    await page.goto('/reading');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await page.evaluate(() => localStorage.getItem('archive-theme'))).toBe('dark');
  });
});

test.describe('configured-off forms', () => {
  test('guestbook renders an empty constellation and disabled submission', async ({ page }) => {
    await page.goto('/guestbook');
    await expect(page.getByRole('heading', { name: 'the constellation.' })).toBeVisible();
    await expect(page.getByText('the sky is quiet. leave the first star.')).toBeVisible();
    await expect(page.getByRole('button', { name: /leave a star/i })).toBeDisabled();
    await expect(page.getByText(/Verification is enabled after deployment configuration/i)).toBeVisible();
  });

  test('contact renders fields and disabled submission', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.getByRole('heading', { name: 'write from here.' })).toBeVisible();
    await expect(page.getByLabel('Name', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Email', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Message', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'send message' })).toBeDisabled();
    await expect(page.getByText(/Verification is enabled after deployment configuration/i)).toBeVisible();
  });
});

test.describe('accessibility smoke checks', () => {
  for (const route of ['/', '/reading', '/writing', '/guestbook', '/contact']) {
    test(`${route} has no detected critical accessibility violations`, async ({ page }) => {
      await page.goto(route);
      const results = await new AxeBuilder({ page }).analyze();
      const critical = results.violations.filter(({ impact }) => impact === 'critical');
      expect(critical, critical.map(({ id, description }) => `${id}: ${description}`).join('\n')).toEqual([]);
    });
  }
});
