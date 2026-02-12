import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';
import { DropdownOption, ApiResponse } from '../types';

interface UseInfiniteDropdownParams {
  endpoint: string;
  labelField: string;
  enabled: boolean;
}

interface UseInfiniteDropdownReturn {
  options: DropdownOption[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  error: string | null;
}

export const useInfiniteDropdown = ({
  endpoint,
  labelField,
  enabled,
}: UseInfiniteDropdownParams): UseInfiniteDropdownReturn => {
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const itemsPerPage = 20;
  const loadingRef = useRef(false);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingRef.current || !enabled) return;
    setPage((prev) => prev + 1);
  }, [hasMore, enabled]);

  useEffect(() => {
    if (!enabled) {
      setOptions([]);
      setPage(0);
      setHasMore(true);
      return;
    }

    const fetchData = async () => {
      if (loadingRef.current) return;
      
      loadingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const params = {
          'page[limit]': itemsPerPage,
          'page[offset]': page * itemsPerPage,
        };

        const response = await api.get<ApiResponse<any>>(endpoint, { params });

        const newOptions: DropdownOption[] = response.data.data.map((item: any) => ({
          value: item.id,
          label: item.attributes[labelField] || item.id,
        }));

        if (page === 0) {
          setOptions(newOptions);
        } else {
          setOptions((prev) => [...prev, ...newOptions]);
        }

        setHasMore(response.data.data.length === itemsPerPage);
      } catch (err) {
        console.error(`Error fetching ${endpoint}:`, err);
        setError(`Gagal memuat data. Silakan coba lagi.`);
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    };

    if (enabled) {
      fetchData();
    }
  }, [endpoint, labelField, page, enabled]);

  useEffect(() => {
    setOptions([]);
    setPage(0);
    setHasMore(true);
  }, [endpoint, enabled]);

  return { options, loading, hasMore, loadMore, error };
};
