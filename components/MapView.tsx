'use client';

/// <reference types="vite/client" />
/// <reference path="../types/react-map-gl.d.ts" />
import React, { useState, useEffect, useRef } from 'react';
import Map, { Marker, Source, Layer, NavigationControl, ScaleControl, Popup } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Drone, DroneStatus, Position } from '../types';
import { COLORS, CHARGING_STATIONS } from '../constants';
import BatteryIndicator from './BatteryIndicator';


interface MapViewProps {
  drones: Drone[];
  onDroneClick: (id: string) => void;
  selectedDrone: Drone | null;
  deliveredDrones?: Set<string>;
  dronePaths?: Record<string, Position[]>;
}

// Real Durango, Mexico coordinates
const DURANGO_CENTER = { latitude: 24.0277, longitude: -104.6532 };
const MAPBOX_TOKEN = (import.meta as any).env?.VITE_MAPBOX_TOKEN;

const MapView: React.FC<MapViewProps> = ({ 
  drones, 
  onDroneClick, 
  selectedDrone, 
  deliveredDrones = new Set(),
  dronePaths = {}
}) => {
  const [hoveredDroneId, setHoveredDroneId] = useState<string | null>(null);
  const mapRef = useRef<any>(null);

  // Animated display positions: we smoothly interpolate from last displayed
  // position to the incoming `drones` position to create smooth movement.
  const displayPosRef = useRef<Record<string, { latitude: number; longitude: number }>>({});
  const rafRef = useRef<number | null>(null);
  const [, setTick] = useState(0);

  const hoveredDrone = drones.find(d => d.id === hoveredDroneId) || null;

  // Convert simulation coordinates (0-1000) to real lat/lng
  const positionToLatLng = (pos: any) => {
    return {
      latitude: DURANGO_CENTER.latitude + (pos.y / 1000 - 0.5) * 0.1,
      longitude: DURANGO_CENTER.longitude + (pos.x / 1000 - 0.5) * 0.1,
    };
  };

  // Create GeoJSON lines for drone paths (using A* calculated paths)
  const dronePathsGeoJSON = {
    type: 'FeatureCollection' as const,
    features: drones
      .filter(drone => drone.destination)
      .map(drone => {
        // Use calculated A* path if available, otherwise use direct line
        const pathPoints = dronePaths[drone.id] || [drone.position, drone.destination!];
        const coordinates = pathPoints.map(p => {
          const latLng = positionToLatLng(p);
          return [latLng.longitude, latLng.latitude];
        });
        return {
          type: 'Feature' as const,
          geometry: {
            type: 'LineString' as const,
            coordinates,
          },
          properties: { droneId: drone.id }
        };
      })
  };

    // Animation loop: interpolate displayed positions towards drone positions
    useEffect(() => {
      // initialize missing display positions
      for (const d of drones) {
        if (!displayPosRef.current[d.id]) {
          displayPosRef.current[d.id] = positionToLatLng(d.position);
        }
      }

      const smoothing = 0.18; // lerp factor (0..1)

      const step = () => {
        let changed = false;
        for (const d of drones) {
          const target = positionToLatLng(d.position);
          const cur = displayPosRef.current[d.id] ?? target;
          const latDelta = target.latitude - cur.latitude;
          const lonDelta = target.longitude - cur.longitude;
          // move a fraction towards target
          const newLat = Math.abs(latDelta) < 1e-6 ? target.latitude : cur.latitude + latDelta * smoothing;
          const newLon = Math.abs(lonDelta) < 1e-6 ? target.longitude : cur.longitude + lonDelta * smoothing;
          if (newLat !== cur.latitude || newLon !== cur.longitude) {
            displayPosRef.current[d.id] = { latitude: newLat, longitude: newLon };
            changed = true;
          }
        }
        if (changed) {
          setTick(t => t + 1);
          rafRef.current = requestAnimationFrame(step);
        } else {
          rafRef.current = null;
        }
      };

      if (!rafRef.current) rafRef.current = requestAnimationFrame(step);

      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      };
    }, [drones]);

  // Layer styling for drone paths
  const pathLayer = {
    id: 'drone-paths',
    type: 'line' as const,
    paint: {
      'line-color': '#d4a373',
      'line-width': 2,
      'line-dasharray': [5, 5],
      'line-opacity': 0.5,
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden">
      <Map
        ref={mapRef}
        initialViewState={{
          latitude: DURANGO_CENTER.latitude,
          longitude: DURANGO_CENTER.longitude,
          zoom: 13,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        attributionControl={false}
      >
        {/* Navigation Controls */}
        <NavigationControl position="top-right" />
        <ScaleControl position="bottom-right" />

        {/* Drone Paths Layer */}
        <Source id="drone-paths" type="geojson" data={dronePathsGeoJSON}>
          <Layer {...pathLayer} />
        </Source>

        {/* Charging Stations Markers */}
        {CHARGING_STATIONS.map((station) => {
          const stationLatLng = positionToLatLng(station.pos);
          return (
            <Marker
              key={station.id}
              latitude={stationLatLng.latitude}
              longitude={stationLatLng.longitude}
              anchor="center"
              onMouseEnter={(e:any) => { e?.originalEvent?.stopPropagation(); e?.originalEvent?.preventDefault?.(); }}
              onMouseLeave={(e:any) => { e?.originalEvent?.stopPropagation(); }}
            >
              <div className="w-8 h-8 bg-[#d4a373] rounded-full border-2 border-[#faedcd] flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                   title={station.name}>
                <div className="w-2 h-2 bg-[#2b1a10] rounded-full"></div>
              </div>
            </Marker>
          );
        })}

        {/* Drone Markers */}
        {drones.map((drone) => {
          const isSelected = selectedDrone?.id === drone.id;
          const isDelivered = deliveredDrones.has(drone.id);
          const color = isDelivered ? '#7cb342' : (drone.status === DroneStatus.INCIDENT ? '#9c4a1a' : '#faedcd');
          const droneLatLng = displayPosRef.current[drone.id] ?? positionToLatLng(drone.position);

          return (
            <Marker
              key={drone.id}
              latitude={droneLatLng.latitude}
              longitude={droneLatLng.longitude}
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                onDroneClick(drone.id);
              }}
            >
              <div
                className={`cursor-pointer transition-all duration-300 ${isSelected ? 'scale-125' : 'scale-100'}`}
                style={{
                  filter: `drop-shadow(0 0 ${isSelected ? 12 : 4}px ${color}aa)`
                }}
                onMouseEnter={() => setHoveredDroneId(drone.id)}
                onMouseLeave={() => setHoveredDroneId(null)}
              >
                {/* Drone Container */}
                <div className="relative w-8 h-8 flex items-center justify-center">
                  {/* Pulse effect if selected */}
                  {isSelected && !isDelivered && (
                    <div
                      className="absolute inset-0 rounded-full border-2"
                      style={{
                        borderColor: color,
                        animation: 'pulse 1.5s ease-out infinite',
                      }}
                    />
                  )}

                  {/* Delivery glow */}
                  {isDelivered && (
                    <div
                      className="absolute inset-0 rounded-full border-2"
                      style={{
                        borderColor: color,
                        animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
                      }}
                    />
                  )}

                  {/* Main drone icon */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isDelivered ? 'animate-pulse' : ''
                    }`}
                    style={{
                      backgroundColor: color + '22',
                      borderColor: color,
                    }}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        drone.status !== DroneStatus.BASE ? 'animate-spin' : ''
                      }`}
                      style={{
                        backgroundColor: color,
                        animationDuration: '0.5s',
                      }}
                    />
                  </div>
                </div>

                {/* Tooltip when hovering */}
                {hoveredDroneId === drone.id && (
                  <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 bg-[#1a0f08] text-[#d4a373] text-xs py-3 px-3 rounded border border-[#5c4033] z-50 shadow-lg min-w-max">
                    <div className="font-bold text-[#fefae0] mb-2 text-center">{drone.id}</div>
                    <div className="text-[9px] mb-2 text-center">Model: {drone.model}</div>
                    <div className="flex justify-center">
                      <BatteryIndicator battery={drone.battery} size="small" />
                    </div>
                  </div>
                )}
              </div>
            </Marker>
          );
        })}

        {/* Info Overlay */}
        <div className="absolute bottom-6 left-6 p-4 rounded bg-black bg-opacity-60 border border-[#5c4033] backdrop-blur-md z-40">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-[#d4a373] animate-pulse"></div>
            <span className="text-xs uppercase tracking-tighter text-[#d4a373] opacity-80">
              Durango Live Map
            </span>
          </div>
          <div className="text-[10px] text-[#fefae0] opacity-60">
            {DURANGO_CENTER.latitude.toFixed(4)}° N, {Math.abs(DURANGO_CENTER.longitude).toFixed(4)}° W
          </div>
          <div className="text-[9px] text-[#d4a373] opacity-40 mt-1">
            {drones.length} drones tracked
          </div>
        </div>
      </Map>

      {/* CSS for animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(212, 163, 115, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(212, 163, 115, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default MapView;
