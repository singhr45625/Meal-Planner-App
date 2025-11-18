import { useEffect, useState } from 'react';
import * as Updates from 'expo-updates';
import { Alert } from 'react-native';

export const useUpdates = () => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    if (__DEV__) return;
    
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        setIsUpdateAvailable(true);
        showUpdateAlert();
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  };

  const showUpdateAlert = () => {
    Alert.alert(
      'New Version Available',
      'An update is available with new features and bug fixes.',
      [
        {
          text: 'Update Later',
          style: 'cancel',
          onPress: () => setIsUpdateAvailable(false)
        },
        {
          text: 'Update Now',
          onPress: startUpdate
        }
      ]
    );
  };

  const startUpdate = async () => {
    try {
      setIsUpdating(true);
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    } catch (error) {
      console.error('Error updating app:', error);
      Alert.alert('Update Failed', 'Please try again later.');
      setIsUpdating(false);
    }
  };

  return {
    isUpdateAvailable,
    isUpdating,
    checkForUpdates,
    startUpdate
  };
};