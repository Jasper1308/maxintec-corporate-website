import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

import { resetSupabaseMock, supabaseMock } from './mocks/supabase';

vi.mock('@/lib/supabase/client', () => ({
  supabase: supabaseMock,
}));

beforeEach(() => {
  resetSupabaseMock();
});

afterEach(() => {
  cleanup();
});
