import { createContext, useEffect, type ReactNode } from 'react';

export const ThemeContext = createContext<{ toggleTheme: () => void } | null>(
  null,
);

const defaultTheme = 'dark';
const lightTheme = 'light';

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const toggleTheme = () => {
    const oldTheme = getTheme();
    const newTheme = oldTheme === defaultTheme ? lightTheme : defaultTheme;

    updateTheme(newTheme, oldTheme);
  };

  useEffect(() => {
    const theme = getTheme();
    if (!theme) updateTheme(defaultTheme);
    else updateTheme(theme);
  }, []);

  return (
    <ThemeContext.Provider value={{ toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

const getTheme = () => localStorage.getItem('theme');

const updateTheme = (theme: string, themeToRemove?: string | null) => {
  if (themeToRemove) document.documentElement.classList.remove(themeToRemove);

  document.documentElement.classList.add(theme);
  localStorage.setItem('theme', theme);
};
