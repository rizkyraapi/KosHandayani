'use client';

import { useEffect } from 'react';

export function useAutoRefresh(refresh: () => void | Promise<void>, intervalMs = 30_000) {
  useEffect(() => {
    let isMounted = true;

    const runRefresh = () => {
      if (isMounted) {
        void refresh();
      }
    };

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') {
        runRefresh();
      }
    };

    window.addEventListener('focus', runRefresh);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    const intervalId = window.setInterval(runRefresh, intervalMs);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', runRefresh);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
      window.clearInterval(intervalId);
    };
  }, [intervalMs, refresh]);
}
