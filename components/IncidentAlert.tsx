
import React from 'react';
import { Drone } from '../types';

interface IncidentAlertProps {
  incident: Drone;
  onClose: () => void;
}

const IncidentAlert: React.FC<IncidentAlertProps> = ({ incident, onClose }) => {
  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 animate-in fade-in slide-in-from-top duration-500">
      <div className="bg-[#632a0d] border-2 border-[#9c4a1a] p-1 pr-6 rounded-full shadow-2xl flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[#9c4a1a] flex items-center justify-center animate-pulse">
           <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <div className="flex flex-col">
           <div className="text-[10px] font-bold uppercase tracking-tighter opacity-80 leading-none">Emergency Protocol Active</div>
           <div className="text-sm font-bold text-white whitespace-nowrap">{incident.id}: {incident.incidentType}</div>
        </div>
        <button onClick={onClose} className="ml-4 opacity-40 hover:opacity-100 transition-opacity">
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
};

export default IncidentAlert;
