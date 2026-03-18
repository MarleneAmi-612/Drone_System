
export enum DroneStatus {
  BASE = 'Base',
  DEPLOYMENT = 'Deployment',
  WORKING = 'Working',
  RETURNING = 'Returning',
  ARRIVED = 'Arrived',
  INCIDENT = 'Incident',
  CHARGING = 'Charging',
  LOW_BATTERY = 'LOW_BATTERY'
}

export interface Position {
  x: number; // 0-1000 scale for simulated map
  y: number;
}

export interface ChargingStation {
  id: string;
  name: string;
  pos: Position;
}

export interface Drone {
  id: string;
  model: string;
  status: DroneStatus;
  battery: number; // 0-100
  speed: number; // km/h
  altitude: number; // meters
  position: Position;
  destination: Position | null;
  mission: string;
  client: string;
  incidentType?: string;
  waypointIndex?: number; // Current waypoint index in calculated path
  simulationType?: 'NORMAL' | 'LOW_BATTERY' | 'INCIDENT';
  originalDestination?: Position | null;
  lowBatteryTime?: number;
  chargingTime?: number;
}

export interface MapDistrict {
  id: string;
  name: string;
  points: string;
}
