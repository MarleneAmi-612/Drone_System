import React from 'react';

interface BatteryIndicatorProps {
  battery: number;
  size?: 'small' | 'medium' | 'large';
}

const BatteryIndicator: React.FC<BatteryIndicatorProps> = ({ battery, size = 'medium' }) => {
  const getBatteryColor = () => {
    if (battery <= 0) return { color: '#9c4a1a', label: 'Empty' }; // Red
    if (battery < 20) return { color: '#d4721f', label: 'Critical' }; // Orange
    if (battery < 50) return { color: '#fefae0', label: 'Low' }; // White
    return { color: '#7cb342', label: 'Good' }; // Green
  };

  const getBatteryFill = () => {
    if (battery <= 0) return 0;
    if (battery < 33) return 1;
    if (battery < 66) return 2;
    if (battery < 100) return 3;
    return 4;
  };

  const { color, label } = getBatteryColor();
  const fill = getBatteryFill();
  const sizeClass = {
    small: 'w-6 h-4',
    medium: 'w-8 h-5',
    large: 'w-10 h-6',
  }[size];

  const segmentSize = {
    small: 'h-3',
    medium: 'h-4',
    large: 'h-5',
  }[size];

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Battery Icon */}
      <div className={`${sizeClass} rounded border-2 p-0.5 flex gap-0.5 items-center justify-center`} style={{ borderColor: color }}>
        {/* Segment 1 */}
        <div
          className={`flex-1 rounded-sm transition-all duration-300 ${segmentSize}`}
          style={{
            backgroundColor: fill >= 1 ? color : 'transparent',
            border: `1px solid ${color}`,
            opacity: fill >= 1 ? 1 : 0.2,
          }}
        />
        {/* Segment 2 */}
        <div
          className={`flex-1 rounded-sm transition-all duration-300 ${segmentSize}`}
          style={{
            backgroundColor: fill >= 2 ? color : 'transparent',
            border: `1px solid ${color}`,
            opacity: fill >= 2 ? 1 : 0.2,
          }}
        />
        {/* Segment 3 */}
        <div
          className={`flex-1 rounded-sm transition-all duration-300 ${segmentSize}`}
          style={{
            backgroundColor: fill >= 3 ? color : 'transparent',
            border: `1px solid ${color}`,
            opacity: fill >= 3 ? 1 : 0.2,
          }}
        />
        {/* Segment 4 */}
        <div
          className={`flex-1 rounded-sm transition-all duration-300 ${segmentSize}`}
          style={{
            backgroundColor: fill >= 4 ? color : 'transparent',
            border: `1px solid ${color}`,
            opacity: fill >= 4 ? 1 : 0.2,
          }}
        />
      </div>

      {/* Battery Percentage and Label */}
      <div className="text-center">
        <div className="text-xs font-bold" style={{ color }}>
          {Math.round(battery)}%
        </div>
        <div className="text-[10px] opacity-60">{label}</div>
      </div>
    </div>
  );
};

export default BatteryIndicator;
