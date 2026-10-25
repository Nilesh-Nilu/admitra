import * as ScreenCapture from 'expo-screen-capture';
import { useEffect } from 'react';
import { Platform } from 'react-native';

interface ScreenSecurityOptions {
  preventScreenshots?: boolean;
  preventScreenRecording?: boolean;
}

export const useScreenSecurity = (options: ScreenSecurityOptions = {}) => {
  const { preventScreenshots = true, preventScreenRecording = true } = options;

  useEffect(() => {
    const enableSecurity = async () => {
      try {
        if (preventScreenshots || preventScreenRecording) {
          // Expo API applies FLAG_SECURE on Android and blocks capture on iOS
          await ScreenCapture.preventScreenCaptureAsync();
        }
      } catch (error) {
      }
    };

    const disableSecurity = async () => {
      try {
        await ScreenCapture.allowScreenCaptureAsync();
      } catch (error) {
      }
    };

    enableSecurity();

    // Cleanup function
    return () => {
      disableSecurity();
    };
  }, [preventScreenshots, preventScreenRecording]);

  return {
    isAndroid: Platform.OS === 'android',
    securityEnabled: preventScreenshots || preventScreenRecording,
  };
};

