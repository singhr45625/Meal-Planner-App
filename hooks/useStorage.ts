import { useCallback, useEffect, useState } from 'react';
import StorageService from '../services/StorageService';

export const useStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredValue();
  }, [key]);

  const loadStoredValue = useCallback(async () => {
    try {
      const value = await StorageService.getItem<T>(key);
      if (value !== null) {
        setStoredValue(value);
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    } finally {
      setLoading(false);
    }
  }, [key]);

  const setValue = useCallback(async (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      await StorageService.setItem(key, valueToStore);
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(async () => {
    try {
      setStoredValue(initialValue);
      await StorageService.removeItem(key);
    } catch (error) {
      console.error('Error removing from storage:', error);
    }
  }, [key, initialValue]);

  return {
    storedValue,
    setValue,
    removeValue,
    loading,
  };
};