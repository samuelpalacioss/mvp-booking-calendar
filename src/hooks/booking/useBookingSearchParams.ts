import { useNavigate, useSearch } from '@tanstack/react-router';
import { CalendarDate } from '@internationalized/date';
import {
  parseISODate,
  calendarDateToISO,
  getTodayInLocalTimezone,
} from '../../lib/booking/date-utils';
import { BookingSearchParams } from '../../lib/booking/types';
import { DEFAULT_LAYOUT } from '../../lib/booking/constants';

export interface UseBookingSearchParamsReturn {
  selectedDate: CalendarDate;
  selectedSlot: string | undefined;
  layout: 'month' | 'week' | 'day';
  setSelectedDate: (date: CalendarDate) => void;
  setSelectedSlot: (slot: string | undefined) => void;
  setLayout: (layout: 'month' | 'week' | 'day') => void;
}

export function useBookingSearchParams(): UseBookingSearchParamsReturn {
  const searchParams = useSearch({ from: '/book/$eventSlug' });
  const navigate = useNavigate({ from: '/book/$eventSlug' });

  const layout = searchParams.layout || DEFAULT_LAYOUT;
  const selectedDate = searchParams.date
    ? parseISODate(searchParams.date)
    : getTodayInLocalTimezone();
  const selectedSlot = searchParams.slot;

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
    updateSearchParams({ slot });
  };

  const setLayout = (newLayout: 'month' | 'week' | 'day') => {
    updateSearchParams({ layout: newLayout });
  };

  return {
    selectedDate,
    selectedSlot,
    layout,
    setSelectedDate,
    setSelectedSlot,
    setLayout,
  };
}
