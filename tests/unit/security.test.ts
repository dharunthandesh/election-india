import { describe, it, expect } from 'vitest';
import { ElectionSecurity } from '../../src/utils/security';

describe('ElectionSecurity Utility', () => {
  it('should sanitize HTML from input', () => {
    const dirty = '<script>alert("xss")</script>Hello <img src="x" onerror="alert(1)">';
    const clean = ElectionSecurity.sanitize(dirty);
    expect(clean).not.toContain('<script>');
    expect(clean).not.toContain('onerror');
    expect(clean).toBe('Hello ');
  });

  it('should clean search queries', () => {
    const malicious = "Polling Booth'; DROP TABLE Users; --";
    const clean = ElectionSecurity.cleanQuery(malicious);
    expect(clean).not.toContain("'");
    expect(clean).not.toContain(";");
    expect(clean).toBe("Polling Booth DROP TABLE Users --");
  });

  it('should enforce rate limiting', () => {
    const key = 'test_limit';
    // First 5 should pass
    for (let i = 0; i < 5; i++) {
      expect(ElectionSecurity.checkRateLimit(key, 5, 1000)).toBe(true);
    }
    // 6th should fail
    expect(ElectionSecurity.checkRateLimit(key, 5, 1000)).toBe(false);
  });
});
