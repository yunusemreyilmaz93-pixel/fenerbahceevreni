/**
 * Admin API istekleri için Authorization header üretir.
 * Firebase canlı: ID token · mock: mock-admin-token-for-{email}
 */
import { auth, isFirebaseConfigured, getCurrentAdminUser } from './firebase';

export async function getAdminAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (isFirebaseConfigured && auth?.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
      return headers;
    } catch (e) {
      console.error('getIdToken failed', e);
    }
  }

  const mockUser = getCurrentAdminUser();
  if (mockUser?.email) {
    headers['Authorization'] = `Bearer mock-admin-token-for-${mockUser.email}`;
    return headers;
  }

  throw new Error('Yönetici oturumu bulunamadı. Lütfen admin girişi yapın.');
}
