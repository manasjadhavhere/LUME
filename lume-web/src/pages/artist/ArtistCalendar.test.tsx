import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import ArtistCalendar from './ArtistCalendar';

const { execute, user } = vi.hoisted(() => ({
  execute: vi.fn(), user: { artistProfile: { id: 'artist-1', hourlyPrice: 1000 } },
}));
vi.mock('../../context/AuthContext', () => ({ useAuth: () => ({ user }) }));
vi.mock('../../hooks/useApi', () => ({ useApi: () => ({ execute, error: 'Save failed' }) }));
beforeEach(() => {
  execute.mockReset().mockImplementation(async (_path, options) => options.method === 'GET'
    ? { availability: [], defaultSchedule: [] } : null);
});
afterEach(cleanup);

it('never shows Saved when a template write fails', async () => {
  render(<ArtistCalendar />);
  await waitFor(() => expect(execute).toHaveBeenCalledTimes(1));
  fireEvent.click(screen.getByRole('button', { name: 'Save Template' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Save Template' })).toBeEnabled());
  expect(screen.queryByText('Saved!')).not.toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent('Save failed');
});

it('keeps the date override open so a failed save can be retried', async () => {
  render(<ArtistCalendar />);
  await waitFor(() => expect(execute).toHaveBeenCalledTimes(1));
  fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${new Date().getDate()} Off$`) }));
  fireEvent.click(screen.getByRole('button', { name: 'Save Override' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Save Override' })).toBeEnabled());
  expect(screen.queryByText('Saved!')).not.toBeInTheDocument();
});
