import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/common/utils';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onClear,
  placeholder = 'Search references...',
  className,
  autoFocus = false,
}) => {
  const [query, setQuery] = useState('');

  // Debounced search - trigger onSearch after 300ms of no typing
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch?.(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
  };

  const handleClear = () => {
    setQuery('');
    onClear?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <form
      className={cn(
        'relative flex items-center gap-2 px-4 py-2 rounded-lg border border-app-border bg-app-bg transition-all duration-200 focus-within:border-app-accent focus-within:ring-1 focus-within:ring-app-accent/50',
        className,
      )}
      onSubmit={handleSubmit}
    >
      <MagnifyingGlassIcon className="h-5 w-5 text-app-text-secondary flex-shrink-0" />
      <input
        autoFocus={autoFocus}
        className="flex-1 bg-transparent text-app-text-primary placeholder:text-app-text-secondary focus:outline-none"
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        type="text"
        value={query}
      />
      {query && (
        <button
          className="p-1 text-app-text-secondary hover:text-app-text-primary hover:bg-app-bg-hover rounded transition-colors"
          onClick={handleClear}
          type="button"
          aria-label="Clear search"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      )}
    </form>
  );
};
