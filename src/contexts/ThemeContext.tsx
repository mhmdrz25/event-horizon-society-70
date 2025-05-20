
import React, { createContext, useState, useEffect, useContext } from 'react';

type Theme = 'light' | 'dark';
type Direction = 'ltr' | 'rtl';

interface ThemeContextType {
  theme: Theme;
  direction: Direction;
  toggleTheme: () => void;
  toggleDirection: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  direction: 'ltr',
  toggleTheme: () => {},
  toggleDirection: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [direction, setDirection] = useState<Direction>('ltr');

  useEffect(() => {
    // Check for user's theme preference in localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedDirection = localStorage.getItem('direction') as Direction;

    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }

    if (savedDirection) {
      setDirection(savedDirection);
      document.documentElement.setAttribute('dir', savedDirection);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', newTheme);
  };

  const toggleDirection = () => {
    const newDirection = direction === 'ltr' ? 'rtl' : 'ltr';
    setDirection(newDirection);
    document.documentElement.setAttribute('dir', newDirection);
    localStorage.setItem('direction', newDirection);
  };

  return (
    <ThemeContext.Provider value={{ theme, direction, toggleTheme, toggleDirection }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
