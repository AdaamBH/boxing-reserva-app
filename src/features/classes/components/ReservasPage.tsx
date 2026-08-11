import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useClassSessionsByDateRange } from '@/features/classes/hooks/useClassSessionsByDateRange';
import { useMonthClassSessions } from '@/features/calendar/hooks/useMonthClassSessions';
import { WeekDayStrip } from '@/features/classes/components/WeekDayStrip';
import { SegmentedToggle } from '@/components/SegmentedToggle';
import { MonthGrid } from '@/features/calendar/components/MonthGrid';
import { ClassSessionCard } from '@/features/classes/components/ClassSessionCard';
import { ClassSessionCardSkeleton } from '@/features/classes/components/ClassSessionCardSkeleton';
import { useMySessionBookingStatuses } from '@/features/bookings/hooks/useMySessionBookingStatuses';
import {
  addDays,
  addMonths,
  getMonthStart,
  getWeekStart,
  parseLocalDate,
  toDateString,
} from '@/utils/calendarDates';

type ViewMode = 'week' | 'month';

function initialDateFromQuery(fechaParam: string | null): Date {
  if (fechaParam) {
    const parsed = parseLocalDate(fechaParam);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return new Date();
}

export function ReservasPage() {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState(() =>
    initialDateFromQuery(searchParams.get('fecha')),
  );
  const [weekStart, setWeekStart] = useState(() => getWeekStart(selectedDate));
  const [monthDate, setMonthDate] = useState(() => getMonthStart(selectedDate));

  const weekRangeStart = toDateString(weekStart);
  const weekRangeEnd = toDateString(addDays(weekStart, 6));
  const {
    data: weekSessions,
    isLoading: isWeekLoading,
    error: weekError,
  } = useClassSessionsByDateRange(weekRangeStart, weekRangeEnd, viewMode === 'week');
  const {
    data: monthSessions,
    isLoading: isMonthLoading,
    error: monthError,
  } = useMonthClassSessions(monthDate, viewMode === 'month');

  const sessions = viewMode === 'month' ? monthSessions : weekSessions;
  const isLoading = viewMode === 'month' ? isMonthLoading : isWeekLoading;
  const error = viewMode === 'month' ? monthError : weekError;

  const sessionsForSelectedDate = useMemo(() => {
    const selectedDateStr = toDateString(selectedDate);
    return sessions?.filter((session) => session.fecha === selectedDateStr) ?? [];
  }, [sessions, selectedDate]);

  const sessionCountByDate = useMemo(() => {
    const counts = new Map<string, number>();
    for (const session of sessions ?? []) {
      counts.set(session.fecha, (counts.get(session.fecha) ?? 0) + 1);
    }
    return counts;
  }, [sessions]);

  const { data: bookingStatuses } = useMySessionBookingStatuses();

  function handleSelectWeek(nextWeekStart: Date) {
    setWeekStart(nextWeekStart);
    setSelectedDate(nextWeekStart);
  }

  function handleSelectMonthDate(date: Date) {
    setSelectedDate(date);
    setWeekStart(getWeekStart(date));
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-wide text-ink uppercase">
          Reservas
        </h1>

        <SegmentedToggle
          value={viewMode}
          onChange={setViewMode}
          options={[
            { value: 'week', label: 'Semana' },
            { value: 'month', label: 'Mes' },
          ]}
        />
      </div>

      {viewMode === 'week' ? (
        <WeekDayStrip
          weekStart={weekStart}
          selectedDate={selectedDate}
          sessionCountByDate={sessionCountByDate}
          onSelectDate={setSelectedDate}
          onPrevWeek={() => handleSelectWeek(addDays(weekStart, -7))}
          onNextWeek={() => handleSelectWeek(addDays(weekStart, 7))}
        />
      ) : (
        <MonthGrid
          monthDate={monthDate}
          selectedDate={selectedDate}
          sessionCountByDate={sessionCountByDate}
          onSelectDate={handleSelectMonthDate}
          onPrevMonth={() => setMonthDate(addMonths(monthDate, -1))}
          onNextMonth={() => setMonthDate(addMonths(monthDate, 1))}
        />
      )}

      {isLoading && (
        <div className="flex flex-col gap-2" aria-busy="true">
          <span className="sr-only">Cargando clases…</span>
          <ClassSessionCardSkeleton />
          <ClassSessionCardSkeleton />
          <ClassSessionCardSkeleton />
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-danger-500">
          No se han podido cargar las clases. Inténtalo de nuevo en unos segundos.
        </p>
      )}

      {!isLoading && !error && sessionsForSelectedDate.length === 0 && (
        <p className="text-sm text-ink-faint">No hay clases programadas este día.</p>
      )}

      {sessionsForSelectedDate.length > 0 && (
        <div className="flex flex-col gap-2">
          {sessionsForSelectedDate.map((session) => (
            <ClassSessionCard
              key={session.id}
              session={session}
              status={bookingStatuses?.get(session.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
