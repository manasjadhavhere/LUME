import React from 'react';
import type { TimeSlot } from '../../data/types';
import './TimeSlotGrid.css';

interface TimeSlotGridProps {
  slots: TimeSlot[];
  selectedSlot: string | null;
  onSlotSelect: (time: string) => void;
}

const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({
  slots,
  selectedSlot,
  onSlotSelect
}) => {
  const handleSlotClick = (slot: TimeSlot) => {
    // Only allow selection of available slots
    if (slot.available) {
      onSlotSelect(slot.time);
    }
  };

  return (
    <div className="time-slot-grid">
      <div className="time-slot-grid__container" role="listbox" aria-label="Select a time slot">
        {slots.map((slot) => (
          <button
            key={slot.time}
            className={`time-slot-grid__slot ${
              slot.available ? 'time-slot-grid__slot--available' : 'time-slot-grid__slot--taken'
            } ${selectedSlot === slot.time ? 'time-slot-grid__slot--selected' : ''}`}
            onClick={() => handleSlotClick(slot)}
            disabled={!slot.available}
            role="option"
            aria-selected={selectedSlot === slot.time && slot.available}
            aria-disabled={!slot.available}
            aria-label={`${slot.time} - ${slot.available ? 'available' : 'taken'}`}
            title={`${slot.time} - ${slot.available ? 'available' : 'taken'}`}
          >
            <span className="time-slot-grid__time">{slot.time}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeSlotGrid;
