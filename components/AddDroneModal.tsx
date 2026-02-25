
import React, { useState, useEffect } from 'react';
import { Drone, DroneStatus } from '../types';
import { COLORS } from '../constants';

interface AddDroneModalProps {
  onClose: () => void;
  onAdd: (drone: Drone) => void;
  drone?: Drone;
}

const AddDroneModal: React.FC<AddDroneModalProps> = ({ onClose, onAdd, drone }) => {
  const [mission, setMission] = useState('');
  const [destX, setDestX] = useState(500);
  const [destY, setDestY] = useState(500);

  useEffect(() => {
    if (drone) {
      setMission(drone.mission);
      setDestX(drone.destination?.x || 500);
      setDestY(drone.destination?.y || 500);
    }
  }, [drone]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDrone: Drone = {
      id: drone ? drone.id : `DG-${Math.floor(100 + Math.random() * 900)}`,
      model: drone ? drone.model : 'Custom-M1',
      status: drone ? drone.status : DroneStatus.DEPLOYMENT,
      battery: drone ? drone.battery : 100,
      speed: drone ? drone.speed : 50,
      altitude: drone ? drone.altitude : 100,
      position: drone ? drone.position : { x: 500, y: 500 },
      destination: { x: destX, y: destY },
      mission: mission || 'Standard Patrol',
      client: drone ? drone.client : 'System Guest',
      ...(drone?.incidentType && { incidentType: drone.incidentType }),
    };
    onAdd(newDrone);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm p-4">
      <div className={`${COLORS.panel} border border-[#5c4033] w-full max-w-md rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200`}>
        <div className="p-6 border-b border-[#5c4033] flex justify-between items-center">
          <h2 className="text-xl font-bold">{drone ? 'EDIT ASSET' : 'DEPLOY NEW ASSET'}</h2>
          <button onClick={onClose} className="opacity-40 hover:opacity-100">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] uppercase opacity-40 font-bold mb-1">Mission Objective</label>
            <input 
              required
              className="w-full bg-[#2b1a10] border border-[#3d2b1f] rounded p-3 text-sm focus:outline-none focus:border-[#d4a373]"
              placeholder="e.g. Roof Inspection, Monitoring..."
              value={mission}
              onChange={(e) => setMission(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase opacity-40 font-bold mb-1">Dest X (0-1000)</label>
              <input 
                type="number"
                min="0" max="1000"
                className="w-full bg-[#2b1a10] border border-[#3d2b1f] rounded p-3 text-sm focus:outline-none focus:border-[#d4a373]"
                value={destX}
                onChange={(e) => setDestX(parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase opacity-40 font-bold mb-1">Dest Y (0-1000)</label>
              <input 
                type="number"
                min="0" max="1000"
                className="w-full bg-[#2b1a10] border border-[#3d2b1f] rounded p-3 text-sm focus:outline-none focus:border-[#d4a373]"
                value={destY}
                onChange={(e) => setDestY(parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="bg-black bg-opacity-20 p-4 rounded text-[11px] opacity-60 leading-relaxed italic border-l-2 border-[#d4a373]">
            Asset will initiate deployment sequence from Durango Center (Base Hub). Power-on self-test (POST) successful. Ready for launch.
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-[#5c4033] text-[#fefae0] text-xs font-bold rounded hover:bg-[#3d2b1f]"
            >
              CANCEL
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 bg-[#d4a373] text-black text-xs font-bold rounded hover:bg-[#faedcd]"
            >
              {drone ? 'UPDATE DRONE' : 'LAUNCH DRONE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDroneModal;
