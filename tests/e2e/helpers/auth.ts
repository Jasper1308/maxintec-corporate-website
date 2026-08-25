import { expect, type Page } from '@playwright/test';

export type TestRole = 'resident' | 'manager' | 'admin';

interface Credentials {
  email?: string;
  password?: string;
}

const credentials: Record<TestRole, Credentials> = {
  resident: {
    email: process.env.E2E_RESIDENT_EMAIL,
    password: process.env.E2E_RESIDENT_PASSWORD,
  },
  manager: {
    email: process.env.E2E_MANAGER_EMAIL,
    password: process.env.E2E_MANAGER_PASSWORD,
  },
  admin: {
    email: process.env.E2E_ADMIN_EMAIL,
    password: process.env.E2E_ADMIN_PASSWORD,
  },
};

export function hasCredentials(role: TestRole): boolean {
  return Boolean(credentials[role].email && credentials[role].password);
}

export async function loginAs(page: Page, role: TestRole) {
  const credential = credentials[role];

  if (!credential.email || !credential.password) {
    throw new Error(`Credenciais E2E ausentes para ${role}.`);
  }

  await page.goto('/login');
  await page.getByLabel('Email').fill(credential.email);
  await page.getByLabel('Senha').fill(credential.password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/portal$/);
}
