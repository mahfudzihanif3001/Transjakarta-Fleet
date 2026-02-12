import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../api/axios';
import type { TripData, ApiResponse, DropdownOption } from '../types';

export const useTrips = (selectedRoutes: string[]) => {
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [allTripIds, setAllTripIds] = useState<Map<string, string[]>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);
  const limit = 100;

  const fetchTrips = useCallback(async (routes: string[], currentOffset: number) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // API requires filter - don't fetch if no routes selected
    if (!routes || routes.length === 0) {
      setOptions([]);
      setHasMore(false);
      setError('');
      return;
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError('');

    try {
      const params: any = {
        'page[limit]': limit,
        'page[offset]': currentOffset,
        'filter[route]': routes.join(','),
      };

      const response = await apiClient.get<ApiResponse<TripData>>('/trips', {
        params,
        signal: abortControllerRef.current.signal,
      });

      // Group trips by headsign and collect all trip IDs for each headsign
      const headsignToIdsMap = new Map<string, string[]>();
      const uniqueTripsMap = new Map<string, DropdownOption>();
      
      response.data.data.forEach((trip) => {
        const headsign = trip.attributes.headsign || trip.attributes.name || trip.id;
        
        // Collect trip IDs for this headsign
        const existingIds = headsignToIdsMap.get(headsign) || [];
        headsignToIdsMap.set(headsign, [...existingIds, trip.id]);
        
        // Only add if this headsign doesn't exist yet in options
        if (!uniqueTripsMap.has(headsign)) {
          uniqueTripsMap.set(headsign, {
            value: headsign,
            label: headsign,
          });
        }
      });

      const newOptions = Array.from(uniqueTripsMap.values());

      if (currentOffset === 0) {
        setOptions(newOptions);
        setAllTripIds(headsignToIdsMap);
      } else {
        // Merge and deduplicate when loading more
        setOptions(prev => {
          const mergedMap = new Map<string, DropdownOption>();
          prev.forEach(opt => mergedMap.set(opt.label, opt));
          newOptions.forEach(opt => mergedMap.set(opt.label, opt));
          return Array.from(mergedMap.values());
        });
        
        setAllTripIds(prev => {
          const merged = new Map(prev);
          headsignToIdsMap.forEach((ids, headsign) => {
            const existing = merged.get(headsign) || [];
            merged.set(headsign, [...new Set([...existing, ...ids])]);
          });
          return merged;
        });
      }
      
      setHasMore(response.data.data.length === limit && newOptions.length > 0);
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        return;
      }
      setError(err.response?.data?.errors?.[0]?.detail || 'Gagal mengambil data trip.');
      if (currentOffset === 0) {
        setOptions([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!loading && hasMore && selectedRoutes.length > 0) {
      const newOffset = offset + limit;
      setOffset(newOffset);
      fetchTrips(selectedRoutes, newOffset);
    }
  }, [offset, loading, hasMore, selectedRoutes, fetchTrips]);

  useEffect(() => {
    // Reset offset when routes change
    setOffset(0);
    fetchTrips(selectedRoutes, 0);
  }, [selectedRoutes, fetchTrips]);

  return { options, loading, error, hasMore, loadMore, allTripIds };
};
