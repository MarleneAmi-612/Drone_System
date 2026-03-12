import React, { useEffect } from 'react';
import { Drone } from '../types';
import { useTheme } from './ThemeContext';

interface DeliveryAlertProps {
  drone: Drone;
  onClose: () => void;
}

const DeliveryAlert: React.FC<DeliveryAlertProps> = ({ drone, onClose }) => {
  const { theme } = useTheme();
  
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 40000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isCafe = theme === 'cafe';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-8 fade-in duration-500 w-96">
      <div className={`border-t-4 border-[#7cb342] p-4 shadow-2xl backdrop-blur-xl flex items-center justify-between rounded-b-xl ${isCafe ? 'bg-[#1a3a1a]/90' : 'bg-white/95 border border-gray-200'}`}>
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#7cb342]/20 flex items-center justify-center text-[#7cb342] text-xl font-bold">✓</div>
            <div>
              <h3 className="text-sm font-extrabold text-[#7cb342] tracking-wide">PAQUETE ENTREGADO</h3>
              <p className={`text-xs font-medium ${isCafe ? 'text-[#fefae0] opacity-70' : 'text-gray-600'}`}>{drone.id} - {drone.client}</p>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-[#7cb342]/20 rounded-full transition-colors flex-shrink-0">
          <svg className={`w-5 h-5 ${isCafe ? 'text-[#7cb342]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div className={`h-1.5 w-full rounded-b-xl overflow-hidden ${isCafe ? 'bg-[#0a0f08]' : 'bg-gray-200'}`}>
        <div className="h-full bg-gradient-to-r from-[#7cb342] to-[#9ccc65]" style={{ animation: 'shrink 40s linear forwards' }} />
        <style>{`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>
      </div>
    </div>
  );
};

export default DeliveryAlert;