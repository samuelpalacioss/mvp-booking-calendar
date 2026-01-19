import { useNavigate, useSearch } from '@tanstack/react-router';
import { CalendarDate } from '@internationalized/date';
import {
  parseISODate,
  calendarDateToISO,
  getTodayInLocalTimezone,
  parseYearMonth,
  yearMonthToString,
} from '../../lib/booking/date-utils';
import { BookingSearchParams } from '../../lib/booking/types';
import { DEFAULT_LAYOUT } from '../../lib/booking/constants';

export interface UseBookingSearchParamsReturn {
  selectedDate: CalendarDate;
  selectedSlot: string | undefined;
  layout: 'month' | 'week' | 'day';
  visibleMonth: { year: number; month: number };
  setSelectedDate: (date: CalendarDate) => void;
  setSelectedSlot: (slot: string | undefined) => void;
  setLayout: (layout: 'month' | 'week' | 'day') => void;
  setVisibleMonth: (year: number, month: number) => void;
}

export function useBookingSearchParams(): UseBookingSearchParamsReturn {
  const searchParams = useSearch({ from: '/book/$eventSlug' });
  const navigate = useNavigate({ from: '/book/$eventSlug' });

  const layout = searchParams.layout || DEFAULT_LAYOUT;
  const selectedDate = searchParams.date
    ? parseISODate(searchParams.date)
    : getTodayInLocalTimezone();
  const selectedSlot = searchParams.slot;

  // Derive visible month from URL params with fallback logic
  // Note: month param is guaranteed to be present by route's beforeLoad
  const visibleMonth = (() => {
    // 1. Try to use month param from URL
    if (searchParams.month) {
      const parsed = parseYearMonth(searchParams.month);
      if (parsed) return parsed;
    }

    // 2. Fall back to month from date param if available
    if (searchParams.date) {
      const date = parseISODate(searchParams.date);
      return { year: date.year, month: date.month };
    }

    // 3. Fall back to current month (should rarely happen due to beforeLoad)
    const today = getTodayInLocalTimezone();
    return { year: today.year, month: today.month };
  })();

  const updateSearchParams = (updates: Partial<BookingSearchParams>) => {
    navigate({
      search: (prev) => ({ ...prev, ...updates }),
    });
  };

  const setSelectedDate = (date: CalendarDate) => {
    updateSearchParams({
      date: calendarDateToISO(date),
      slot: undefined, // Clear slot when date changes
    });
  };

  const setSelectedSlot = (slot: string | undefined) => {
    // Strip timezone annotation if present
    const cleanSlot = slot?.replace(/\[.*\]$/, '');
    updateSearchParams({ slot: cleanSlot });
  };

  const setLayout = (newLayout: 'month' | 'week' | 'day') => {
    updateSearchParams({ layout: newLayout });
  };

  const setVisibleMonth = (year: number, month: number) => {
    updateSearchParams({
      month: yearMonthToString(year, month),
      date: undefined,   // Clear date when month changes
      slot: undefined,   // Clear slot when month changes
    });
  };

  return {
    selectedDate,
    selectedSlot,
    layout,
    visibleMonth,
    setSelectedDate,
    setSelectedSlot,
    setLayout,
    setVisibleMonth,
  };
}
