export interface EventData {
  id: string;
  slug: string;
  title: string;
  durationMinutes: number;
  meetingType: 'google_meet' | 'zoom' | 'phone' | 'in_person';
  requiresConfirmation: boolean;
  owners: Array<{ name: string; avatarUrl?: string; role?: string }>;
}

export interface TimeSlot {
  startTime: string; // "09:00" or ISO datetime
  endTime: string;
  available: boolean;
}

export interface BookingSearchParams {
  layout?: 'month' | 'week' | 'day';
  date?: string; // "2026-01-18"
  slot?: string; // ISO datetime UTC
}
