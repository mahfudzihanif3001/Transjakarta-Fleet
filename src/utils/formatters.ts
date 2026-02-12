export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
};

export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} detik yang lalu`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
  return formatDateTime(dateString);
};

export const getStatusLabel = (status: string | null): string => {
  const statusMap: Record<string, string> = {
    'IN_TRANSIT_TO': 'Dalam Perjalanan',
    'STOPPED_AT': 'Berhenti',
    'INCOMING_AT': 'Akan Tiba',
  };
  return status ? statusMap[status] || status : 'Tidak Diketahui';
};

export const getStatusColor = (status: string | null): string => {
  const colorMap: Record<string, string> = {
    'IN_TRANSIT_TO': 'bg-green-100 text-green-800 border-green-200',
    'STOPPED_AT': 'bg-red-100 text-red-800 border-red-200',
    'INCOMING_AT': 'bg-orange-100 text-orange-800 border-orange-200',
  };
  return status ? colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200' : 'bg-gray-100 text-gray-800 border-gray-200';
};

export const formatCoordinates = (lat: number | null, lng: number | null): string => {
  if (lat === null || lng === null) return 'Koordinat tidak tersedia';
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

export const formatDistanceToNow = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 5) return 'just now';
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  return `${Math.floor(diffInSeconds / 3600)}h ago`;
};
