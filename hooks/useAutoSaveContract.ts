import { useEffect, RefObject } from "react";

export function useAutoSaveContract({
  isLoading,
  triggerDebouncedSave,
  debouncedSaveRef,
  deps = [],
}: {
  isLoading: boolean;
  triggerDebouncedSave: () => void;
  debouncedSaveRef: RefObject<{ cancel: () => void } | undefined>;
  deps?: any[];
}) {
  useEffect(() => {
    if (isLoading) return;

    triggerDebouncedSave();

    return () => {
      debouncedSaveRef.current?.cancel();
    };
  }, [isLoading, triggerDebouncedSave, ...deps]);
}
