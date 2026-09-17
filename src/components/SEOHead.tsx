'use client';

/**
 * Legacy SEOHead component — thin wrapper for backward compatibility.
 * In Next.js, metadata should ideally be handled via the metadata export
 * in page files, but this component is kept for pages that were ported
 * with inline SEO tags.
 */
export const SEOHead = ({
  title,
  description,
  ogImage,
  canonical,
}: {
  title?: string;
  description?: string;
  ogImage?: string;
  canonical?: string;
}) => {
  // In Next.js App Router, metadata is handled by the metadata export.
  // This component is a no-op placeholder for ported pages.
  return null;
};

export default SEOHead;
