"use client";

import { useState, useCallback } from "react";
import { DEFAULT_PAGE, DEFAULT_LIMIT } from "@/constants";

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
}

interface UsePaginationReturn {
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  resetPage: () => void;
}

/**
 * Manage pagination state for tables and lists.
 *
 * @example
 * const { page, limit, setPage, nextPage, prevPage } = usePagination();
 */
export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const { initialPage = DEFAULT_PAGE, initialLimit = DEFAULT_LIMIT } = options;

  const [page, setPageState] = useState(initialPage);
  const [limit, setLimitState] = useState(initialLimit);

  const setPage = useCallback((p: number) => setPageState(p), []);

  const setLimit = useCallback((l: number) => {
    setLimitState(l);
    setPageState(1); // reset to first page when limit changes
  }, []);

  const nextPage = useCallback(() => setPageState((p) => p + 1), []);
  const prevPage = useCallback(() => setPageState((p) => Math.max(1, p - 1)), []);
  const resetPage = useCallback(() => setPageState(1), []);

  return { page, limit, setPage, setLimit, nextPage, prevPage, resetPage };
}
