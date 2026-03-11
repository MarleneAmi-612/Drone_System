"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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

const MapView: React.FC<MapViewProps> = ({ 
  drones, 
  onDroneClick, 
  selectedDrone, 
  deliveredDrones = new Set(),
  dronePaths = {}
}) => {
  const [hoveredDroneId, setHoveredDroneId] = useState<string | null>(null);
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
  if (!mapRef.current) return;

  const map = mapRef.current;

  //se supone que el mapa debe estar completo
  const interval = setTimeout(() => {
    map.invalidateSize();
  }, 500);

  return () => clearTimeout(interval);
}, []);

useEffect(() => {
  if (!mapRef.current) return;

  const map = mapRef.current;

  const fixSize = () => {
    requestAnimationFrame(() => {
      map.invalidateSize();
    });
  };

  // ejecutar varias veces para asegurar layout final
  fixSize();
  setTimeout(fixSize, 100);
  setTimeout(fixSize, 300);
  setTimeout(fixSize, 600);

}, []);

  // Animated display positions: we smoothly interpolate from last displayed
  // position to the incoming `drones` position to create smooth movement.
  const displayPosRef = useRef<Record<string, { latitude: number; longitude: number }>>({});
  const rafRef = useRef<number | null>(null);
  const [, setTick] = useState(0);

  const hoveredDrone = drones.find(d => d.id === hoveredDroneId) || null;

  useEffect(() => {
    if (!mapReady || !mapRef.current || !containerRef.current) return;

    const map = mapRef.current;
    const mapContainer = containerRef.current;
    const onResize = () => map.invalidateSize();

    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(mapContainer);

    // Force initial size correction after mount (as leaflets can initial render with wrong dimensions in flex layouts)
    setTimeout(() => {
      map.invalidateSize();
    }, 300);
    window.addEventListener('resize', onResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [mapReady]);

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

  // Leaflet style options for drone paths
  const pathOptions = {
    color: '#d4a373',
    weight: 2,
    dashArray: '5,5',
    opacity: 0.5,
  } as L.PathOptions;

  // small helper to add scale control (react-leaflet doesn't export it directly in all versions)
  function ScaleControl() {
    const map = useMap();
    useEffect(() => {
      const ctrl = L.control.scale({ position: 'bottomright' }).addTo(map);
      return () => ctrl.remove();
    }, [map]);
    return null;
  }

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.invalidateSize();
    }
  }, [drones]);
