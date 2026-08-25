import { expect, test } from '@playwright/test';

import { hasCredentials, loginAs } from './helpers/auth';

test.describe('authentication', () => {
  test.skip(
    !hasCredentials('resident'),
    'Credenciais do resident de testes não configuradas.'
  );

  test('persists across reload and logout clears the session', async ({ page }) => {
    await loginAs(page, 'resident');
    await page.reload();
    await expect(page).toHaveURL(/\/portal$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await page.getByRole('button', { name: 'Sair' }).click();
    await expect(page).toHaveURL(/\/login$/);
  });
});
