import { TimeSlot } from '../../lib/booking/types';

interface TimeSlotButtonProps {
  slot: TimeSlot;
  isSelected: boolean;
  onClick: () => void;
  displayTime: string;
}

export function TimeSlotButton({
  slot,
  isSelected,
  onClick,
  displayTime,
}: TimeSlotButtonProps) {
  if (!slot.available) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className={`w-full cursor-pointer rounded-lg px-4 py-3 text-center text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
        isSelected
          ? 'bg-zinc-700 text-white'
          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
      }`}
    >
      {displayTime}
    </button>
  );
}
