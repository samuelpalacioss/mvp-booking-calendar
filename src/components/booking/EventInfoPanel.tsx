import { CheckSquare, Clock, Video, MapPin } from 'lucide-react';
import { EventData } from '../../lib/booking/types';
import { TimezoneSelector } from './TimezoneSelector';
import { formatDuration } from '../../lib/booking/date-utils';

interface EventInfoPanelProps {
  event: EventData;
  timezone: string;
  onTimezoneChange: (timezone: string) => void;
}

const MEETING_TYPE_ICONS = {
  google_meet: Video,
  zoom: Video,
  phone: MapPin,
  in_person: MapPin,
};

const MEETING_TYPE_LABELS = {
  google_meet: 'Google Meet',
  zoom: 'Zoom',
  phone: 'Teléfono',
  in_person: 'Presencial',
};

export function EventInfoPanel({
  event,
  timezone,
  onTimezoneChange,
}: EventInfoPanelProps) {
  const MeetingIcon = MEETING_TYPE_ICONS[event.meetingType];
  const meetingLabel = MEETING_TYPE_LABELS[event.meetingType];

  return (
    <div className="bg-transparent p-6 md:rounded-l-lg md:border-b-0 md:border-r md:border-zinc-800 md:bg-zinc-900">
      <div className="space-y-4">
        {/* Avatar and Owner name on same row */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
            <span className="text-sm font-medium text-white">
              {event.owners[0]?.name?.charAt(0) || 'D'}
            </span>
          </div>
          <div className="text-sm text-zinc-400">
            {event.owners.map((owner, i) => (
              <span key={i}>
                {owner.name}
                {owner.role && ` (${owner.role})`}
                {i < event.owners.length - 1 && ' + '}
              </span>
            ))}
          </div>
        </div>

        {/* Event title */}
        <h2 className="text-xl font-semibold text-white">{event.title}</h2>

        {/* Requires confirmation */}
        {event.requiresConfirmation && (
          <div className="flex items-center gap-2 text-sm text-zinc-300">
            <CheckSquare className="h-4 w-4" />
            <span>Requiere confirmación</span>
          </div>
        )}

        {/* Duration */}
        <div className="flex items-center gap-2 text-sm text-zinc-300">
          <Clock className="h-4 w-4" />
          <span>{formatDuration(event.durationMinutes)}</span>
        </div>

        {/* Meeting type */}
        <div className="flex items-center gap-2 text-sm text-zinc-300">
          <MeetingIcon className="h-4 w-4" />
          <span>{meetingLabel}</span>
        </div>

        {/* Timezone selector */}
        <TimezoneSelector value={timezone} onChange={onTimezoneChange} />
      </div>
    </div>
  );
}
