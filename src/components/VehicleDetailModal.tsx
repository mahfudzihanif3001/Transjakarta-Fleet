import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, MapPin, Clock, Activity, Navigation, Gauge, Route,
  MapPinned, Compass, ArrowUpRight, Users, DollarSign,
  Hash, Train
} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import type { Vehicle, RouteData, TripData, StopData } from '../types';
import { formatDateTime, formatRelativeTime, getStatusLabel, getStatusColor } from '../utils/formatters';
import { cn } from '../utils/cn';

interface VehicleDetailModalProps {
  vehicle: Vehicle;
  routeData?: RouteData;
  tripData?: TripData;
  stopData?: StopData;
  onClose: () => void;
}

const getStatusBadgeStyle = (status: string | null) => {
  switch (status) {
    case 'IN_TRANSIT_TO': return 'bg-green-500';
    case 'STOPPED_AT': return 'bg-red-500';
    case 'INCOMING_AT': return 'bg-amber-500';
    default: return 'bg-gray-500';
  }
};

const getOccupancyLabel = (status: string | null): string => {
  const map: Record<string, string> = {
    'MANY_SEATS_AVAILABLE': 'Banyak Kursi Tersedia',
    'FEW_SEATS_AVAILABLE': 'Sedikit Kursi Tersedia',
    'STANDING_ROOM_ONLY': 'Hanya Berdiri',
    'CRUSHED_STANDING_ROOM_ONLY': 'Sangat Padat',
    'FULL': 'Penuh',
    'NOT_ACCEPTING_PASSENGERS': 'Tidak Menerima Penumpang',
    'NO_DATA_AVAILABLE': 'Data Tidak Tersedia',
    'NOT_BOARDABLE': 'Tidak Bisa Naik',
  };
  return status ? map[status] || status : 'Tidak Diketahui';
};

const getRevenueLabel = (status: string | null): string => {
  const map: Record<string, string> = {
    'REVENUE': 'Beroperasi Komersial',
    'NON_REVENUE': 'Tidak Komersial',
  };
  return status ? map[status] || status : 'Tidak Diketahui';
};

