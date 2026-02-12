import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axios';
import type { Vehicle, ApiResponse, FilterState } from '../types';
import { useAutoRefresh } from './useAutoRefresh';

interface UseVehiclesOptions {
  autoRefresh?: {
    enabled?: boolean;
    interval?: number;
  };
}

export const useVehicles = (
  page: number,
  itemsPerPage: number,
  filters: FilterState,
  options?: UseVehiclesOptions
) => {
  const [data, setData] = useState<Vehicle[]>([]);
  const [includedData, setIncludedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [totalItems, setTotalItems] = useState(0);

  const autoRefreshEnabled = options?.autoRefresh?.enabled ?? false;
  const autoRefreshInterval = options?.autoRefresh?.interval ?? 15000;

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params: any = {
        'page[limit]': itemsPerPage,
        'page[offset]': (page - 1) * itemsPerPage,
        'include': 'route,trip,stop',
      };

      if (filters.routes.length > 0) {
        params['filter[route]'] = filters.routes.join(',');
      }

      if (filters.trips.length > 0) {
        params['filter[trip]'] = filters.trips.join(',');
      }

      const response = await apiClient.get<ApiResponse<Vehicle>>('/vehicles', { params });

      setData(response.data.data || []);
      setIncludedData(response.data.included || []);

      setTotalItems(response.data.data.length < itemsPerPage ? (page - 1) * itemsPerPage + response.data.data.length : page * itemsPerPage + 1);
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0]?.detail || 'Gagal mengambil data kendaraan. Silakan coba lagi.');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [filters.routes, filters.trips, itemsPerPage, page]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  useAutoRefresh({
    onRefresh: fetchVehicles,
    interval: autoRefreshInterval,
    enabled: autoRefreshEnabled,
    callOnMount: false,
  });

  const getIncludedItem = (type: string, id: string) => {
    return includedData.find((item) => item.type === type && item.id === id);
  };

  return { data, loading, error, totalItems, getIncludedItem };
};
