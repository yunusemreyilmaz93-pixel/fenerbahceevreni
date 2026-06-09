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

/**
 * Seed initial newsletter subscribers if needed
 */
export async function seedNewsletterSubscribersIfEmpty() {
  try {
    const subs = await dbGetCollection('newsletterSubscribers');
    if (subs.length === 0) {
      const initialSubs: NewsletterSubscriber[] = [
        {
          email: 'yunusemreyilmaz93@gmail.com',
          name: 'Yunus Emre Yılmaz',
          source: 'newsletter-page',
          interests: ['Maç analizleri', 'Transfer dosyaları'],
          status: 'active',
          subscribedAt: new Date(2026, 4, 1).toISOString(),
          createdAt: new Date(2026, 4, 1).toISOString(),
          updatedAt: new Date(2026, 4, 1).toISOString()
        },
        {
          email: 'ahmet.fener@hotmail.com',
          name: 'Ahmet Yılmaz',
          source: 'homepage',
          interests: ['Maç analizleri', 'Taraftar anketleri'],
          status: 'active',
          subscribedAt: new Date(2026, 4, 15).toISOString(),
          createdAt: new Date(2026, 4, 15).toISOString(),
          updatedAt: new Date(2026, 4, 15).toISOString()
        },
        {
          email: 'can.kaya@gmail.com',
          name: 'Can Kaya',
          source: 'premium-page',
          interests: ['Premium içerikler'],
          status: 'unsubscribed',
          subscribedAt: new Date(2026, 4, 10).toISOString(),
          unsubscribedAt: new Date(2026, 4, 25).toISOString(),
          createdAt: new Date(2026, 4, 10).toISOString(),
          updatedAt: new Date(2026, 4, 25).toISOString()
        }
      ];
      
      for (const sub of initialSubs) {
        await dbAddDocument('newsletterSubscribers', sub);
      }
    }
    
    const issues = await dbGetCollection('newsletterIssues');
    if (issues.length === 0) {
      const initialIssues: NewsletterIssue[] = [
        {
          id: 'issue-1',
          title: 'Fenerbahçe Evreni - Sayı #1',
          subject: 'Fred Geri Döndü, Taktik Yapı Nasıl Etkilenecek?',
          intro: 'Merhaba Fenerbahçe Evreni okuyucuları! Bu haftaki bültenimizde takımımızın orta saha direncini, son taktik varyasyonları ve radarımızdaki yeni scout adaylarını ele alıyoruz.',
          sections: [
            {
              heading: '1. Haftanın taktik odağı: Fred etkisi',
              bodyText: 'Sakatlıktan dönen Fred ile orta sahadaki geçiş savunmamız büyük ölçüde toparlandı. Szymanski ile olan ikili bağları hücum hattını beslemekte kilit rol oynuyor.',
              articleLink: '#',
              ctaText: 'Analizi Oku',
              ctaUrl: '#'
            },
            {
              heading: '2. Transfer scout merceği: Genç 6 Numara',
              bodyText: 'Ligue 1’de forma giyen 21 yaşındaki genç ve dinamik ön libero profiline dair tüm detaylı istatistikler ve ısı haritası güncellendi.',
              articleLink: '#',
              ctaText: 'Transfer Raporuna Git',
              ctaUrl: '#'
            }
          ],
          status: 'sent',
          sentAt: new Date(2026, 4, 20).toISOString(),
          createdAt: new Date(2026, 4, 18).toISOString(),
          updatedAt: new Date(2026, 4, 20).toISOString()
        },
        {
          id: 'issue-2',
          title: 'Derbi Öncesi Kadıköy Raporu - Sayı #2',
          subject: 'Dev Derbi Öncesi Taktiksel Plan ve Sürpriz XI',
          intro: 'Büyük maç haftası geldi çattı! Beşiktaş karşılaşması öncesinde takımın son durumunu, Mourinho’nun muhtemel sürpriz dokunuşlarını ve taraftarın güven endeksini inceliyoruz.',
          sections: [
            {
              heading: '1. Mourinho’nun derbi stratejisi',
              bodyText: 'Savunma güvenliğini elden bırakmadan, hücum presiyle erken skor bulma planı öncelikli duruyor. Bek bindirmeleri maçın kaderini tayin edebilir.',
              articleLink: '#'
            }
          ],
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      for (const issue of initialIssues) {
        await dbAddDocument('newsletterIssues', issue);
      }
    }
  } catch (err) {
    console.error('Error seeding newsletter data:', err);
  }
}
