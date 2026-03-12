import React from 'react';
import { Drone, DroneStatus } from '../types';
import { useTheme } from './ThemeContext';

const THEMES = {
  cafe: {
    panel: 'bg-[#2b1a10]/95 border-[#5c4033]',
    textMain: 'text-[#fefae0]',
    textSub: 'text-[#d4a373]',
    textMuted: 'text-white/40',
    gridBox: 'bg-black/20 border-[#3d2b1f]',
    divider: 'border-[#5c4033]',
    btnCancel: 'bg-[#2b1a10] border-[#5c4033] text-[#d4a373] hover:bg-[#3d2b1f]',
    btnAction: 'bg-[#d4a373] text-black hover:bg-[#faedcd]',
  },
  beige: {
    panel: 'bg-[#f9f8f3]/95 border-[#d4c3a3]',
    textMain: 'text-[#2b1a10]',
    textSub: 'text-[#bc8a5f]',
    textMuted: 'text-[#5c4033]/60',
    gridBox: 'bg-white/50 border-[#e5dcc5] shadow-sm',
    divider: 'border-[#d4c3a3]',
    btnCancel: 'bg-white border-[#d4c3a3] text-[#5c4033] hover:bg-[#ebe7d5]',
    btnAction: 'bg-[#2b1a10] text-[#fefae0] hover:bg-[#433422]',
  }
};

interface DetailPanelProps {
  drone: Drone;
  onClose: () => void;
  onCancel: () => void;
  onCharge: () => void;
  onEdit: (drone: Drone) => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ drone, onClose, onCancel, onCharge, onEdit }) => {
  const { theme } = useTheme();
  const colors = THEMES[theme];
  const isIncident = drone.status === DroneStatus.INCIDENT;

  return (
    <div className={`absolute top-4 right-4 bottom-4 w-96 border shadow-2xl z-[9999] flex flex-col backdrop-blur-xl rounded-2xl overflow-hidden animate-in slide-in-from-right duration-300 ${colors.panel}`}>
      {/* Header */}
      <div className={`p-6 border-b flex justify-between items-start ${colors.divider}`}>
        <div className="flex items-start gap-3 flex-1">
          <div>
            <h2 className={`text-2xl font-extrabold leading-none mb-1 ${colors.textMain}`}>{drone.id}</h2>
            <p className={`text-xs font-mono font-bold ${colors.textSub}`}>{drone.model}</p>
          </div>
          <button onClick={() => onEdit(drone)} className={`p-2 rounded-full transition-colors mt-1 hover:bg-black/5 dark:hover:bg-white/10 ${colors.textSub}`} title="Editar dron">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
        </div>
        <button onClick={onClose} className={`p-2 rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10 ${colors.textMuted}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-[#3d2b1f]">

        {isIncident && (
          <div className="bg-[#fff0eb] dark:bg-[#632a0d] border border-[#ff8a65] dark:border-[#9c4a1a] p-4 rounded-xl animate-pulse shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-[#bf360c] dark:text-[#fefae0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <span className="font-bold text-xs uppercase tracking-widest text-[#bf360c] dark:text-[#fefae0]">Incidente Crítico</span>
            </div>
            <div className="text-[11px] text-[#bf360c]/80 dark:text-white/80 font-medium">{drone.incidentType}</div>
          </div>
        )}

        {/* Telemetría */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-4 border rounded-xl ${colors.gridBox}`}>
            <div className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${colors.textMuted}`}>Batería</div>
            <div className="flex items-end gap-1.5">
              <span className={`text-xl font-bold ${drone.battery < 20 ? 'text-red-500' : colors.textMain}`}>{Math.round(drone.battery)}%</span>
            </div>
          </div>
          <div className={`p-4 border rounded-xl ${colors.gridBox}`}>
            <div className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${colors.textMuted}`}>Estado</div>
            <div className={`text-sm font-extrabold truncate ${colors.textSub}`}>{drone.status.toUpperCase()}</div>
          </div>
          <div className={`p-4 border rounded-xl ${colors.gridBox}`}>
            <div className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${colors.textMuted}`}>Velocidad</div>
            <div className={`text-xl font-bold ${colors.textMain}`}>{drone.speed} <span className="text-[10px] font-normal opacity-50">km/h</span></div>
          </div>
          <div className={`p-4 border rounded-xl ${colors.gridBox}`}>
            <div className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${colors.textMuted}`}>Altitud</div>
            <div className={`text-xl font-bold ${colors.textMain}`}>{drone.altitude} <span className="text-[10px] font-normal opacity-50">m</span></div>
          </div>
        </div>

        {/* Detalles de Misión */}
        <div className="space-y-4">
          <div className={`text-[10px] uppercase tracking-widest font-extrabold ${colors.textMuted}`}>Parámetros de Misión</div>
          <div className="space-y-3 bg-black/5 dark:bg-black/20 p-4 rounded-xl">
            <div className="flex justify-between text-xs items-center">
              <span className={`font-medium ${colors.textMuted}`}>Cliente:</span>
              <span className={`font-bold ${colors.textMain}`}>{drone.client}</span>
            </div>
            <div className="flex justify-between text-xs items-center">
              <span className={`font-medium ${colors.textMuted}`}>Objetivo:</span>
              <span className={`font-bold ${colors.textMain}`}>{drone.mission}</span>
            </div>
            <div className="flex justify-between text-xs items-center">
              <span className={`font-medium ${colors.textMuted}`}>Telemetría GPS:</span>
              <span className={`font-mono text-[10px] font-bold bg-black/10 dark:bg-black/40 px-2 py-1 rounded ${colors.textSub}`}>
                {drone.position.x.toFixed(2)}x, {drone.position.y.toFixed(2)}y
              </span>
            </div>
          </div>
        </div>

        {/* Feed de Video */}
        <div className={`relative aspect-video rounded-xl overflow-hidden border ${colors.divider} bg-black shadow-inner`}>
          <div className="absolute inset-0 opacity-50 bg-[url('https://picsum.photos/400/225?grayscale&blur=2')] bg-cover mix-blend-luminosity"></div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
            <div className="text-[10px] uppercase font-bold tracking-widest text-white/90 bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-md">
              Feed Interrumpido
            </div>
          </div>
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-[9px] font-mono text-white font-bold drop-shadow-md">REC • DGO HUB</span>
          </div>
        </div>
      </div>

      {/* Footer Actions Modificado */}
      <div className={`p-6 border-t flex flex-wrap gap-3 ${colors.divider}`}>
        <button
          onClick={onCancel}
          disabled={drone.status === DroneStatus.BASE || drone.status === DroneStatus.RETURNING}
          className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3.5 border text-xs font-bold rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:active:scale-100 ${colors.btnCancel}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          ABORTAR
        </button>

        {/* BOTÓN ASIGNAR / MODIFICAR MISIÓN */}
        <button
          onClick={() => onEdit(drone)}
          className={`flex-[1.5] min-w-[120px] flex items-center justify-center gap-2 py-3.5 border text-xs font-bold rounded-xl transition-all active:scale-95 ${colors.btnCancel}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          {drone.status === DroneStatus.BASE ? 'ASIGNAR MISIÓN' : 'MODIFICAR MISIÓN'}
        </button>

        <button
          onClick={onCharge}
          disabled={drone.battery > 90 || drone.status === DroneStatus.CHARGING}
          className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3.5 text-xs font-bold rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:active:scale-100 shadow-md ${colors.btnAction}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          RECARGA
        </button>
      </div>
    </div>
  );
};

export default DetailPanel;