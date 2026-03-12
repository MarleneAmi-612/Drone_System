import React, { useState, useEffect } from 'react';
import { Drone, DroneStatus, Position } from '../types';
import { useTheme } from './ThemeContext';

export interface QueuedTask {
  id: string;
  mission: string;
  destination: Position;
  priority: 'Alta' | 'Media' | 'Baja';
  client: string;
  timestamp: number;
}

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

interface AddDroneModalProps {
  onClose: () => void;
  onAdd: (drone: Drone, taskId?: string) => void; 
  onAddTask: (task: QueuedTask) => void;
  drone?: Drone; 
  taskToAssign?: QueuedTask | null;
  availableDrones?: Drone[]; 
}

const AddDroneModal: React.FC<AddDroneModalProps> = ({ onClose, onAdd, onAddTask, drone, taskToAssign, availableDrones = [] }) => {
  const { theme } = useTheme();
  const colors = THEMES[theme];

  const [mission, setMission] = useState('');
  const [destX, setDestX] = useState(500);
  const [destY, setDestY] = useState(500);
  const [priority, setPriority] = useState<'Alta' | 'Media' | 'Baja'>('Media');
  const [selectedUnit, setSelectedUnit] = useState<string>('new');

  // El arreglo vacío al final previene que el simulador reinicie el formulario
  useEffect(() => {
    if (drone) {
      setSelectedUnit(drone.id);
      setMission(drone.mission);
      setDestX(drone.destination?.x || 500);
      setDestY(drone.destination?.y || 500);
    } else if (taskToAssign) {
      setMission(taskToAssign.mission);
      setDestX(taskToAssign.destination.x);
      setDestY(taskToAssign.destination.y);
      setPriority(taskToAssign.priority);
      
      const baseDrone = availableDrones.find(d => d.status === DroneStatus.BASE);
      if (baseDrone) {
        setSelectedUnit(baseDrone.id);
      } else if (availableDrones.length > 0) {
        setSelectedUnit(availableDrones[0].id);
      }
    } else if (availableDrones.length > 0) {
      const baseDrone = availableDrones.find(d => d.status === DroneStatus.BASE);
      if (baseDrone) {
        setSelectedUnit(baseDrone.id);
      }
    }
  }, []); 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedUnit === 'queue') {
      onAddTask({
        id: `TSK-${Math.floor(1000 + Math.random() * 9000)}`,
        mission: mission || 'Misión Pendiente',
        destination: { x: destX || 0, y: destY || 0 },
        priority,
        client: 'Operador Durango',
        timestamp: Date.now()
      });
    } else {
      const isNew = selectedUnit === 'new';
      const targetId = isNew ? `DG-${Math.floor(100 + Math.random() * 900)}` : selectedUnit;
      const baseDrone = !isNew ? (availableDrones.find(d => d.id === targetId) || drone) : null;

      const newDrone: Drone = {
        id: targetId,
        model: isNew ? 'Custom-M1' : (baseDrone?.model || 'Custom-M1'),
        status: DroneStatus.DEPLOYMENT,
        battery: isNew ? 100 : (baseDrone?.battery || 100),
        speed: isNew ? 50 : (baseDrone?.speed || 50),
        altitude: isNew ? 100 : (baseDrone?.altitude || 100),
        position: isNew ? { x: 500, y: 500 } : (baseDrone?.position || { x: 500, y: 500 }),
        destination: { x: destX || 0, y: destY || 0 },
        mission: mission || 'Patrullaje Estándar',
        client: taskToAssign ? taskToAssign.client : (isNew ? 'Invitado' : (baseDrone?.client || 'Invitado')),
        waypointIndex: 0,
        ...(baseDrone?.incidentType && { incidentType: baseDrone.incidentType }),
      };
      onAdd(newDrone, taskToAssign?.id);
    }
  };

  const isQueue = selectedUnit === 'queue';

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors duration-300 ${colors.overlay}`}>
      <div className={`${colors.panel} border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200`}>
        <div className={`p-6 flex justify-between items-center ${colors.header}`}>
          <div>
            <h2 className={`text-xl font-extrabold tracking-tight ${colors.title}`}>
              {taskToAssign ? 'ASIGNAR TAREA PENDIENTE' : 'ASIGNACIÓN DE MISIÓN'}
            </h2>
            <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${colors.subtitle}`}>
              Centro de Comando
            </p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full transition-all duration-200 ${colors.closeBtn}`}>
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {!drone && (
            <div>
              <label className={`block text-xs font-bold mb-2 tracking-wide ${colors.label}`}>Unidad Asignada</label>
               <div className={colors.inputGroup}>
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${colors.icon}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </div>
                  <select
                    className={`w-full rounded-xl py-3 pr-8 appearance-none transition-all border outline-none font-medium ${colors.input}`}
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                  >
                    <option value="queue">[+] Enviar a Cola de Tareas Pendientes</option>
                    <option value="new" disabled={taskToAssign ? true : false}>[+] Desplegar Nueva Unidad Fisica</option>
                    {availableDrones.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.id} - {d.status === DroneStatus.BASE ? 'Disponible (En Base)' : 'En Vuelo (Redirigir)'}
                      </option>
                    ))}
                  </select>
                  <div className={`absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none ${colors.icon}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
            </div>
          )}

          <div>
            <label className={`block text-xs font-bold mb-2 tracking-wide ${colors.label}`}>Objetivo de la Mision</label>
            <div className={colors.inputGroup}>
              <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${colors.icon}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              </div>
              <input 
                required
                className={`w-full rounded-xl py-3 pr-3 transition-all border outline-none ${colors.input}`}
                placeholder="ej. Inspeccion de rutas..."
                value={mission}
                onChange={(e) => setMission(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className={`block text-xs font-bold mb-2 tracking-wide ${colors.label}`}>Destino X (0-1000)</label>
              <div className={colors.inputGroup}>
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${colors.icon}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <input 
                  type="number" min="0" max="1000" required
                  className={`w-full rounded-xl py-3 pr-3 transition-all border outline-none ${colors.input}`}
                  value={destX}
                  onChange={(e) => setDestX(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <div>
              <label className={`block text-xs font-bold mb-2 tracking-wide ${colors.label}`}>Destino Y (0-1000)</label>
              <div className={colors.inputGroup}>
                 <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${colors.icon}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <input 
                  type="number" min="0" max="1000" required
                  className={`w-full rounded-xl py-3 pr-3 transition-all border outline-none ${colors.input}`}
                  value={destY}
                  onChange={(e) => setDestY(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold mb-2 tracking-wide ${colors.label}`}>Nivel de Prioridad</label>
             <div className={colors.inputGroup}>
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${colors.icon}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
                </div>
                <select
                  className={`w-full rounded-xl py-3 pr-3 appearance-none transition-all border outline-none ${colors.input}`}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                >
                  <option value="Baja">Baja - Rutina</option>
                  <option value="Media">Media - Asignacion Normal</option>
                  <option value="Alta">Alta - Critica / Inmediata</option>
                </select>
                <div className={`absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none ${colors.icon}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
          </div>

          <div className="pt-2 flex gap-4">
            <button type="button" onClick={onClose} className={`flex-1 py-3.5 border-2 text-sm font-bold rounded-xl transition-all active:scale-95 ${colors.btnCancel}`}>
              CANCELAR
            </button>
            <button type="submit" className={`flex-[1.5] py-3.5 text-sm font-bold rounded-xl transition-all active:scale-95 flex justify-center items-center gap-2 ${colors.btnSubmit}`}>
              {isQueue ? (
                <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg> AGREGAR A COLA</>
              ) : (
                <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> INICIAR MISION</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDroneModal;