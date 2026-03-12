import React from 'react';
import { useTheme } from './ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isCafe = theme === 'cafe';

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex h-8 w-16 flex-shrink-0 items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none shadow-inner
        ${isCafe ? 'bg-[#3d2b1f]' : 'bg-[#d4c3a3]'}
      `}
      aria-label="Alternar modo de visualización"
    >
      <span className="sr-only">Cambiar a modo {isCafe ? 'Beige' : 'Café'}</span>
      <span
        className={`
          inline-flex h-6 w-6 transform items-center justify-center rounded-full transition-transform duration-300 ease-in-out shadow-md
          ${isCafe ? 'translate-x-9 bg-[#1a0f09]' : 'translate-x-1 bg-white'}
        `}
      >
        {isCafe ? (
          <svg className="h-3.5 w-3.5 text-[#d4a373]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
        ) : (
          <svg className="h-4 w-4 text-[#bc8a5f]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        )}
      </span>
      <span className={`absolute left-2 text-[10px] font-bold transition-opacity duration-300 pointer-events-none ${isCafe ? 'opacity-0' : 'opacity-100 text-[#5c4033]'}`}></span>
      <span className={`absolute right-2 text-[10px] font-bold transition-opacity duration-300 pointer-events-none ${isCafe ? 'opacity-100 text-[#d4a373]' : 'opacity-0'}`}></span>
    </button>
  );
};

export default ThemeToggle;