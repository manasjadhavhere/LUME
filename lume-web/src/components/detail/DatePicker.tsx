import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './DatePicker.css';

interface DateChip {
  date: Date;
  dayName: string;
  dayNumber: number;
}

interface DatePickerProps {
  dates: DateChip[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({
  dates,
  selectedDate,
  onDateSelect
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to selected date on mount/change
  useEffect(() => {
    if (!scrollRef.current || !selectedDate) return;

    const dateString = selectedDate.toISOString().split('T')[0];
    const selectedElement = scrollRef.current.querySelector(
      `[data-date="${dateString}"]`
    );

    if (selectedElement) {
      selectedElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [selectedDate]);

  const isDateSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return (
      date.getFullYear() === selectedDate.getFullYear() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getDate() === selectedDate.getDate()
    );
  };

  const getMonthYear = () => {
    if (dates.length === 0) return '';
    const dateToUse = selectedDate || dates[0].date;
    return dateToUse.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="date-picker">
      <div className="date-picker__header">
        <button className="date-picker__arrow" aria-label="Previous month">
          <ChevronLeft size={20} />
        </button>
        <div className="date-picker__month-year">{getMonthYear()}</div>
        <button className="date-picker__arrow" aria-label="Next month">
          <ChevronRight size={20} />
        </button>
      </div>

      <div
        className="date-picker__scroll"
        ref={scrollRef}
        role="listbox"
        aria-label="Select a date"
      >
        {dates.map((dateChip) => {
          const isSelected = isDateSelected(dateChip.date);
          return (
            <button
              key={dateChip.date.toISOString()}
              data-date={dateChip.date.toISOString().split('T')[0]}
              className={`date-picker__chip ${
                isSelected ? 'date-picker__chip--selected' : ''
              }`}
              onClick={() => onDateSelect(dateChip.date)}
              role="option"
              aria-selected={isSelected}
              aria-label={`${dateChip.dayName}, ${dateChip.dayNumber}`}
              title={`${dateChip.dayName}, ${dateChip.dayNumber}`}
            >
              <div className="date-picker__day-name">{dateChip.dayName}</div>
              <div className="date-picker__day-number-wrapper">
                <div className="date-picker__day-number">{dateChip.dayNumber}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DatePicker;
