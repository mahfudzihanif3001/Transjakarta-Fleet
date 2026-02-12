import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axios';
import type { RouteData, ApiResponse, DropdownOption } from '../types';

export const useRoutes = () => {
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const fetchRoutes = useCallback(async (currentOffset: number) => {
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      const params = {
        'page[limit]': limit,
        'page[offset]': currentOffset,
      };

      const response = await apiClient.get<ApiResponse<RouteData>>('/routes', { params });

      const newOptions: DropdownOption[] = response.data.data.map((route) => ({
        value: route.id,
        label: route.attributes.long_name || route.attributes.short_name || route.id,
        color: route.attributes.color,
      }));

      setOptions((prev) => [...prev, ...newOptions]);
      setHasMore(response.data.data.length === limit);
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0]?.detail || 'Gagal mengambil data rute.');
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const newOffset = offset + limit;
      setOffset(newOffset);
      fetchRoutes(newOffset);
    }
  }, [offset, loading, hasMore, fetchRoutes]);

  useEffect(() => {
    fetchRoutes(0);
  }, []);

  return { options, loading, error, hasMore, loadMore };
};
