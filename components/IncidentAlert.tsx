import React, { useEffect } from 'react';
import { Drone } from '../types';
import { useTheme } from './ThemeContext';

interface IncidentAlertProps {
  incident: Drone;
  onClose: () => void;
}



const IncidentAlert: React.FC<IncidentAlertProps> = ({ incident, onClose }) => {
  const isLowBattery = incident.status === 'LOW_BATTERY';
  
  const { theme } = useTheme();
  const isCafe = theme === 'cafe';

  const colors = isLowBattery
  ? {
      borderTop: 'border-yellow-500',
      bg: isCafe ? 'bg-[#2a1f08]/95' : 'bg-yellow-50 border border-yellow-200',
      iconBg: isCafe ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-400/20 text-yellow-600',
      title: isCafe ? 'text-yellow-400' : 'text-yellow-600',
      text: isCafe ? 'text-[#fefae0] opacity-80' : 'text-gray-700',
      progressBg: isCafe ? 'bg-[#1a0f09]' : 'bg-yellow-100',
      progressBar: 'from-yellow-400 to-orange-500'
    }
  : {
      borderTop: 'border-[#c14545]',
      bg: isCafe ? 'bg-[#2a1208]/95' : 'bg-[#fff0eb]/95 border border-red-200',
      iconBg: isCafe ? 'bg-[#c14545]/20 text-[#c14545]' : 'bg-red-500/20 text-red-600',
      title: isCafe ? 'text-[#c14545]' : 'text-red-600',
      text: isCafe ? 'text-[#fefae0] opacity-80' : 'text-gray-700',
      progressBg: isCafe ? 'bg-[#1a0f09]' : 'bg-red-100',
      progressBar: 'from-[#c14545] to-[#ff5722]'
    };

  // Auto-cierre opcional para que coincida con DeliveryAlert (ej. 15 segundos)
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 15000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-8 fade-in duration-500 w-96 hover:scale-[1.02] transition-transform">
      <div className={`border-t-4 p-4 shadow-2xl backdrop-blur-xl flex items-center justify-between rounded-b-xl ${colors.borderTop} ${colors.bg}`}>
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center animate-pulse ${colors.iconBg}`}>
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div>
              <h3 className={`text-sm font-extrabold tracking-wide ${colors.title}`}>
  {isLowBattery ? 'BATERÍA BAJA' : 'PROTOCOLO DE EMERGENCIA'}
</h3>
              <p className={`text-xs font-medium ${colors.text}`}>
  {incident.id} - {isLowBattery ? 'Nivel crítico de batería' : incident.incidentType}
</p>
            </div>
          </div>
        </div>
        <button onClick={onClose} className={`p-2 rounded-full transition-colors flex-shrink-0 ${isCafe ? 'hover:bg-[#c14545]/20 text-white/50 hover:text-white' : 'hover:bg-red-100 text-gray-500 hover:text-red-600'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      
      {/* Barra de progreso de cierre */}
      <div className={`h-1.5 w-full rounded-b-xl overflow-hidden ${colors.progressBg}`}>
        <div className={`h-full bg-gradient-to-r ${colors.progressBar}`} style={{ animation: 'shrinkIncident 15s linear forwards' }} />
        <style>{`@keyframes shrinkIncident { from { width: 100%; } to { width: 0%; } }`}</style>
      </div>
    </div>
  );
};

export default IncidentAlert;