import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createTicket } from '../actions';
import { NewTicketModal } from './NewTicketModal';

vi.mock('../actions', () => ({
  createTicket: vi.fn(),
}));

const createTicketMock = vi.mocked(createTicket);
const condominiums = [
  { id: 'condominium-a', name: 'Condominium A', active: true },
];

async function fillRequiredFields() {
  const user = userEvent.setup();
  await user.selectOptions(screen.getByLabelText('Condomínio'), 'condominium-a');
  await user.selectOptions(screen.getByLabelText('Categoria'), 'portao');
  await user.selectOptions(screen.getByLabelText('Prioridade'), 'high');
  await user.type(screen.getByLabelText('Título'), 'Portão com falha');
  await user.type(
    screen.getByLabelText('Descrição'),
    'O portão da garagem não está fechando.'
  );
  return user;
}

describe('NewTicketModal', () => {
  beforeEach(() => {
    createTicketMock.mockReset();
  });

  it('does not render while closed', () => {
    render(
      <NewTicketModal
        open={false}
        condominiums={condominiums}
        onClose={vi.fn()}
        onCreated={vi.fn()}
      />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not submit a form missing required fields', async () => {
    const user = userEvent.setup();
    render(
      <NewTicketModal
        open
        condominiums={condominiums}
        onClose={vi.fn()}
        onCreated={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Abrir chamado' }));
    expect(createTicketMock).not.toHaveBeenCalled();
  });

  it('submits normalized ticket data and completes the workflow', async () => {
    const onClose = vi.fn();
    const onCreated = vi.fn();
    createTicketMock.mockResolvedValue('ticket-1');
    render(
      <NewTicketModal
        open
        condominiums={condominiums}
        onClose={onClose}
        onCreated={onCreated}
      />
    );
    const user = await fillRequiredFields();

    await user.click(screen.getByRole('button', { name: 'Abrir chamado' }));

    await waitFor(() => {
      expect(createTicketMock).toHaveBeenCalledWith({
        condominiumId: 'condominium-a',
        category: 'portao',
        priority: 'high',
        title: 'Portão com falha',
        description: 'O portão da garagem não está fechando.',
      });
    });
    expect(onCreated).toHaveBeenCalledWith('ticket-1');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('prevents double submit while the action is pending', async () => {
    let resolveTicket: ((ticketId: string) => void) | undefined;
    createTicketMock.mockImplementation(
      () => new Promise(resolve => {
        resolveTicket = resolve;
      })
    );
    render(
      <NewTicketModal
        open
        condominiums={condominiums}
        onClose={vi.fn()}
        onCreated={vi.fn()}
      />
    );
    const user = await fillRequiredFields();
    const submitButton = screen.getByRole('button', { name: 'Abrir chamado' });

    await user.click(submitButton);
    expect(screen.getByRole('button', { name: 'Abrindo...' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Abrindo...' }));
    expect(createTicketMock).toHaveBeenCalledOnce();

    resolveTicket?.('ticket-1');
    await waitFor(() => expect(createTicketMock).toHaveBeenCalledOnce());
  });

  it('shows a safe error and keeps the modal open when creation fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    createTicketMock.mockRejectedValue(new Error('Falha controlada'));
    render(
      <NewTicketModal
        open
        condominiums={condominiums}
        onClose={vi.fn()}
        onCreated={vi.fn()}
      />
    );
    const user = await fillRequiredFields();
    await user.click(screen.getByRole('button', { name: 'Abrir chamado' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha controlada');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('disables creation when no condominium is authorized', () => {
    render(
      <NewTicketModal
        open
        condominiums={[]}
        onClose={vi.fn()}
        onCreated={vi.fn()}
      />
    );

    expect(screen.getByText(/Nenhum condomínio disponível/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abrir chamado' })).toBeDisabled();
  });
});
