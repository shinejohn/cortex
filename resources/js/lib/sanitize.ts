import DOMPurify from "dompurify";

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Use this whenever rendering user-generated HTML with dangerouslySetInnerHTML.
 */
export function sanitizeHtml(dirty: string): string {
    return DOMPurify.sanitize(dirty);
}
