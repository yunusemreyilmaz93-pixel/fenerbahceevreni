import { apiNewsletterSubscribe } from './secureApi';
import { dbAddDocument, dbGetCollection } from './dbService';

export interface NewsletterSubscriber {
  id?: string;
  email: string;
  name?: string;
  source: string;
  interests?: string[];
  status: 'active' | 'unsubscribed';
  subscribedAt: string;
  unsubscribedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewsletterIssue {
  id: string;
  title: string;
  subject: string;
  intro: string;
  sections: {
    heading: string;
    bodyText: string;
    articleLink?: string;
    ctaText?: string;
    ctaUrl?: string;
  }[];
  status: 'draft' | 'scheduled' | 'sent';
  scheduledAt?: string | null;
  sentAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Common newsletter subscription helper.
 * Prefers rate-limited server API; falls back to Firestore create rules.
 */
export async function subscribeToNewsletter(
  email: string,
  name?: string,
  source: string = 'newsletter-page',
  interests: string[] = []
): Promise<{ success: boolean; message: string; isDuplicate?: boolean }> {
  try {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@') || cleanEmail.length > 254) {
      return { success: false, message: 'Geçersiz e-posta adresi.' };
    }

    // 1) Secure API path
    try {
      const apiResult = await apiNewsletterSubscribe({
        email: cleanEmail,
        name: name || '',
        source,
        interests,
        website: '',
      });
      // If API is up (even on 409 duplicate), trust it
      if (apiResult.success || apiResult.isDuplicate || apiResult.message) {
        // Detect hard API-down: only fall through when fetch threw
        if (apiResult.success || apiResult.isDuplicate) return apiResult;
        // 4xx from API with message
        if (!apiResult.success && apiResult.message !== 'Kayıt tamamlanamadı.') {
          return apiResult;
        }
      }
    } catch {
      /* fall through to Firestore */
    }

    // 2) Firestore create (no public list of subscribers for duplicate check if rules deny read)
    // Client cannot list newsletterSubscribers when rules enforce admin-only read.
    // So we only attempt create; duplicate may surface as permission/error.
    const now = new Date().toISOString();
    const newSubscriber: Omit<NewsletterSubscriber, 'id'> = {
      email: cleanEmail,
      name: name || '',
      source,
      interests,
      status: 'active',
      subscribedAt: now,
      unsubscribedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    try {
      // Admin dual-path may still list; public users get empty + create
      const subscribers = await dbGetCollection('newsletterSubscribers').catch(() => []);
      const existing = subscribers.find(
        (sub: any) => sub.email?.toLowerCase() === cleanEmail && sub.status === 'active'
      );
      if (existing) {
        return {
          success: false,
          message: 'Bu e-posta zaten bültene kayıtlı.',
          isDuplicate: true,
        };
      }

      const existingUnsubscribed = subscribers.find(
        (sub: any) => sub.email?.toLowerCase() === cleanEmail && sub.status === 'unsubscribed'
      );
      if (existingUnsubscribed?.id) {
        // Public cannot update — only admin/API can re-activate
        // Attempt create of new active row if rules allow (may fail on unique logic)
      }

      await dbAddDocument('newsletterSubscribers', newSubscriber);
      return { success: true, message: 'Bültene katıldın. İlk sayıda görüşürüz.' };
    } catch (err) {
      console.error('Newsletter Firestore fallback error:', err);
      return { success: false, message: 'Bir hata oluştu, lütfen daha sonra tekrar deneyin.' };
    }
  } catch (err) {
    console.error('Newsletter subscribe error:', err);
    return { success: false, message: 'Bir hata oluştu, lütfen daha sonra tekrar deneyin.' };
  }
}
