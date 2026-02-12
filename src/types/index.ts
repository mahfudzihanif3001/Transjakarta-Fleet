// Vehicle Types
export interface CarriageInfo {
  occupancy_status: string | null;
  occupancy_percentage: number | null;
  label: string | null;
}

export interface VehicleAttributes {
  label: string;
  current_status: 'IN_TRANSIT_TO' | 'STOPPED_AT' | 'INCOMING_AT' | null;
  latitude: number | null;
  longitude: number | null;
  updated_at: string;
  bearing: number | null;
  speed: number | null;
  current_stop_sequence: number | null;
  direction_id: number | null;
  occupancy_status: string | null;
  revenue_status: string | null;
  carriages: CarriageInfo[] | null;
}

export interface VehicleRelationships {
  route: {
    data: {
      id: string;
      type: string;
    } | null;
  };
  trip: {
    data: {
      id: string;
      type: string;
    } | null;
  };
  stop: {
    data: {
      id: string;
      type: string;
    } | null;
  };
}

export interface Vehicle {
  id: string;
  type: string;
  attributes: VehicleAttributes;
  relationships: VehicleRelationships;
}

// Route Types
export interface RouteAttributes {
  long_name: string;
  short_name: string;
  color: string;
  text_color: string;
  description: string | null;
  direction_names: string[];
  direction_destinations: string[];
  fare_class: string;
  sort_order: number;
  type: number;
}

export interface RouteData {
  id: string;
  type: string;
  attributes: RouteAttributes;
}

// Trip Types
export interface TripAttributes {
  headsign: string;
  name: string;
  direction_id: number;
  block_id: string | null;
  wheelchair_accessible: number;
  bikes_allowed: number;
}

export interface TripData {
  id: string;
  type: string;
  attributes: TripAttributes;
}

// Stop Types
export interface StopAttributes {
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  wheelchair_boarding: number;
}

export interface StopData {
  id: string;
  type: string;
  attributes: StopAttributes;
}

// API Response Types
export interface ApiResponse<T> {
  data: T[];
  included?: (RouteData | TripData | StopData)[];
  links?: {
    first?: string;
    last?: string;
    next?: string;
    prev?: string;
    self?: string;
  };
  jsonapi?: {
    version: string;
  };
}

// Filter Types
export interface FilterState {
  routes: string[];
  trips: string[];
}

// Dropdown Option Types
export interface DropdownOption {
  value: string;
  label: string;
  color?: string;
}
