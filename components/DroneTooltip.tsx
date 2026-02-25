import React from 'react';
import { Drone } from '../types';
import BatteryIndicator from './BatteryIndicator';

interface DroneTooltipProps {
  drone: Drone;
}

const DroneTooltip: React.FC<DroneTooltipProps> = ({ drone }) => {
  return (
    <div 
      className="fixed top-1/3 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none"
    >
      {/* Tooltip Container - Minimal */}
      <div className="bg-[#1a0f08] border border-[#5c4033] rounded-lg p-3 shadow-2xl backdrop-blur-xl w-40 animate-in fade-in zoom-in-95 duration-200">
        {/* Drone ID */}
        <div className="text-xs font-bold text-[#fefae0] text-center mb-3">
          {drone.id}
        </div>

        {/* Battery Indicator */}
        <div className="flex justify-center">
          <BatteryIndicator battery={drone.battery} size="small" />
        </div>
      </div>
    </div>
  );
};

export default DroneTooltip;
