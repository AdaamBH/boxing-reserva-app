import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import { ToggleSwitch } from './ToggleSwitch';

describe('ToggleSwitch', () => {
  it('refleja el estado checked recibido', () => {
    render(<ToggleSwitch checked={true} onChange={vi.fn()} label="Activar" />);

    expect(screen.getByRole('switch', { name: 'Activar' })).toBeChecked();
  });

  it('llama a onChange con el nuevo valor al pulsar', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<ToggleSwitch checked={false} onChange={onChange} label="Activar" />);
    await user.click(screen.getByRole('switch', { name: 'Activar' }));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('no responde a clics cuando está deshabilitado', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<ToggleSwitch checked={false} onChange={onChange} label="Activar" disabled />);
    await user.click(screen.getByRole('switch', { name: 'Activar' }));

    expect(onChange).not.toHaveBeenCalled();
  });
});
