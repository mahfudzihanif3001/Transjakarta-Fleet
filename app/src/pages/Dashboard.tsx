import { useNavigate } from 'react-router-dom';
import {
  Activity, TrendingUp, StopCircle, Navigation, RefreshCw,
  MapPin, Clock, Bus, ArrowUpRight, Zap, Users
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { useAllVehicles } from '../hooks/useAllVehicles';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { formatDistanceToNow, getStatusLabel } from '../utils/formatters';
import { cn } from '../utils/cn';
import 'leaflet/dist/leaflet.css';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { vehicles, loading, error, lastUpdated, refreshNow } = useAllVehicles(10000);

  // Calculate stats
  const stats = {
    total: vehicles.length,
    inTransit: vehicles.filter(v => v.attributes.current_status === 'IN_TRANSIT_TO').length,
    stopped: vehicles.filter(v => v.attributes.current_status === 'STOPPED_AT').length,
    incoming: vehicles.filter(v => v.attributes.current_status === 'INCOMING_AT').length,
  };

  const operatingPercentage = stats.total > 0
    ? Math.round(((stats.inTransit + stats.incoming) / stats.total) * 100)
    : 0;

  // Pie chart data
  const pieData = [
    { name: 'In Transit', value: stats.inTransit, color: '#22c55e' },
    { name: 'Stopped', value: stats.stopped, color: '#ef4444' },
    { name: 'Incoming', value: stats.incoming, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  // Recent vehicles (last 5 updated)
  const recentVehicles = [...vehicles]
    .sort((a, b) => new Date(b.attributes.updated_at).getTime() - new Date(a.attributes.updated_at).getTime())
    .slice(0, 5);

  // Vehicles with coordinates for mini map
  const mappableVehicles = vehicles.filter(v => v.attributes.latitude && v.attributes.longitude);

  const defaultCenter: [number, number] = [42.3601, -71.0589];

  const getStatusDotColor = (status: string | null) => {
    switch (status) {
      case 'IN_TRANSIT_TO': return '#22c55e';
      case 'STOPPED_AT': return '#ef4444';
      case 'INCOMING_AT': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const statsCards = [
    {
      title: 'Total Armada',
      value: stats.total,
      subtitle: 'Unit aktif terpantau',
      icon: Bus,
      gradient: 'from-blue-500 to-blue-600',
      lightBg: 'bg-blue-50',
    },
    {
      title: 'Dalam Perjalanan',
      value: stats.inTransit,
      subtitle: 'Sedang beroperasi',
      icon: TrendingUp,
      gradient: 'from-green-500 to-emerald-600',
      lightBg: 'bg-green-50',
    },
    {
      title: 'Berhenti',
      value: stats.stopped,
      subtitle: 'Di halte/terminal',
      icon: StopCircle,
      gradient: 'from-red-500 to-rose-600',
      lightBg: 'bg-red-50',
    },
    {
      title: 'Akan Tiba',
      value: stats.incoming,
      subtitle: 'Mendekati halte',
      icon: Navigation,
      gradient: 'from-amber-500 to-orange-600',
      lightBg: 'bg-amber-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time fleet monitoring system
            {lastUpdated && (
              <span className="ml-2 text-gray-400">
                &bull; Updated {formatDistanceToNow(lastUpdated)}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live
          </div>
          <button
            onClick={refreshNow}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <ErrorMessage message={error} onRetry={refreshNow} className="mb-6" />
      )}

      {/* Loading State (first load only) */}
      {loading && !lastUpdated && (
        <div className="py-24">
          <LoadingSpinner size="lg" text="Memuat data dashboard..." />
        </div>
      )}

      {(!loading || lastUpdated) && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
            {statsCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn('p-2.5 rounded-xl bg-gradient-to-br', card.gradient)}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs text-gray-400 font-medium">Real-time</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{card.value}</h3>
                  <p className="text-sm font-medium text-gray-900">{card.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{card.subtitle}</p>
                </div>
              );
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            {/* Chart Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-base font-semibold text-gray-900 mb-1">Distribusi Status</h2>
              <p className="text-xs text-gray-500 mb-4">Status armada saat ini</p>

              <div className="flex items-center justify-center">
                <div className="relative">
                  <ResponsiveContainer width={200} height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any, name: any) => [`${value} unit`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">{operatingPercentage}%</span>
                    <span className="text-[10px] text-gray-500">Beroperasi</span>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-4 space-y-2.5">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini Map */}
            <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="p-5 pb-0 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Peta Armada</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {mappableVehicles.length} kendaraan terpantau
                  </p>
                </div>
                <button
                  onClick={() => navigate('/map')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                >
                  Lihat Peta Lengkap
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div
                className="flex-1 min-h-[320px] m-5 rounded-xl overflow-hidden border border-gray-200 cursor-pointer"
                onClick={() => navigate('/map')}
              >
                <MapContainer
                  center={defaultCenter}
                  zoom={11}
                  className="h-full w-full"
                  zoomControl={false}
                  attributionControl={false}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  {mappableVehicles.map((vehicle) => (
                    <CircleMarker
                      key={vehicle.id}
                      center={[vehicle.attributes.latitude!, vehicle.attributes.longitude!]}
                      radius={5}
                      pathOptions={{
                        fillColor: getStatusDotColor(vehicle.attributes.current_status),
                        color: '#fff',
                        weight: 2,
                        fillOpacity: 0.9,
                      }}
                    >
                      <Popup>
                        <div className="text-xs">
                          <p className="font-semibold">{vehicle.attributes.label}</p>
                          <p>{getStatusLabel(vehicle.attributes.current_status)}</p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Aktivitas Terkini</h2>
                  <p className="text-xs text-gray-500 mt-0.5">5 kendaraan terakhir diperbarui</p>
                </div>
                <button
                  onClick={() => navigate('/fleet')}
                  className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  Lihat Semua <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kendaraan</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kecepatan</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bearing</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentVehicles.map((vehicle) => (
                      <tr
                        key={vehicle.id}
                        className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => navigate('/fleet')}
                      >
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                              <Bus className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{vehicle.attributes.label}</p>
                              <p className="text-[11px] text-gray-500">ID: {vehicle.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: getStatusDotColor(vehicle.attributes.current_status) }}
                            />
                            <span className="text-xs font-medium text-gray-700">
                              {getStatusLabel(vehicle.attributes.current_status)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-xs text-gray-600">
                          {vehicle.attributes.speed != null
                            ? `${Math.round(vehicle.attributes.speed * 3.6)} km/h`
                            : '-'}
                        </td>
                        <td className="py-3 px-2 text-xs text-gray-600">
                          {vehicle.attributes.bearing != null ? `${vehicle.attributes.bearing}°` : '-'}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(vehicle.attributes.updated_at))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-base font-semibold text-gray-900 mb-1">Ringkasan Sistem</h2>
              <p className="text-xs text-gray-500 mb-5">Informasi operasional</p>

              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-900">Tingkat Operasi</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{operatingPercentage}%</p>
                  <div className="w-full bg-blue-100 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${operatingPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-semibold text-gray-700">Occupancy</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {vehicles.filter(v => v.attributes.occupancy_status).length} kendaraan
                    melaporkan status penumpang
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-semibold text-gray-700">Revenue Status</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {vehicles.filter(v => v.attributes.revenue_status === 'REVENUE').length} unit
                    beroperasi komersial
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-semibold text-gray-700">Lokasi Terpantau</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {mappableVehicles.length} dari {stats.total} kendaraan memiliki koordinat
                  </p>
                </div>

                <div className="pt-2">
                  <p className="text-[10px] text-gray-400 text-center">
                    Last update: {lastUpdated ? lastUpdated.toLocaleTimeString('id-ID') : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
