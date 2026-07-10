/**
 * Client helpers for rate-limited / secured backend endpoints.
 * Prefer these for public writes (forms, votes) over direct Firestore when API is up.
 */
import { auth } from './firebase';

async function parseJsonSafe(res: Response): Promise<any> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function getIdTokenOptional(): Promise<string | null> {
  try {
    if (!auth?.currentUser) return null;
    return await auth.currentUser.getIdToken();
  } catch {
    return null;
  }
}

export async function getIdTokenRequired(): Promise<string> {
  if (!auth?.currentUser) {
    throw new Error('Oturum gerekli. Lütfen sayfayı yenileyip tekrar deneyin.');
  }
  return auth.currentUser.getIdToken();
}

/** POST JSON to same-origin API. */
export async function securePost(
  path: string,
  body: Record<string, unknown>,
  options?: { auth?: boolean }
): Promise<{ ok: boolean; status: number; data: any }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (options?.auth) {
    headers.Authorization = `Bearer ${await getIdTokenRequired()}`;
  }

  const res = await fetch(path, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const data = await parseJsonSafe(res);
  return { ok: res.ok, status: res.status, data };
}

export async function apiCastPollVote(
  pollId: string,
  optionId: string
): Promise<void> {
  const { ok, status, data } = await securePost(
    `/api/v1/polls/${encodeURIComponent(pollId)}/vote`,
    { optionId },
    { auth: true }
  );
  if (ok) return;
  const msg =
    data?.message ||
    (status === 409
      ? 'Bu ankette daha önce oy kullandınız.'
      : 'Oy kaydedilemedi.');
  throw new Error(msg);
}

export async function apiContactSubmit(
  payload: Record<string, unknown>
): Promise<{ success: boolean; message: string }> {
  const { ok, data } = await securePost('/api/v1/public/contact', payload);
  if (ok && data?.success !== false) {
    return { success: true, message: data?.message || 'Mesaj alındı.' };
  }
  return {
    success: false,
    message: data?.message || 'Mesaj gönderilemedi.',
  };
}

export async function apiNewsletterSubscribe(payload: {
  email: string;
  name?: string;
  source?: string;
  interests?: string[];
  /** Honeypot — must stay empty */
  website?: string;
}): Promise<{ success: boolean; message: string; isDuplicate?: boolean }> {
  const { ok, status, data } = await securePost('/api/v1/public/newsletter', payload);
  if (ok && data?.success !== false) {
    return { success: true, message: data?.message || 'Kayıt tamam.' };
  }
  return {
    success: false,
    message: data?.message || 'Kayıt tamamlanamadı.',
    isDuplicate: status === 409 || data?.isDuplicate === true,
  };
}

export async function apiWaitlistSubmit(payload: {
  email: string;
  name: string;
  planInterest?: string;
  source?: string;
  website?: string;
}): Promise<{ success: boolean; message: string }> {
  const { ok, data } = await securePost('/api/v1/public/waitlist', payload);
  if (ok && data?.success !== false) {
    return { success: true, message: data?.message || 'Listeye eklendiniz.' };
  }
  return {
    success: false,
    message: data?.message || 'Kayıt tamamlanamadı.',
  };
}
