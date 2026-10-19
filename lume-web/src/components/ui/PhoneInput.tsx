import React, { useState } from 'react';
import './PhoneInput.css';

export interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  countryCode?: string;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  containerClassName?: string;
  ariaLabel?: string;
}

/**
 * Standardizes a raw phone number input to extract just the 10 subscriber digits
 */
export function extract10Digits(val: string): string {
  if (!val) return '';
  let digits = val.replace(/\D/g, '');

  // Strip leading international 91 if full number was supplied
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  return digits.slice(0, 10);
}

/**
 * Formats 10 digits into "98765 43210" for human readability
 */
export function formatPhoneNumber(digits: string): string {
  if (digits.length > 5) {
    return `${digits.slice(0, 5)} ${digits.slice(5, 10)}`;
  }
  return digits;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = '98765 43210',
  countryCode = '+91',
  id,
  name,
  required = false,
  disabled = false,
  autoFocus = false,
  className = '',
  containerClassName = '',
  ariaLabel = 'Phone number',
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Maintain internal formatted display string
  const cleanDigits = extract10Digits(value || '');
  const displayValue = formatPhoneNumber(cleanDigits);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;
    const digits = extract10Digits(rawInput);
    // Emit the clean digits to parent
    onChange(digits);
  };

  return (
    <div
      className={`lume-phone-input-wrap ${isFocused ? 'is-focused' : ''} ${
        disabled ? 'is-disabled' : ''
      } ${containerClassName}`}
    >
      <div className="lume-phone-input__prefix" aria-hidden="true">
        <span className="lume-phone-input__code">{countryCode}</span>
        <span className="lume-phone-input__separator" />
      </div>

      <input
        type="tel"
        inputMode="numeric"
        id={id}
        name={name}
        required={required}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={displayValue}
        onChange={handleInputChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`lume-phone-input__field ${className}`}
        maxLength={11} // Allows for the single separator space in "98765 43210"
      />
    </div>
  );
};

export default PhoneInput;
