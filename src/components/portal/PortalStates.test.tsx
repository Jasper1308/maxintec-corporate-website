import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  AccessDenied,
  EmptyState,
  ErrorState,
  LoadingState,
} from './PortalStates';

describe('portal states', () => {
  it('announces loading with a configurable label', () => {
    render(<LoadingState label="Carregando moradores..." />);
    expect(screen.getByRole('status')).toHaveTextContent('Carregando moradores...');
  });

  it('renders an empty state with supporting guidance', () => {
    render(
      <EmptyState title="Nenhum chamado">
        Abra um chamado para começar.
      </EmptyState>
    );
    expect(screen.getByText('Nenhum chamado')).toBeInTheDocument();
    expect(screen.getByText('Abra um chamado para começar.')).toBeInTheDocument();
  });

  it('announces an error and lets the user retry', async () => {
    const user = userEvent.setup();
    const retry = vi.fn();
    render(<ErrorState message="Falha ao carregar" retry={retry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Falha ao carregar');
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it('gives restricted areas a specific heading', () => {
    render(<AccessDenied />);
    expect(screen.getByRole('heading', { name: 'Acesso restrito' })).toBeInTheDocument();
  });
});
