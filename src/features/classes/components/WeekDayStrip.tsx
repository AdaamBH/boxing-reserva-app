import { useRef } from 'react';
import type { TouchEvent } from 'react';
import {
  formatMonthLabel,
  formatWeekdayLetter,
  getWeekDates,
  isSameDate,
  toDateString,
} from '@/utils/calendarDates';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';

interface WeekDayStripProps {
  weekStart: Date;
  selectedDate: Date;
  sessionCountByDate: Map<string, number>;
  onSelectDate: (date: Date) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  /**
   * `false` cuando ya se está en la última semana reservable: desactiva la
   * flecha y también el gesto de deslizar, que si no sería una puerta
   * trasera para saltarse el tope sin tocar el botón (ver bookingWindow.ts).
   */
  canGoNextWeek: boolean;
}

// Distancia horizontal mínima (px) para contar un gesto como "deslizar de
// semana" en vez de un toque o un scroll vertical accidental de la página.
const SWIPE_THRESHOLD_PX = 40;

/**
 * Barra de días de la semana (L 10 | M 11 | ... | D 16) con navegación
 * entre semanas. Grid de 7 columnas fijas (nunca desplazable horizontalmente
 * dentro de la propia semana, se encoge para caber en cualquier ancho de
 * pantalla) — deslizar sobre la barra cambia de semana entera, igual que
 * las flechas. El punto bajo el número indica que ese día tiene alguna
 * clase programada — mismo dato (class_sessions) que usa el Calendario,
 * sin una tabla aparte de "días abiertos/cerrados".
 */
export function WeekDayStrip({
  weekStart,
  selectedDate,
  sessionCountByDate,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
  canGoNextWeek,
}: WeekDayStripProps) {
  const days = getWeekDates(weekStart);
  const today = new Date();
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    const touch = event.touches[0];
    touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = touchStart.current;
    touchStart.current = null;
    const touch = event.changedTouches[0];
    if (!start || !touch) return;

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX || Math.abs(deltaX) < Math.abs(deltaY)) {
      return;
    }

    if (deltaX < 0) {
      if (canGoNextWeek) {
        onNextWeek();
      }
    } else {
      onPrevWeek();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onPrevWeek}
          aria-label="Semana anterior"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-muted hover:bg-chalk hover:text-ink"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>

        <span className="text-sm font-medium text-ink-muted">
          {formatMonthLabel(weekStart)}
        </span>

        <button
          type="button"
          onClick={onNextWeek}
          disabled={!canGoNextWeek}
          aria-label="Semana siguiente"
          title={
            canGoNextWeek
              ? undefined
              : 'Las clases se abren semana a semana: todavía no puedes reservar más adelante.'
          }
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-muted hover:bg-chalk hover:text-ink disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>

      <div
        className="grid grid-cols-7 gap-1 sm:gap-1.5"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {days.map((day) => {
          const dateStr = toDateString(day);
          const selected = isSameDate(day, selectedDate);
          const isToday = isSameDate(day, today);
          const hasSessions = (sessionCountByDate.get(dateStr) ?? 0) > 0;

          return (
            <button
              key={dateStr}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelectDate(day)}
              className={`flex min-w-0 flex-col items-center gap-1 rounded-xl border px-1 py-2 text-sm transition-colors sm:px-2 sm:py-2.5 ${
                selected
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : isToday
                    ? 'border-brand-600/50 bg-canvas-raised text-ink'
                    : 'border-line bg-canvas-raised text-ink-muted hover:bg-chalk'
              }`}
            >
              <span className="text-[11px] font-medium uppercase sm:text-xs">
                {formatWeekdayLetter(day)}
              </span>
              <span className="text-sm font-semibold sm:text-base">{day.getDate()}</span>
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
    </div>
  );
}
