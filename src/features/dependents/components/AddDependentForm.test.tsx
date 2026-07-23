import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import { AddDependentForm } from './AddDependentForm';
import { addDependent } from '@/features/dependents/api/dependentsApi';

vi.mock('@/features/dependents/api/dependentsApi', () => ({
  addDependent: vi.fn(),
}));

describe('AddDependentForm', () => {
  beforeEach(() => {
    vi.mocked(addDependent).mockReset();
  });

  it('llama a addDependent con los datos y el consentimiento marcado', async () => {
    vi.mocked(addDependent).mockResolvedValue(undefined);
    const onSuccess = vi.fn();
    const user = userEvent.setup();

    render(<AddDependentForm onSuccess={onSuccess} />);
    await user.type(screen.getByLabelText('Nombre'), 'Lucía');
    await user.type(screen.getByLabelText('Apellidos'), 'Pérez Ruiz');
    fireEvent.change(screen.getByLabelText('Fecha de nacimiento'), {
      target: { value: '2015-03-10' },
    });
    await user.selectOptions(
      screen.getByLabelText('Tu relación con el/la menor'),
      'madre',
    );
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Añadir dependiente' }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
    expect(addDependent).toHaveBeenCalledWith({
      nombre: 'Lucía',
      apellidos: 'Pérez Ruiz',
      fechaNacimiento: '2015-03-10',
      relacion: 'madre',
      consentimiento: true,
    });
  });

  it('no llama a addDependent si no se marca el consentimiento', async () => {
    const onSuccess = vi.fn();
    const user = userEvent.setup();

    render(<AddDependentForm onSuccess={onSuccess} />);
    await user.type(screen.getByLabelText('Nombre'), 'Lucía');
    await user.type(screen.getByLabelText('Apellidos'), 'Pérez Ruiz');
    fireEvent.change(screen.getByLabelText('Fecha de nacimiento'), {
      target: { value: '2015-03-10' },
    });
    await user.selectOptions(
      screen.getByLabelText('Tu relación con el/la menor'),
      'madre',
    );
    // El checkbox de consentimiento se deja sin marcar a propósito.
    await user.click(screen.getByRole('button', { name: 'Añadir dependiente' }));

    await screen.findByText('Debes confirmar el consentimiento para continuar');
    expect(addDependent).not.toHaveBeenCalled();
  });
});
