"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Persist state to localStorage with SSR safety.
 *
 * @example
 * const [sidebarOpen, setSidebarOpen] = useLocalStorage("sidebar-open", true);
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Read from localStorage on mount (client-only)
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item) as T);
      }
    } catch {
      // localStorage unavailable (SSR, private browsing)
    }
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        setStoredValue((prev) => {
          const newValue = typeof value === "function" ? (value as (prev: T) => T)(prev) : value;
          window.localStorage.setItem(key, JSON.stringify(newValue));
          return newValue;
        });
      } catch {
        // ignore write errors
      }
    },
    [key]
  );

  return [storedValue, setValue];
}
