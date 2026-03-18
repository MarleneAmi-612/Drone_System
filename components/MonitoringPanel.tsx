import React, { useState } from 'react';
import { Drone, DroneStatus } from '../types';
import { useTheme } from './ThemeContext';

interface MonitoringPanelProps {
  alarms: Drone[];
  onSelectAlarm: (id: string) => void;
  onClose: () => void;
}

const THEMES = {
  cafe: {
    panelBg: 'bg-[#1a0f09]/95',
    borderColor: 'border-[#5c4033]',
    titleNominal: 'text-[#7cb342]',
    titleWarning: 'text-[#c14545]',
    textMuted: 'text-[#fefae0]/60',
    itemBg: 'bg-[#2b1a10]',
    itemHover: 'hover:bg-[#3d2b1f]',
    iconHover: 'hover:bg-white/10 hover:text-white',
  },
  beige: {
    panelBg: 'bg-white/95',
    borderColor: 'border-[#d4c3a3]',
    titleNominal: 'text-[#6b8e23]',
    titleWarning: 'text-red-600',
    textMuted: 'text-[#5c4033]/60',
    itemBg: 'bg-[#f9f8f3]',
    itemHover: 'hover:bg-[#ebe7d5]',
    iconHover: 'hover:bg-black/5 hover:text-black',
  }
};

const MonitoringPanel: React.FC<MonitoringPanelProps> = ({ alarms, onSelectAlarm, onClose }) => {
  const { theme } = useTheme();
  const colors = THEMES[theme];
  const [isMinimized, setIsMinimized] = useState(false);

  const getAlarmStyles = (status: DroneStatus) => {
    switch(status) {
      case DroneStatus.LOW_BATTERY: return { border: 'border-yellow-500', text: 'text-yellow-500', bg: 'bg-yellow-500/10' };
      case DroneStatus.LOST_COMMUNICATION: return { border: 'border-purple-500', text: 'text-purple-500', bg: 'bg-purple-500/10' };
      case DroneStatus.OFF_COURSE: return { border: 'border-orange-500', text: 'text-orange-500', bg: 'bg-orange-500/10' };
      case DroneStatus.INCIDENT: return { border: 'border-[#c14545]', text: 'text-[#c14545]', bg: 'bg-[#c14545]/10' };
      default: return { border: 'border-gray-500', text: 'text-gray-500', bg: 'bg-gray-500/10' };
    }
  };

  const getAlarmLabel = (status: DroneStatus) => {
    if (status === DroneStatus.LOW_BATTERY) return 'BATERÍA CRÍTICA';
    if (status === DroneStatus.LOST_COMMUNICATION) return 'SIN COMUNICACIÓN';
    if (status === DroneStatus.OFF_COURSE) return 'DESVÍO DE RUTA';
    return 'INCIDENTE CRÍTICO';
  };

  const hasAlarms = alarms.length > 0;

  return (
    <div className={`absolute top-4 left-4 z-[1000] w-80 rounded-2xl border shadow-2xl backdrop-blur-md overflow-hidden transition-all duration-500 ${colors.panelBg} ${colors.borderColor}`}>
      
      {/* Cabecera del Panel */}
      <div 
        className={`p-4 flex items-center justify-between cursor-pointer border-b transition-colors ${hasAlarms ? 'bg-red-500/10 border-red-500/30' : `border-transparent`}`}
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            {hasAlarms ? (
              <>
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
                <svg className={`w-6 h-6 animate-pulse ${colors.titleWarning}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </>
            ) : (
              <svg className={`w-6 h-6 ${colors.titleNominal}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
          </div>
          <div>
            <h2 className={`text-sm font-extrabold tracking-widest uppercase ${hasAlarms ? colors.titleWarning : colors.titleNominal}`}>
              {hasAlarms ? 'ALARMAS ACTIVAS' : 'SISTEMA NOMINAL'}
            </h2>
            <p className={`text-[10px] font-bold ${colors.textMuted}`}>
              {alarms.length} {alarms.length === 1 ? 'unidad requiere' : 'unidades requieren'} atención
            </p>
          </div>
        </div>
        
        {/* Controles: Minimizar y Cerrar */}
        <div className="flex items-center gap-1">
          <svg className={`w-4 h-4 transition-transform duration-300 ${colors.textMuted} ${isMinimized ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation(); 
              onClose();
            }} 
            className={`p-1 rounded-full transition-colors ${colors.textMuted} ${colors.iconHover}`}
            title="Cerrar panel completamente"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      {/* Lista de Alertas (Colapsable) - CORREGIDO EL BUG DE MINIMIZADO */}
      <div className={`transition-all duration-300 ease-in-out ${isMinimized ? 'max-h-0 opacity-0' : 'max-h-[60vh] opacity-100 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500/50'}`}>
        {hasAlarms ? (
          <div className="p-3 flex flex-col gap-2">
            {alarms.map(alarm => {
              const styles = getAlarmStyles(alarm.status);
              return (
                <div 
                  key={alarm.id}
                  onClick={() => onSelectAlarm(alarm.id)}
                  className={`p-3 rounded-xl border-l-4 cursor-pointer transition-all active:scale-95 ${colors.itemBg} ${colors.itemHover} ${styles.border} ${styles.bg}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`font-bold text-sm ${theme === 'cafe' ? 'text-white' : 'text-black'}`}>{alarm.id}</span>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wider border border-current ${styles.text}`}>
                      {getAlarmLabel(alarm.status)}
                    </span>
                  </div>
                  <div className={`text-[10px] truncate ${colors.textMuted}`}>
                    {alarm.mission}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className={`text-xs font-medium ${colors.textMuted}`}>Todas las unidades operando dentro de los parámetros de vuelo seguros.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitoringPanel;