import React, { useState } from 'react';
import { useTheme } from './ThemeContext';

export interface IncidentRecord {
  id: string;
  droneId: string;
  type: string;
  timestamp: number;
  status: 'ACTIVE' | 'RESOLVED';
  details: string;
}

interface IncidentHistoryModalProps {
  history: IncidentRecord[];
  onClose: () => void;
}

const THEMES = {
  cafe: {
    overlay: 'bg-black/80 backdrop-blur-sm',
    panel: 'bg-[#2b1a10] border-[#5c4033]',
    header: 'border-b border-[#5c4033] bg-[#22140c]',
    title: 'text-white',
    subtitle: 'text-[#d4a373]',
    closeBtn: 'text-white/40 hover:text-white hover:bg-white/10',
    tabActive: 'bg-[#3d2b1f] text-[#d4a373] border-[#d4a373]',
    tabInactive: 'text-white/40 hover:text-white/80 border-transparent',
    card: 'bg-[#1a0f09] border-[#3d2b1f]',
    textMain: 'text-[#fefae0]',
    textSub: 'text-white/50',
    badgeActive: 'bg-[#c14545]/20 text-[#c14545] border-[#c14545]/30',
    badgeResolved: 'bg-[#7cb342]/20 text-[#7cb342] border-[#7cb342]/30',
  },
  beige: {
    overlay: 'bg-[#2b1a10]/60 backdrop-blur-md',
    panel: 'bg-[#f9f8f3] border-[#d4c3a3]',
    header: 'border-b border-[#d4c3a3] bg-[#ebe7d5]',
    title: 'text-[#2b1a10]',
    subtitle: 'text-[#bc8a5f]',
    closeBtn: 'text-[#5c4033]/40 hover:text-[#5c4033] hover:bg-black/5',
    tabActive: 'bg-white text-[#bc8a5f] border-[#bc8a5f] shadow-sm',
    tabInactive: 'text-[#5c4033]/50 hover:text-[#5c4033] border-transparent',
    card: 'bg-white border-[#e5dcc5] shadow-sm',
    textMain: 'text-[#2b1a10]',
    textSub: 'text-[#5c4033]/60',
    badgeActive: 'bg-red-100 text-red-600 border-red-200',
    badgeResolved: 'bg-green-100 text-green-700 border-green-200',
  }
};

const IncidentHistoryModal: React.FC<IncidentHistoryModalProps> = ({ history, onClose }) => {
  const { theme } = useTheme();
  const colors = THEMES[theme];
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');

  const filteredHistory = history.filter(record => {
    if (filter === 'ALL') return true;
    return record.status === filter;
  });

  const getIncidentLabel = (type: string) => {
    if (type === 'LOW_BATTERY') return 'Batería Crítica';
    if (type === 'LOST_COMMUNICATION') return 'Pérdida de Señal';
    if (type === 'OFF_COURSE') return 'Desvío de Ruta';
    if (type === 'Incident') return 'Accidente / Falla';
    return type;
  };

  return (
    <div className={`fixed inset-0 z-[2000] flex items-center justify-center p-4 transition-colors duration-300 ${colors.overlay}`}>
      <div className={`${colors.panel} border w-full max-w-3xl h-[80vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200`}>
        
        <div className={`p-6 flex justify-between items-center ${colors.header}`}>
          <div>
            <h2 className={`text-xl font-extrabold tracking-tight ${colors.title}`}>
              BITÁCORA DE INCIDENTES
            </h2>
            <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${colors.subtitle}`}>
              Historial de Eventos del Sistema
            </p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full transition-all duration-200 ${colors.closeBtn}`}>
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex px-6 pt-4 gap-2 border-b border-inherit">
          <button 
            onClick={() => setFilter('ALL')} 
            className={`px-4 py-2 text-xs font-bold border-b-2 rounded-t-lg transition-colors ${filter === 'ALL' ? colors.tabActive : colors.tabInactive}`}
          >
            Todos ({history.length})
          </button>
          <button 
            onClick={() => setFilter('ACTIVE')} 
            className={`px-4 py-2 text-xs font-bold border-b-2 rounded-t-lg transition-colors ${filter === 'ACTIVE' ? colors.tabActive : colors.tabInactive}`}
          >
            Activos ({history.filter(h => h.status === 'ACTIVE').length})
          </button>
          <button 
            onClick={() => setFilter('RESOLVED')} 
            className={`px-4 py-2 text-xs font-bold border-b-2 rounded-t-lg transition-colors ${filter === 'RESOLVED' ? colors.tabActive : colors.tabInactive}`}
          >
            Resueltos ({history.filter(h => h.status === 'RESOLVED').length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3 scrollbar-thin scrollbar-thumb-gray-500/50">
          {filteredHistory.length === 0 ? (
            <div className={`text-center py-20 ${colors.textSub}`}>
              <svg className="w-12 h-12 mx-auto mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
              <p className="font-bold">No hay registros para mostrar</p>
            </div>
          ) : (
            filteredHistory.map(record => (
              <div key={record.id} className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all hover:scale-[1.01] ${colors.card}`}>
                <div className="flex items-center gap-4 flex-1">
                  <div className={`text-xs font-mono font-bold w-20 ${colors.textSub}`}>
                    {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                  <div>
                    <div className={`font-bold text-sm ${colors.textMain}`}>{record.droneId}</div>
                    <div className={`text-[10px] uppercase font-bold tracking-widest mt-0.5 ${colors.textSub}`}>{record.details}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-right">
                  <span className={`font-bold text-xs ${colors.textMain}`}>
                    {getIncidentLabel(record.type)}
                  </span>
                  <span className={`px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider rounded border ${record.status === 'ACTIVE' ? colors.badgeActive : colors.badgeResolved}`}>
                    {record.status === 'ACTIVE' ? 'En Progreso' : 'Resuelto'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default IncidentHistoryModal;