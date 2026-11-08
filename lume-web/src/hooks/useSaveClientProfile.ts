import { useAuth, type AuthUser, type ClientProfile } from '../context/AuthContext';
import { apiFetch } from './useApi';

export function useSaveClientProfile() {
  const { user, token, updateUser } = useAuth();
  return async (fields: Pick<ClientProfile, 'savedAddresses' | 'beautyPreferences'>) => {
    if (!token || user?.role !== 'CLIENT') throw new Error('Sign in as a client to save your profile.');
    const saved = await apiFetch<AuthUser>('/api/auth/me', {
      method: 'PUT', token, body: {
        ...fields,
        ...(fields.savedAddresses && { previousAddresses: user.clientProfile?.savedAddresses ?? [] }),
      },
    });
    updateUser(saved);
  };
}
