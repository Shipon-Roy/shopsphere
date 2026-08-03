"use client";

import { useState, useEffect } from "react";

/**
 * Debounce a value by a given delay (ms).
 * Useful for search inputs to avoid excessive API calls.
 *
 * @example
 * const debouncedSearch = useDebounce(searchQuery, 400);
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
