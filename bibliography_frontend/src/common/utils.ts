import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Author } from './types';

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date for display
 */
export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', options).format(d);
}

/**
 * Truncate text with ellipsis if it exceeds max length
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 *
 * @example
 * truncateText('Long title here', 10) // "Long ti..."
 * truncateText('ab', 2) // "ab"
 * truncateText('abc', 2) // "ab..." (respects maxLength)
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  if (maxLength < 3) return text.slice(0, maxLength) + '...';
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Debounce a function call
 *
 * @param fn - Function to debounce
 * @param ms - Delay in milliseconds
 * @returns Debounced function
 *
 * @example
 * const debouncedSearch = debounce(handleSearch, 300);
 */
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Format author list to string
 *
 * @param authors - Array of author objects
 * @returns Formatted author string
 *
 * @example
 * formatAuthors([{ full: 'John Doe' }, { full: 'Jane Smith' }])
 * // "John Doe, Jane Smith"
 *
 * formatAuthors([...3 authors...])
 * // "First Author et al."
 */
export function formatAuthors(authors: Author[]): string {
  if (authors.length === 0) return 'Unknown Author';
  if (authors.length === 1) return authors[0]!.full;
  if (authors.length === 2) return `${authors[0]!.full}, ${authors[1]!.full}`;
  return `${authors[0]!.full} et al.`;
}

/**
 * Format file size in bytes to human-readable string
 *
 * @param bytes - File size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted file size string
 *
 * @example
 * formatFileSize(1024) // "1.00 KB"
 * formatFileSize(1536000) // "1.46 MB"
 * formatFileSize(1536000000) // "1.43 GB"
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
