import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { COMMON_TIMEZONES } from '../../lib/booking/constants';

interface TimezoneSelectorProps {
  value: string;
  onChange: (timezone: string) => void;
}

export function TimezoneSelector({ value, onChange }: TimezoneSelectorProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-zinc-300">
      <Globe className="h-4 w-4 shrink-0" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-auto border-none bg-transparent p-0 shadow-none hover:text-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-80">
          {COMMON_TIMEZONES.map((tz) => (
            <SelectItem key={tz.value} value={tz.value}>
              {tz.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
