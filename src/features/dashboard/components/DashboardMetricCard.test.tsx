import { render, screen } from '@testing-library/react';
import { Bell } from 'lucide-react';
import { describe, expect, it } from 'vitest';

import { DashboardMetricCard } from './DashboardMetricCard';

describe('DashboardMetricCard', () => {
  it('renders a metric without inventing navigation', () => {
    render(
      <DashboardMetricCard
        title="Notificações"
        value={3}
        description="Não lidas"
        icon={<Bell aria-hidden="true" />}
      />
    );

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('becomes a link only when a destination is supplied', () => {
    render(
      <DashboardMetricCard
        title="Chamados"
        value={2}
        description="Em atendimento"
        href="/portal/tickets"
        icon={<Bell aria-hidden="true" />}
      />
    );

    expect(screen.getByRole('link', { name: /Chamados/ })).toHaveAttribute(
      'href',
      '/portal/tickets'
    );
  });
});
