import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import GeoLocationInput from './GeoLocationInput';
import { searchOfflineLocations } from '../../data/indianGeoLocations';
import { readRecentLocations, rememberLocation } from '../../utils/geoCoding';

const location = { city: 'Mumbai', sublocality: 'Bandra West', formattedAddress: 'Bandra West, Mumbai, Maharashtra', source: 'photon' as const };
function Harness() { const [value, setValue] = useState(''); return <GeoLocationInput value={value} onChange={setValue} />; }
beforeEach(() => { vi.useFakeTimers(); localStorage.clear(); vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: { results: [location], source: 'photon' } }) })); });
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('location picker', () => {
  it('debounces search and supports keyboard selection with a structured result', async () => {
    render(<Harness />); const input = screen.getByRole('combobox');
    fireEvent.focus(input); fireEvent.change(input, { target: { value: 'Bandra' } });
    expect(fetch).not.toHaveBeenCalled();
    await act(async () => { await vi.advanceTimersByTimeAsync(300); });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('option', { name: /Bandra West/ })).toBeVisible();
    fireEvent.keyDown(input, { key: 'ArrowDown' }); fireEvent.keyDown(input, { key: 'Enter' });
    expect(input).toHaveValue(location.formattedAddress); expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(readRecentLocations()[0].city).toBe('Mumbai');
  });
  it('ignores a stale result when a newer query has been typed', async () => {
    let resolveFirst: (value: unknown) => void = () => {};
    vi.mocked(fetch).mockImplementationOnce(() => new Promise(resolve => { resolveFirst = resolve; }));
    render(<Harness />); const input = screen.getByRole('combobox'); fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Del' } }); await act(async () => { await vi.advanceTimersByTimeAsync(300); });
    fireEvent.change(input, { target: { value: 'Bandra' } }); await act(async () => { await vi.advanceTimersByTimeAsync(300); });
    await act(async () => { resolveFirst({ ok: true, json: async () => ({ data: { results: [{ ...location, city: 'Delhi', sublocality: undefined, formattedAddress: 'Delhi' }], source: 'photon' } }) }); });
    expect(screen.getByRole('option', { name: /Bandra West/ })).toBeVisible(); expect(screen.queryByRole('option', { name: 'Delhi Delhi' })).not.toBeInTheDocument();
  });
  it('falls back to local city and locality suggestions on network failure', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('offline')); render(<Harness />);
    fireEvent.focus(screen.getByRole('combobox')); fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Koregaon' } });
    await act(async () => { await vi.advanceTimersByTimeAsync(300); });
    expect(screen.getByRole('option', { name: /Koregaon Park/ })).toBeVisible(); expect(screen.getByRole('status')).toHaveTextContent('Live search is unavailable');
  });
  it('shows a recoverable message when GPS permission is denied', async () => {
    Object.defineProperty(navigator, 'geolocation', { configurable: true, value: { getCurrentPosition: (_ok: unknown, fail: (e: { code: number }) => void) => fail({ code: 1 }) } });
    render(<Harness />); fireEvent.focus(screen.getByRole('combobox'));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Use my current location/ })); });
    expect(screen.getByRole('status')).toHaveTextContent('permission was denied'); expect(screen.getByRole('combobox')).not.toBeDisabled();
  });
  it('closes on Escape and does not open disabled profile fields', () => {
    render(<Harness />); const input = screen.getByRole('combobox'); fireEvent.focus(input); fireEvent.keyDown(input, { key: 'Escape' }); expect(input).toHaveAttribute('aria-expanded', 'false');
    cleanup(); render(<GeoLocationInput value="Mumbai" onChange={vi.fn()} disabled />); expect(screen.getByRole('combobox')).toBeDisabled();
  });
  it('handles corrupt local storage and canonical city aliases', () => {
    localStorage.setItem('lume_recent_locations_v1', 'broken'); expect(readRecentLocations()).toEqual([]);
    rememberLocation(location); rememberLocation(location); expect(readRecentLocations()).toHaveLength(1);
    expect(searchOfflineLocations('Bangalore').some(r => /Bengaluru|Bangalore/i.test(r.city))).toBe(true);
  });
});
