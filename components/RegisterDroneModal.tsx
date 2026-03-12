import React, { useState } from 'react';
import { Drone, DroneStatus } from '../types';
import { useTheme } from './ThemeContext';

const THEMES = {
  cafe: {
    overlay: 'bg-black/80 backdrop-blur-sm',
    panel: 'bg-[#2b1a10] border-[#5c4033]',
    header: 'border-b border-[#5c4033] bg-[#22140c]',
    title: 'text-white',
    subtitle: 'text-[#d4a373]',
    closeBtn: 'text-white/40 hover:text-white hover:bg-white/10',
    label: 'text-white/60',
    inputGroup: 'relative',
    icon: 'text-[#d4a373] opacity-70',
    input: 'bg-[#1a0f09] border-[#3d2b1f] text-white focus:border-[#d4a373] focus:ring-1 focus:ring-[#d4a373] pl-10',
    noteBox: 'bg-[#1a0f09] border-[#d4a373] text-white/80',
    noteHighlight: 'text-[#d4a373]',
    btnCancel: 'border-[#5c4033] text-[#fefae0] hover:bg-[#3d2b1f]',
    btnSubmit: 'bg-[#d4a373] text-[#1a0f09] hover:bg-[#faedcd]',
  },
  beige: {
    overlay: 'bg-[#2b1a10]/60 backdrop-blur-md',
    panel: 'bg-[#f2f0e4] border-[#d4c3a3]',
    header: 'border-b border-[#d4c3a3] bg-[#ebe7d5]',
    title: 'text-[#2b1a10]',
    subtitle: 'text-[#bc8a5f]',
    closeBtn: 'text-[#5c4033]/40 hover:text-[#5c4033] hover:bg-black/5',
    label: 'text-[#5c4033]/80',
    inputGroup: 'relative',
    icon: 'text-[#bc8a5f]',
    input: 'bg-white border-[#d4c3a3] text-[#2b1a10] placeholder:text-[#d4c3a3] focus:ring-2 focus:ring-[#bc8a5f]/20 focus:border-[#bc8a5f] shadow-sm pl-10',
    noteBox: 'bg-[#bc8a5f]/10 border-[#bc8a5f] text-[#5c4033]',
    noteHighlight: 'text-[#2b1a10]',
    btnCancel: 'border-[#d4c3a3] border-2 text-[#5c4033] hover:bg-[#d4c3a3]/20',
    btnSubmit: 'bg-[#2b1a10] text-[#fefae0] hover:bg-[#433422] shadow-lg shadow-black/20',
  }
};

interface RegisterDroneModalProps {
  onClose: () => void;
  onRegister: (drone: Drone) => void;
}

const RegisterDroneModal: React.FC<RegisterDroneModalProps> = ({ onClose, onRegister }) => {
  const { theme } = useTheme();
  const colors = THEMES[theme];

  const [droneId, setDroneId] = useState(`DG-${Math.floor(100 + Math.random() * 900)}`);
  const [model, setModel] = useState('LUX-Scout V1');
  const [speed, setSpeed] = useState(50);
  const [altitude, setAltitude] = useState(120);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDrone: Drone = {
      id: droneId,
      model,
      status: DroneStatus.BASE,
      battery: 100,
      speed,
      altitude,
      position: { x: 500, y: 500 },
      destination: null,
      mission: 'Standby',
      client: 'Base Central',
      waypointIndex: 0,
    };
    onRegister(newDrone);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors duration-300 ${colors.overlay}`}>
      <div className={`${colors.panel} border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200`}>
        
        <div className={`p-6 flex justify-between items-center ${colors.header}`}>
          <div>
            <h2 className={`text-xl font-extrabold tracking-tight ${colors.title}`}>
              REGISTRO DE UNIDAD
            </h2>
            <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${colors.subtitle}`}>
              Alta en Sistema Central
            </p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full transition-all duration-200 ${colors.closeBtn}`}>
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          <div>
            <label className={`block text-xs font-bold mb-2 tracking-wide ${colors.label}`}>Identificador del Dron</label>
            <div className={colors.inputGroup}>
              <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${colors.icon}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              </div>
              <input 
                required
                className={`w-full rounded-xl py-3 pr-3 transition-all border outline-none ${colors.input}`}
                value={droneId}
                onChange={(e) => setDroneId(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold mb-2 tracking-wide ${colors.label}`}>Modelo de Equipo</label>
             <div className={colors.inputGroup}>
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${colors.icon}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <select
                  className={`w-full rounded-xl py-3 pr-3 appearance-none transition-all border outline-none ${colors.input}`}
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                >
                  <option value="LUX-Scout V1">LUX-Scout V1 (Vigilancia)</option>
                  <option value="EagleEye-Z">EagleEye-Z (Reconocimiento)</option>
                  <option value="Titan-Cargo">Titan-Cargo (Logistica)</option>
                  <option value="Raven-9">Raven-9 (Tactico)</option>
                </select>
                <div className={`absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none ${colors.icon}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className={`block text-xs font-bold mb-2 tracking-wide ${colors.label}`}>Velocidad Max (km/h)</label>
              <div className={colors.inputGroup}>
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${colors.icon}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <input 
                  type="number" min="10" max="150" required
                  className={`w-full rounded-xl py-3 pr-3 transition-all border outline-none ${colors.input}`}
                  value={speed}
                  onChange={(e) => setSpeed(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <div>
              <label className={`block text-xs font-bold mb-2 tracking-wide ${colors.label}`}>Altitud Max (m)</label>
              <div className={colors.inputGroup}>
                 <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${colors.icon}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                </div>
                <input 
                  type="number" min="10" max="500" required
                  className={`w-full rounded-xl py-3 pr-3 transition-all border outline-none ${colors.input}`}
                  value={altitude}
                  onChange={(e) => setAltitude(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex gap-4">
            <button type="button" onClick={onClose} className={`flex-1 py-3.5 border-2 text-sm font-bold rounded-xl transition-all active:scale-95 ${colors.btnCancel}`}>
              CANCELAR
            </button>
            <button type="submit" className={`flex-[1.5] py-3.5 text-sm font-bold rounded-xl transition-all active:scale-95 flex justify-center items-center gap-2 ${colors.btnSubmit}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              REGISTRAR DRON
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterDroneModal;