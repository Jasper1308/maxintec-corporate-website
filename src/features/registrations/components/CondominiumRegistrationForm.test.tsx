import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuth } from '@/features/auth/AuthProvider';

import { getRegistrationCondominiums } from '../form-queries';
import { submitRegistration } from '../submit-registration';
import { CondominiumRegistrationForm } from './CondominiumRegistrationForm';

vi.mock('@/features/auth/AuthProvider', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../form-queries', () => ({
  getRegistrationCondominiums: vi.fn(),
}));

vi.mock('../submit-registration', () => ({
  submitRegistration: vi.fn(),
}));

const useAuthMock = vi.mocked(useAuth);
const getCondominiumsMock = vi.mocked(getRegistrationCondominiums);
const submitRegistrationMock = vi.mocked(submitRegistration);

const options = [
  { id: 'condominium-a', name: 'Condominium A', blocks: ['Torre 1', 'Torre 2'] },
  { id: 'condominium-b', name: 'Condominium B', blocks: ['Bloco B'] },
];

describe('CondominiumRegistrationForm', () => {
  beforeEach(() => {
    useAuthMock.mockReturnValue({
      user: { id: 'resident-a', email: 'resident-a@example.test' },
    } as ReturnType<typeof useAuth>);
    getCondominiumsMock.mockResolvedValue(options);
    submitRegistrationMock.mockResolvedValue();
  });

  it('loads condominiums and updates block options from the selection', async () => {
    const user = userEvent.setup();
    render(<CondominiumRegistrationForm />);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando...');
    const condominium = await screen.findByLabelText(/Condomínio/);
    await user.selectOptions(condominium, 'condominium-b');

    expect(screen.getByRole('option', { name: 'Bloco B' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Torre 1' })).not.toBeInTheDocument();
  });

  it('validates required application fields before calling the boundary', async () => {
    const { container } = render(<CondominiumRegistrationForm />);
    await screen.findByLabelText(/Condomínio/);

    fireEvent.submit(container.querySelector('form') as HTMLFormElement);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Preencha todos os campos obrigatórios.'
    );
    expect(submitRegistrationMock).not.toHaveBeenCalled();
  });

  it('rejects a malformed CPF without submitting', async () => {
    const user = userEvent.setup();
    const { container } = render(<CondominiumRegistrationForm />);
    await user.selectOptions(await screen.findByLabelText(/Condomínio/), 'condominium-a');
    await user.selectOptions(screen.getByLabelText(/Bloco/), 'Torre 1');
    await user.type(screen.getByLabelText(/Apartamento/), '101');
    await user.type(screen.getByLabelText(/Nome completo/), 'Resident A');
    await user.type(screen.getByLabelText(/CPF/), '123');

    fireEvent.submit(container.querySelector('form') as HTMLFormElement);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Informe um CPF com 11 dígitos.'
    );
    expect(submitRegistrationMock).not.toHaveBeenCalled();
  });

  it('submits the selected condominium and resident data', async () => {
    const user = userEvent.setup();
    render(<CondominiumRegistrationForm />);
    await user.selectOptions(await screen.findByLabelText(/Condomínio/), 'condominium-a');
    await user.selectOptions(screen.getByLabelText(/Bloco/), 'Torre 2');
    await user.type(screen.getByLabelText(/Apartamento/), '1204');
    await user.type(screen.getByLabelText(/Nome completo/), 'Resident A');
    await user.type(screen.getByLabelText(/CPF/), '12345678901');
    await user.type(screen.getByLabelText(/Telefone/), '48999998888');

    await user.click(screen.getByRole('button', { name: 'Enviar cadastro' }));

    await waitFor(() => {
      expect(submitRegistrationMock).toHaveBeenCalledWith({
        condominiumId: 'condominium-a',
        condominiumName: 'Condominium A',
        block: 'Torre 2',
        apartment: '1204',
        residentType: 'morador',
        cpf: '123.456.789-01',
        fullName: 'Resident A',
        phone: '(48) 99999-8888',
        email: 'resident-a@example.test',
        photo: null,
        documents: [],
      });
    });
    expect(screen.getByRole('status')).toHaveTextContent(
      'Cadastro enviado. Acompanhe a análise em Meu cadastro.'
    );
  });

  it('surfaces condominium loading errors and never renders a usable form', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    getCondominiumsMock.mockRejectedValue(new Error('network unavailable'));
    render(<CondominiumRegistrationForm />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível conectar ao serviço. Verifique sua conexão.'
    );
    expect(screen.getByRole('button', { name: 'Enviar cadastro' })).toBeDisabled();
  });
});
