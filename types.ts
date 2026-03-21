
export enum DroneStatus {
  BASE = 'Base',
  DEPLOYMENT = 'Deployment',
  WORKING = 'Working',
  RETURNING = 'Returning',
  ARRIVED = 'Arrived',
  INCIDENT = 'Incident',
  CHARGING = 'Charging',
  LOW_BATTERY = 'LOW_BATTERY',
  LOST_COMMUNICATION = 'LOST_COMMUNICATION',
  OFF_COURSE = 'OFF_COURSE',
}

export interface Position {
  x: number;
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
  battery: number;
  speed: number;
  altitude: number;
  position: Position;
  destination: Position | null;
  mission: string;
  client: string;
  incidentType?: string;
  waypointIndex?: number;
  originalDestination?: Position | null;
  lowBatteryTime?: number;
  chargingTime?: number;
}

export interface MapDistrict {
  id: string;
  name: string;
  points: string;
}