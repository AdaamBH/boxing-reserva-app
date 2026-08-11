import {
  WEEKDAY_LETTERS,
  formatMonthLabel,
  getMonthGridDates,
  isSameDate,
  toDateString,
} from '@/utils/calendarDates';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';

interface MonthGridProps {
  monthDate: Date;
  selectedDate: Date;
  sessionCountByDate: Map<string, number>;
  onSelectDate: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

/**
 * Cuadrícula mensual: cada día del mes se marca como "abierto" (tiene
 * alguna clase programada) o "cerrado" (no tiene ninguna). Los días de
 * relleno del mes anterior/siguiente se muestran atenuados y no son
 * interactivos, solo dan contexto visual de en qué semana cae el día 1.
 */
export function MonthGrid({
  monthDate,
  selectedDate,
  sessionCountByDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: MonthGridProps) {
  const gridDates = getMonthGridDates(monthDate);
  const today = new Date();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onPrevMonth}
          aria-label="Mes anterior"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-chalk hover:text-ink"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>

        <span className="text-sm font-medium text-ink-muted">
          {formatMonthLabel(monthDate)}
        </span>

        <button
          type="button"
          onClick={onNextMonth}
          aria-label="Mes siguiente"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-chalk hover:text-ink"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-ink-faint uppercase">
        {WEEKDAY_LETTERS.map((letter) => (
          <span key={letter}>{letter}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {gridDates.map((day) => {
          const dateStr = toDateString(day);
          const inMonth = day.getMonth() === monthDate.getMonth();
          const hasSessions = (sessionCountByDate.get(dateStr) ?? 0) > 0;
          const selected = isSameDate(day, selectedDate);
          const isToday = isSameDate(day, today);

          if (!inMonth) {
            return (
              <span key={dateStr} className="py-2 text-center text-sm text-ink-faint/40">
                {day.getDate()}
              </span>
            );
          }

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDate(day)}
              aria-pressed={selected}
              className={`flex flex-col items-center gap-0.5 rounded-lg py-2 text-sm transition-colors ${
                selected
                  ? 'bg-brand-600 text-white'
                  : isToday
                    ? 'border border-brand-600/50 text-ink'
                    : 'text-ink hover:bg-chalk'
              }`}
            >
              <span className="font-medium">{day.getDate()}</span>
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  hasSessions
                    ? selected
                      ? 'bg-white'
                      : 'bg-brand-600'
                    : 'bg-transparent'
                }`}
              />
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4 pt-1 text-xs text-ink-faint">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-600" /> Abierto
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full border border-line-strong" /> Cerrado
        </span>
      </div>
    </div>
  );
}
