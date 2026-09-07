import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface VirtualScrollOptions {
  totalItems: number;
  itemHeight: number;
  overscan?: number;
}

export interface VirtualScrollResult {
  containerRef: React.RefObject<HTMLDivElement | null>;
  virtualItems: { index: number; start: number }[];
  totalHeight: number;
  startIndex: number;
  endIndex: number;
  topPadding: number;
  bottomPadding: number;
  visibleCount: number;
  scrollToIndex: (index: number) => void;
  scrollToTop: () => void;
}

/**
 * High-performance virtual DOM windowing hook.
 * Calculates visible window indices based on container scroll position and viewport height.
 * Keeps DOM node count minimal (~15-30 elements) regardless of whether totalItems is 1,000 or 100,000.
 */
export function useVirtualScroll({
  totalItems,
  itemHeight,
  overscan = 5
}: VirtualScrollOptions): VirtualScrollResult {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(500);

  // Measure container height with ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      if (container) {
        setViewportHeight(container.clientHeight || 500);
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Listen to scroll events on container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (container) {
            setScrollTop(container.scrollTop);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Compute virtual boundaries
  const totalHeight = totalItems * itemHeight;

  const rawStartIndex = Math.floor(scrollTop / itemHeight);
  const startIndex = Math.max(0, rawStartIndex - overscan);

  const rawVisibleCount = Math.ceil(viewportHeight / itemHeight);
  const visibleCount = rawVisibleCount + 2 * overscan;
  const endIndex = Math.min(totalItems, startIndex + visibleCount);

  const topPadding = startIndex * itemHeight;
  const bottomPadding = Math.max(0, (totalItems - endIndex) * itemHeight);

  const virtualItems: { index: number; start: number }[] = [];
  for (let i = startIndex; i < endIndex; i++) {
    virtualItems.push({
      index: i,
      start: i * itemHeight
    });
  }

  const scrollToIndex = useCallback((index: number) => {
    if (containerRef.current) {
      containerRef.current.scrollTop = index * itemHeight;
    }
  }, [itemHeight]);

  const scrollToTop = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, []);

  return {
    containerRef,
    virtualItems,
    totalHeight,
    startIndex,
    endIndex,
    topPadding,
    bottomPadding,
    visibleCount: endIndex - startIndex,
    scrollToIndex,
    scrollToTop
  };
}
