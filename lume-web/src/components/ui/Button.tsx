import React from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  ariaLabel?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled = false,
  ariaLabel,
  ...props
}) => {
  const classNames = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    disabled ? 'btn-disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button 
      className={classNames} 
      disabled={disabled} 
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
