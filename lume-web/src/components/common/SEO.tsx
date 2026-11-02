import React, { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
}

const DEFAULT_TITLE = "LUME — Book Top Bridal & Wedding Makeup Artists in India | Verified MUAs";
const DEFAULT_DESC = "Book India's top verified bridal, wedding, party & editorial makeup artists on LUME. Transparent pricing from ₹4,500, authentic portfolios, client reviews, 100% escrow protection & instant booking across Mumbai, Delhi NCR, Bengaluru, Pune & Hyderabad.";
const DEFAULT_KEYWORDS = "makeup artist booking, bridal makeup artist near me, wedding makeup artist, bridal makeup Mumbai, makeup artist Bangalore, makeup artist Delhi NCR, professional makeup artist India, party makeup artist, celebrity makeup artist, bridal makeup packages, MUA booking platform, freelance makeup artist, verified beauty artists, LUME beauty";
const DEFAULT_CANONICAL = "https://hellolume.in/";
const DEFAULT_OG_IMAGE = "https://hellolume.in/logo.png";

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  ogType = 'website',
}) => {
  useEffect(() => {
    // 1. Update Title
    const finalTitle = title ? `${title} | LUME` : DEFAULT_TITLE;
    document.title = finalTitle;

    // Helper to update or create meta tags
    const updateMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (el) {
        el.setAttribute(attr, value);
      } else {
        el = document.createElement('meta');
        if (selector.startsWith('meta[name=')) {
          const name = selector.match(/meta\[name="([^"]+)"\]/)?.[1];
          if (name) el.setAttribute('name', name);
        } else if (selector.startsWith('meta[property=')) {
          const prop = selector.match(/meta\[property="([^"]+)"\]/)?.[1];
          if (prop) el.setAttribute('property', prop);
        }
        el.setAttribute(attr, value);
        document.head.appendChild(el);
      }
    };

    // 2. Update Description & Keywords
    updateMeta('meta[name="description"]', 'content', description || DEFAULT_DESC);
    updateMeta('meta[name="keywords"]', 'content', keywords || DEFAULT_KEYWORDS);

    // 3. Update Open Graph
    updateMeta('meta[property="og:title"]', 'content', finalTitle);
    updateMeta('meta[property="og:description"]', 'content', description || DEFAULT_DESC);
    updateMeta('meta[property="og:url"]', 'content', canonical || DEFAULT_CANONICAL);
    updateMeta('meta[property="og:image"]', 'content', ogImage || DEFAULT_OG_IMAGE);
    updateMeta('meta[property="og:type"]', 'content', ogType);

    // 4. Update Twitter Card
    updateMeta('meta[name="twitter:title"]', 'content', finalTitle);
    updateMeta('meta[name="twitter:description"]', 'content', description || DEFAULT_DESC);
    updateMeta('meta[name="twitter:image"]', 'content', ogImage || DEFAULT_OG_IMAGE);

    // 5. Update Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (canonicalLink) {
      canonicalLink.setAttribute('href', canonical || DEFAULT_CANONICAL);
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      canonicalLink.setAttribute('href', canonical || DEFAULT_CANONICAL);
      document.head.appendChild(canonicalLink);
    }
  }, [title, description, keywords, canonical, ogImage, ogType]);

  return null;
};

export default SEO;
