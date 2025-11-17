import { describe, it, expect } from 'vitest';
import { isValidDoi, normalizeDoi, extractDoi, DOI_REGEX } from '../validation';

describe('DOI Validation Utils', () => {
  describe('DOI_REGEX', () => {
    it('should match valid DOI patterns', () => {
      const validDois = [
        '10.1234/test',
        '10.1145/3411764.3445518',
        '10.1000/182',
        '10.1038/nature12373',
        '10.1016/j.cell.2019.01.001',
        '10.1109/CVPR.2020.00001',
        '10.1007/978-3-642-12345-6_1',
        '10.1234/test-with-hyphen',
        '10.1234/test_with_underscore',
        '10.1234/test.with.dot',
        '10.1234/test;with;semicolon',
        '10.1234/test(with)parens',
        '10.1234/test:with:colon',
        '10.1234/test/with/slash',
        '10.1234/TEST', // Uppercase
        '10.12345678/test', // 8-digit prefix
        '10.123456789/test', // 9-digit prefix
      ];

      validDois.forEach((doi) => {
        expect(DOI_REGEX.test(doi)).toBe(true);
      });
    });

    it('should NOT match invalid DOI patterns', () => {
      const invalidDois = [
        'invalid-doi',
        '10.123/test', // Prefix too short (3 digits)
        '10.1234567890/test', // Prefix too long (10 digits)
        '11.1234/test', // Wrong registrant
        '10.1234', // No suffix
        '10.1234/', // Empty suffix
        'DOI:10.1234/test', // Prefix
        'doi:10.1234/test', // Lowercase prefix
        'https://doi.org/10.1234/test', // Full URL
        '10.1234/test with spaces', // Spaces not allowed
        '', // Empty string
        '10', // Just registrant
      ];

      invalidDois.forEach((doi) => {
        expect(DOI_REGEX.test(doi)).toBe(false);
      });
    });
  });

  describe('isValidDoi', () => {
    it('should return true for valid DOIs', () => {
      expect(isValidDoi('10.1145/3411764.3445518')).toBe(true);
      expect(isValidDoi('10.1038/nature12373')).toBe(true);
      expect(isValidDoi('10.1234/test')).toBe(true);
    });

    it('should return false for invalid DOIs', () => {
      expect(isValidDoi('invalid-doi')).toBe(false);
      expect(isValidDoi('10.123/test')).toBe(false);
      expect(isValidDoi('')).toBe(false);
    });

    it('should trim whitespace before validation', () => {
      expect(isValidDoi('  10.1234/test  ')).toBe(true);
      expect(isValidDoi('\n10.1234/test\n')).toBe(true);
      expect(isValidDoi('\t10.1234/test\t')).toBe(true);
    });

    it('should be case-insensitive', () => {
      expect(isValidDoi('10.1234/TEST')).toBe(true);
      expect(isValidDoi('10.1234/Test')).toBe(true);
      expect(isValidDoi('10.1234/test')).toBe(true);
    });
  });

  describe('normalizeDoi', () => {
    it('should trim whitespace', () => {
      expect(normalizeDoi('  10.1234/test  ')).toBe('10.1234/test');
      expect(normalizeDoi('\n10.1234/test\n')).toBe('10.1234/test');
    });

    it('should convert to lowercase', () => {
      expect(normalizeDoi('10.1234/TEST')).toBe('10.1234/test');
      expect(normalizeDoi('10.1234/Test')).toBe('10.1234/test');
    });

    it('should handle already normalized DOIs', () => {
      expect(normalizeDoi('10.1234/test')).toBe('10.1234/test');
    });

    it('should handle empty string', () => {
      expect(normalizeDoi('')).toBe('');
      expect(normalizeDoi('   ')).toBe('');
    });
  });

  describe('extractDoi', () => {
    it('should extract DOI from plain text', () => {
      expect(extractDoi('The DOI is 10.1234/test')).toBe('10.1234/test');
      expect(extractDoi('See 10.1145/3411764.3445518 for details')).toBe('10.1145/3411764.3445518');
    });

    it('should extract DOI from URL', () => {
      expect(extractDoi('https://doi.org/10.1234/test')).toBe('10.1234/test');
      expect(extractDoi('http://dx.doi.org/10.1038/nature12373')).toBe('10.1038/nature12373');
    });

    it('should return null when no DOI found', () => {
      expect(extractDoi('No DOI here')).toBeNull();
      expect(extractDoi('invalid doi format')).toBeNull();
      expect(extractDoi('')).toBeNull();
    });

    it('should extract first DOI when multiple present', () => {
      expect(extractDoi('First 10.1234/test1 and second 10.1234/test2')).toBe('10.1234/test1');
    });

    it('should handle DOI with special characters', () => {
      expect(extractDoi('DOI: 10.1234/test-with-hyphen')).toBe('10.1234/test-with-hyphen');
      expect(extractDoi('See 10.1234/test_underscore')).toBe('10.1234/test_underscore');
      expect(extractDoi('Check 10.1234/test.dot')).toBe('10.1234/test.dot');
    });
  });
});
