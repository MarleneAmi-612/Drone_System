import React, { useEffect } from 'react';
import { Drone, DroneStatus } from '../types';
import { useTheme } from './ThemeContext';

interface IncidentAlertProps {
  incident: Drone;
  onClose: () => void;
}

const IncidentAlert: React.FC<IncidentAlertProps> = ({ incident, onClose }) => {
  const isLowBattery = incident.status === DroneStatus.LOW_BATTERY;
  const isLostComms = incident.status === DroneStatus.LOST_COMMUNICATION;
  const isOffCourse = incident.status === DroneStatus.OFF_COURSE;
  
  const { theme } = useTheme();
  const isCafe = theme === 'cafe';

  // Determinar colores según el tipo de incidente
  const getColors = () => {
    if (isLowBattery) {
      return {
        borderTop: 'border-yellow-500',
        bg: isCafe ? 'bg-[#2a1f08]/95' : 'bg-yellow-50 border border-yellow-200',
        iconBg: isCafe ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-400/20 text-yellow-600',
        title: isCafe ? 'text-yellow-400' : 'text-yellow-600',
        text: isCafe ? 'text-[#fefae0] opacity-80' : 'text-gray-700',
        progressBg: isCafe ? 'bg-[#1a0f09]' : 'bg-yellow-100',
        progressBar: 'from-yellow-400 to-orange-500',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
      };
    } else if (isLostComms) {
      return {
        borderTop: 'border-purple-500',
        bg: isCafe ? 'bg-[#2a0f1f]/95' : 'bg-purple-50 border border-purple-200',
        iconBg: isCafe ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-400/20 text-purple-600',
        title: isCafe ? 'text-purple-400' : 'text-purple-600',
        text: isCafe ? 'text-[#fefae0] opacity-80' : 'text-gray-700',
        progressBg: isCafe ? 'bg-[#1a0f09]' : 'bg-purple-100',
        progressBar: 'from-purple-500 to-pink-500',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
          </svg>
        )
      };
    } else if (isOffCourse) {
      return {
        borderTop: 'border-orange-500',
        bg: isCafe ? 'bg-[#2a1a0f]/95' : 'bg-orange-50 border border-orange-200',
        iconBg: isCafe ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-400/20 text-orange-600',
        title: isCafe ? 'text-orange-400' : 'text-orange-600',
        text: isCafe ? 'text-[#fefae0] opacity-80' : 'text-gray-700',
        progressBg: isCafe ? 'bg-[#1a0f09]' : 'bg-orange-100',
        progressBar: 'from-orange-500 to-red-500',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        )
      };
    } else {
      // Incidente genérico
      return {
        borderTop: 'border-[#c14545]',
        bg: isCafe ? 'bg-[#2a1208]/95' : 'bg-[#fff0eb]/95 border border-red-200',
        iconBg: isCafe ? 'bg-[#c14545]/20 text-[#c14545]' : 'bg-red-500/20 text-red-600',
        title: isCafe ? 'text-[#c14545]' : 'text-red-600',
        text: isCafe ? 'text-[#fefae0] opacity-80' : 'text-gray-700',
        progressBg: isCafe ? 'bg-[#1a0f09]' : 'bg-red-100',
        progressBar: 'from-[#c14545] to-[#ff5722]',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )
      };
    }
  };

  const colors = getColors();

  // Título según el tipo
  const getTitle = () => {
    if (isLowBattery) return 'BATERÍA BAJA';
    if (isLostComms) return 'PÉRDIDA DE COMUNICACIÓN';
    if (isOffCourse) return 'DESVIACIÓN DE RUTA';
    return 'PROTOCOLO DE EMERGENCIA';
  };

  // Mensaje según el tipo
  const getMessage = () => {
    if (isLowBattery) return 'Nivel crítico de batería - Regresando a base';
    if (isLostComms) return 'Dron perdió comunicación - Activando protocolo de búsqueda';
    if (isOffCourse) return 'Dron desviado de ruta - Requiere localización por radar';
    return incident.incidentType || 'Incidente no especificado';
  };

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
              {colors.icon}
            </div>
            <div>
              <h3 className={`text-sm font-extrabold tracking-wide ${colors.title}`}>
                {getTitle()}
              </h3>
              <p className={`text-xs font-medium ${colors.text}`}>
                {incident.id} - {getMessage()}
              </p>
              {isLostComms && (
                <p className="text-[10px] mt-1 opacity-70">
                   Última posición conocida: [{Math.round(incident.position.x)}, {Math.round(incident.position.y)}]
                </p>
              )}
              {isOffCourse && (
                <p className="text-[10px] mt-1 opacity-70">
                   Búsqueda por radar activada
                </p>
              )}
            </div>
          </div>
        </div>
        <button onClick={onClose} className={`p-2 rounded-full transition-colors flex-shrink-0 ${isCafe ? 'hover:bg-[#c14545]/20 text-white/50 hover:text-white' : 'hover:bg-red-100 text-gray-500 hover:text-red-600'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
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