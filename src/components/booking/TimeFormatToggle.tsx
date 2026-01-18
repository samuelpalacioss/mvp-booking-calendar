import { useState, useEffect } from 'react';
import { TimeFormat } from '../../lib/booking/date-utils';
import { DEFAULT_TIME_FORMAT } from '../../lib/booking/constants';

const TIME_FORMAT_STORAGE_KEY = 'booking-time-format';

interface TimeFormatToggleProps {
  value?: TimeFormat;
  onChange?: (format: TimeFormat) => void;
}

export function TimeFormatToggle({ value, onChange }: TimeFormatToggleProps) {
  const [format, setFormat] = useState<TimeFormat>(() => {
    if (value) return value;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(TIME_FORMAT_STORAGE_KEY);
      if (stored === '12h' || stored === '24h') {
        return stored;
      }
    }
    return DEFAULT_TIME_FORMAT;
  });

  useEffect(() => {
    if (value && value !== format) {
      setFormat(value);
    }
  }, [value, format]);

  const handleToggle = (newFormat: TimeFormat) => {
    setFormat(newFormat);
    if (typeof window !== 'undefined') {
      localStorage.setItem(TIME_FORMAT_STORAGE_KEY, newFormat);
    }
    onChange?.(newFormat);
  };

  return (
    <div className="inline-flex rounded-md bg-zinc-800 p-1">
      <button
        onClick={() => handleToggle('12h')}
        className={`rounded cursor-pointer px-3 py-1 text-sm font-medium transition-colors ${
          format === '12h'
            ? 'bg-zinc-700 text-white'
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        12 h
      </button>
      <button
        onClick={() => handleToggle('24h')}
        className={`rounded cursor-pointer px-3 py-1 text-sm font-medium transition-colors ${
          format === '24h'
            ? 'bg-zinc-700 text-white'
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        24hs
      </button>
    </div>
  );
}
