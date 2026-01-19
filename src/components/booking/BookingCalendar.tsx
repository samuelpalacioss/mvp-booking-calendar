import { useState } from 'react';
import { EventData } from '../../lib/booking/types';
import { useBookingSearchParams } from '../../hooks/booking/useBookingSearchParams';
import { useTimezone } from '../../hooks/booking/useTimezone';
import { useAvailableSlots, useAvailableDates, useAvailabilityCount } from '../../hooks/booking/useAvailableSlots';
import { EventInfoPanel } from './EventInfoPanel';
import { CalendarPanel } from './CalendarPanel';
import { TimeSlotsPanel } from './TimeSlotsPanel';

interface BookingCalendarProps {
  eventSlug: string;
  event: EventData;
}

export function BookingCalendar({ eventSlug, event }: BookingCalendarProps) {
  const {
    selectedDate,
    selectedSlot,
    setSelectedDate,
    setSelectedSlot,
  } = useBookingSearchParams();

  const { timezone, setTimezone } = useTimezone();

  // Track visible month in calendar to fetch available dates for the correct month
  const [visibleMonth, setVisibleMonth] = useState<{ year: number; month: number }>({
    year: selectedDate.year,
    month: selectedDate.month,
  });

  // Fetch available slots for selected date
  const {
    data: slots = [],
    isLoading: isSlotsLoading,
    error: slotsError,
    refetch: refetchSlots,
  } = useAvailableSlots({
    eventSlug,
    date: selectedDate,
    timezone,
  });

  // TODO: Fetch available dates for all months within the bookable period (e.g. not before two months from event date)

  // Fetch available dates for the visible month (not selected month)
  // This ensures dates are shown with greyed out background when navigating to other months
  const {
    data: availableDates = new Set(),
    error: datesError,
  } = useAvailableDates(eventSlug, visibleMonth.year, visibleMonth.month);

  // Fetch availability count for the visible month to show dots
  const {
    data: availabilityCount = new Map(),
  } = useAvailabilityCount(eventSlug, visibleMonth.year, visibleMonth.month);

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-7xl">
        {/* Error banner for dates loading failure */}
        {datesError && (
          <div className="mb-4 rounded-lg border border-red-900 bg-red-950/20 p-3 text-sm text-red-400">
            No se pudieron cargar las fechas disponibles. El calendario puede
            no mostrar todos los días con disponibilidad.
          </div>
        )}

        {/* Mobile: Stack vertically in unified card */}
        {/* Tablet (md): Two columns - info+calendar, slots below */}
        {/* Desktop (lg): Three columns - narrower left, wider calendar, narrow time slots */}
        <div className="md:rounded-lg bg-zinc-900 md:bg-transparent">
          <div className="flex flex-col md:grid md:grid-cols-[300px_1fr] lg:grid-cols-[280px_500px_260px]">
            {/* Left Panel: Event Info */}
            <EventInfoPanel
              event={event}
              timezone={timezone}
              onTimezoneChange={setTimezone}
            />

            {/* Center Panel: Calendar */}
            <CalendarPanel
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              availableDates={availableDates}
              availabilityCount={availabilityCount}
              showAvailabilityDots={true}
              onVisibleMonthChange={(year, month) => {
                setVisibleMonth({ year, month });
              }}
            />

            {/* Right Panel: Time Slots */}
            <TimeSlotsPanel
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              slots={slots}
              onSlotSelect={setSelectedSlot}
              timezone={timezone}
              isLoading={isSlotsLoading}
              error={slotsError}
              onRetry={refetchSlots}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
