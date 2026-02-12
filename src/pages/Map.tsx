import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { RefreshCw, MapPin, X, Bus, Navigation, Gauge, Clock } from 'lucide-react';
import { useAllVehicles } from '../hooks/useAllVehicles';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { formatDistanceToNow, getStatusLabel, formatRelativeTime } from '../utils/formatters';
import { cn } from '../utils/cn';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom vehicle icons based on status
const createVehicleIcon = (status: string | null, isSelected: boolean = false) => {
  const getColorByStatus = (status: string | null) => {
    switch (status) {
      case 'IN_TRANSIT_TO': return '#22c55e';
      case 'STOPPED_AT': return '#ef4444';
      case 'INCOMING_AT': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const color = getColorByStatus(status);
  const size = isSelected ? 40 : 28;
  const stroke = isSelected ? 4 : 2;
  const r = isSelected ? 14 : 10;

  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="${color}" stroke="white" stroke-width="${stroke}"/>
        ${isSelected ? `<circle cx="${size/2}" cy="${size/2}" r="${r + 6}" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="4,3"/>` : ''}
        <rect x="${size/2-3}" y="${size/2-3}" width="6" height="6" fill="white" rx="1"/>
      </svg>
    `)}`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2],
  });
};

// Component to fly to a specific location
const FlyToLocation: React.FC<{ lat: number; lng: number; zoom?: number }> = ({ lat, lng, zoom = 15 }) => {
  const map = useMap();
  const hasFlown = useRef(false);

  useEffect(() => {
    if (!hasFlown.current && lat && lng) {
      map.flyTo([lat, lng], zoom, { duration: 1.5 });
      hasFlown.current = true;
    }
  }, [map, lat, lng, zoom]);

  return null;
};

