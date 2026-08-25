import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('renders the supplied user-facing label', () => {
    render(<StatusBadge value="pending" label="Aguardando aprovação" />);
    expect(screen.getByText('Aguardando aprovação')).toBeInTheDocument();
  });

  it.each([
    ['approved', 'text-emerald-200'],
    ['waiting', 'text-amber-200'],
    ['rejected', 'text-red-200'],
    ['unknown', 'text-slate-300'],
  ])('maps %s to its semantic style', (value, className) => {
    render(<StatusBadge value={value} />);
    expect(screen.getByText(value)).toHaveClass(className);
  });
});
