import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { adminUser, fixtureFetch } from '../../test/overhaulFixtures';
import AdminDashboard from './AdminDashboard';
vi.mock('recharts', () => ({ ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, AreaChart: () => <div />, Area: () => null, LineChart: () => null, Line: () => null, PieChart: () => null, Pie: () => null, Cell: () => null, XAxis: () => null, YAxis: () => null, CartesianGrid: () => null, Tooltip: () => null, Legend: () => null }));
beforeEach(() => { vi.stubGlobal('fetch', vi.fn(fixtureFetch)); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
function renderAdmin() { return render(<MemoryRouter><AuthContext.Provider value={{ user: adminUser, token: 'qa', isLoading: false, isAuthenticated: true, login: vi.fn(), loginWithGoogle: vi.fn(), register: vi.fn(), logout: vi.fn(), updateUser: vi.fn(), refreshUser: vi.fn() }}><AdminDashboard /></AuthContext.Provider></MemoryRouter>); }
it('loads actual insights, filters artists and opens the management dialog', async () => {
  renderAdmin(); expect(await screen.findByText('Service GMV')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: /Artists & verifications/ }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Search artists' }), { target: { value: 'Mira' } });
  expect(screen.getByText('Mira Kapoor')).toBeVisible(); expect(screen.queryByText('Ananya Mehra')).not.toBeInTheDocument();
  fireEvent.click(screen.getByTitle('Manage Artist'));
  expect(screen.getByRole('dialog')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Edit Profile Details' }));
  expect(screen.getByRole('combobox', { name: 'Location' })).toHaveValue('Indiranagar, Bengaluru, Karnataka');
  fireEvent.keyDown(document, { key: 'Escape' }); expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
it('shows client history, payout details and the operational activity view', async () => {
  renderAdmin(); await screen.findByText('Service GMV');
  fireEvent.click(screen.getByRole('button', { name: 'Clients' })); fireEvent.click(screen.getByText('View history'));
  expect(screen.getByRole('dialog', { name: 'Client booking history' })).toBeVisible(); expect(screen.getByText(/WEDDING/)).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Close client history' }));
  fireEvent.click(screen.getByRole('button', { name: 'Payments & receipts' })); fireEvent.click(screen.getByText('View Details'));
  expect(await screen.findByText('Booking Payments')).toBeVisible(); expect(screen.getByRole('button', { name: /Mark Payout Done/ })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'Close payment details' }));
  fireEvent.click(screen.getByRole('button', { name: 'Activity logs' })); expect(await screen.findByText('Behind every booking.')).toBeVisible();
  fireEvent.change(screen.getByRole('combobox', { name: 'Activity type' }), { target: { value: 'payout' } });
  await waitFor(() => expect(screen.getByText('Payout completed')).toBeVisible()); expect(screen.queryByText('Booking created')).not.toBeInTheDocument();
});
it('exposes a retry when workspace requests fail rather than spinning indefinitely', async () => {
  vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ message: 'Service unavailable' }), { status: 503 }));
  renderAdmin(); expect(await screen.findByRole('alert')).toHaveTextContent('Some workspace data could not be loaded');
  expect(screen.getByRole('button', { name: 'Retry' })).toBeEnabled();
});
