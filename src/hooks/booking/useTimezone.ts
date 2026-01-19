import { useState } from 'react';
import { getLocalTimeZone } from '@internationalized/date';

const TIMEZONE_STORAGE_KEY = 'booking-preferred-timezone';

export interface UseTimezoneReturn {
  timezone: string;
  setTimezone: (tz: string) => void;
  detectedTimezone: string;
}

/**
 * Hook to manage timezone detection and persistence
 * Stores user's timezone preference in localStorage only (not in URL params)
 */
export function useTimezone(): UseTimezoneReturn {
  const detectedTimezone = getLocalTimeZone();

  const [timezone, setTimezoneState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(TIMEZONE_STORAGE_KEY);
      if (stored) {
        return stored;
      }
    }

    return detectedTimezone;
  });

  const setTimezone = (tz: string) => {
    setTimezoneState(tz);
    if (typeof window !== 'undefined') {
      localStorage.setItem(TIMEZONE_STORAGE_KEY, tz);
    }
  };

  return {
    timezone,
    setTimezone,
    detectedTimezone,
  };
}
