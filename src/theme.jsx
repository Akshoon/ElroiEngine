import React, { createContext, useContext, useEffect } from 'react';

/**
 * ELROI Engine Theme Design System
 * Centralized styles, colors, and tokens.
 */
export const THEME = {
  colors: {
    bg: '#080808',
    surface: '#0f0f0f',
    surface2: '#161616',
    border: '#222',
    accent: '#ff5a00',
    accentHover: '#e05000',
    accentAlpha: 'rgba(255, 90, 0, 0.12)',
    muted: '#666',
    text: '#ffffff',
    textDim: '#aaaaaa',
    error: '#d9534f',
    warning: '#f0ad4e',
    success: '#00C853',
    info: '#4299e1',
    // Loader image tint (CSS filter string to recolorize the monochromatic logo)
    loaderFilter: 'brightness(0) saturate(100%) invert(45%) sepia(80%) saturate(700%) hue-rotate(350deg) brightness(105%)',
  },
  glass: {
    bg: 'rgba(10, 12, 20, 0.8)',
    border: 'rgba(255, 255, 255, 0.08)',
    blur: '20px',
    shadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
  },
  spacing: {
    sidebarWidth: '400px',
    railWidth: '72px',
    heroPadding: '10%',
    widgetGap: '40px',
  },
  transitions: {
    default: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    fast: 'all 0.15s ease',
  },
  shadows: {
    soft: '0 4px 12px rgba(0, 0, 0, 0.3)',
    glow: '0 0 12px rgba(255, 90, 0, 0.3)',
    deep: '0 8px 32px rgba(0, 0, 0, 0.6)',
  }
};

const ThemeContext = createContext(THEME);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    // Inject CSS variables into :root
    const root = document.documentElement;
    
    // Colors
    Object.entries(THEME.colors).forEach(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--color-${cssKey}`, value);
    });
    
    // Spacing
    Object.entries(THEME.spacing).forEach(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--${cssKey}`, value);
    });
    
    // Glass
    Object.entries(THEME.glass).forEach(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--glass-${cssKey}`, value);
    });
    
    // Transitions
    Object.entries(THEME.transitions).forEach(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--transition-${cssKey}`, value);
    });
    
    // Shadows
    Object.entries(THEME.shadows).forEach(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--shadow-${cssKey}`, value);
    });
  }, []);

  return (
    <ThemeContext.Provider value={THEME}>
      {children}
    </ThemeContext.Provider>
  );
};
