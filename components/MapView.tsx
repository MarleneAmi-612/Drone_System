"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Drone, DroneStatus, Position } from '../types';
import { CHARGING_STATIONS } from '../constants';
import BatteryIndicator from './BatteryIndicator';
import { useTheme } from './ThemeContext';
import { QueuedTask } from './AddDroneModal'; // Importamos la interfaz de la cola

interface MapViewProps {
  drones: Drone[];
  tasks?: QueuedTask[]; // Añadimos las tareas para dibujar sus destinos
  onDroneClick: (id: string) => void;
  selectedDrone: Drone | null;
  deliveredDrones?: Set<string>;
  dronePaths?: Record<string, Position[]>;
}

const DURANGO_CENTER = { latitude: 24.0277, longitude: -104.6532 };

const MapView: React.FC<MapViewProps> = ({ 
  drones, 
  tasks = [], // Inicializamos vacío por si acaso
  onDroneClick, 
  selectedDrone, 
  deliveredDrones = new Set(),
  dronePaths = {}
}) => {
  const { theme } = useTheme();
  const isCafe = theme === 'cafe';

  const [hoveredDroneId, setHoveredDroneId] = useState<string | null>(null);
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    setMapReady(true);
  }, []);

  const positionToLatLng = (pos: Position) => {
    return {
      latitude: DURANGO_CENTER.latitude + (pos.y / 1000 - 0.5) * 0.1,
      longitude: DURANGO_CENTER.longitude + (pos.x / 1000 - 0.5) * 0.1,
    };
  };

  const pathOptions = {
    color: isCafe ? '#d4a373' : '#bc8a5f',
    weight: 2,
    dashArray: '5,5',
    opacity: 0.6,
  } as L.PathOptions;

  function ScaleControl() {
    const map = useMap();
    useEffect(() => {
      const ctrl = L.control.scale({ position: 'bottomright' }).addTo(map);
      return () => ctrl.remove();
    }, [map]);
    return null;
  }

  const mapTileUrl = isCafe 
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  // Color de acento según el tema
  const accentColor = isCafe ? '#d4a373' : '#bc8a5f';

  return (
    <div ref={containerRef} className="w-full h-full min-h-0 min-w-0 relative overflow-hidden z-0"> 
      <MapContainer
        key={mapReady ? "map-ready" : "map-init"}
        className="absolute inset-0"
        center={[DURANGO_CENTER.latitude, DURANGO_CENTER.longitude]}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        whenReady={(map) => {
          setTimeout(() => map.target.invalidateSize(), 100);
        }}
        zoomControl={false}
      >
        <ZoomControl position="topright" />
        <ScaleControl />
        
        <TileLayer
          url={mapTileUrl}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
        />

        {/* 1. RUTAS DE LOS DRONES */}
        {drones
          .filter(d => d.destination && d.status !== DroneStatus.CHARGING)
          .map((drone) => {
            const pathPoints = dronePaths[drone.id] || [drone.position, drone.destination!];
            const latLngs = pathPoints.map((p: any) => {
              const latLng = positionToLatLng(p);
              return [latLng.latitude, latLng.longitude] as [number, number];
            });
            return <Polyline key={`path-${drone.id}`} positions={latLngs} pathOptions={pathOptions} />;
        })}

        {/* 2. MARCADORES DE TAREAS EN COLA (Pendientes de asignar) */}
        {tasks.map((task) => {
          const taskLatLng = positionToLatLng(task.destination);
          
          // Color por prioridad
          let pColor = accentColor;
          if (task.priority === 'Alta') pColor = '#c14545';
          else if (task.priority === 'Media') pColor = '#e9c46a';

          const html = `
            <div class="relative w-8 h-8 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity">
              <div class="absolute inset-0 rounded-full border-[2px] border-dashed" style="border-color: ${pColor};"></div>
              <svg class="w-4 h-4" style="color: ${pColor};" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            </div>
          `;
          const icon = L.divIcon({ html, className: '', iconSize: [32, 32], iconAnchor: [16, 16] });
          
          return (
            <Marker key={`task-${task.id}`} position={[taskLatLng.latitude, taskLatLng.longitude]} icon={icon}>
              <Tooltip direction="top" offset={[0, -10]}>
                <div className="font-bold text-xs">Punto de Recogida (Cola)</div>
                <div className="text-[10px] opacity-80">{task.mission}</div>
              </Tooltip>
            </Marker>
          );
        })}

        {/* 3. MARCADORES DE DESTINOS ACTIVOS (Drones en camino) */}
        {drones
          .filter(d => d.destination && !d.mission.includes('Cargando') && d.status !== DroneStatus.RETURNING && d.status !== DroneStatus.BASE)
          .map((drone) => {
            const destLatLng = positionToLatLng(drone.destination!);
            const isDelivered = deliveredDrones.has(drone.id);
            
            // Si ya se entregó, no mostramos el target
            if (isDelivered) return null;

            const html = `
              <div class="relative w-6 h-6 flex items-center justify-center">
                <div class="absolute inset-0 rounded-full border border-solid animate-ping opacity-50" style="border-color: ${accentColor}; animation-duration: 2s;"></div>
                <div class="w-2 h-2 rounded-full" style="background-color: ${accentColor};"></div>
                <div class="absolute w-6 h-6 border border-dashed rounded-full" style="border-color: ${accentColor}; animation: spin 5s linear infinite;"></div>
              </div>
            `;
            const icon = L.divIcon({ html, className: '', iconSize: [24, 24], iconAnchor: [12, 12] });

            return (
              <Marker key={`dest-${drone.id}`} position={[destLatLng.latitude, destLatLng.longitude]} icon={icon}>
                <Tooltip direction="top" offset={[0, -10]}>
                  <div className="font-bold text-[10px]">Zona de Entrega/Operación</div>
                  <div className="text-[9px] opacity-80">Objetivo de: {drone.id}</div>
                </Tooltip>
              </Marker>
            );
        })}

        {/* 4. ESTACIONES DE CARGA */}
        {CHARGING_STATIONS.map((station) => {
          const stationLatLng = positionToLatLng(station.pos);
          const html = `<div class="w-8 h-8 bg-[#e9c46a] rounded-full border-2 border-[#1a0f09] flex items-center justify-center shadow-[0_0_15px_rgba(233,196,106,0.4)]"><svg class="w-4 h-4 text-[#1a0f09]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clip-rule="evenodd"></path></svg></div>`;
          const icon = L.divIcon({ html, className: '', iconSize: [32, 32], iconAnchor: [16, 16] });
          return (
            <Marker key={station.id} position={[stationLatLng.latitude, stationLatLng.longitude]} icon={icon}>
              <Tooltip direction="top" offset={[0, -15]}>
                 <div className="font-bold">{station.name}</div>
                 <div className="text-[9px] opacity-80">Durango Hub</div>
              </Tooltip>
            </Marker>
          );
        })}

        {/* 5. MARCADORES DE DRONES */}
        {drones.map((drone) => {
          const isSelected = selectedDrone?.id === drone.id;
          const isDelivered = deliveredDrones.has(drone.id);
          const isCharging = drone.status === DroneStatus.CHARGING;
          
          let color = accentColor;
          if (drone.status === DroneStatus.BASE) color = isCafe ? '#6b7280' : '#9ca3af';
          if (isDelivered) color = '#7cb342';
          if (drone.status === DroneStatus.INCIDENT) color = isCafe ? '#c14545' : '#ff5722';
          if (isCharging) color = '#e9c46a';

          const droneLatLng = positionToLatLng(drone.position);

          const html = `
            <div class="cursor-pointer transition-all duration-300 ${isSelected || isCharging ? 'scale-125' : 'scale-100'}" style='filter: drop-shadow(0 0 ${isSelected || isCharging ? 12 : 4}px ${color}aa)'>
              <div class="relative w-8 h-8 flex items-center justify-center">
                ${isCharging ? `
                  <div class="absolute inset-0 rounded-full border-[3px] border-dashed" style="border-color: ${color}; animation: spin 4s linear infinite;"></div>
                  <div class="absolute inset-0 rounded-full opacity-40 animate-ping" style="background-color: ${color};"></div>
                  <svg class="absolute w-4 h-4 z-10 animate-pulse" style="color: ${color};" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clip-rule="evenodd"></path></svg>
                ` : ''}
                ${isSelected && !isDelivered && !isCharging ? `<div class="absolute inset-0 rounded-full border-2" style="border-color: ${color}; animation: pulse 1.5s ease-out infinite;"></div>` : ''}
                <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors" style="background-color: ${isCafe ? '#1a0f09' : '#ffffff'}; border-color: ${color}; ${isCharging ? 'opacity: 0.1;' : ''}">
                  ${!isCharging ? `<div class="w-2 h-2 rounded-full ${drone.status !== DroneStatus.BASE ? 'animate-spin' : ''}" style="background-color: ${color}; animation-duration: 0.5s;"></div>` : ''}
                </div>
              </div>
            </div>
          `;

          const icon = L.divIcon({ html, className: '', iconSize: [32, 32], iconAnchor: [16, 16] });

          return (
            <Marker key={drone.id} position={[droneLatLng.latitude, droneLatLng.longitude]} icon={icon} eventHandlers={{ click: () => onDroneClick(drone.id) }}> 
              <Tooltip direction="top" offset={[0, -10]} interactive={false}>
                 <div className={`text-xs py-2 px-3 rounded-xl border shadow-xl backdrop-blur-md ${isCafe ? 'bg-[#1a0f08]/90 text-[#d4a373] border-[#5c4033]' : 'bg-white/95 text-[#bc8a5f] border-[#d4c3a3]'}`}>
                   <div className={`font-bold text-center mb-1 ${isCafe ? 'text-[#fefae0]' : 'text-[#2b1a10]'}`}>{drone.id}</div>
                   <div className="flex justify-center"><BatteryIndicator battery={drone.battery} size="small" theme={theme} /></div>
                 </div>
              </Tooltip>
            </Marker>
          );
        })}

        {/* Panel de Información Flotante */}
        <div className="leaflet-bottom leaflet-left" style={{ position: 'absolute', left: 16, bottom: 24, zIndex: 1000, pointerEvents: "none" }}>
          <div className={`p-4 rounded-xl border backdrop-blur-md shadow-lg transition-colors duration-300 ${isCafe ? 'bg-[#1a0f09]/80 border-[#3d2b1f]' : 'bg-white/80 border-[#e5dcc5]'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${isCafe ? 'bg-[#d4a373]' : 'bg-[#bc8a5f]'}`}></div>
              <span className={`text-[10px] uppercase font-bold tracking-widest ${isCafe ? 'text-[#d4a373]' : 'text-[#bc8a5f]'}`}>Centro Durango Vivo</span>
            </div>
            <div className={`text-[10px] font-mono font-bold ${isCafe ? 'text-[#fefae0]' : 'text-[#2b1a10]'}`}>
              {DURANGO_CENTER.latitude.toFixed(4)}° N, {Math.abs(DURANGO_CENTER.longitude).toFixed(4)}° W
            </div>
            <div className={`text-[9px] font-bold uppercase mt-1 ${isCafe ? 'text-white/40' : 'text-[#5c4033]/60'}`}>
              {drones.length} unidades en sector
            </div>
          </div>
        </div>
      </MapContainer>
    </div>
  );
};

export default MapView;