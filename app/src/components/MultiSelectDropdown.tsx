import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';
import { cn } from '../utils/cn';
import type { DropdownOption } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface MultiSelectDropdownProps {
  label: string;
  options: DropdownOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  placeholder?: string;
  serverSearch?: boolean;
  onSearchChange?: (search: string) => void;
  disabled?: boolean;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  loading,
  hasMore,
  onLoadMore,
  placeholder = 'Pilih opsi...',
  serverSearch = false,
  onSearchChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled) {
      setIsOpen(false);
      setSearchTerm('');
    }
  }, [disabled]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!listRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      if (scrollHeight - scrollTop - clientHeight < 50 && hasMore && !loading) {
        onLoadMore();
      }
    };

    const listElement = listRef.current;
    if (listElement) {
      listElement.addEventListener('scroll', handleScroll);
      return () => listElement.removeEventListener('scroll', handleScroll);
    }
  }, [hasMore, loading, onLoadMore]);

  // Notify parent of search changes for server-side search
  useEffect(() => {
    if (serverSearch && onSearchChange) {
      onSearchChange(searchTerm);
    }
  }, [searchTerm, serverSearch, onSearchChange]);

  // Client-side filtering (skip if server-side search)
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredOptions = serverSearch
    ? options
    : options.filter((option) =>
        option.label.toLowerCase().includes(normalizedSearch) ||
        option.value.toLowerCase().includes(normalizedSearch)
      );

  // Auto-load more for client-side search
  useEffect(() => {
    if (serverSearch) return;
    
    const hasSearch = searchTerm.trim().length > 0;
    if (!isOpen || !hasSearch || loading || !hasMore) return;
    if (filteredOptions.length > 0) return;

    onLoadMore();
  }, [filteredOptions.length, hasMore, isOpen, loading, onLoadMore, searchTerm, serverSearch]);

  const handleToggle = (value: string) => {
    if (disabled) return;
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const handleRemove = (value: string) => {
    if (disabled) return;
    onChange(selectedValues.filter((v) => v !== value));
  };

  const selectedLabels = Array.from(
  new Set(
    options
      .filter((opt) => selectedValues.includes(opt.value))
      .map((opt) => opt.label)
  )
);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      
      <div
        className={cn(
          'relative w-full min-h-[42px] p-2 border rounded-md transition-colors',
          disabled
            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-white border-gray-300 cursor-pointer hover:border-gray-400'
        )}
        onClick={() => {
          if (disabled) return;
          setIsOpen(!isOpen);
        }}
        aria-disabled={disabled}
      >
        <div className="flex flex-wrap gap-1 pr-8">
          {selectedLabels.length > 0 ? (
            selectedLabels.map((label, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
              >
                {label}
                <X
                  className={cn(
                    'w-3 h-3',
                    disabled ? 'cursor-not-allowed text-blue-300' : 'cursor-pointer hover:text-blue-600'
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    const value = options.find((opt) => opt.label === label)?.value;
                    if (value) handleRemove(value);
                  }}
                />
              </span>
            ))
          ) : (
            <span className="text-gray-500 text-sm">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-200 bg-gray-50">
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={serverSearch ? "Ketik minimal 2 karakter..." : "Cari..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>

          <div ref={listRef} className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 && !loading ? (
              <div className="p-4 text-sm text-gray-500 text-center">
                {serverSearch && searchTerm.trim().length < 2
                  ? 'Ketik minimal 2 karakter untuk mencari'
                  : searchTerm
                  ? 'Tidak ada hasil yang cocok'
                  : 'Tidak ada data ditemukan'}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(option.value);
                  }}
                >
                  <div
                    className={cn(
                      'flex items-center justify-center w-5 h-5 border-2 rounded flex-shrink-0',
                      selectedValues.includes(option.value)
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300'
                    )}
                  >
                    {selectedValues.includes(option.value) && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-sm text-gray-700 flex-1 truncate">{option.label}</span>
                  {option.color && (
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: `#${option.color}` }}
                    />
                  )}
                </div>
              ))
            )}

            {loading && (
              <div className="p-3">
                <LoadingSpinner size="sm" text="Memuat lebih banyak..." />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
