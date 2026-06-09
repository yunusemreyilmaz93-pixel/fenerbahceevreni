import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  schema?: Record<string, any>;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords = 'Fenerbahçe, Fenerbahçe analiz, Fenerbahçe maç analizi, Fenerbahçe transfer, Fenerbahçe haberleri, Fenerbahçe oyuncu analizi, Fenerbahçe taraftar platformu, Fenerbahçe Evreni',
  canonical,
  ogType = 'website',
  ogImage = 'https://i.hizliresim.com/cjtn8ay.png', // Fallback high-quality platform brand image
  schema
}) => {
  useEffect(() => {
    // 1. Update Title
    document.title = title;

    // Helper to update or create meta tags
    const updateMetaTag = (attributeName: string, attributeValue: string, content: string) => {
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (element) {
        element.setAttribute('content', content);
      } else {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        element.setAttribute('content', content);
        document.head.appendChild(element);
      }
    };

    // 2. Update Standard Meta Tags
    updateMetaTag('name', 'description', description);
    updateMetaTag('name', 'keywords', keywords);
    updateMetaTag('name', 'robots', 'index, follow');

    // 3. Update Open Graph Tags
    updateMetaTag('property', 'og:title', title);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:type', ogType);
    updateMetaTag('property', 'og:url', canonical || window.location.href);
    updateMetaTag('property', 'og:site_name', 'Fenerbahçe Evreni');
    updateMetaTag('property', 'og:image', ogImage);

    // 4. Update Twitter / X Cards
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', title);
    updateMetaTag('name', 'twitter:description', description);
    updateMetaTag('name', 'twitter:image', ogImage);

    // 5. Update Canonical link
    const canonicalURL = canonical || window.location.href;
    let linkElement = document.querySelector('link[rel="canonical"]');
    if (linkElement) {
      linkElement.setAttribute('href', canonicalURL);
    } else {
      linkElement = document.createElement('link');
      linkElement.setAttribute('rel', 'canonical');
      linkElement.setAttribute('href', canonicalURL);
      document.head.appendChild(linkElement);
    }

    // 6. Structured Data (JSON-LD)
    let scriptElement = document.getElementById('seo-json-ld');
    if (scriptElement) {
      scriptElement.remove();
    }

    if (schema) {
      scriptElement = document.createElement('script');
      scriptElement.id = 'seo-json-ld';
      scriptElement.setAttribute('type', 'application/ld+json');
      scriptElement.innerHTML = JSON.stringify(schema);
      document.head.appendChild(scriptElement);
    }

    // Cleanup script on unmount
    return () => {
      const scriptToRemove = document.getElementById('seo-json-ld');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [title, description, keywords, canonical, ogType, ogImage, schema]);

  return null; // Side-effect only component
};

export default SEO;
