import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import { MonthGrid } from './MonthGrid';

// Julio de 2026 (mes fijo) para que el test no dependa de qué mes es
// "hoy" al ejecutarse.
const MONTH_DATE = new Date(2026, 6, 15);
// Por defecto, todo julio dentro de la ventana: así los tests que no van
// del tope se comportan como antes de añadirlo.
const LAST_BOOKABLE = new Date(2026, 6, 31);

function renderGrid(overrides: Partial<Parameters<typeof MonthGrid>[0]> = {}) {
  const handlers = {
    onSelectDate: vi.fn(),
    onPrevMonth: vi.fn(),
    onNextMonth: vi.fn(),
  };
  render(
    <MonthGrid
      monthDate={MONTH_DATE}
      selectedDate={MONTH_DATE}
      sessionCountByDate={new Map()}
      lastBookableDate={LAST_BOOKABLE}
      canGoNextMonth
      {...handlers}
      {...overrides}
    />,
  );
  return handlers;
}

describe('MonthGrid', () => {
  it('muestra la etiqueta del mes y los días del mes actual', () => {
    renderGrid();

    expect(screen.getByText('Julio 2026')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '31' })).toBeInTheDocument();
  });

  it('llama a onSelectDate con la fecha del día pulsado', async () => {
    const user = userEvent.setup();
    const { onSelectDate } = renderGrid();

    await user.click(screen.getByRole('button', { name: '20' }));

    expect(onSelectDate).toHaveBeenCalledTimes(1);
    const calledWith = onSelectDate.mock.calls[0]?.[0] as Date;
    expect(calledWith.getDate()).toBe(20);
    expect(calledWith.getMonth()).toBe(6);
  });

  it('llama a onPrevMonth / onNextMonth al pulsar las flechas', async () => {
    const user = userEvent.setup();
    const { onPrevMonth, onNextMonth } = renderGrid();

    await user.click(screen.getByLabelText('Mes anterior'));
    await user.click(screen.getByLabelText('Mes siguiente'));

    expect(onPrevMonth).toHaveBeenCalledTimes(1);
    expect(onNextMonth).toHaveBeenCalledTimes(1);
  });

  it('los días fuera de mes no son interactivos', () => {
    renderGrid();

    // 1 de julio de 2026 es miércoles, así que el grid incluye días de
    // finales de junio (29, 30) como relleno atenuado, no interactivo —
    // a diferencia de los días del mes, que sí son <button>.
    const fillerDay = screen
      .getAllByText('29')
      .find((el) => el.closest('button') === null);
    expect(fillerDay).toBeDefined();
  });

  // Sin esto, la vista de Mes sería la puerta de atrás para llegar a una
  // semana que la vista de Semana no deja alcanzar (ver bookingWindow.ts).
  describe('tope de la ventana de reserva', () => {
    it('deja pulsables los días hasta el tope, incluido', async () => {
      const user = userEvent.setup();
      const { onSelectDate } = renderGrid({ lastBookableDate: new Date(2026, 6, 20) });

      await user.click(screen.getByRole('button', { name: '20' }));

      expect(onSelectDate).toHaveBeenCalledTimes(1);
    });

    it('convierte los días posteriores al tope en texto no pulsable', () => {
      renderGrid({ lastBookableDate: new Date(2026, 6, 20) });

      expect(screen.queryByRole('button', { name: '21' })).toBeNull();
      expect(screen.queryByRole('button', { name: '31' })).toBeNull();
      // Siguen viéndose, solo que atenuados y sin ser interactivos.
      expect(screen.getByText('21')).toBeInTheDocument();
    });

    it('desactiva la flecha de mes siguiente cuando el tope no llega al mes que viene', async () => {
      const user = userEvent.setup();
      const { onNextMonth } = renderGrid({ canGoNextMonth: false });

      const nextButton = screen.getByLabelText('Mes siguiente');
      expect(nextButton).toBeDisabled();

      await user.click(nextButton);
      expect(onNextMonth).not.toHaveBeenCalled();
    });
  });
});
