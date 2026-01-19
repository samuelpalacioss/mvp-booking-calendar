import { useQuery } from '@tanstack/react-query';
import { CalendarDate } from '@internationalized/date';
import { TimeSlot } from '../../lib/booking/types';
import { calendarDateToISO } from '../../lib/booking/date-utils';

interface UseAvailableSlotsOptions {
  eventSlug: string;
  date: CalendarDate;
  timezone: string;
}

// Mock user schedule: Define specific dates with their available time slots
// This represents a user's actual availability
interface MockUserSchedule {
  date: string; // YYYY-MM-DD format
  timeSlots: string[]; // Array of time strings in HH:mm format
}

const MOCK_USER_SCHEDULE: MockUserSchedule[] = [
  // January 2026 - first 16 days with various time slots
  { date: '2026-01-18', timeSlots: ['09:00', '09:30', '10:00', '11:00', '11:30', '12:00', '12:30', '13:00'] },
  { date: '2026-01-19', timeSlots: ['09:30', '10:30', '14:00', '14:30', '15:00'] },
  { date: '2026-01-20', timeSlots: ['10:00', '11:00', '15:30', '16:00'] },
  { date: '2026-01-21', timeSlots: ['09:00', '10:30', '11:30', '13:00', '14:00'] },
  { date: '2026-01-22', timeSlots: ['09:30', '10:00', '11:00', '12:30', '15:00'] },
  { date: '2026-01-23', timeSlots: ['10:00', '11:30', '13:00', '14:30', '16:00'] },
  { date: '2026-01-24', timeSlots: ['09:00', '10:30', '12:00', '13:30', '15:00'] },
  { date: '2026-01-25', timeSlots: ['09:30', '11:00', '12:30', '14:00', '15:30'] },
  { date: '2026-01-26', timeSlots: ['10:00', '11:30', '13:00', '14:30'] },
  { date: '2026-01-27', timeSlots: ['09:00', '10:30', '12:00', '15:00', '16:00'] },
  { date: '2026-01-28', timeSlots: ['09:30', '11:00', '13:30', '14:30'] },
  { date: '2026-01-29', timeSlots: ['10:00', '11:30', '12:30', '14:00', '15:30'] },
  { date: '2026-01-30', timeSlots: ['09:00', '10:30', '13:00', '14:30', '16:00'] },
  { date: '2026-01-31', timeSlots: ['09:30', '11:00', '12:00', '15:00'] },
  // February 2026 - first 16 days
  { date: '2026-02-01', timeSlots: ['09:00', '10:00', '11:30', '13:00', '14:00'] },
  { date: '2026-02-02', timeSlots: ['09:30', '10:30', '12:00', '13:30', '15:00'] },
  { date: '2026-02-03', timeSlots: ['10:00', '11:00', '12:30', '14:30', '16:00'] },
  { date: '2026-02-04', timeSlots: ['09:00', '10:30', '11:30', '13:00', '14:00'] },
  { date: '2026-02-05', timeSlots: ['09:30', '11:00', '12:00', '15:00', '15:30'] },
  { date: '2026-02-06', timeSlots: ['10:00', '11:30', '13:00', '14:30', '16:00'] },
  { date: '2026-02-07', timeSlots: ['09:00', '10:30', '12:00', '13:30', '15:00'] },
  { date: '2026-02-08', timeSlots: ['09:30', '11:00', '12:30', '14:00', '15:30'] },
  { date: '2026-02-09', timeSlots: ['10:00', '11:30', '13:00', '14:30'] },
  { date: '2026-02-10', timeSlots: ['09:00', '10:30', '12:00', '15:00', '16:00'] },
  { date: '2026-02-11', timeSlots: ['09:30', '11:00', '13:30', '14:30'] },
  { date: '2026-02-12', timeSlots: ['10:00', '11:30', '12:30', '14:00', '15:30'] },
  { date: '2026-02-13', timeSlots: ['09:00', '10:30', '13:00', '14:30', '16:00'] },
  { date: '2026-02-14', timeSlots: ['09:30', '11:00', '12:00', '15:00'] },
  { date: '2026-02-15', timeSlots: ['10:00', '11:30', '13:00', '14:00'] },
  { date: '2026-02-16', timeSlots: ['09:00', '10:30', '12:30', '13:30', '15:00'] },
];

// Mock data generator for time slots
// Only returns slots for dates that exist in MOCK_USER_SCHEDULE
function generateMockSlots(date: CalendarDate, timezone: string): TimeSlot[] {
  const dateStr = calendarDateToISO(date);
  
  // Find the schedule entry for this date
  const scheduleEntry = MOCK_USER_SCHEDULE.find(entry => entry.date === dateStr);
  
  // If date is not in the schedule, return empty array (no slots available)
  if (!scheduleEntry) {
    return [];
  }

  // Generate slots from the defined time slots for this date
  // Store slots without timezone annotation - timezone is managed separately in localStorage
  const slots: TimeSlot[] = scheduleEntry.timeSlots.map(timeStr => {
    const dateTime = `${dateStr}T${timeStr}:00`;

    return {
      startTime: dateTime,
      endTime: dateTime, // In real app, this would be +duration
      available: true, // All slots in the schedule are available
    };
  });

  return slots;
}

// Generate available dates based on MOCK_USER_SCHEDULE
// Only dates that have time slots are considered available
function generateAvailableDates(year: number, month: number): Set<string> {
  const dates = new Set<string>();

  // Filter schedule entries for the requested month/year
  MOCK_USER_SCHEDULE.forEach(entry => {
    const entryDate = new Date(entry.date);
    // Check if this entry belongs to the requested month/year
    if (entryDate.getFullYear() === year && entryDate.getMonth() + 1 === month) {
      dates.add(entry.date);
    }
  });

  return dates;
}

export function useAvailableSlots({
  eventSlug,
  date,
  timezone,
}: UseAvailableSlotsOptions) {
  return useQuery({
    queryKey: ['availableSlots', eventSlug, calendarDateToISO(date), timezone],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      return generateMockSlots(date, timezone);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useAvailableDates(eventSlug: string, year: number, month: number) {
  return useQuery({
    queryKey: ['availableDates', eventSlug, year, month],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 200));

      return generateAvailableDates(year, month);
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
