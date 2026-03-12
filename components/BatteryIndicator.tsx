import React from 'react';

// Temas para el texto y fondo general (no para la batería en sí, que debe ser semántica)
const THEMES = {
  cafe: {
    textBase: 'text-white',
    textMuted: 'text-white/60',
  },
  beige: {
    textBase: 'text-[#2b1a10]',
    textMuted: 'text-[#5c4033]/70',
  }
};

interface BatteryIndicatorProps {
  battery: number;
  size?: 'small' | 'medium' | 'large';
  theme?: 'cafe' | 'beige';
}

const BatteryIndicator: React.FC<BatteryIndicatorProps> = ({ 
  battery, 
  size = 'medium',
  theme = 'beige' 
}) => {
  const colors = THEMES[theme];

  // Paleta de colores semánticos adaptados al estilo terroso/marrón
  const getBatteryStatus = () => {
    if (battery <= 5) return { color: '#8b0000', label: 'Agotada', isCritical: true }; // Terracota oscuro
    if (battery <= 20) return { color: '#c14545', label: 'Crítica', isCritical: true }; // Rojo/Óxido
    if (battery <= 50) return { color: '#d4a373', label: 'Baja', isCritical: false }; // Mostaza/Beige oscuro
    return { color: '#6b8e23', label: 'Óptima', isCritical: false }; // Verde oliva
  };

  const getBatteryFill = () => {
    if (battery <= 0) return 0;
    if (battery <= 25) return 1;
    if (battery <= 50) return 2;
    if (battery <= 75) return 3;
    return 4;
  };

  const { color, label, isCritical } = getBatteryStatus();
  const fill = getBatteryFill();

  // Dimensiones dinámicas según el tamaño
  const dimensions = {
    small: { body: 'w-7 h-3.5', segment: 'h-2.5', terminal: 'w-0.5 h-1.5', text: 'text-[10px]' },
    medium: { body: 'w-10 h-5', segment: 'h-3.5', terminal: 'w-1 h-2.5', text: 'text-xs' },
    large: { body: 'w-14 h-7', segment: 'h-5', terminal: 'w-1.5 h-3.5', text: 'text-sm' },
  }[size];

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Contenedor del Icono de Batería */}
      <div className={`flex items-center ${isCritical ? 'animate-pulse' : ''}`}>
        
        {/* Cuerpo de la batería */}
        <div 
          className={`${dimensions.body} rounded-sm border-2 p-0.5 flex gap-0.5 shadow-sm`} 
          style={{ borderColor: color }}
        >
          {/* Generamos los 4 segmentos dinámicamente */}
          {[1, 2, 3, 4].map((segmentIndex) => (
            <div
              key={segmentIndex}
              className={`flex-1 rounded-[1px] transition-all duration-500 ease-in-out ${dimensions.segment}`}
              style={{
                backgroundColor: fill >= segmentIndex ? color : 'transparent',
                opacity: fill >= segmentIndex ? 1 : 0.15,
              }}
            />
          ))}
        </div>

        {/* Terminal positivo (el puntito de la derecha) */}
        <div 
          className={`${dimensions.terminal} rounded-r-sm`}
          style={{ backgroundColor: color }}
        />
      </div>

      {/* Porcentaje y Etiqueta */}
      <div className="text-center flex flex-col items-center">
        <div className={`font-bold ${dimensions.text}`} style={{ color }}>
          {Math.round(battery)}%
        </div>
        <div className={`text-[9px] font-medium uppercase tracking-wider mt-0.5 ${colors.textMuted}`}>
          {label}
        </div>
      </div>
    </div>
  );
};

export default BatteryIndicator;