import React from 'react';
import { Drone } from '../types';
import BatteryIndicator from './BatteryIndicator';

interface DroneTooltipProps {
  drone: Drone;
  pos?: { x: number; y: number } | null;
}

const DroneTooltip: React.FC<DroneTooltipProps> = ({ drone, pos = null }) => {
  // If pos provided, position absolutely at that screen point, otherwise
  // fallback to centered fixed tooltip for legacy behavior.
  const style: React.CSSProperties = pos
    ? {
        position: 'absolute',
        left: pos.x,
        top: Math.max(8, pos.y - 56), // appear slightly above the marker
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
        zIndex: 1000,
      }
    : {
        position: 'fixed',
        top: '33%',
        left: '50%',
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
        zIndex: 1000,
      };

  return (
    <div style={style}>
      <div className="bg-[#1a0f08] border border-[#5c4033] rounded-lg p-3 shadow-2xl backdrop-blur-xl w-40 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-xs font-bold text-[#fefae0] text-center mb-3">
          {drone.id}
        </div>
        <div className="flex justify-center">
          <BatteryIndicator battery={drone.battery} size="small" />
        </div>
      </div>
    </div>
  );
};

export default DroneTooltip;
