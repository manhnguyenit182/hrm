import { useState, useEffect } from 'react';

/**
 * A hook that delays updating a value until after a specified delay has passed
 * since the last time the value was updated.
 * 
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set debouncedValue to value (passed in) after the specified delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout if value changes before the delay has passed
    // or if the component unmounts
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]); // Only re-call effect if value or delay changes

  return debouncedValue;
}
