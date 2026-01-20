import { useState } from 'react';
import { EventData } from '../../lib/booking/types';
import { useBookingSearchParams } from '../../hooks/booking/useBookingSearchParams';
import { useTimezone } from '../../hooks/booking/useTimezone';
import { useAvailableSlots, useAvailableDates, useAvailabilityCount } from '../../hooks/booking/useAvailableSlots';
import { EventInfoPanel } from './EventInfoPanel';
import { CalendarPanel } from './CalendarPanel';
import { TimeSlotsPanel } from './TimeSlotsPanel';
import { BookingConfirmation } from './BookingConfirmation';

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

  // Booking step: 1 = select date/time, 2 = confirmation/file upload
  const [step, setStep] = useState<1 | 2>(1);

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

  // Step 2: Show confirmation with file upload
  if (step === 2 && selectedSlot) {
    return (
      <BookingConfirmation
        event={event}
        selectedDate={selectedDate}
        selectedSlot={selectedSlot}
        timezone={timezone}
        onBack={() => setStep(1)}
      />
    );
  }

  // Step 1: Calendar and time slot selection
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

          {/* Next button when slot is selected */}
          {selectedSlot && (
            <div className="border-t border-zinc-800 p-4 md:p-6">
              <button
                onClick={() => setStep(2)}
                className="w-full rounded-lg bg-white px-6 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:w-auto md:ml-auto md:block"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
