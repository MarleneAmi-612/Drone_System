
import React from 'react';
import { Drone, DroneStatus } from '../types';
import { COLORS } from '../constants';

interface ControlPanelProps {
  drones: Drone[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddClick: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ drones, selectedId, onSelect, onAddClick }) => {
  const getStatusColor = (status: DroneStatus) => {
    switch(status) {
      case DroneStatus.INCIDENT: return 'text-[#9c4a1a]';
      case DroneStatus.BASE: return 'text-white opacity-40';
      case DroneStatus.ARRIVED: return 'text-[#d4a373]';
      default: return 'text-[#faedcd]';
    }
  };

  return (
    <div className={`w-80 flex flex-col ${COLORS.panel} border-r border-[#5c4033] shadow-2xl z-10 overflow-hidden`}>
      <div className="p-6 border-b border-[#5c4033] flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-[#fefae0]">AEROGUARD <span className="text-[#d4a373]">DGO</span></h1>
        <p className="text-[10px] opacity-40 uppercase tracking-[0.2em]">Fleet Management System</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4 flex flex-col gap-2">
          <div className="text-[10px] opacity-40 uppercase font-bold mb-2 tracking-widest">Connected Assets</div>
          {drones.map(drone => (
            <div 
              key={drone.id}
              onClick={() => onSelect(drone.id)}
              className={`p-4 rounded border transition-all cursor-pointer group flex items-start gap-4 ${
                selectedId === drone.id 
                ? 'bg-[#5c4033] border-[#d4a373]' 
                : 'bg-[#2b1a10] border-[#3d2b1f] hover:border-[#5c4033]'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm text-[#fefae0] truncate">{drone.id}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded bg-black bg-opacity-30 ${getStatusColor(drone.status)}`}>
                    {drone.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-[10px] opacity-60 truncate mb-2">{drone.mission}</div>
                
                {/* Battery Mini Bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-black bg-opacity-40 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${drone.battery < 20 ? 'bg-[#9c4a1a]' : 'bg-[#d4a373]'}`}
                      style={{ width: `${drone.battery}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono opacity-80">{Math.round(drone.battery)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-[#5c4033] flex gap-2">
        <button 
          onClick={onAddClick}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#d4a373] text-black font-bold text-xs rounded hover:bg-[#e9c46a] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          ADD DRONE
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
