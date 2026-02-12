import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../utils/cn';

interface PaginationProps {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  dataLength: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  dataLength,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, (currentPage - 1) * itemsPerPage + dataLength);
  const estimatedTotalPages = Math.ceil(totalItems / itemsPerPage);

  const canGoPrevious = currentPage > 1;
  const canGoNext = dataLength === itemsPerPage;

  const handlePrevious = () => {
    if (canGoPrevious) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onPageChange(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;
    
    if (estimatedTotalPages <= maxPagesToShow + 2) {
      for (let i = 1; i <= estimatedTotalPages; i++) {
        pages.push(i);
      }
      if (canGoNext && currentPage >= estimatedTotalPages) {
        pages.push(currentPage + 1);
      }
    } else {
      pages.push(1);
      
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(estimatedTotalPages - 1, currentPage + 1);
      
      if (currentPage > estimatedTotalPages - 2) {
        endPage = Math.max(endPage, currentPage + 1);
      }
      
      if (startPage > 2) {
        pages.push('...');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < estimatedTotalPages - 1) {
        pages.push('...');
      }
      
      if (estimatedTotalPages > 1 && !canGoNext) {
        pages.push(estimatedTotalPages);
      } else if (canGoNext) {
        if (currentPage >= estimatedTotalPages - 1) {
          pages.push(currentPage + 1);
        }
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="bg-white border-t border-gray-200 px-6 py-4 rounded-b-xl">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Items Per Page Selector */}
        <div className="flex items-center gap-3">
          <label htmlFor="items-per-page" className="text-sm text-gray-700 whitespace-nowrap">
            Data per halaman:
          </label>
          <select
            id="items-per-page"
            value={itemsPerPage}
            onChange={(e) => {
              onItemsPerPageChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        {/* Page Info */}
        <div className="text-sm text-gray-700 text-center">
          Menampilkan{' '}
          <span className="font-semibold">{startItem}</span>
          {' '}-{' '}
          <span className="font-semibold">{endItem}</span>
          {' '}data
        </div>

        {/* Page Navigation */}
        <div className="flex items-center gap-1">
          {/* Previous Button */}
          <button
            onClick={handlePrevious}
            disabled={!canGoPrevious}
            className={cn(
              'px-3 py-2 rounded-md text-sm font-medium transition-colors',
              'flex items-center gap-1',
              canGoPrevious
                ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
            )}
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Page Numbers */}
          <div className="hidden sm:flex items-center gap-1">
            {pageNumbers.map((page, index) => {
              if (page === '...') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-3 py-2 text-sm text-gray-500"
                  >
                    ...
                  </span>
                );
              }
              
              const pageNum = page as number;
              const isActive = pageNum === currentPage;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={cn(
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  )}
                  aria-label={`Halaman ${pageNum}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Current Page Display (Mobile) */}
          <div className="sm:hidden px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-md border border-gray-200">
            Hal. {currentPage}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className={cn(
              'px-3 py-2 rounded-md text-sm font-medium transition-colors',
              'flex items-center gap-1',
              canGoNext
                ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
            )}
            aria-label="Halaman selanjutnya"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>

        </div>
      </div>

     
    </div>
  );
};
