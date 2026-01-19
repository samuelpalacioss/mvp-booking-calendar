import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';
import { BookingCalendar } from '../../components/booking/BookingCalendar';
import { EventData } from '../../lib/booking/types';
import { getTodayInLocalTimezone, yearMonthToString, parseISODate } from '../../lib/booking/date-utils';

const bookingSearchSchema = z.object({
  layout: z.enum(['month', 'week', 'day']).optional().default('month'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  // Slot format: ISO datetime without timezone (e.g. "2026-01-20T16:00:00")
  slot: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/).optional(),
  // Month format: YYYY-MM (e.g. "2026-01")
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
});

// Mock event data - in a real app, this would be fetched from an API
const MOCK_EVENTS: Record<string, EventData> = {
  'delty-demo': {
    id: '1',
    slug: 'delty-demo',
    title: 'Book Delty Demo',
    durationMinutes: 20,
    meetingType: 'google_meet',
    requiresConfirmation: true,
    owners: [
      {
        name: 'Lalit',
        role: 'Delty Founders',
      },
      {
        name: 'Catherine',
        role: 'Delty Founders',
      },
    ],
  },
};

export const Route = createFileRoute('/book/$eventSlug')({
  validateSearch: bookingSearchSchema,
  beforeLoad: ({ search, params }) => {
    // Ensure month parameter is always present in URL
    if (!search.month) {
      // Derive month from date param if available, otherwise use current month
      let monthStr: string;
      if (search.date) {
        const date = parseISODate(search.date);
        monthStr = yearMonthToString(date.year, date.month);
      } else {
        const today = getTodayInLocalTimezone();
        monthStr = yearMonthToString(today.year, today.month);
      }

      // Redirect to include month parameter
      throw redirect({
        to: '/book/$eventSlug',
        params: { eventSlug: params.eventSlug },
        search: (prev) => ({ ...prev, month: monthStr }),
      });
    }
  },
  component: BookingPage,
});

function BookingPage() {
  const { eventSlug } = Route.useParams();

  // Get event data or use default
  const event = MOCK_EVENTS[eventSlug] || {
    id: eventSlug,
    slug: eventSlug,
    title: `Book ${eventSlug}`,
    durationMinutes: 30,
    meetingType: 'google_meet' as const,
    requiresConfirmation: false,
    owners: [{ name: 'Demo User' }],
  };

  return <BookingCalendar eventSlug={eventSlug} event={event} />;
}
