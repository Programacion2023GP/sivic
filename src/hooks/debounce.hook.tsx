// hooks/useDebounce.ts
import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
   const [debouncedValue, setDebouncedValue] = useState<T>(value);

   useEffect(() => {
      const timer = setTimeout(() => {
         setDebouncedValue(value);
      }, delay);

      return () => {
         clearTimeout(timer);
      };
   }, [value, delay]);

   return debouncedValue;
}

// hooks/useDebounceCallback.ts
import { useCallback, useRef } from "react";

export function useDebounceCallback<T extends (...args: any[]) => any>(callback: T, delay: number): T {
   const timeoutRef = useRef<number | null>(null);

   const debouncedCallback = useCallback(
      (...args: Parameters<T>) => {
         if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
         }

         timeoutRef.current = window.setTimeout(() => {
            callback(...args);
         }, delay);
      },
      [callback, delay]
   );

   // Limpiar al desmontar
   useEffect(() => {
      return () => {
         if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
         }
      };
   }, []);

   return debouncedCallback as T;
}
