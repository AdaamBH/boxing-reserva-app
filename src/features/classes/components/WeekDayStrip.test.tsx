import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import { WeekDayStrip } from './WeekDayStrip';

// Semana fija (lunes 2026-07-06 a domingo 2026-07-12) para que el test no
// dependa de qué día es "hoy" al ejecutarse.
const WEEK_START = new Date(2026, 6, 6);

describe('WeekDayStrip', () => {
  it('muestra los 7 días de la semana con su letra e inicial', () => {
    render(
      <WeekDayStrip
        weekStart={WEEK_START}
        selectedDate={WEEK_START}
        sessionCountByDate={new Map()}
        onSelectDate={vi.fn()}
        onPrevWeek={vi.fn()}
        onNextWeek={vi.fn()}
      />,
    );

    expect(screen.getByText('L')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('marca el día seleccionado con aria-pressed', () => {
    render(
      <WeekDayStrip
        weekStart={WEEK_START}
        selectedDate={new Date(2026, 6, 8)}
        sessionCountByDate={new Map()}
        onSelectDate={vi.fn()}
        onPrevWeek={vi.fn()}
        onNextWeek={vi.fn()}
      />,
    );

    const buttons = screen
      .getAllByRole('button')
      .filter((b) => b.textContent?.match(/^\D\d+$/));
    const pressed = buttons.find((b) => b.getAttribute('aria-pressed') === 'true');
    expect(pressed?.textContent).toBe('X8');
  });

  it('llama a onSelectDate con la fecha del día pulsado', async () => {
    const onSelectDate = vi.fn();
    const user = userEvent.setup();

    render(
      <WeekDayStrip
        weekStart={WEEK_START}
        selectedDate={WEEK_START}
        sessionCountByDate={new Map()}
        onSelectDate={onSelectDate}
        onPrevWeek={vi.fn()}
        onNextWeek={vi.fn()}
      />,
    );

    await user.click(screen.getByText('J').closest('button')!);

    expect(onSelectDate).toHaveBeenCalledTimes(1);
    const calledWith = onSelectDate.mock.calls[0]?.[0] as Date;
    expect(calledWith.getDate()).toBe(9);
  });

  it('llama a onPrevWeek / onNextWeek al pulsar las flechas', async () => {
    const onPrevWeek = vi.fn();
    const onNextWeek = vi.fn();
    const user = userEvent.setup();

    render(
      <WeekDayStrip
        weekStart={WEEK_START}
        selectedDate={WEEK_START}
        sessionCountByDate={new Map()}
        onSelectDate={vi.fn()}
        onPrevWeek={onPrevWeek}
        onNextWeek={onNextWeek}
      />,
    );

    await user.click(screen.getByLabelText('Semana anterior'));
    await user.click(screen.getByLabelText('Semana siguiente'));

    expect(onPrevWeek).toHaveBeenCalledTimes(1);
    expect(onNextWeek).toHaveBeenCalledTimes(1);
  });
});
