import {
  CalendarDate,
  parseDate,
  parseZonedDateTime,
  today,
  getLocalTimeZone,
  ZonedDateTime,
  toCalendarDate,
} from '@internationalized/date';

export type TimeFormat = '12h' | '24h';

/**
 * Format a ZonedDateTime to time string based on the selected format
 * Uses Intl.DateTimeFormat for proper localization
 *
 * @param dateTime - ZonedDateTime object or datetime string
 * @param format - Time format ('12h' or '24h')
 * @param locale - Locale string for formatting
 * @param timezone - Optional timezone to apply to plain datetime strings
 */
export function formatTime(
  dateTime: ZonedDateTime | string,
  format: TimeFormat = '12h',
  locale: string = 'es-ES',
  timezone?: string
): string {
  try {
    let dt: ZonedDateTime;

    if (typeof dateTime === 'string') {
      // If timezone is provided and the string doesn't include timezone annotation,
      // add it before parsing
      if (timezone && !dateTime.includes('[')) {
        dt = parseZonedDateTime(`${dateTime}[${timezone}]`);
      } else {
        dt = parseZonedDateTime(dateTime);
      }
    } else {
      dt = dateTime;
    }

    return dt.toDate().toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: format === '12h',
    });
  } catch {
    // Fallback for invalid datetime strings
    return '--:--';
  }
}

/**
 * Format a CalendarDate for display using Intl.DateTimeFormat
 * @param date - CalendarDate object
 * @param locale - Locale string (default: 'es-ES')
 * @returns Formatted date string (e.g., "dom 18")
 */
export function formatCalendarDate(
  date: CalendarDate,
  locale: string = 'es-ES'
): string {
  return date.toDate(getLocalTimeZone()).toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
  });
}

/**
 * Convert CalendarDate to ISO date string (YYYY-MM-DD)
 * Uses built-in toString() method
 */
export function calendarDateToISO(date: CalendarDate): string {
  return date.toString();
}

/**
 * Parse ISO date string to CalendarDate
 * Returns today's date if parsing fails
 */
export function parseISODate(dateStr: string | undefined): CalendarDate {
  if (!dateStr) {
    return today(getLocalTimeZone());
  }

  try {
    return parseDate(dateStr);
  } catch {
    return today(getLocalTimeZone());
  }
}

/**
 * Format duration in minutes to readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Convert ZonedDateTime to CalendarDate
 */
export function zonedDateTimeToCalendarDate(
  dateTime: ZonedDateTime
): CalendarDate {
  return toCalendarDate(dateTime);
}

/**
 * Get current date in local timezone
 */
export function getTodayInLocalTimezone(): CalendarDate {
  return today(getLocalTimeZone());
}

/**
 * Check if a CalendarDate is in the past
 * Compares the date with today's date in local timezone
 */
export function isDateInPast(date: CalendarDate): boolean {
  const todayDate = today(getLocalTimeZone());
  return date.compare(todayDate) < 0;
}

/**
 * Check if a CalendarDate is today
 * Compares the date with today's date in local timezone
 */
export function isToday(date: CalendarDate): boolean {
  const todayDate = today(getLocalTimeZone());
  return date.compare(todayDate) === 0;
}

/**
 * Check if a CalendarDate is more than 10 days before today
 * Used to hide dates that are too far in the past
 */
export function isMoreThan10DaysAgo(date: CalendarDate): boolean {
  const todayDate = today(getLocalTimeZone());
  // Calculate the date 10 days ago
  const tenDaysAgo = todayDate.subtract({ days: 10 });
  return date.compare(tenDaysAgo) < 0;
}

/**
 * Convert year and month to YYYY-MM format string
 * @param year - Full year (e.g., 2026)
 * @param month - Month (1-12)
 * @returns YYYY-MM format string (e.g., "2026-01")
 */
export function yearMonthToString(year: number, month: number): string {
  const monthStr = month.toString().padStart(2, '0');
  return `${year}-${monthStr}`;
}

/**
 * Parse YYYY-MM format string to { year, month }
 * Returns null if parsing fails or month is invalid
 * @param monthStr - YYYY-MM format string (e.g., "2026-01")
 * @returns { year, month } or null if invalid
 */
export function parseYearMonth(monthStr: string): { year: number; month: number } | null {
  const match = monthStr.match(/^(\d{4})-(\d{2})$/);
  if (!match) return null;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);

  // Validate month range (1-12)
  if (month < 1 || month > 12) return null;

  return { year, month };
}

/**
 * Extract year-month from a CalendarDate
 * @param date - CalendarDate object
 * @returns YYYY-MM format string (e.g., "2026-01")
 */
export function calendarDateToYearMonth(date: CalendarDate): string {
  return yearMonthToString(date.year, date.month);
}
