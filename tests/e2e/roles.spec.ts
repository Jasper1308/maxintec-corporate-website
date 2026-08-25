import { expect, test } from '@playwright/test';

import { hasCredentials, loginAs } from './helpers/auth';

test.describe('resident', () => {
  test.skip(
    !hasCredentials('resident'),
    'Credenciais do resident de testes não configuradas.'
  );

  test('accesses personal flows without administrative navigation', async ({ page }) => {
    await loginAs(page, 'resident');
    await expect(page.getByRole('link', { name: 'Meu cadastro' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Chamados' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Aprovações' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Moradores' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Condomínios' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Auditoria' })).toHaveCount(0);

    await page.getByRole('link', { name: 'Meu cadastro' }).click();
    await expect(page).toHaveURL(/\/portal\/registrations$/);
    await page.getByRole('link', { name: 'Chamados' }).click();
    await expect(page).toHaveURL(/\/portal\/tickets$/);
  });
});

test.describe('manager', () => {
  test.skip(
    !hasCredentials('manager'),
    'Credenciais do manager de testes não configuradas.'
  );

  test('accesses condominium workflows but not admin-only routes', async ({ page }) => {
    await loginAs(page, 'manager');
    await expect(page.getByRole('link', { name: 'Aprovações' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Moradores' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Chamados' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Condomínios' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Auditoria' })).toHaveCount(0);

    await page.goto('/portal/audit');
    await expect(page.getByRole('heading', { name: 'Acesso restrito' })).toBeVisible();
  });
});

test.describe('admin', () => {
  test.skip(
    !hasCredentials('admin'),
    'Credenciais do admin de testes não configuradas.'
  );

  test('accesses every administrative route', async ({ page }) => {
    await loginAs(page, 'admin');

    for (const name of ['Aprovações', 'Condomínios', 'Auditoria']) {
      await expect(page.getByRole('link', { name })).toBeVisible();
    }

    await page.getByRole('link', { name: 'Condomínios' }).click();
    await expect(page).toHaveURL(/\/portal\/condominiums$/);
    await page.getByRole('link', { name: 'Auditoria' }).click();
    await expect(page).toHaveURL(/\/portal\/audit$/);
  });
});
