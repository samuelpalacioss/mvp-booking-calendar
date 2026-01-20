import { useState } from 'react';
import { CalendarDate } from '@internationalized/date';
import { ArrowLeft, Clock, Video, Calendar, Check } from 'lucide-react';
import { EventData } from '../../lib/booking/types';
import { formatTime, formatDuration } from '../../lib/booking/date-utils';
import { FileUpload } from '../file-uploads/FileUpload';

interface BookingConfirmationProps {
  event: EventData;
  selectedDate: CalendarDate;
  selectedSlot: string;
  timezone: string;
  onBack: () => void;
}

export function BookingConfirmation({
  event,
  selectedDate,
  selectedSlot,
  timezone,
  onBack,
}: BookingConfirmationProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const formattedDate = selectedDate.toDate(timezone).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedTime = formatTime(selectedSlot, '12h', 'es-ES', timezone);

  const handleConfirm = () => {
    // MVP: Just show success state, no backend
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 rounded-2xl p-8 text-center">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-green-500/20">
            <Check className="size-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">
            Reserva confirmada
          </h2>
          <p className="text-zinc-400 mb-6">
            Tu cita ha sido reservada exitosamente para el {formattedDate} a las {formattedTime}.
          </p>
          {uploadedFile && (
            <p className="text-sm text-zinc-500 mb-6">
              Archivo adjunto: {uploadedFile.name}
            </p>
          )}
          <button
            onClick={() => window.location.reload()}
            className="w-full rounded-lg bg-zinc-800 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            Hacer otra reserva
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-2xl p-4 md:p-8">
        {/* Header with back button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Volver
        </button>

        <div className="rounded-2xl bg-zinc-900 p-6 md:p-8">
          {/* Event title */}
          <h1 className="text-2xl font-semibold text-white mb-6">
            {event.title}
          </h1>

          {/* Booking details */}
          <div className="mb-8 space-y-4 rounded-xl bg-zinc-800/50 p-4">
            <div className="flex items-center gap-3 text-zinc-300">
              <Calendar className="size-5 text-zinc-500" />
              <span className="capitalize">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-300">
              <Clock className="size-5 text-zinc-500" />
              <span>{formattedTime} ({formatDuration(event.durationMinutes)})</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-300">
              <Video className="size-5 text-zinc-500" />
              <span>
                {event.meetingType === 'google_meet' && 'Google Meet'}
                {event.meetingType === 'zoom' && 'Zoom'}
                {event.meetingType === 'phone' && 'Llamada telefónica'}
                {event.meetingType === 'in_person' && 'Presencial'}
              </span>
            </div>
          </div>

          {/* Hosts */}
          {event.owners.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-zinc-400 mb-3">
                {event.owners.length > 1 ? 'Anfitriones' : 'Anfitrión'}
              </h3>
              <div className="flex flex-wrap gap-3">
                {event.owners.map((owner, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-full bg-zinc-800 px-3 py-1.5"
                  >
                    <div className="size-6 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-medium text-zinc-300">
                      {owner.name.charAt(0)}
                    </div>
                    <span className="text-sm text-zinc-300">{owner.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File upload section */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-zinc-400 mb-3">
              Adjuntar archivo (opcional)
            </h3>
            <FileUpload
              maxSizeMB={5}
              onFileSelected={setUploadedFile}
            />
          </div>

          {/* Confirm button */}
          <button
            onClick={handleConfirm}
            className="w-full rounded-lg bg-white px-6 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Confirmar reserva
          </button>

          {event.requiresConfirmation && (
            <p className="mt-4 text-center text-xs text-zinc-500">
              Esta reserva requiere confirmación del anfitrión
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
