import { MapPin, Clock, Navigation, Activity, Zap } from 'lucide-react';
import type { Vehicle } from '../types';
import { formatRelativeTime, getStatusLabel, formatCoordinates } from '../utils/formatters';
import { cn } from '../utils/cn';

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick: () => void;
}

const getStatusConfig = (status: string | null) => {
  switch (status) {
    case 'IN_TRANSIT_TO':
      return {
        color: 'bg-green-50 border-green-200 text-green-800',
        badge: 'bg-green-500',
        icon: Navigation,
        label: 'Dalam Perjalanan',
        pulse: true
      };
    case 'STOPPED_AT':
      return {
        color: 'bg-red-50 border-red-200 text-red-800',
        badge: 'bg-red-500',
        icon: Activity,
        label: 'Berhenti',
        pulse: false
      };
    case 'INCOMING_AT':
      return {
        color: 'bg-orange-50 border-orange-200 text-orange-800',
        badge: 'bg-orange-500',
        icon: Zap,
        label: 'Akan Tiba',
        pulse: true
      };
    default:
      return {
        color: 'bg-gray-50 border-gray-200 text-gray-800',
        badge: 'bg-gray-500',
        icon: Activity,
        label: 'Tidak Diketahui',
        pulse: false
      };
  }
};

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onClick }) => {
  const { attributes } = vehicle;
  const statusConfig = getStatusConfig(attributes.current_status);
  const StatusIcon = statusConfig.icon;

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white border-2 rounded-xl p-6 cursor-pointer transition-all duration-200',
        'hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
        statusConfig.color
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {attributes.label || 'Tidak Ada Label'}
          </h3>
          <p className="text-sm text-gray-600">ID: {vehicle.id}</p>
        </div>
        
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-3 h-3 rounded-full',
            statusConfig.badge,
            statusConfig.pulse && 'animate-pulse'
          )}></div>
          <span className={cn(
            'px-3 py-1 rounded-full text-xs font-semibold',
            statusConfig.color
          )}>
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Status Icon and Label */}
      <div className="flex items-center gap-3 mb-4">
        <div className={cn(
          'p-2 rounded-lg',
          statusConfig.color
        )}>
          <StatusIcon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900">
            {getStatusLabel(attributes.current_status)}
          </div>
          {attributes.speed && (
            <div className="text-xs text-gray-600">
              Kecepatan: {Math.round(attributes.speed * 3.6)} km/h
            </div>
          )}
        </div>
      </div>

      {/* Location */}
      <div className="flex items-start gap-3 mb-4">
        <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <div className="font-medium text-gray-900 mb-1">Koordinat</div>
          <div className="text-gray-600">
            {formatCoordinates(attributes.latitude, attributes.longitude)}
          </div>
        </div>
      </div>

      {/* Last Update */}
      <div className="flex items-center gap-3">
        <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <div className="text-sm">
          <div className="font-medium text-gray-900 mb-1">Update Terakhir</div>
          <div className="text-gray-600">
            {formatRelativeTime(attributes.updated_at)}
          </div>
        </div>
      </div>
    </div>
  );
};
