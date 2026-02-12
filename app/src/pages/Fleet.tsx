import { useState, useMemo, useEffect, useRef } from 'react';
import { Filter, Bus } from 'lucide-react';
import { useVehicles } from '../hooks/useVehicles';
import { useAllVehicles } from '../hooks/useAllVehicles';
import { useRoutes } from '../hooks/useRoutes';
import { useTrips } from '../hooks/useTrips';
import { VehicleCard } from '../components/VehicleCard';
import { VehicleDetailModal } from '../components/VehicleDetailModal';
import { MultiSelectDropdown } from '../components/MultiSelectDropdown';
import { Pagination } from '../components/Pagination';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import type { Vehicle, FilterState } from '../types';

export const Fleet = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState<FilterState>({
    routes: [],
    trips: [],
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const prevRoutesRef = useRef<string[]>([]);

  const {
    options: routeOptions,
    loading: routesLoading,
    hasMore: routesHasMore,
    loadMore: routesLoadMore,
  } = useRoutes();

  // Fetch trips based on selected routes
  const {
    options: tripOptions,
    loading: tripsLoading,
    hasMore: tripsHasMore,
    loadMore: tripsLoadMore,
    allTripIds,
  } = useTrips(filters.routes);

  // Auto-reset trip filters when routes change
  useEffect(() => {
    const routesChanged =
      prevRoutesRef.current.length !== filters.routes.length ||
      prevRoutesRef.current.some((route, i) => route !== filters.routes[i]);

    if (routesChanged && prevRoutesRef.current.length > 0) {
      setFilters((prev) => ({ ...prev, trips: [] }));
    }

    prevRoutesRef.current = filters.routes;
  }, [filters.routes]);

  // Convert selected trip headsigns to actual trip IDs for API filter
  const filtersWithTripIds = useMemo(() => {
    const actualTripIds = filters.trips.flatMap((headsign) => allTripIds.get(headsign) || []);

    return {
      ...filters,
      trips: actualTripIds,
    };
  }, [filters, allTripIds]);

  // Fetch vehicles with converted trip IDs
  const {
    data: vehicles,
    loading: vehiclesLoading,
    error: vehiclesError,
    totalItems,
    getIncludedItem,
  } = useVehicles(currentPage, itemsPerPage, filtersWithTripIds, {
    autoRefresh: {
      enabled: true,
      interval: 15000,
    },
  });

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const isSearching = normalizedSearch.length >= 2;

  const {
    vehicles: allVehicles,
    loading: allVehiclesLoading,
    error: allVehiclesError,
    refreshNow: refreshAllVehicles,
    getIncludedItem: getAllIncludedItem,
  } = useAllVehicles(15000, isSearching);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof FilterState, values: string[]) => {
    setFilters((prev) => ({ ...prev, [key]: values }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({ routes: [], trips: [] });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleCloseModal = () => {
    setSelectedVehicle(null);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const baseVehicles = isSearching ? allVehicles : vehicles;
  const routeFilter = filtersWithTripIds.routes;
  const tripFilter = filtersWithTripIds.trips;

  const filteredByRouteTrip = useMemo(() => {
    if (routeFilter.length === 0 && tripFilter.length === 0) return baseVehicles;

    const routeSet = new Set(routeFilter);
    const tripSet = new Set(tripFilter);

    return baseVehicles.filter((vehicle) => {
      const routeId = vehicle.relationships.route.data?.id;
      const tripId = vehicle.relationships.trip.data?.id;

      if (routeSet.size > 0 && (!routeId || !routeSet.has(routeId))) return false;
      if (tripSet.size > 0 && (!tripId || !tripSet.has(tripId))) return false;
      return true;
    });
  }, [baseVehicles, routeFilter, tripFilter]);

  const filteredVehicles = isSearching
    ? filteredByRouteTrip.filter((vehicle) =>
        vehicle.id.toLowerCase().includes(normalizedSearch) ||
        vehicle.attributes.label.toLowerCase().includes(normalizedSearch)
      )
    : filteredByRouteTrip;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = currentPage * itemsPerPage;
  const paginatedVehicles = isSearching
    ? filteredVehicles.slice(startIndex, endIndex)
    : filteredVehicles;

  const isLoading = isSearching ? allVehiclesLoading : vehiclesLoading;
  const errorMessage = isSearching ? allVehiclesError : vehiclesError;
  const totalItemsForPagination = isSearching ? filteredVehicles.length : totalItems;
  const includedItemGetter = isSearching ? getAllIncludedItem : getIncludedItem;

  // Get included data for selected vehicle
  const selectedVehicleRoute = selectedVehicle?.relationships.route.data
    ? includedItemGetter('route', selectedVehicle.relationships.route.data.id)
    : undefined;

  const selectedVehicleTrip = selectedVehicle?.relationships.trip.data
    ? includedItemGetter('trip', selectedVehicle.relationships.trip.data.id)
    : undefined;

  const selectedVehicleStop = selectedVehicle?.relationships.stop.data
    ? includedItemGetter('stop', selectedVehicle.relationships.stop.data.id)
    : undefined;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fleet Management</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola dan pantau armada kendaraan</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Auto-update: 15s
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-700" />
            <h2 className="text-base font-semibold text-gray-900">Filter Kendaraan</h2>
          </div>
          <button
            onClick={handleResetFilters}
            className="text-xs font-medium text-gray-600 hover:text-gray-800 px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MultiSelectDropdown
            label="Rute"
            options={routeOptions}
            selectedValues={filters.routes}
            onChange={(values) => handleFilterChange('routes', values)}
            loading={routesLoading}
            hasMore={routesHasMore}
            onLoadMore={routesLoadMore}
            placeholder="Pilih rute..."
          />
          <MultiSelectDropdown
            label="Trip"
            options={tripOptions}
            selectedValues={filters.trips}
            onChange={(values) => handleFilterChange('trips', values)}
            loading={tripsLoading}
            hasMore={tripsHasMore}
            onLoadMore={tripsLoadMore}
            placeholder={filters.routes.length > 0 ? 'Pilih trip...' : 'Pilih rute terlebih dahulu...'}
            disabled={filters.routes.length === 0}
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cari Kendaraan
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ketik minimal 2 karakter..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

        {/* Error State */}
        {errorMessage && (
          <ErrorMessage
            message={errorMessage}
            onRetry={isSearching ? refreshAllVehicles : () => window.location.reload()}
            className="mb-6"
          />
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="py-12">
            <LoadingSpinner size="lg" text="Memuat data kendaraan..." />
          </div>
        )}

        {/* Vehicles Grid */}
        {!isLoading && !errorMessage && (
          <>
            {filteredVehicles.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
                <Bus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada kendaraan ditemukan</h3>
                <p className="text-sm text-gray-500">Coba ubah filter atau kata kunci pencarian</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {paginatedVehicles.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} onClick={() => handleVehicleClick(vehicle)} />
                  ))}
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={totalItemsForPagination}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  dataLength={paginatedVehicles.length}
                />
              </>
            )}
          </>
        )}
      {/* Vehicle Detail Modal */}
      {selectedVehicle && (
        <VehicleDetailModal
          vehicle={selectedVehicle}
          routeData={selectedVehicleRoute}
          tripData={selectedVehicleTrip}
          stopData={selectedVehicleStop}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};
