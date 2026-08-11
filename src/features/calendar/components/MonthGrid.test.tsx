import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import { MonthGrid } from './MonthGrid';

// Julio de 2026 (mes fijo) para que el test no dependa de qué mes es
// "hoy" al ejecutarse.
const MONTH_DATE = new Date(2026, 6, 15);

describe('MonthGrid', () => {
  it('muestra la etiqueta del mes y los días del mes actual', () => {
    render(
      <MonthGrid
        monthDate={MONTH_DATE}
        selectedDate={MONTH_DATE}
        sessionCountByDate={new Map()}
        onSelectDate={vi.fn()}
        onPrevMonth={vi.fn()}
        onNextMonth={vi.fn()}
      />,
    );

    expect(screen.getByText('Julio 2026')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '31' })).toBeInTheDocument();
  });

  it('llama a onSelectDate con la fecha del día pulsado', async () => {
    const onSelectDate = vi.fn();
    const user = userEvent.setup();

    render(
      <MonthGrid
        monthDate={MONTH_DATE}
        selectedDate={MONTH_DATE}
        sessionCountByDate={new Map()}
        onSelectDate={onSelectDate}
        onPrevMonth={vi.fn()}
        onNextMonth={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: '20' }));

    expect(onSelectDate).toHaveBeenCalledTimes(1);
    const calledWith = onSelectDate.mock.calls[0]?.[0] as Date;
    expect(calledWith.getDate()).toBe(20);
    expect(calledWith.getMonth()).toBe(6);
  });

  it('llama a onPrevMonth / onNextMonth al pulsar las flechas', async () => {
    const onPrevMonth = vi.fn();
    const onNextMonth = vi.fn();
    const user = userEvent.setup();

    render(
      <MonthGrid
        monthDate={MONTH_DATE}
        selectedDate={MONTH_DATE}
        sessionCountByDate={new Map()}
        onSelectDate={vi.fn()}
        onPrevMonth={onPrevMonth}
        onNextMonth={onNextMonth}
      />,
    );

    await user.click(screen.getByLabelText('Mes anterior'));
    await user.click(screen.getByLabelText('Mes siguiente'));

    expect(onPrevMonth).toHaveBeenCalledTimes(1);
    expect(onNextMonth).toHaveBeenCalledTimes(1);
  });

  it('los días fuera de mes no son interactivos', () => {
    render(
      <MonthGrid
        monthDate={MONTH_DATE}
        selectedDate={MONTH_DATE}
        sessionCountByDate={new Map()}
        onSelectDate={vi.fn()}
        onPrevMonth={vi.fn()}
        onNextMonth={vi.fn()}
      />,
    );

    // 1 de julio de 2026 es miércoles, así que el grid incluye días de
    // finales de junio (29, 30) como relleno atenuado, no interactivo —
    // a diferencia de los días del mes, que sí son <button>.
    const fillerDay = screen
      .getAllByText('29')
      .find((el) => el.closest('button') === null);
    expect(fillerDay).toBeDefined();
  });
});
