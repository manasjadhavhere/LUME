import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button Component', () => {
  test('renders with correct content', () => {
    const { getByRole } = render(
      <Button variant="primary">Click me</Button>
    );
    
    const button = getByRole('button');
    expect(button).toHaveTextContent('Click me');
  });

  test('applies primary variant CSS classes', () => {
    const { getByRole } = render(
      <Button variant="primary">Primary</Button>
    );
    expect(getByRole('button')).toHaveClass('btn', 'btn-primary', 'btn-md');
  });

  test('applies secondary variant CSS classes', () => {
    const { getByRole } = render(
      <Button variant="secondary">Secondary</Button>
    );
    expect(getByRole('button')).toHaveClass('btn', 'btn-secondary', 'btn-md');
  });

  test('applies ghost variant CSS classes', () => {
    const { getByRole } = render(
      <Button variant="ghost">Ghost</Button>
    );
    expect(getByRole('button')).toHaveClass('btn', 'btn-ghost', 'btn-md');
  });

  test('applies small size CSS classes', () => {
    const { getByRole } = render(
      <Button size="sm">Small</Button>
    );
    expect(getByRole('button')).toHaveClass('btn-sm');
  });

  test('applies medium size CSS classes', () => {
    const { getByRole } = render(
      <Button size="md">Medium</Button>
    );
    expect(getByRole('button')).toHaveClass('btn-md');
  });

  test('applies large size CSS classes', () => {
    const { getByRole } = render(
      <Button size="lg">Large</Button>
    );
    expect(getByRole('button')).toHaveClass('btn-lg');
  });

  test('handles click events', async () => {
    const user = userEvent.setup();
    let clicked = false;
    
    const { getByRole } = render(
      <Button onClick={() => { clicked = true; }}>
        Click me
      </Button>
    );
    
    const button = getByRole('button');
    await user.click(button);
    
    expect(clicked).toBe(true);
  });

  test('disabled state prevents interaction', async () => {
    const user = userEvent.setup();
    let clicked = false;
    
    const { getByRole } = render(
      <Button disabled onClick={() => { clicked = true; }}>
        Disabled
      </Button>
    );
    
    const button = getByRole('button');
    expect(button).toBeDisabled();
    
    await user.click(button);
    expect(clicked).toBe(false);
  });
});