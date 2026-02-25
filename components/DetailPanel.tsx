
import React from 'react';
import { Drone, DroneStatus } from '../types';
import { COLORS } from '../constants';

interface DetailPanelProps {
  drone: Drone;
  onClose: () => void;
  onCancel: () => void;
  onCharge: () => void;
  onEdit: (drone: Drone) => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ drone, onClose, onCancel, onCharge, onEdit }) => {
  const isIncident = drone.status === DroneStatus.INCIDENT;

  return (
    <div className={`absolute top-4 right-4 bottom-4 w-96 ${COLORS.panel} border border-[#5c4033] shadow-2xl z-20 flex flex-col backdrop-blur-xl bg-opacity-95 rounded-lg overflow-hidden animate-in slide-in-from-right duration-300`}>
      {/* Header */}
      <div className="p-6 border-b border-[#5c4033] flex justify-between items-start">
        <div className="flex items-start gap-3 flex-1">
          <div>
            <h2 className="text-2xl font-bold text-[#fefae0] leading-none mb-1">{drone.id}</h2>
            <p className="text-xs text-[#d4a373] font-mono">{drone.model}</p>
          </div>
          <button 
            onClick={() => onEdit(drone)}
            className="p-2 hover:bg-[#d4a373] hover:bg-opacity-20 rounded transition-colors mt-1"
            title="Edit drone"
          >
            <svg className="w-4 h-4 text-[#d4a373]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-5 rounded transition-colors">
          <svg className="w-5 h-5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Status Alert */}
        {isIncident && (
          <div className="bg-[#632a0d] border border-[#9c4a1a] p-4 rounded animate-pulse">
            <div className="flex items-center gap-3 mb-2">
               <svg className="w-5 h-5 text-[#fefae0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
               <span className="font-bold text-xs uppercase tracking-widest text-[#fefae0]">Critical Incident</span>
            </div>
            <div className="text-[11px] opacity-80">{drone.incidentType}</div>
          </div>
        )}

        {/* Live Data Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black bg-opacity-20 p-3 border border-[#3d2b1f] rounded">
            <div className="text-[10px] opacity-40 uppercase mb-1">Battery</div>
            <div className="flex items-end gap-1">
              <span className={`text-xl font-bold ${drone.battery < 20 ? 'text-[#9c4a1a]' : 'text-[#fefae0]'}`}>{Math.round(drone.battery)}%</span>
              <div className={`w-2 h-2 rounded-full mb-1 ${drone.battery < 20 ? 'bg-[#9c4a1a]' : 'bg-[#d4a373]'}`}></div>
            </div>
          </div>
          <div className="bg-black bg-opacity-20 p-3 border border-[#3d2b1f] rounded">
            <div className="text-[10px] opacity-40 uppercase mb-1">Status</div>
            <div className="text-sm font-bold truncate text-[#d4a373]">{drone.status.toUpperCase()}</div>
          </div>
          <div className="bg-black bg-opacity-20 p-3 border border-[#3d2b1f] rounded">
            <div className="text-[10px] opacity-40 uppercase mb-1">Speed</div>
            <div className="text-xl font-bold">{drone.speed} <span className="text-[10px] opacity-40 font-normal">km/h</span></div>
          </div>
          <div className="bg-black bg-opacity-20 p-3 border border-[#3d2b1f] rounded">
            <div className="text-[10px] opacity-40 uppercase mb-1">Altitude</div>
            <div className="text-xl font-bold">{drone.altitude} <span className="text-[10px] opacity-40 font-normal">m</span></div>
          </div>
        </div>

        {/* Mission Details */}
        <div className="space-y-4">
          <div className="text-[10px] opacity-40 uppercase tracking-widest font-bold">Mission Parameters</div>
          <div className="space-y-3">
             <div className="flex justify-between text-xs">
                <span className="opacity-40">Client:</span>
                <span className="font-bold">{drone.client}</span>
             </div>
             <div className="flex justify-between text-xs">
                <span className="opacity-40">Current Mission:</span>
                <span className="font-bold">{drone.mission}</span>
             </div>
             <div className="flex justify-between text-xs">
                <span className="opacity-40">GPS:</span>
                <span className="font-mono text-[10px]">{drone.position.x.toFixed(2)}x, {drone.position.y.toFixed(2)}y</span>
             </div>
          </div>
        </div>

        {/* Visual View (Mini Map) */}
        <div className="relative aspect-video rounded-lg overflow-hidden border border-[#5c4033] bg-black">
           <div className="absolute inset-0 opacity-40 bg-[url('https://picsum.photos/400/225?grayscale&blur=2')] bg-cover"></div>
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-[10px] uppercase font-bold tracking-tighter text-[#d4a373]">Live Feed Interrupted</div>
           </div>
           {/* UI Overlay on Mini Map */}
           <div className="absolute top-2 left-2 text-[8px] font-mono text-white opacity-80">REC • 2023-10-27 14:23:01</div>
           <div className="absolute bottom-2 right-2 flex gap-1">
              <div className="w-1 h-3 bg-[#d4a373]"></div>
              <div className="w-1 h-3 bg-[#d4a373] opacity-40"></div>
              <div className="w-1 h-3 bg-[#d4a373] opacity-40"></div>
           </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-[#5c4033] flex flex-col gap-2">
        <div className="flex gap-2">
          <button 
            onClick={onCancel}
            disabled={drone.status === DroneStatus.BASE || drone.status === DroneStatus.RETURNING}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#2b1a10] border border-[#5c4033] text-[#d4a373] font-bold text-xs rounded hover:bg-[#3d2b1f] disabled:opacity-30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            ABORT MISSION
          </button>
          <button 
            onClick={onCharge}
            disabled={drone.battery > 90 || drone.status === DroneStatus.CHARGING}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#d4a373] text-black font-bold text-xs rounded hover:bg-[#faedcd] disabled:opacity-30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            QUICK CHARGE
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailPanel;
