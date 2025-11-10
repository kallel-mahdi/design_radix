import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatDate, truncateText, debounce, formatAuthors } from '../utils';
import type { Author } from '../types';

describe('formatDate', () => {
  it('should format Date object to US format by default', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    const formatted = formatDate(date);
    expect(formatted).toBe('1/15/2024');
  });

  it('should format ISO string to US format', () => {
    const formatted = formatDate('2024-01-15T10:30:00Z');
    expect(formatted).toBe('1/15/2024');
  });

  it('should accept custom Intl options', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    const formatted = formatDate(date, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    expect(formatted).toContain('January');
    expect(formatted).toContain('15');
    expect(formatted).toContain('2024');
  });

  it('should handle different date formats', () => {
    const formatted = formatDate('2024-12-25T00:00:00Z', {
      month: 'short',
      day: 'numeric',
    });
    expect(formatted).toContain('Dec');
    expect(formatted).toContain('25');
  });
});

describe('truncateText', () => {
  it('should not truncate text shorter than maxLength', () => {
    const text = 'Short';
    expect(truncateText(text, 10)).toBe('Short');
  });

  it('should not truncate text equal to maxLength', () => {
    const text = 'Exactly10!';
    expect(truncateText(text, 10)).toBe('Exactly10!');
  });

  it('should truncate text longer than maxLength', () => {
    const text = 'This is a very long title that needs truncation';
    const result = truncateText(text, 10);
    expect(result).toBe('This is...'); // 7 chars + 3 ellipsis = 10 total
    expect(result.length).toBe(10); // respects maxLength budget
  });

  it('should truncate to maxLength and add ellipsis', () => {
    const text = 'Long text';
    const result = truncateText(text, 3);
    expect(result).toBe('...'); // 0 chars + 3 ellipsis = 3 total
    expect(result.length).toBe(3); // respects maxLength budget
  });

  it('should handle empty string', () => {
    expect(truncateText('', 10)).toBe('');
  });

  it('should handle single character with maxLength 1', () => {
    expect(truncateText('A', 1)).toBe('A');
  });
});

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should delay function execution', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn();
    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should cancel previous timeout on new call', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn();
    vi.advanceTimersByTime(50);
    debouncedFn();
    vi.advanceTimersByTime(50);

    // Should not have been called yet (timer reset)
    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should only call function once for multiple rapid calls', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn();
    debouncedFn();
    debouncedFn();
    debouncedFn();

    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should preserve function arguments', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn('arg1', 'arg2', 123);
    vi.advanceTimersByTime(100);

    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 123);
  });

  it('should work with different delay times', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 300);

    debouncedFn();
    vi.advanceTimersByTime(200);
    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});

describe('formatAuthors', () => {
  it('should return "Unknown Author" for empty array', () => {
    expect(formatAuthors([])).toBe('Unknown Author');
  });

  it('should return full name for single author', () => {
    const authors: Author[] = [{ full: 'John Doe' }];
    expect(formatAuthors(authors)).toBe('John Doe');
  });

  it('should return full name with given and family names', () => {
    const authors: Author[] = [
      { given: 'John', family: 'Doe', full: 'John Doe' },
    ];
    expect(formatAuthors(authors)).toBe('John Doe');
  });

  it('should format two authors with comma separation', () => {
    const authors: Author[] = [
      { full: 'John Doe' },
      { full: 'Jane Smith' },
    ];
    expect(formatAuthors(authors)).toBe('John Doe, Jane Smith');
  });

  it('should format three authors with "et al."', () => {
    const authors: Author[] = [
      { full: 'John Doe' },
      { full: 'Jane Smith' },
      { full: 'Bob Johnson' },
    ];
    expect(formatAuthors(authors)).toBe('John Doe et al.');
  });

  it('should format four+ authors with "et al."', () => {
    const authors: Author[] = [
      { full: 'John Doe' },
      { full: 'Jane Smith' },
      { full: 'Bob Johnson' },
      { full: 'Alice Williams' },
    ];
    expect(formatAuthors(authors)).toBe('John Doe et al.');
  });

  it('should handle authors with only given names', () => {
    const authors: Author[] = [
      { given: 'John', full: 'John' },
      { given: 'Jane', full: 'Jane' },
    ];
    expect(formatAuthors(authors)).toBe('John, Jane');
  });

  it('should handle authors with only family names', () => {
    const authors: Author[] = [{ family: 'Doe', full: 'Doe' }];
    expect(formatAuthors(authors)).toBe('Doe');
  });
});
