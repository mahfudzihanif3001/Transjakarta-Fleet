import { useEffect, useRef } from 'react';

interface UseAutoRefreshOptions {
  onRefresh: () => void;
  interval?: number;
  enabled?: boolean;
  callOnMount?: boolean;
}

export const useAutoRefresh = ({ 
  onRefresh, 
  interval = 15000,
  enabled = true,
  callOnMount = true
}: UseAutoRefreshOptions) => {
  const intervalRef = useRef<number>();
  const onRefreshRef = useRef(onRefresh);
  const hasCalledInitial = useRef(false);

  // Keep ref in sync without re-triggering effect
  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      hasCalledInitial.current = false;
      return;
    }

    // Initial call on mount (only once)
    if (callOnMount && !hasCalledInitial.current) {
      hasCalledInitial.current = true;
      onRefreshRef.current();
    }

    // Setup interval for subsequent refreshes
    intervalRef.current = setInterval(() => {
      onRefreshRef.current();
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [interval, enabled]);
};
