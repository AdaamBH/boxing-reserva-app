import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import { fireEvent } from '@testing-library/react';
import { WeekDayStrip } from './WeekDayStrip';

// Semana fija (lunes 2026-07-06 a domingo 2026-07-12) para que el test no
// dependa de qué día es "hoy" al ejecutarse.
const WEEK_START = new Date(2026, 6, 6);

function renderStrip(overrides: Partial<Parameters<typeof WeekDayStrip>[0]> = {}) {
  const handlers = {
    onSelectDate: vi.fn(),
    onPrevWeek: vi.fn(),
    onNextWeek: vi.fn(),
  };
  render(
    <WeekDayStrip
      weekStart={WEEK_START}
      selectedDate={WEEK_START}
      sessionCountByDate={new Map()}
      canGoNextWeek
      {...handlers}
      {...overrides}
    />,
  );
  return handlers;
}

describe('WeekDayStrip', () => {
  it('muestra los 7 días de la semana con su letra e inicial', () => {
    renderStrip();

    expect(screen.getByText('L')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('marca el día seleccionado con aria-pressed', () => {
    renderStrip({ selectedDate: new Date(2026, 6, 8) });

    const buttons = screen
      .getAllByRole('button')
      .filter((b) => b.textContent?.match(/^\D\d+$/));
    const pressed = buttons.find((b) => b.getAttribute('aria-pressed') === 'true');
    expect(pressed?.textContent).toBe('X8');
  });

  it('llama a onSelectDate con la fecha del día pulsado', async () => {
    const user = userEvent.setup();
    const { onSelectDate } = renderStrip();

    await user.click(screen.getByText('J').closest('button')!);

    expect(onSelectDate).toHaveBeenCalledTimes(1);
    const calledWith = onSelectDate.mock.calls[0]?.[0] as Date;
    expect(calledWith.getDate()).toBe(9);
  });

  it('llama a onPrevWeek / onNextWeek al pulsar las flechas', async () => {
    const user = userEvent.setup();
    const { onPrevWeek, onNextWeek } = renderStrip();

    await user.click(screen.getByLabelText('Semana anterior'));
    await user.click(screen.getByLabelText('Semana siguiente'));

    expect(onPrevWeek).toHaveBeenCalledTimes(1);
    expect(onNextWeek).toHaveBeenCalledTimes(1);
  });

  // Tope de la ventana de reserva (ver bookingWindow.ts): la semana
  // siguiente deja de ser alcanzable, ni por flecha ni deslizando.
  describe('cuando ya se está en la última semana reservable', () => {
    it('desactiva la flecha de semana siguiente', async () => {
      const user = userEvent.setup();
      const { onNextWeek } = renderStrip({ canGoNextWeek: false });

      const nextButton = screen.getByLabelText('Semana siguiente');
      expect(nextButton).toBeDisabled();

      await user.click(nextButton);
      expect(onNextWeek).not.toHaveBeenCalled();
    });

    it('sigue dejando volver a la semana anterior', async () => {
      const user = userEvent.setup();
      const { onPrevWeek } = renderStrip({ canGoNextWeek: false });

      await user.click(screen.getByLabelText('Semana anterior'));
      expect(onPrevWeek).toHaveBeenCalledTimes(1);
    });

    it('ignora el gesto de deslizar hacia delante, que si no sería una puerta trasera', () => {
      const { onNextWeek } = renderStrip({ canGoNextWeek: false });

      const strip = screen.getByText('L').closest('div')!;
      fireEvent.touchStart(strip, { touches: [{ clientX: 200, clientY: 50 }] });
      fireEvent.touchEnd(strip, { changedTouches: [{ clientX: 60, clientY: 55 }] });

      expect(onNextWeek).not.toHaveBeenCalled();
    });
  });

  it('deslizar hacia delante sí cambia de semana mientras quede margen', () => {
    const { onNextWeek } = renderStrip({ canGoNextWeek: true });

    const strip = screen.getByText('L').closest('div')!;
    fireEvent.touchStart(strip, { touches: [{ clientX: 200, clientY: 50 }] });
    fireEvent.touchEnd(strip, { changedTouches: [{ clientX: 60, clientY: 55 }] });

    expect(onNextWeek).toHaveBeenCalledTimes(1);
  });
});
