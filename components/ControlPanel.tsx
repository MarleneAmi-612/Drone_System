import React, { useState } from 'react';
import { Drone, DroneStatus } from '../types';
import { useTheme } from './ThemeContext';
import { QueuedTask } from './AddDroneModal'; // Importamos la interfaz

const THEMES = {
  cafe: {
    sidebar: 'bg-[#1a0f09] border-[#5c4033]',
    headerBg: 'bg-[#22140c]',
    headerTitle: 'text-[#fefae0]',
    headerSub: 'text-[#d4a373] opacity-70',
    sectionTitle: 'text-white opacity-40',
    cardBase: 'bg-[#2b1a10] border-[#3d2b1f] hover:border-[#5c4033]',
    cardSelected: 'bg-[#3d2b1f] border-[#d4a373] shadow-[0_0_15px_rgba(212,163,115,0.1)]',
    cardTitle: 'text-[#fefae0]',
    cardSub: 'text-white/60',
    badgeBg: 'bg-black/40 border-[#3d2b1f]',
    btnAdd: 'bg-[#d4a373] text-[#1a0f09] hover:bg-[#faedcd] border-transparent',
    scrollbar: 'scrollbar-thin scrollbar-thumb-[#3d2b1f] scrollbar-track-transparent',
    tabActive: 'text-[#d4a373] border-[#d4a373]',
    tabInactive: 'text-white/40 border-transparent hover:text-white/70'
  },
  beige: {
    sidebar: 'bg-[#f9f8f3] border-[#d4c3a3]',
    headerBg: 'bg-[#ebe7d5]',
    headerTitle: 'text-[#2b1a10]',
    headerSub: 'text-[#bc8a5f]',
    sectionTitle: 'text-[#5c4033] opacity-70',
    cardBase: 'bg-white border-[#e5dcc5] hover:border-[#bc8a5f] shadow-sm',
    cardSelected: 'bg-[#f4efe1] border-[#bc8a5f] ring-1 ring-[#bc8a5f] shadow-md',
    cardTitle: 'text-[#2b1a10]',
    cardSub: 'text-[#5c4033]/70',
    badgeBg: 'bg-white border-[#d4c3a3]',
    btnAdd: 'bg-[#2b1a10] text-[#fefae0] hover:bg-[#433422] shadow-lg shadow-black/10',
    scrollbar: 'scrollbar-thin scrollbar-thumb-[#d4c3a3] scrollbar-track-transparent',
    tabActive: 'text-[#bc8a5f] border-[#bc8a5f]',
    tabInactive: 'text-[#5c4033]/50 border-transparent hover:text-[#5c4033]'
  }
};

