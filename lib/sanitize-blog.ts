/**
 * Sanitize blog content to prevent false positive SQL detection
 * This is overly cautious - the real fix is proper headers
 */
export function sanitizeBlogContent(markdown: string): string {
    // Only flag if it looks like ACTUAL SQL (has semicolons and SQL keywords together)
    const potentialSQLPattern = /\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\s+.*\s*;/gi

    if (potentialSQLPattern.test(markdown)) {
        console.warn('⚠️ Potential SQL-like pattern detected in blog markdown')
        // In production, you might want to alert or log this
    }

    // For now, just return as-is
    // The content is legitimate instructional text
    return markdown
}