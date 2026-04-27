import DOMPurify from 'dompurify';

/**
 * Enhanced security utility for input sanitization and risk mitigation.
 */
export class ElectionSecurity {
  /**
   * Sanitizes user input to prevent XSS attacks.
   * @param input - Raw user input string.
   * @returns Sanitized string.
   */
  static sanitize(input: string): string {
    if (!input) return '';
    // Use DOMPurify for robust HTML sanitization
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [], // No tags allowed for basic input
      ALLOWED_ATTR: [],
    });
  }

  /**
   * Validates and cleans search queries to prevent common injection attempts.
   * @param query - Raw search query.
   * @returns Cleaned query.
   */
  static cleanQuery(query: string): string {
    return query
      .replace(/[<>\"\'\%;\(\)\&\+]/g, '') // Strip suspicious characters
      .substring(0, 200) // Limit length
      .trim();
  }

  /**
   * Simple client-side rate limiting to prevent UI spam.
   * @param key - Unique key for the action (e.g., 'chat_send').
   * @param limit - Max attempts.
   * @param windowMs - Time window in milliseconds.
   * @returns True if the action is allowed.
   */
  private static rateLimits: Record<string, { count: number; resetAt: number }> = {};
  
  static checkRateLimit(key: string, limit: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const state = this.rateLimits[key];

    if (!state || now > state.resetAt) {
      this.rateLimits[key] = { count: 1, resetAt: now + windowMs };
      return true;
    }

    if (state.count >= limit) {
      return false;
    }

    state.count += 1;
    return true;
  }
}
