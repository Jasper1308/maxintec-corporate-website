import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
  it('renders the title hierarchy and description', () => {
    render(
      <PageHeader
        eyebrow="Área do Cliente"
        title="Chamados"
        description="Acompanhe o atendimento."
      />
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Chamados' })).toBeInTheDocument();
    expect(screen.getByText('Área do Cliente')).toBeInTheDocument();
    expect(screen.getByText('Acompanhe o atendimento.')).toBeInTheDocument();
  });

  it('renders an optional action', () => {
    render(<PageHeader title="Chamados" action={<button>Novo chamado</button>} />);
    expect(screen.getByRole('button', { name: 'Novo chamado' })).toBeInTheDocument();
  });
});
