/**
 * SEO Meta Tags Component
 * Provides server-side rendering of structured data and meta tags
 */

interface SEOMetaTagsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema?: Record<string, any>;
  preconnect?: string[];
}

export function SEOMetaTags({ schema, preconnect = [] }: SEOMetaTagsProps) {
  return (
    <>
      {/* Preconnect to external resources for faster loading */}
      {preconnect.map((href) => (
        <link key={href} rel="preconnect" href={href} crossOrigin="anonymous" />
      ))}

      {/* DNS Prefetch for potential external services */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />

      {/* JSON-LD Structured Data */}
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}

      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#000000" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      <meta name="apple-mobile-web-app-title" content="GhostSweep" />

      {/* Referrer Policy for privacy */}
      <meta name="referrer" content="strict-origin-when-cross-origin" />

      {/* Content Security Policy */}
      <meta
        httpEquiv="Content-Security-Policy"
        content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel.com; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; font-src 'self' https:; connect-src 'self' https:; frame-src 'self';"
      />

      {/* Permissions Policy */}
      <meta
        httpEquiv="Permissions-Policy"
        content="geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()"
      />
    </>
  );
}

export default SEOMetaTags;
