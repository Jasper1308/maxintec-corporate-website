'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { getDashboardMetrics } from './queries';
import type { DashboardMetrics } from './types';

interface UseDashboardMetricsResult {
  metrics: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useDashboardMetrics(
  enabled: boolean
): UseDashboardMetricsResult {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setMetrics(null);
      setLoading(false);
      setError(null);
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);

    try {
      const nextMetrics = await getDashboardMetrics();

      if (mountedRef.current && requestId === requestIdRef.current) {
        setMetrics(nextMetrics);
        setError(null);
      }
    } catch (loadError) {
      console.error('Failed to load dashboard metrics:', loadError);

      if (mountedRef.current && requestId === requestIdRef.current) {
        setError('Não foi possível carregar os indicadores do portal.');
      }
    } finally {
      if (mountedRef.current && requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const requestId = ++requestIdRef.current;
    let active = true;

    void getDashboardMetrics()
      .then(nextMetrics => {
        if (
          active &&
          mountedRef.current &&
          requestId === requestIdRef.current
        ) {
          setMetrics(nextMetrics);
          setError(null);
        }
      })
      .catch(loadError => {
        console.error('Failed to load dashboard metrics:', loadError);

        if (
          active &&
          mountedRef.current &&
          requestId === requestIdRef.current
        ) {
          setError('Não foi possível carregar os indicadores do portal.');
        }
      })
      .finally(() => {
        if (
          active &&
          mountedRef.current &&
          requestId === requestIdRef.current
        ) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [enabled]);

  return {
    metrics,
    loading,
    error,
    refresh,
  };
}
