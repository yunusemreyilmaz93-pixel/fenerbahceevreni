export interface FenerNewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  image?: string;
  date: string;
  source?: string;
  category: string;
}

const NEWS_RSS_URL = 'https://news.google.com/rss/search?q=Fenerbah%C3%A7e&hl=tr&gl=TR&ceid=TR:tr';

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function fetchFenerbahceNews(limit = 6): Promise<FenerNewsItem[]> {
  const endpoint = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(NEWS_RSS_URL)}`;
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(`News API error: ${response.status}`);
  }

  const data = await response.json();
  const items: any[] = Array.isArray(data?.items) ? data.items : [];

  return items.slice(0, limit).map((item, index) => ({
    id: item.guid || item.link || `news-${index}`,
    title: item.title || 'Fenerbahçe haberi',
    summary: stripHtml(item.description || item.content || 'Özet bilgi bulunamadı.'),
    url: item.link || '#',
    image: item?.thumbnail || undefined,
    date: item.pubDate
      ? new Date(item.pubDate).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })
      : 'Az önce',
    source: item.author || item?.source || 'Google News',
    category: 'GÜNCEL',
  }));
}
