import React, { useEffect } from 'react';
import { Drone } from '../types';

interface DeliveryAlertProps {
  drone: Drone;
  onClose: () => void;
}

const DeliveryAlert: React.FC<DeliveryAlertProps> = ({ drone, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 40000); // 40 segundos

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-0 right-6 z-50 animate-in slide-in-from-bottom duration-300 w-96">
      <div className="bg-[#1a3a1a] border-t-2 border-[#7cb342] p-3 shadow-2xl backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {/* Icon and Text */}
          <div className="flex items-center gap-3">
            <div className="text-2xl">✓</div>
            <div>
              <h3 className="text-sm font-bold text-[#7cb342]">PAQUETE ENTREGADO</h3>
              <p className="text-xs text-[#fefae0] opacity-70">{drone.id} - {drone.client}</p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-2 hover:bg-[#7cb342] hover:bg-opacity-20 rounded transition-colors flex-shrink-0"
        >
          <svg className="w-5 h-5 text-[#7cb342]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[#0a0f08] w-full">
        <div
          className="h-full bg-gradient-to-r from-[#7cb342] to-[#9ccc65]"
          style={{
            animation: 'shrink 40s linear forwards'
          }}
        />
        <style>{`
          @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default DeliveryAlert;
