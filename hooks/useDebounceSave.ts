import { useEffect, useRef } from "react";
import { debounce } from "lodash";

export function useDebouncedSave(saveFn: () => void, delay = 2000) {
  const debouncedRef = useRef<ReturnType<typeof debounce>>();

  useEffect(() => {
    debouncedRef.current = debounce(() => {
      saveFn();
    }, delay);

    return () => {
      debouncedRef.current?.cancel();
    };
  }, [saveFn, delay]);

  return debouncedRef;
}
