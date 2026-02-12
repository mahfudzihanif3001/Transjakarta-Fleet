import { useState, useCallback } from 'react';
import apiClient from '../api/axios';
import type { Vehicle, ApiResponse } from '../types';
import { useAutoRefresh } from './useAutoRefresh';

export const useAllVehicles = (refreshInterval: number = 10000, enabled: boolean = true) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [includedData, setIncludedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAllVehicles = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError('');

    try {
      const allVehicles: Vehicle[] = [];
      const allIncluded: any[] = [];
      let offset = 0;
      const limit = 500;

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const response = await apiClient.get<ApiResponse<Vehicle>>('/vehicles', {
          params: {
            'page[limit]': limit,
            'page[offset]': offset,
            'include': 'route,trip,stop',
          },
        });

        const data = response.data.data || [];
        const included = response.data.included || [];

        allVehicles.push(...data);
        allIncluded.push(...included);

        if (data.length < limit) break;
        offset += limit;
      }

      setVehicles(allVehicles);
      setIncludedData(allIncluded);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0]?.detail || 'Gagal mengambil data kendaraan.');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useAutoRefresh({
    onRefresh: fetchAllVehicles,
    interval: refreshInterval,
    enabled,
  });

  const getIncludedItem = useCallback(
    (type: string, id: string) => {
      return includedData.find((item) => item.type === type && item.id === id);
    },
    [includedData]
  );

  return { vehicles, loading, error, lastUpdated, refreshNow: fetchAllVehicles, getIncludedItem };
};
