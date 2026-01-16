# SEO & Metadata Quick Reference Guide

## File Structure

### Configuration Files
- `lib/seo-config.ts` - Centralized SEO configuration and constants
- `components/seo-meta-tags.tsx` - Reusable SEO meta tags component

### Root Layout
- `app/layout.tsx` - Root metadata + Organization schema

### Public Pages with Metadata
- `app/home/layout.tsx` - Home page layout
- `app/home/page.tsx` - Home page with FAQ schema
- `app/home/breach_check/layout.tsx` - Breach checker metadata + Web App schema
- `app/home/how-it-works/layout.tsx` - How-it-works metadata + HowTo schema
- `app/home/security/page.tsx` - Security page with schema
- `app/home/privacy/page.tsx` - Privacy page with schema
- `app/home/terms/page.tsx` - Terms page with schema
- `app/home/blogs/layout.tsx` - Blog listing metadata + Blog schema
- `app/home/blogs/[slug]/page.tsx` - Dynamic blog metadata generator
- `app/home/unsubscribe/layout.tsx` - Unsubscribe page metadata
- `app/help/layout.tsx` - Help page metadata

### Authentication Pages (Noindex)
- `app/login/layout.tsx` - Login metadata + noindex
- `app/forgot_password/layout.tsx` - Password recovery metadata + noindex
- `app/reset_password/layout.tsx` - Reset password metadata + noindex

### Dashboard Pages (Noindex)
- `app/(protected)/dashboard/layout.tsx` - Dashboard metadata + noindex
- `app/error/layout.tsx` - Error page metadata + noindex
- `app/global-not-found.tsx` - 404 page metadata + noindex
- `app/support/layout.tsx` - Support page metadata + noindex
- `app/sentry-example-page/layout.tsx` - Test page metadata + noindex

### SEO Sitemaps
- `app/sitemap.ts` - XML sitemap with priorities
- `public/robots.txt` - Robots directives and crawl instructions

---

## Key Configuration Values

### Site Information
```typescript
const SITE_CONFIG = {
  siteName: "GhostSweep",
  siteUrl: "https://ghostsweep.com",
  image: "https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png",
  twitterHandle: "@ghostsweep",
};
```

### OpenGraph Image
```typescript
const OG_IMAGE = {
  url: "https://...",
  width: 1200,
  height: 630,
  type: "image/png",
};
```

### Robots Settings
```typescript
// Public pages
robots: { index: true, follow: true }

// Private pages
robots: { index: false, follow: false }
```

---

## Common Metadata Patterns

### Public Page Template
```typescript
export const metadata: Metadata = {
  title: "Page Title | GhostSweep",
  description: "Clear 155-160 character description",
  keywords: ["keyword1", "keyword2", "keyword3"],
  openGraph: {
    title: "Page Title",
    description: "Description",
    url: "https://ghostsweep.com/page",
    type: "website",
    images: [{ url: OG_IMAGE.url, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Page Title",
    description: "Description",
    images: [OG_IMAGE.url],
  },
  alternates: {
    canonical: "https://ghostsweep.com/page",
  },
};
```

### Private Page Template
```typescript
export const metadata: Metadata = {
  title: "Page Title | GhostSweep",
  description: "Description",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Page Title",
    url: "https://ghostsweep.com/page",
    type: "website",
  },
};
```

### With Schema
```typescript
const schema = { "@context": "https://schema.org", ... };

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {children}
    </>
  );
}
```

---

## SEO Checklist for New Pages

- [ ] Create `layout.tsx` with Metadata export
- [ ] Add title (50-60 characters)
- [ ] Add description (155-160 characters)
- [ ] Add relevant keywords (3-5)
- [ ] Set robots directive (public/private)
- [ ] Add OpenGraph tags (if public)
- [ ] Add Twitter Card tags (if public)
- [ ] Add canonical URL
- [ ] Add JSON-LD schema if applicable
- [ ] Include in sitemap
- [ ] Update robots.txt if needed

---

## JSON-LD Schema Types Available

1. **Organization** - Brand/company information
2. **WebApplication** - Tools and apps
3. **HowTo** - Step-by-step processes
4. **FAQPage** - Frequently asked questions
5. **BlogPosting** - Individual blog articles
6. **Blog** - Blog collection
7. **WebPage** - General web pages
8. **Article** - News articles
9. **Product** - E-commerce products (if applicable)
10. **LocalBusiness** - Physical location (if applicable)

---

## Keywords by Category

### Primary (Homepage)
- find hidden accounts
- email scanner
- account discovery
- data breach detection
- digital footprint

### Tools (Breach Checker)
- breach checker
- email breach check
- data breach search
- email security check
- compromised email

### Security
- email security
- privacy protection
- OAuth security
- data privacy
- CCPA compliant

---

## Performance Optimization Tags

### DNS Prefetch
```html
<link rel="dns-prefetch" href="//fonts.googleapis.com" />
```

### Preconnect
```html
<link rel="preconnect" href="https://domain.com" crossOrigin="anonymous" />
```

### Preload
```html
<link rel="preload" as="font" href="/fonts/..." />
```

---

## Testing Tools

### Validation
- [Google Structured Data Tester](https://schema.org/validator)
- [OpenGraph Debugger](https://www.opengraphcheck.com)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)

### Analytics
- [Google Search Console](https://search.google.com/search-console)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Monitoring
- [Google PageSpeed Insights](https://pagespeed.web.dev)
- [SEMrush](https://www.semrush.com)
- [Ahrefs](https://ahrefs.com)

---

## Sitemap Priority Guide

| Priority | Content Type |
|----------|--------------|
| 1.0 | Homepage |
| 0.9 | Main features/tools |
| 0.85 | Information pages |
| 0.7 | Blog collection |
| 0.6-0.7 | Support pages |
| 0.5 | Legal pages |
| 0.3-0.5 | Old/archived content |

---

## Mobile Optimization

- ✅ Viewport meta tag configured
- ✅ Mobile app capability enabled
- ✅ Apple app support configured
- ✅ Touch-friendly design indicators
- ✅ Theme color set

---

## Security & Privacy Headers

- ✅ Content Security Policy (CSP)
- ✅ Referrer Policy: strict-origin-when-cross-origin
- ✅ Permissions Policy restricting APIs
- ✅ X-Content-Type-Options: nosniff (via Next.js)
- ✅ X-Frame-Options: DENY (via Next.js)

---

## Indexing Strategy

### Pages to Index (robots: true)
- Homepage
- Feature pages (how-it-works, security, etc.)
- Public content (blogs, help)
- Landing pages

### Pages to Exclude (robots: false)
- Authentication pages (login, register, reset)
- Dashboard pages
- Error pages (404, 500)
- Transactional pages (unsubscribe)
- Admin/internal pages

---

## Quick Updates

To update metadata across the site:
1. Edit `lib/seo-config.ts` for global values
2. Update individual `layout.tsx` files for page-specific changes
3. Run tests in Google Search Console
4. Monitor rankings and CTR

---

**Last Updated**: January 16, 2026  
**Version**: 2.0 (Phase 1 + Phase 2)
