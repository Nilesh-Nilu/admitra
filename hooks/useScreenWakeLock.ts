import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useEffect } from 'react';

/**
 * Custom hook to manage screen wake lock during video playback
 * Keeps the screen awake when video is playing and releases wake lock when paused/stopped
 */
export const useScreenWakeLock = (isPlaying: boolean, tag?: string) => {
  useEffect(() => {
    const handleKeepAwake = async () => {
      if (isPlaying) {
        // Activate keep awake when video starts playing
        await activateKeepAwakeAsync(tag || 'VideoPlayback');
      } else {
        // Deactivate keep awake when video is paused or stopped
        deactivateKeepAwake(tag || 'VideoPlayback');
      }
    };

    handleKeepAwake();

    // Cleanup on unmount - always deactivate keep awake
    return () => {
      deactivateKeepAwake(tag || 'VideoPlayback');
    };
  }, [isPlaying, tag]);

  // Additional cleanup when component unmounts
  useEffect(() => {
    return () => {
      deactivateKeepAwake(tag || 'VideoPlayback');
    };
  }, [tag]);
};