interface ControlPanelProps {
  drones: Drone[];
  tasks: QueuedTask[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddClick: () => void;
  onAssignTask: (task: QueuedTask) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  drones, tasks, selectedId, onSelect, onAddClick, onAssignTask 
}) => {
  const { theme } = useTheme(); 
  const colors = THEMES[theme];
  const [activeTab, setActiveTab] = useState<'fleet' | 'queue'>('fleet');

  const activeDronesCount = drones.filter(d => d.status !== DroneStatus.BASE).length;

  // Lógica para ordenar las tareas por prioridad
  const sortedTasks = [...tasks].sort((a, b) => {
    const pVal = { Alta: 3, Media: 2, Baja: 1 };
    if (pVal[a.priority] !== pVal[b.priority]) return pVal[b.priority] - pVal[a.priority];
    return a.timestamp - b.timestamp;
  });

  const getPriorityColor = (priority: string) => {
    if (priority === 'Alta') return 'bg-[#c14545] text-white';
    if (priority === 'Media') return 'bg-[#e9c46a] text-black';
    return 'bg-[#6b8e23] text-white';
  };

  const getStatusConfig = (status: DroneStatus) => {
    switch(status) {
      case DroneStatus.INCIDENT: return { label: 'INCIDENTE', color: 'text-[#c14545]', dot: 'bg-[#c14545] animate-pulse', border: 'border-[#c14545]/30' };
      case DroneStatus.BASE: return { label: 'EN BASE', color: 'text-gray-400', dot: 'bg-gray-400', border: 'border-gray-400/30' };
      case DroneStatus.ARRIVED: return { label: 'EN DESTINO', color: 'text-[#6b8e23]', dot: 'bg-[#6b8e23]', border: 'border-[#6b8e23]/30' };
      case DroneStatus.DEPLOYMENT: return { label: 'EN RUTA', color: 'text-[#d4a373]', dot: 'bg-[#d4a373]', border: 'border-[#d4a373]/30' };
      case DroneStatus.CHARGING: return { label: 'RECARGANDO', color: 'text-[#e9c46a]', dot: 'bg-[#e9c46a] animate-pulse', border: 'border-[#e9c46a]/30' };
      case DroneStatus.LOW_BATTERY:
  return {
    label: 'BATERÍA BAJA',
    color: 'text-[#f59e0b]',
    dot: 'bg-[#f59e0b] animate-pulse',
    border: 'border-[#f59e0b]/30'
  };
      default: return { label: status, color: colors.cardTitle, dot: 'bg-gray-500', border: 'border-transparent' };
    }
  };

  return (
    <div className={`w-80 flex flex-col h-screen border-r shadow-2xl z-10 overflow-hidden transition-colors duration-300 ${colors.sidebar}`}>
      <div className={`p-6 pb-0 border-b flex flex-col gap-1 ${colors.headerBg} border-inherit transition-colors duration-300`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className={`text-xl font-extrabold tracking-tight ${colors.headerTitle}`}>AEROGUARD <span className={colors.headerSub.split(' ')[0]}>DGO</span></h1>
            <p className={`text-[9px] font-bold uppercase tracking-[0.2em] mt-1 ${colors.headerSub}`}>Gestión de Flotas</p>
          </div>
        </div>
        
        {/* PESTAÑAS (TABS) */}
        <div className="flex font-bold text-[10px] tracking-widest uppercase">
          <button onClick={() => setActiveTab('fleet')} className={`flex-1 pb-3 border-b-2 transition-all ${activeTab === 'fleet' ? colors.tabActive : colors.tabInactive}`}>
            Flota ({drones.length})
          </button>
          <button onClick={() => setActiveTab('queue')} className={`flex-1 pb-3 border-b-2 transition-all flex items-center justify-center gap-1.5 ${activeTab === 'queue' ? colors.tabActive : colors.tabInactive}`}>
            Cola 
            {tasks.length > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[8px] leading-none ${theme === 'cafe' ? 'bg-[#d4a373] text-black' : 'bg-[#bc8a5f] text-white'}`}>{tasks.length}</span>
            )}
          </button>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto ${colors.scrollbar} p-4`}>
        
        {/* VISTA DE FLOTA (DRONES) */}
        {activeTab === 'fleet' && (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-end mb-1 px-1">
              <div className={`text-[10px] uppercase font-bold tracking-widest ${colors.sectionTitle}`}>Activos Conectados</div>
              <div className={`text-[10px] font-bold ${colors.sectionTitle}`}>{activeDronesCount} / {drones.length} en vuelo</div>
            </div>
            {drones.map(drone => {
              const statusConfig = getStatusConfig(drone.status);
              return (
                <div key={drone.id} onClick={() => onSelect(drone.id)} className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer group flex flex-col gap-3 ${selectedId === drone.id ? colors.cardSelected : colors.cardBase}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <svg className={`w-4 h-4 ${colors.headerSub.split(' ')[0]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                      <span className={`font-bold text-sm truncate ${colors.cardTitle}`}>{drone.id}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 text-[9px] font-bold px-2 py-1 rounded-full border transition-colors duration-300 ${colors.badgeBg} ${statusConfig.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                      <span className={statusConfig.color}>{statusConfig.label}</span>
                    </div>
                  </div>
                  <div className={`text-[11px] truncate flex items-center gap-1.5 ${colors.cardSub}`}>
                    <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    {drone.mission || 'Sin asignación'}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VISTA DE COLA DE TAREAS */}
        {activeTab === 'queue' && (
          <div className="flex flex-col gap-3 animate-in fade-in duration-300">
            <div className={`text-[10px] uppercase font-bold tracking-widest mb-1 px-1 ${colors.sectionTitle}`}>Misiones Pendientes</div>
            {sortedTasks.length === 0 ? (
              <div className={`text-center py-10 px-4 rounded-xl border border-dashed ${theme === 'cafe' ? 'border-[#3d2b1f]' : 'border-[#d4c3a3]'}`}>
                <p className={`text-xs font-medium mb-1 ${colors.cardTitle}`}>No hay tareas en cola</p>
                <p className={`text-[10px] ${colors.cardSub}`}>Las misiones enviadas a la cola aparecerán aquí ordenadas por prioridad.</p>
              </div>
            ) : (
              sortedTasks.map(task => (
                <div key={task.id} className={`p-4 rounded-xl border flex flex-col gap-3 ${colors.cardBase}`}>
                  <div className="flex justify-between items-start">
                    <span className={`font-bold text-xs truncate ${colors.cardTitle}`}>{task.mission}</span>
                    <span className={`text-[9px] font-extrabold px-2 py-1 rounded-md tracking-wider ${getPriorityColor(task.priority)}`}>
                      {task.priority.toUpperCase()}
                    </span>
                  </div>
                  <div className={`text-[10px] font-mono ${colors.cardSub}`}>Destino: {task.destination.x}x, {task.destination.y}y</div>
                  <button onClick={() => onAssignTask(task)} className={`mt-1 py-2 text-[10px] font-bold rounded-lg border border-dashed transition-all hover:border-solid hover:scale-[1.02] active:scale-95 ${theme === 'cafe' ? 'border-[#d4a373] text-[#d4a373] hover:bg-[#d4a373] hover:text-black' : 'border-[#bc8a5f] text-[#bc8a5f] hover:bg-[#bc8a5f] hover:text-white'}`}>
                    ASIGNAR A UNIDAD LIBRE
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className={`p-4 border-t flex gap-2 ${colors.sidebar} border-inherit`}>
        <button onClick={onAddClick} className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-bold rounded-xl transition-all active:scale-95 shadow-md ${colors.btnAdd}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          CREAR MISIÓN
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;