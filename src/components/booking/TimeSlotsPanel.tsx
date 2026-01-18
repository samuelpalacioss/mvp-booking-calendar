import { useState } from 'react';
import { CalendarDate } from '@internationalized/date';
import { TimeSlot } from '../../lib/booking/types';
import { TimeSlotButton } from './TimeSlotButton';
import { TimeFormatToggle } from './TimeFormatToggle';
import { formatCalendarDate, formatTime, TimeFormat } from '../../lib/booking/date-utils';

interface TimeSlotsPanelProps {
  selectedDate: CalendarDate;
  selectedSlot?: string;
  slots: TimeSlot[];
  onSlotSelect: (slot: string | undefined) => void;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  locale?: string;
}

export function TimeSlotsPanel({
  selectedDate,
  selectedSlot,
  slots,
  onSlotSelect,
  isLoading = false,
  error,
  onRetry,
  locale = 'es-ES',
}: TimeSlotsPanelProps) {
  const [timeFormat, setTimeFormat] = useState<TimeFormat>('12h');

  const formattedDate = formatCalendarDate(selectedDate, locale);

  return (
    <div className="border-t border-zinc-800 bg-transparent p-6 md:rounded-r-lg md:border-t-0 md:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">{formattedDate}</h3>
        <TimeFormatToggle value={timeFormat} onChange={setTimeFormat} />
      </div>

      <div className="max-h-96 space-y-2 overflow-y-auto">
        {error ? (
          <div className="py-8 text-center">
            <p className="mb-4 text-sm text-red-400">
              Error al cargar horarios disponibles
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="rounded-md bg-zinc-800 px-4 py-2 text-sm text-white hover:bg-zinc-700"
              >
                Reintentar
              </button>
            )}
          </div>
        ) : isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded-lg bg-zinc-800"
              />
            ))}
          </div>
        ) : slots.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-400">
            No hay horarios disponibles para esta fecha
          </p>
        ) : (
          slots.map((slot) => {
            const displayTime = formatTime(slot.startTime, timeFormat, locale);
            return (
              <TimeSlotButton
                key={slot.startTime}
                slot={slot}
      
                isSelected={selectedSlot === slot.startTime}
                onClick={() =>
                  onSlotSelect(
                    selectedSlot === slot.startTime ? undefined : slot.startTime
                  )
                }
                displayTime={displayTime}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