//mapa hasta al fondo
  return (
    <div ref={containerRef} className="w-full h-full min-h-0 min-w-0 relative overflow-hidden z-0"> 
      <MapContainer
      key={mapReady ? "map-ready" : "map-init"}
        className="absolute inset-0"
        center={[DURANGO_CENTER.latitude, DURANGO_CENTER.longitude]}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        //aqui estaba el maldito problema del mapa incompleto
        whenReady={(map) => {
  setTimeout(() => {
    map.target.invalidateSize();
  }, 100);
}}
        zoomControl={false}
      >
        <ZoomControl position="topright" />
        <ScaleControl />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        />

        {/* Drone Paths */}
        {drones
          .filter(d => d.destination)
          .map((drone) => {
            const pathPoints = dronePaths[drone.id] || [drone.position, drone.destination!];
            const latLngs = pathPoints.map((p: any) => {
              const latLng = positionToLatLng(p);
              return [latLng.latitude, latLng.longitude] as [number, number];
            });
            return <Polyline key={`path-${drone.id}`} positions={latLngs} pathOptions={pathOptions} />;
        })}

        {/* Charging Stations */}
        {CHARGING_STATIONS.map((station) => {
          const stationLatLng = positionToLatLng(station.pos);
          const html = `<div class="w-8 h-8 bg-[#d4a373] rounded-full border-2 border-[#faedcd] flex items-center justify-center"><div class=\"w-2 h-2 bg-[#2b1a10] rounded-full\"></div></div>`;
          const icon = L.divIcon({ html, className: '', iconSize: [32, 32], iconAnchor: [16, 16] });
          return (
            <Marker
              key={station.id}
              position={[stationLatLng.latitude, stationLatLng.longitude]}
              icon={icon}
            >
              <Tooltip>{station.name}</Tooltip>
            </Marker>
          );
        })}

        {/* Drone Markers */}
        {drones.map((drone) => {
          const isSelected = selectedDrone?.id === drone.id;
          const isDelivered = deliveredDrones.has(drone.id);
          const color = isDelivered ? '#7cb342' : (drone.status === DroneStatus.INCIDENT ? '#9c4a1a' : '#faedcd');
          const droneLatLng = displayPosRef.current[drone.id] ?? positionToLatLng(drone.position);

          const html = `
            <div class="cursor-pointer transition-all duration-300 ${isSelected ? 'scale-125' : 'scale-100'}" style='filter: drop-shadow(0 0 ${isSelected ? 12 : 4}px ${color}aa)'>
              <div class="relative w-8 h-8 flex items-center justify-center">
                ${isSelected && !isDelivered ? `<div class=\"absolute inset-0 rounded-full border-2\" style=\"border-color: ${color}; animation: pulse 1.5s ease-out infinite;\"></div>` : ''}
                ${isDelivered ? `<div class=\"absolute inset-0 rounded-full border-2\" style=\"border-color: ${color}; animation: ping 1s cubic-bezier(0,0,0.2,1) infinite;\"></div>` : ''}
                <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center" style="background-color: ${color}22; border-color: ${color};">
                  <div class="w-2 h-2 rounded-full ${drone.status !== DroneStatus.BASE ? 'animate-spin' : ''}" style="background-color: ${color}; animation-duration: 0.5s;"></div>
                </div>
              </div>
            </div>
          `;

          const icon = L.divIcon({ html, className: '', iconSize: [32, 32], iconAnchor: [16, 16] });

          return (
            
            <Marker
              key={drone.id}
              position={[droneLatLng.latitude, droneLatLng.longitude]}
              icon={icon}
              eventHandlers={{
                 click: () => {
  console.log("DRONE CLICK", drone.id)
  onDroneClick(drone.id)
},
                mouseover: () => setHoveredDroneId(drone.id),
                mouseout: () => setHoveredDroneId(null),
              }} 
            > 
              <Tooltip direction="top" offset={[0, -10]} interactive={false}>
                <div className="bg-[#1a0f08] text-[#d4a373] text-xs py-2 px-3 rounded border border-[#5c4033] shadow-lg">
                  <div className="font-bold text-[#fefae0] mb-1 text-center">{drone.id}</div>
                  <div className="text-[9px] mb-1 text-center">Model: {drone.model}</div>
                  <div className="flex justify-center"><BatteryIndicator battery={drone.battery} size="small" /></div>
                </div>
              </Tooltip>
            </Marker>
          );
        })}

        {/* Info Overlay (kept as absolute overlay) */}
        <div className="leaflet-bottom leaflet-left" style={{ position: 'absolute', left: 16, bottom: 24, zIndex: 1000, pointerEvents: "none" }}>
          <div className="p-4 rounded bg-black bg-opacity-60 border border-[#5c4033] backdrop-blur-md z-40">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-[#d4a373] animate-pulse"></div>
              <span className="text-xs uppercase tracking-tighter text-[#d4a373] opacity-80">Durango Live Map</span>
            </div>
            <div className="text-[10px] text-[#fefae0] opacity-60">{DURANGO_CENTER.latitude.toFixed(4)}° N, {Math.abs(DURANGO_CENTER.longitude).toFixed(4)}° W</div>
            <div className="text-[9px] text-[#d4a373] opacity-40 mt-1">{drones.length} drones tracked</div>
          </div>
        </div>
      </MapContainer>

      {/* CSS for animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212,163,115,0.7); }
          50% { box-shadow: 0 0 0 10px rgba(212,163,115,0); }
        }
        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          75% { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>

      <style>{`
      @keyframes pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(212,163,115,0.7); }
        50% { box-shadow: 0 0 0 10px rgba(212,163,115,0); }
      }

      @keyframes ping {
        0% { transform: scale(1); opacity: 1; }
        75% { transform: scale(1.6); opacity: 0; }
        100% { transform: scale(1.6); opacity: 0; }
      }

      

      
      }
      `}</style>
    </div>
  );
};

export default MapView;
