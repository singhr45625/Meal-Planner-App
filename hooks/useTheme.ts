import { useCallback, useState } from 'react';
import { useStorage } from './useStorage';

export type Theme = 'light' | 'dark' | 'system';

export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>('light');
  const { storedValue, setValue } = useStorage<Theme>('theme', 'light');

  const setTheme = useCallback(async (newTheme: Theme) => {
    setThemeState(newTheme);
    await setValue(newTheme);
  }, [setValue]);

  const toggleTheme = useCallback(async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    await setTheme(newTheme);
  }, [theme, setTheme]);

  return {
    theme: storedValue || theme,
    setTheme,
    toggleTheme,
    isDark: (storedValue || theme) === 'dark',
  };
};