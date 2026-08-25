import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Modal } from './Modal';

describe('Modal', () => {
  it('does not render its content while closed', () => {
    render(
      <Modal open={false} title="Confirmação" onClose={vi.fn()}>
        Conteúdo protegido
      </Modal>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Conteúdo protegido')).not.toBeInTheDocument();
  });

  it('renders an accessible dialog while open', () => {
    render(
      <Modal open title="Confirmação" onClose={vi.fn()}>
        Conteúdo protegido
      </Modal>
    );

    expect(screen.getByRole('dialog', { name: 'Confirmação' })).toBeInTheDocument();
    expect(screen.getByText('Conteúdo protegido')).toBeInTheDocument();
  });

  it('closes from the explicit close button', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <Modal open title="Confirmação" onClose={onClose}>
        Conteúdo
      </Modal>
    );

    await user.click(screen.getByRole('button', { name: 'Fechar modal' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('closes with Escape and when the backdrop is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal open title="Confirmação" onClose={onClose}>
        Conteúdo
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.mouseDown(container.firstElementChild as Element);

    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
