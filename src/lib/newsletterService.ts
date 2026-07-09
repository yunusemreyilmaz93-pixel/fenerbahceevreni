import { dbGetCollection, dbAddDocument, dbUpsertDocument } from './dbService';

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
 * Common newsletter subscription helper
 */
export async function subscribeToNewsletter(
  email: string,
  name?: string,
  source: string = 'newsletter-page',
  interests: string[] = []
): Promise<{ success: boolean; message: string; isDuplicate?: boolean }> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    
    // Basic validation
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Geçersiz e-posta adresi.' };
    }

    // Check if duplicate active subscriber exists
    const subscribers = await dbGetCollection('newsletterSubscribers');
    const existing = subscribers.find(
      (sub: any) => sub.email.toLowerCase() === cleanEmail && sub.status === 'active'
    );

    if (existing) {
      return { 
        success: false, 
        message: 'Bu e-posta zaten bültene kayıtlı.', 
        isDuplicate: true 
      };
    }

    // Check if there's an unsubscribed subscriber with this email to re-activate
    const existingUnsubscribed = subscribers.find(
      (sub: any) => sub.email.toLowerCase() === cleanEmail && sub.status === 'unsubscribed'
    );

    if (existingUnsubscribed && existingUnsubscribed.id) {
      await dbUpsertDocument('newsletterSubscribers', existingUnsubscribed.id, {
        ...existingUnsubscribed,
        name: name || existingUnsubscribed.name || '',
        status: 'active',
        source: source || existingUnsubscribed.source,
        interests: interests.length > 0 ? interests : (existingUnsubscribed.interests || []),
        subscribedAt: new Date().toISOString(),
        unsubscribedAt: null,
        updatedAt: new Date().toISOString()
      });
      return { success: true, message: 'Bültene katıldın. İlk sayıda görüşürüz.' };
    }

    // Otherwise create new active subscriber
    const newSubscriber: Omit<NewsletterSubscriber, 'id'> = {
      email: cleanEmail,
      name: name || '',
      source,
      interests,
      status: 'active',
      subscribedAt: new Date().toISOString(),
      unsubscribedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await dbAddDocument('newsletterSubscribers', newSubscriber);
    return { success: true, message: 'Bültene katıldın. İlk sayıda görüşürüz.' };
  } catch (err) {
    console.error('Newsletter subscribe error:', err);
    return { success: false, message: 'Bir hata oluştu, lütfen daha sonra tekrar deneyin.' };
  }
}
