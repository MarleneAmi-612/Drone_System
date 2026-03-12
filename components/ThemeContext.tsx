import React, { createContext, useState, useContext, useEffect } from 'react';

type Theme = 'cafe' | 'beige';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('lux-aeroguard-theme');
    return (savedTheme as Theme) || 'cafe';
  });

  useEffect(() => {
    localStorage.setItem('lux-aeroguard-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'cafe' ? 'beige' : 'cafe'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`min-h-screen transition-colors duration-500 ease-in-out ${theme === 'cafe' ? 'bg-[#1a0f09]' : 'bg-[#f4efe1]'}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme debe usarse dentro de un ThemeProvider');
  }
  return context;
};