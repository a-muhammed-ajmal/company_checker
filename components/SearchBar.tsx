import React, { useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface SearchBarProps {
  query: string;
  setQuery: (val: string) => void;
  onSearch: () => void;
  onClear: () => void;
  loading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  setQuery,
  onSearch,
  onClear,
  loading
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    onClear();
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-md mx-auto z-20">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800">
          <div className="pl-3 text-slate-400">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </div>
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent p-3 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none font-medium"
            placeholder="Search company name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          {query && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 mr-1 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onSearch}
            disabled={!query.trim() || loading}
            className="hidden sm:block mr-1.5 px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold text-xs hover:opacity-90 transition-all disabled:opacity-50"
          >
            Check
          </button>
        </div>
      </div>
    </div>
  );
};
