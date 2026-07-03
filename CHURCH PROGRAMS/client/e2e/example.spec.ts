import { test, expect } from '@playwright/test';

test('homepage has title text', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('text=Gilgal Parish Church')).toBeVisible();
});
