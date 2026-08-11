import { useMemo } from 'react';
import { useClassSessionsByDateRange } from '@/features/classes/hooks/useClassSessionsByDateRange';
import { getMonthGridDates, toDateString } from '@/utils/calendarDates';

/**
 * Trae las sesiones de todo el rango visible en la cuadrícula del mes
 * (incluye los días del mes anterior/siguiente que rellenan la primera y
 * última semana), así el punto de "día abierto" es correcto también para
 * esos días de borde.
 */
export function useMonthClassSessions(monthDate: Date, enabled = true) {
  const gridDates = useMemo(() => getMonthGridDates(monthDate), [monthDate]);
  const startDate = toDateString(gridDates[0] ?? monthDate);
  const endDate = toDateString(gridDates[gridDates.length - 1] ?? monthDate);

  return useClassSessionsByDateRange(startDate, endDate, enabled);
}
