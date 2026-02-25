import { useScreenSecurity } from '@/hooks/useScreenSecurity';
import React, { useEffect, useRef } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

interface SecureVideoWrapperProps {
  children: React.ReactNode;
  enableExtraProtection?: boolean;
  onSecurityViolation?: () => void;
}

const SecureVideoWrapper: React.FC<SecureVideoWrapperProps> = ({
  children,
  enableExtraProtection = true,
  onSecurityViolation,
}) => {
  const viewRef = useRef<View>(null);
  
  // Enable screen security for this component
  const { isAndroid, securityEnabled } = useScreenSecurity({
    preventScreenshots: true,
    preventScreenRecording: true,
  });

  useEffect(() => {
    let securityCheckInterval: ReturnType<typeof setInterval> | undefined;

    if (isAndroid && enableExtraProtection) {
      // Enhanced security checks for video content
      securityCheckInterval = setInterval(() => {
        // In a real implementation, this would check for:
        // - Screen recording apps running
        // - Screenshot attempts
        // - Developer options enabled
        // - ADB connections
        
        // For now, we'll log security status
        // console.log('Video Security Check - Protected:', securityEnabled);
      }, 3000);

      // Show warning about protected content
      if (enableExtraProtection) {
        // console.log('Secure video content loaded - Screenshots and recording disabled');
      }
    }

    return () => {
      if (securityCheckInterval) {
        clearInterval(securityCheckInterval);
      }
    };
  }, [isAndroid, enableExtraProtection, securityEnabled]);

  // Handle security violations
  const handleSecurityViolation = () => {
    if (onSecurityViolation) {
      onSecurityViolation();
    } else {
      Alert.alert(
        'Security Warning',
        'This content is protected and cannot be recorded or captured.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  return (
    <View ref={viewRef} style={styles.container}>
      {children}
      {isAndroid && securityEnabled && (
        <View style={styles.securityOverlay} pointerEvents="none" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  securityOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: -1,
  },
});

export default SecureVideoWrapper;