export const Map = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    searchParams.get('vehicle')
  );
  const { vehicles, loading, error, lastUpdated, refreshNow, getIncludedItem } = useAllVehicles(10000);

  // Get target coordinates from URL
  const targetLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
  const targetLng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null;

  const statusFilters = [
    { value: 'all', label: 'Semua', count: 0, color: 'gray' },
    { value: 'IN_TRANSIT_TO', label: 'In Transit', count: 0, color: 'green' },
    { value: 'STOPPED_AT', label: 'Berhenti', count: 0, color: 'red' },
    { value: 'INCOMING_AT', label: 'Akan Tiba', count: 0, color: 'orange' },
  ];

  const filteredVehicles = vehicles.filter(vehicle => {
    if (!vehicle.attributes.latitude || !vehicle.attributes.longitude) return false;
    if (selectedStatus === 'all') return true;
    return vehicle.attributes.current_status === selectedStatus;
  });

  const stats = {
    total: vehicles.filter(v => v.attributes.latitude && v.attributes.longitude).length,
    inTransit: vehicles.filter(v => v.attributes.current_status === 'IN_TRANSIT_TO').length,
    stopped: vehicles.filter(v => v.attributes.current_status === 'STOPPED_AT').length,
    incoming: vehicles.filter(v => v.attributes.current_status === 'INCOMING_AT').length,
  };

  statusFilters[0].count = stats.total;
  statusFilters[1].count = stats.inTransit;
  statusFilters[2].count = stats.stopped;
  statusFilters[3].count = stats.incoming;

  const selectedVehicle = selectedVehicleId
    ? vehicles.find(v => v.id === selectedVehicleId)
    : null;

  const clearSelection = () => {
    setSelectedVehicleId(null);
    setSearchParams({});
  };

  const defaultCenter: [number, number] = [42.3601, -71.0589];

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Peta Armada</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {stats.total} kendaraan terpantau
            {lastUpdated && ` • Updated ${formatDistanceToNow(lastUpdated)}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Status Filters */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedStatus(filter.value)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                  selectedStatus === filter.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {filter.label}
                <span className="ml-1 text-[10px] text-gray-400">({filter.count})</span>
              </button>
            ))}
          </div>

          <button
            onClick={refreshNow}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="px-6 pt-3">
          <ErrorMessage message={error} onRetry={refreshNow} />
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative">
        {loading && !lastUpdated ? (
          <div className="h-full flex items-center justify-center">
            <LoadingSpinner size="lg" text="Memuat data peta..." />
          </div>
        ) : (
          <>
            <MapContainer
              center={defaultCenter}
              zoom={11}
              className="h-full w-full"
              zoomControl={true}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />

              {/* Fly to target vehicle if URL params exist */}
              {targetLat && targetLng && (
                <FlyToLocation lat={targetLat} lng={targetLng} zoom={16} />
              )}

              {filteredVehicles.map((vehicle) => {
                if (!vehicle.attributes.latitude || !vehicle.attributes.longitude) return null;

                const isSelected = vehicle.id === selectedVehicleId;
                const route = vehicle.relationships.route.data
                  ? getIncludedItem('route', vehicle.relationships.route.data.id)
                  : null;
                const trip = vehicle.relationships.trip.data
                  ? getIncludedItem('trip', vehicle.relationships.trip.data.id)
                  : null;

                return (
                  <Marker
                    key={vehicle.id}
                    position={[vehicle.attributes.latitude, vehicle.attributes.longitude]}
                    icon={createVehicleIcon(vehicle.attributes.current_status, isSelected)}
                    eventHandlers={{
                      click: () => setSelectedVehicleId(vehicle.id),
                    }}
                  >
                    <Popup>
                      <div className="p-1 min-w-[220px]">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1.5 bg-blue-50 rounded-lg">
                            <Bus className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-sm">
                              {vehicle.attributes.label}
                            </h3>
                            <p className="text-[10px] text-gray-500">ID: {vehicle.id}</p>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Status:</span>
                            <span className={cn(
                              'px-2 py-0.5 rounded-full text-[10px] font-semibold',
                              vehicle.attributes.current_status === 'IN_TRANSIT_TO' && 'bg-green-100 text-green-800',
                              vehicle.attributes.current_status === 'STOPPED_AT' && 'bg-red-100 text-red-800',
                              vehicle.attributes.current_status === 'INCOMING_AT' && 'bg-orange-100 text-orange-800',
                              !vehicle.attributes.current_status && 'bg-gray-100 text-gray-800'
                            )}>
                              {getStatusLabel(vehicle.attributes.current_status)}
                            </span>
                          </div>

                          {route && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Rute:</span>
                              <span className="font-medium text-gray-800 text-right max-w-[140px] truncate">
                                {route.attributes.long_name}
                              </span>
                            </div>
                          )}

                          {trip && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Tujuan:</span>
                              <span className="font-medium text-gray-800 text-right max-w-[140px] truncate">
                                {trip.attributes.headsign}
                              </span>
                            </div>
                          )}

                          {vehicle.attributes.speed != null && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Kecepatan:</span>
                              <span className="font-medium">{Math.round(vehicle.attributes.speed * 3.6)} km/h</span>
                            </div>
                          )}

                          {vehicle.attributes.bearing != null && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Bearing:</span>
                              <span className="font-medium">{vehicle.attributes.bearing}°</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                            <span className="text-gray-500">
                              {vehicle.attributes.latitude?.toFixed(4)}, {vehicle.attributes.longitude?.toFixed(4)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>

            {/* Loading overlay */}
            {loading && lastUpdated && (
              <div className="absolute top-4 right-4 bg-white rounded-xl shadow-lg px-4 py-2 flex items-center gap-2 z-[1000]">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-xs text-gray-600">Memperbarui...</span>
              </div>
            )}

            {/* Selected vehicle panel */}
            {selectedVehicle && (
              <div className="absolute bottom-6 left-6 right-6 max-w-lg bg-white rounded-2xl shadow-2xl z-[1000] overflow-hidden animate-slideUp">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-xl">
                        <Bus className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {selectedVehicle.attributes.label}
                        </h3>
                        <p className="text-xs text-gray-500">ID: {selectedVehicle.id}</p>
                      </div>
                    </div>
                    <button
                      onClick={clearSelection}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <Navigation className="w-4 h-4 mx-auto text-gray-600 mb-1" />
                      <p className="text-[10px] text-gray-500">Status</p>
                      <p className="text-xs font-semibold text-gray-900">
                        {getStatusLabel(selectedVehicle.attributes.current_status)}
                      </p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <Gauge className="w-4 h-4 mx-auto text-gray-600 mb-1" />
                      <p className="text-[10px] text-gray-500">Kecepatan</p>
                      <p className="text-xs font-semibold text-gray-900">
                        {selectedVehicle.attributes.speed != null
                          ? `${Math.round(selectedVehicle.attributes.speed * 3.6)} km/h`
                          : '-'}
                      </p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <MapPin className="w-4 h-4 mx-auto text-gray-600 mb-1" />
                      <p className="text-[10px] text-gray-500">Bearing</p>
                      <p className="text-xs font-semibold text-gray-900">
                        {selectedVehicle.attributes.bearing != null
                          ? `${selectedVehicle.attributes.bearing}°`
                          : '-'}
                      </p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <Clock className="w-4 h-4 mx-auto text-gray-600 mb-1" />
                      <p className="text-[10px] text-gray-500">Update</p>
                      <p className="text-xs font-semibold text-gray-900">
                        {formatRelativeTime(selectedVehicle.attributes.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Legend */}
        <div className="absolute bottom-6 right-6 bg-white rounded-xl shadow-lg p-3 z-[1000]">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Legend</p>
          <div className="space-y-1.5">
            {[
              { label: 'In Transit', color: '#22c55e' },
              { label: 'Berhenti', color: '#ef4444' },
              { label: 'Akan Tiba', color: '#f59e0b' },
              { label: 'Lainnya', color: '#6b7280' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: item.color }} />
                <span className="text-[11px] text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
