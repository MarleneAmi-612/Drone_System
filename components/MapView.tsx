
import React, { useMemo, useState } from 'react';
import { Drone, Position } from '../types';
import { COLORS, DURANGO_DISTRICTS, CHARGING_STATIONS } from '../constants';
import DroneTooltip from './DroneTooltip';

interface MapViewProps {
  drones: Drone[];
  onDroneClick: (id: string) => void;
  selectedDrone: Drone | null;
  deliveredDrones?: Set<string>;
}

const MapView: React.FC<MapViewProps> = ({ drones, onDroneClick, selectedDrone, deliveredDrones = new Set() }) => {
  const [hoveredDroneId, setHoveredDroneId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const hoveredDrone = drones.find(d => d.id === hoveredDroneId) || null;
  // Generate random "city noise" (small squares representing buildings)
  const buildings = useMemo(() => {
    const res = [];
    for (let i = 0; i < 400; i++) {
      res.push({
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        w: 5 + Math.random() * 15,
        h: 5 + Math.random() * 15,
      });
    }
    return res;
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#1e130a]">
      <svg 
        viewBox="0 0 1000 1000" 
        className="w-full h-full"
        style={{
          transform: selectedDrone 
            ? `scale(1.5) translate(${(500 - selectedDrone.position.x) / 1.5}px, ${(500 - selectedDrone.position.y) / 1.5}px)` 
            : 'scale(1)',
          transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Map Background Grid */}
        <defs>
          <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#3d2b1f" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="1000" height="1000" fill="url(#grid)" />

        {/* Districts */}
        {DURANGO_DISTRICTS.map(district => (
          <polygon 
            key={district.id}
            points={district.points}
            fill="#3d2b1f"
            fillOpacity="0.3"
            stroke="#5c4033"
            strokeWidth="2"
            strokeDasharray="4 2"
          />
        ))}

        {/* Static Elements: Buildings */}
        {buildings.map((b, i) => (
          <rect 
            key={i} 
            x={b.x} y={b.y} width={b.w} height={b.h} 
            fill="#2b1a10" 
            stroke="#3d2b1f" 
            strokeWidth="0.5" 
          />
        ))}

        {/* Charging Stations */}
        {CHARGING_STATIONS.map(st => (
          <g key={st.id} transform={`translate(${st.pos.x}, ${st.pos.y})`}>
            <circle r="6" fill="#faedcd" fillOpacity="0.2" stroke="#d4a373" strokeWidth="1" />
            <path d="M-3 -4 L3 0 L-3 4 L0 0 Z" fill="#d4a373" />
            <text y="15" textAnchor="middle" className="text-[10px] fill-[#d4a373] opacity-60 font-mono">{st.name}</text>
          </g>
        ))}

        {/* Drone Paths (to destination) */}
        {drones.map(drone => drone.destination && (
          <line 
            key={`path-${drone.id}`}
            x1={drone.position.x} 
            y1={drone.position.y}
            x2={drone.destination.x} 
            y2={drone.destination.y}
            stroke="#d4a373"
            strokeWidth="1"
            strokeDasharray="5 5"
            opacity="0.3"
          />
        ))}

        {/* Drones */}
        {drones.map(drone => {
          const isSelected = selectedDrone?.id === drone.id;
          const isHovered = hoveredDroneId === drone.id;
          const isDelivered = deliveredDrones.has(drone.id);
          const color = isDelivered ? '#7cb342' : (drone.status === 'Incident' ? '#9c4a1a' : '#faedcd');
          return (
            <g 
              key={drone.id} 
              transform={`translate(${drone.position.x}, ${drone.position.y})`}
              className="cursor-pointer transition-transform duration-300 group"
              onClick={() => onDroneClick(drone.id)}
              onMouseEnter={(e) => {
                const svg = e.currentTarget.ownerSVGElement;
                const rect = svg?.getBoundingClientRect();
                const pt = svg?.createSVGPoint();
                if (pt && rect && svg) {
                  pt.x = drone.position.x;
                  pt.y = drone.position.y;
                  const screenPt = pt.matrixTransform(svg.getScreenCTM());
                  setTooltipPos({ x: screenPt.x, y: screenPt.y });
                  setHoveredDroneId(drone.id);
                }
              }}
              onMouseLeave={() => setHoveredDroneId(null)}
            >
              {/* Delivery Glow effect */}
              {isDelivered && (
                <circle r="20" fill="none" stroke={color} strokeWidth="1" className="opacity-100">
                  <animate attributeName="r" from="10" to="30" dur="1s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="1" to="0" dur="1s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Pulse effect if selected */}
              {isSelected && !isDelivered && (
                <circle r="20" fill="none" stroke={color} strokeWidth="1">
                  <animate attributeName="r" from="10" to="25" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="1" to="0" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              
              {/* Selection Highlight */}
              <circle r={isSelected ? "12" : "8"} fill="#2b1a10" stroke={color} strokeWidth={isSelected ? "2" : "1"} 
                className={isDelivered ? 'animate-pulse' : ''}
              />
              
              {/* Icon / Shape */}
              <path 
                d="M-4 -4 L4 4 M-4 4 L4 -4" 
                stroke={color} 
                strokeWidth="2" 
                className={drone.status !== 'Base' ? 'animate-spin' : ''} 
                style={{ animationDuration: '0.5s' }}
              />
              
              {/* ID Label */}
              <text 
                y="-15" 
                textAnchor="middle" 
                className={`text-[10px] font-bold ${drone.status === 'Incident' ? 'fill-[#9c4a1a]' : 'fill-[#fefae0]'} pointer-events-none select-none`}
              >
                {drone.id}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Compass/Mini Overlay */}
      <div className="absolute bottom-6 left-6 p-4 rounded bg-black bg-opacity-40 border border-[#5c4033] backdrop-blur-md">
        <div className="flex items-center gap-2 mb-2">
           <div className="w-3 h-3 rounded-full bg-[#d4a373] animate-pulse"></div>
           <span className="text-xs uppercase tracking-tighter opacity-80">Durango Real-time Feed</span>
        </div>
        <div className="text-[10px] opacity-40">24.0277° N, 104.6532° W</div>
      </div>

      {/* Drone Tooltip */}
      {hoveredDrone && <DroneTooltip drone={hoveredDrone} />}
    </div>
  );
};

export default MapView;
