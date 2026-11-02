import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { useApi } from './useApi';

afterEach(() => { cleanup(); localStorage.clear(); vi.unstubAllGlobals(); });

it('keeps execute stable when the user profile changes without a token change', async () => {
  localStorage.clear();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { token: 'test-token', user: {
    id: 'client-1', name: 'Before', email: 'client@example.test', role: 'CLIENT',
  } } }))));
  const callbacks: unknown[] = [];
  let auth!: ReturnType<typeof useAuth>;
  function Harness() {
    auth = useAuth();
    callbacks.push(useApi().execute);
    return <span>{auth.user?.name}</span>;
  }
  render(<AuthProvider><Harness /></AuthProvider>);
  await act(async () => { await auth.login('client@example.test', 'password'); });
  const execute = callbacks.at(-1);
  act(() => { auth.updateUser({ name: 'After' }); });
  expect(screen.getByText('After')).toBeVisible();
  expect(callbacks.at(-1)).toBe(execute);
});
