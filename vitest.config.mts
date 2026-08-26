import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    testTimeout: 15_000,
    hookTimeout: 15_000,
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: `${projectRoot}coverage`,
      include: [
        'src/lib/format.ts',
        'src/lib/listing.ts',
        'src/lib/supabase/errors.ts',
        'src/features/auth/actions.ts',
        'src/features/auth/AuthProvider.tsx',
        'src/features/condominiums/actions.ts',
        'src/features/condominiums/validation.ts',
        'src/features/registrations/labels.ts',
        'src/features/tickets/errors.ts',
        'src/components/portal/{Modal,PageHeader,PortalStates,StatusBadge}.tsx',
        'src/features/dashboard/components/DashboardMetricCard.tsx',
        'src/features/registrations/components/CondominiumRegistrationForm.tsx',
        'src/features/tickets/components/NewTicketModal.tsx',
      ],
      thresholds: {
        statements: 70,
        branches: 60,
        functions: 70,
        lines: 70,
      },
    },
  },
});
