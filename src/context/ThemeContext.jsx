import { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

const COLORS = {
  ink: '#121414',
  persian: '#029CA3',
  seaLight: '#07B5A7',
  pastelGrey: '#D8D5C3',
  whiteChoco: '#E8E2D1',
  pearl: '#EDE3C9',
  pearlGrey: '#E9E8C9',
  zinc: '#FBFBFB',
  lavender: '#C7C9C9',
};

export const ThemeProvider = ({ children }) => {
  // CORRECCIÓN: Usamos try-catch para evitar que la app explote si el localStorage tiene datos corruptos
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      // Si existe, intentamos parsear. Si falla (ej: dice "dark" en texto plano), va al catch.
      return saved ? JSON.parse(saved) : true;
    } catch (error) {
      console.warn("Error leyendo tema del localStorage, reseteando a default:", error);
      return true; // Default a modo oscuro si falla
    }
  });

  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(isDark));
    // Clase 'dark' para Tailwind
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const themeStyles = isDark ? {
    '--bg-main': COLORS.ink,
    '--bg-card': '#1A1D1D',
    '--text-primary': COLORS.whiteChoco,
    '--text-secondary': COLORS.pearl,
    '--accent': COLORS.persian,
    '--border': '#2A2D2D',
  } : {
    '--bg-main': COLORS.zinc,
    '--bg-card': '#FFFFFF',
    '--text-primary': COLORS.ink,
    '--text-secondary': '#4A4A4A',
    '--accent': COLORS.seaLight,
    '--border': COLORS.lavender,
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <div 
        style={{ 
          ...themeStyles, 
          backgroundColor: 'var(--bg-main)', 
          color: 'var(--text-primary)', 
          fontFamily: '"JetBrains Mono", monospace' 
        }} 
        className="min-h-screen transition-colors duration-300 font-mono"
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);