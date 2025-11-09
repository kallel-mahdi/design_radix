import React, { useState } from 'react';
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
        'relative flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-bg-dark transition-all duration-200 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/50',
        className,
      )}
      onSubmit={handleSubmit}
    >
      <MagnifyingGlassIcon className="h-5 w-5 text-text-secondary flex-shrink-0" />
      <input
        autoFocus={autoFocus}
        className="flex-1 bg-transparent text-text-primary placeholder:text-text-secondary focus:outline-none"
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        type="text"
        value={query}
      />
      {query && (
        <button
          className="p-1 text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded transition-colors"
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