const getDirectionLabel = (id: number | null): string => {
  if (id === null) return 'Tidak Diketahui';
  return id === 0 ? 'Outbound (0)' : 'Inbound (1)';
};

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  vehicle,
  routeData,
  tripData,
  stopData,
  onClose,
}) => {
  const navigate = useNavigate();
  const { attributes } = vehicle;
  const hasValidCoordinates = attributes.latitude !== null && attributes.longitude !== null;

  const handleViewOnMap = () => {
    onClose();
    navigate(`/map?vehicle=${vehicle.id}&lat=${attributes.latitude}&lng=${attributes.longitude}`);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <Train className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">
                Kendaraan {attributes.label || vehicle.id}
              </h2>
              <p className="text-sm text-white/60 mb-3">ID: {vehicle.id}</p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white',
                  getStatusBadgeStyle(attributes.current_status)
                )}>
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  {getStatusLabel(attributes.current_status)}
                </span>
                {hasValidCoordinates && (
                  <button
                    onClick={handleViewOnMap}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500 hover:bg-blue-400 transition-colors"
                  >
                    <MapPin className="w-3 h-3" />
                    Lihat di Peta
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column - Vehicle Details */}
            <div className="space-y-5">
              {/* Location */}
              <Section title="Lokasi & Pergerakan" icon={<MapPin className="w-4 h-4 text-blue-500" />}>
                <InfoRow label="Latitude" value={attributes.latitude?.toFixed(6) ?? 'N/A'} />
                <InfoRow label="Longitude" value={attributes.longitude?.toFixed(6) ?? 'N/A'} />
                <InfoRow
                  label="Kecepatan"
                  value={attributes.speed != null ? `${attributes.speed} m/s (${Math.round(attributes.speed * 3.6)} km/h)` : 'N/A'}
                  icon={<Gauge className="w-3.5 h-3.5 text-amber-500" />}
                />
                <InfoRow
                  label="Bearing (Arah)"
                  value={attributes.bearing != null ? `${attributes.bearing}°` : 'N/A'}
                  icon={<Compass className="w-3.5 h-3.5 text-purple-500" />}
                />
              </Section>

              {/* Status Details */}
              <Section title="Status Kendaraan" icon={<Activity className="w-4 h-4 text-green-500" />}>
                <InfoRow
                  label="Status Saat Ini"
                  value={getStatusLabel(attributes.current_status)}
                  badge={getStatusColor(attributes.current_status)}
                />
                <InfoRow
                  label="Direction ID"
                  value={getDirectionLabel(attributes.direction_id)}
                  icon={<Navigation className="w-3.5 h-3.5 text-cyan-500" />}
                />
                <InfoRow
                  label="Stop Sequence"
                  value={attributes.current_stop_sequence != null ? `#${attributes.current_stop_sequence}` : 'N/A'}
                  icon={<Hash className="w-3.5 h-3.5 text-orange-500" />}
                />
              </Section>

              {/* Occupancy & Revenue */}
              <Section title="Operasional" icon={<Users className="w-4 h-4 text-indigo-500" />}>
                <InfoRow
                  label="Status Penumpang"
                  value={getOccupancyLabel(attributes.occupancy_status)}
                  icon={<Users className="w-3.5 h-3.5 text-indigo-400" />}
                />
                <InfoRow
                  label="Revenue Status"
                  value={getRevenueLabel(attributes.revenue_status)}
                  icon={<DollarSign className="w-3.5 h-3.5 text-emerald-500" />}
                />
              </Section>

              {/* Carriages */}
              {attributes.carriages && attributes.carriages.length > 0 && (
                <Section title="Gerbong" icon={<Train className="w-4 h-4 text-rose-500" />}>
                  {attributes.carriages.map((carriage, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-100 mb-2 last:mb-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-700">
                          {carriage.label || `Gerbong ${index + 1}`}
                        </span>
                        {carriage.occupancy_percentage != null && (
                          <span className="text-xs font-medium text-gray-600">
                            {carriage.occupancy_percentage}%
                          </span>
                        )}
                      </div>
                      {carriage.occupancy_percentage != null && (
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={cn(
                              'h-1.5 rounded-full',
                              carriage.occupancy_percentage > 80 ? 'bg-red-500' :
                              carriage.occupancy_percentage > 50 ? 'bg-amber-500' : 'bg-green-500'
                            )}
                            style={{ width: `${Math.min(carriage.occupancy_percentage, 100)}%` }}
                          />
                        </div>
                      )}
                      <p className="text-[11px] text-gray-500 mt-1">
                        {getOccupancyLabel(carriage.occupancy_status)}
                      </p>
                    </div>
                  ))}
                </Section>
              )}

              {/* Timestamp */}
              <Section title="Waktu" icon={<Clock className="w-4 h-4 text-blue-500" />}>
                <InfoRow label="Terakhir Diperbarui" value={formatDateTime(attributes.updated_at)} />
                <InfoRow label="Relatif" value={formatRelativeTime(attributes.updated_at)} />
              </Section>
            </div>

            {/* Right Column - Route, Trip, Stop */}
            <div className="space-y-5">
              {/* Mini Map */}
              {hasValidCoordinates && (
                <div 
                  onClick={handleViewOnMap}
                  className="border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all"
                >
                  <MapContainer
                    center={[attributes.latitude!, attributes.longitude!]}
                    zoom={15}
                    style={{ height: '220px', width: '100%', pointerEvents: 'none' }}
                    zoomControl={false}
                    attributionControl={false}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution=""
                    />
                    <CircleMarker
                      center={[attributes.latitude!, attributes.longitude!]}
                      radius={8}
                      fillColor={
                        attributes.current_status === 'IN_TRANSIT_TO' ? '#10b981' :
                        attributes.current_status === 'STOPPED_AT' ? '#ef4444' :
                        attributes.current_status === 'INCOMING_AT' ? '#f59e0b' : '#6b7280'
                      }
                      color="white"
                      weight={2}
                      opacity={1}
                      fillOpacity={0.8}
                    />
                  </MapContainer>
                </div>
              )}

              {/* Route */}
              {routeData ? (
                <div className="p-5 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Route className="w-4 h-4 text-blue-500" />
                    <h3 className="text-sm font-semibold text-blue-900">Rute</h3>
                  </div>
                  <p className="text-base font-bold text-gray-900 mb-1">{routeData.attributes.long_name}</p>
                  <div className="space-y-1.5 text-xs text-gray-600 mt-3">
                    {routeData.attributes.short_name && (
                      <p>Kode: <span className="font-medium text-gray-800">{routeData.attributes.short_name}</span></p>
                    )}
                    {routeData.attributes.description && (
                      <p>Tipe: <span className="font-medium text-gray-800">{routeData.attributes.description}</span></p>
                    )}
                    {routeData.attributes.fare_class && (
                      <p>Kelas: <span className="font-medium text-gray-800">{routeData.attributes.fare_class}</span></p>
                    )}
                    {routeData.attributes.direction_names?.length > 0 && (
                      <p>Arah: <span className="font-medium text-gray-800">
                        {routeData.attributes.direction_names.join(' ↔ ')}
                      </span></p>
                    )}
                    {routeData.attributes.direction_destinations?.length > 0 && (
                      <p>Tujuan: <span className="font-medium text-gray-800">
                        {routeData.attributes.direction_destinations.join(' ↔ ')}
                      </span></p>
                    )}
                    {routeData.attributes.color && (
                      <div className="flex items-center gap-2 mt-2">
                        <span>Warna:</span>
                        <div
                          className="w-5 h-5 rounded border border-gray-300"
                          style={{ backgroundColor: `#${routeData.attributes.color}` }}
                        />
                        <span className="font-mono text-gray-800">#{routeData.attributes.color}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Route className="w-4 h-4 text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-500">Rute</h3>
                  </div>
                  <p className="text-xs text-gray-400 italic">Data rute tidak tersedia</p>
                </div>
              )}

              {/* Trip */}
              {tripData ? (
                <div className="p-5 bg-green-50 rounded-xl border border-green-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Navigation className="w-4 h-4 text-green-500" />
                    <h3 className="text-sm font-semibold text-green-900">Trip</h3>
                  </div>
                  <p className="text-base font-bold text-gray-900 mb-1">{tripData.attributes.headsign}</p>
                  <div className="space-y-1.5 text-xs text-gray-600 mt-3">
                    <p>ID: <span className="font-mono font-medium text-gray-800">{tripData.id}</span></p>
                    {tripData.attributes.name && (
                      <p>Nama: <span className="font-medium text-gray-800">{tripData.attributes.name}</span></p>
                    )}
                    <p>Direction: <span className="font-medium text-gray-800">
                      {getDirectionLabel(tripData.attributes.direction_id)}
                    </span></p>
                    {tripData.attributes.block_id && (
                      <p>Block: <span className="font-mono font-medium text-gray-800">{tripData.attributes.block_id}</span></p>
                    )}
                    <p>Akses Kursi Roda: <span className="font-medium text-gray-800">
                      {tripData.attributes.wheelchair_accessible === 1 ? 'Ya' : tripData.attributes.wheelchair_accessible === 2 ? 'Tidak' : 'Tidak Diketahui'}
                    </span></p>
                    <p>Sepeda: <span className="font-medium text-gray-800">
                      {tripData.attributes.bikes_allowed === 1 ? 'Diizinkan' : tripData.attributes.bikes_allowed === 2 ? 'Tidak Diizinkan' : 'Tidak Diketahui'}
                    </span></p>
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Navigation className="w-4 h-4 text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-500">Trip</h3>
                  </div>
                  <p className="text-xs text-gray-400 italic">Data trip tidak tersedia</p>
                </div>
              )}

              {/* Stop */}
              {stopData ? (
                <div className="p-5 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPinned className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-semibold text-amber-900">
                      {attributes.current_status === 'STOPPED_AT' ? 'Halte Saat Ini' : 'Halte Berikutnya'}
                    </h3>
                  </div>
                  <p className="text-base font-bold text-gray-900 mb-1">{stopData.attributes.name}</p>
                  <div className="space-y-1.5 text-xs text-gray-600 mt-3">
                    <p>ID: <span className="font-mono font-medium text-gray-800">{stopData.id}</span></p>
                    {stopData.attributes.description && (
                      <p>Deskripsi: <span className="font-medium text-gray-800">{stopData.attributes.description}</span></p>
                    )}
                    {stopData.attributes.latitude && stopData.attributes.longitude && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <span className="font-mono">
                          {stopData.attributes.latitude.toFixed(6)}, {stopData.attributes.longitude.toFixed(6)}
                        </span>
                      </div>
                    )}
                    <p>Akses Kursi Roda: <span className="font-medium text-gray-800">
                      {stopData.attributes.wheelchair_boarding === 1 ? 'Ya' : stopData.attributes.wheelchair_boarding === 2 ? 'Tidak' : 'Tidak Diketahui'}
                    </span></p>
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPinned className="w-4 h-4 text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-500">Halte/Stop</h3>
                  </div>
                  <p className="text-xs text-gray-400 italic">Data halte tidak tersedia</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper components
interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, icon, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
      {icon}
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
    </div>
    <div className="p-4 space-y-2.5">{children}</div>
  </div>
);

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  badge?: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, icon, badge }) => (
  <div className="flex items-center justify-between gap-2">
    <div className="flex items-center gap-2 text-xs text-gray-500">
      {icon}
      <span>{label}</span>
    </div>
    {badge ? (
      <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-medium', badge)}>
        {value}
      </span>
    ) : (
      <span className="text-xs font-medium text-gray-900 text-right">{value}</span>
    )}
  </div>
);
