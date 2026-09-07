import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  Zap, 
  Layers,
  ArrowRight
} from 'lucide-react';

export type PageSizeMode = 25 | 50 | 100 | 250 | 'virtual';

export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pageSize: PageSizeMode;
  totalItems: number;
  startIndex: number; // 0-based
  endIndex: number; // 0-based, exclusive
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: PageSizeMode) => void;
  itemLabel?: string;
  virtualVisibleCount?: number;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
  onPageSizeChange,
  itemLabel = 'records',
  virtualVisibleCount
}) => {
  const [jumpInput, setJumpInput] = useState('');
  const isVirtual = pageSize === 'virtual';

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(jumpInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
      setJumpInput('');
    }
  };

  // Generate page numbers to show with smart ellipses
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [1];

    if (currentPage > 3) {
      pages.push('...');
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    if (!pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200/90 text-xs">
      {/* Left: Range Info & Virtual Window Badge */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-slate-500 font-medium">
          {totalItems === 0 ? (
            '0 items'
          ) : isVirtual ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
              <span className="font-bold text-slate-900">{totalItems.toLocaleString()}</span> {itemLabel}
            </span>
          ) : (
            <span>
              Showing <strong className="text-slate-900 font-semibold">{Math.min(startIndex + 1, totalItems).toLocaleString()}</strong> to{' '}
              <strong className="text-slate-900 font-semibold">{Math.min(endIndex, totalItems).toLocaleString()}</strong> of{' '}
              <strong className="text-slate-900 font-semibold">{totalItems.toLocaleString()}</strong> {itemLabel}
            </span>
          )}
        </span>

        {isVirtual && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium text-[11px] border border-indigo-100">
            <Zap className="w-3 h-3 text-indigo-600 animate-pulse" />
            <span>Virtual Windowing (~{virtualVisibleCount || 20} DOM nodes in viewport)</span>
          </span>
        )}
      </div>

      {/* Right: Page Size Selector & Navigation Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Page Size Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 text-[11px]">View:</span>
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            {([25, 50, 100, 250] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onPageSizeChange(size)}
                className={`px-2 py-0.5 rounded-md font-semibold text-[11px] transition-all cursor-pointer ${
                  pageSize === size
                    ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={`Show ${size} rows per page`}
              >
                {size}
              </button>
            ))}
            <button
              type="button"
              onClick={() => onPageSizeChange('virtual')}
              className={`px-2.5 py-0.5 rounded-md font-semibold text-[11px] inline-flex items-center gap-1 transition-all cursor-pointer ${
                isVirtual
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-indigo-600 hover:bg-indigo-50'
              }`}
              title="Virtual DOM Windowing: Renders all items virtually with 60 FPS smooth scrolling"
            >
              <Zap className="w-3 h-3" />
              <span>Virtual All</span>
            </button>
          </div>
        </div>

        {/* Standard Pagination Navigation (hidden when in virtual window mode) */}
        {!isVirtual && totalPages > 1 && (
          <div className="flex items-center gap-1">
            {/* First Page */}
            <button
              type="button"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="First Page"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>

            {/* Previous Page */}
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Page Numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {getPageNumbers().map((p, idx) => {
                if (typeof p === 'string') {
                  return (
                    <span key={`dots-${idx}`} className="px-1 text-slate-400 select-none">
                      ...
                    </span>
                  );
                }
                const isActive = p === currentPage;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onPageChange(p)}
                    className={`min-w-7 h-7 px-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            {/* Next Page */}
            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Last Page */}
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Last Page"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>

            {/* Jump to Page Input */}
            {totalPages > 5 && (
              <form onSubmit={handleJumpSubmit} className="hidden md:flex items-center gap-1 ml-1.5">
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={jumpInput}
                  onChange={(e) => setJumpInput(e.target.value)}
                  placeholder="Go to"
                  className="w-14 px-1.5 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-center font-medium"
                />
                <button
                  type="submit"
                  className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  title="Go to page"
                >
                  <ArrowRight className="w-3 h-3" />
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
