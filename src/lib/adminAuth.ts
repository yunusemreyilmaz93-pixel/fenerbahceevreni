/**
 * Admin API istekleri için Authorization header üretir.
 * Firebase: verified ID token
 */
import { auth, isFirebaseConfigured } from './firebase';

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


  throw new Error('Yönetici oturumu bulunamadı. Lütfen admin girişi yapın.');
}

