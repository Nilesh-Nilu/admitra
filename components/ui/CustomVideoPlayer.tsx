import { useScreenWakeLock } from '@/hooks/useScreenWakeLock';
import { Ionicons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';

const CustomVideoPlayer = ({ 
  source, 
  style, 
  autoPlay = false, 
  loop = true, 
  muted = false,
  showControls = true,
  onPlaybackStatusUpdate = () => {},   
  ...props  
}: {
  source: string;
  style: StyleProp<ViewStyle>;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  showControls?: boolean;
  onPlaybackStatusUpdate?: (playbackStatus: any) => void;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPlayButton, setShowPlayButton] = useState(true);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<VideoView>(null);
  const hideButtonTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep screen awake during video playback
  useScreenWakeLock(isPlaying, `CustomVideoPlayer-${source}`);

  // Create video player with expo-video
  const player = useVideoPlayer(source, (player) => {
    player.loop = loop;
    player.muted = muted;

    // Handle status updates
    player.addListener('statusChange', (statusPayload) => {
      const status = statusPayload.status as
        | 'idle'
        | 'loading'
        | 'buffering'
        | 'readyToPlay'
        | 'playing'
        | 'paused'
        | 'ended'
        | 'error';

      // console.log('Video status change:', status);

      if (status === 'error') {
        setHasError(true);
        setIsLoading(false);
        setIsPlaying(false);
        console.error('Video error:', statusPayload);
        return;
      }

      const loading = status === 'loading' || status === 'buffering';
      const loaded =
        status === 'readyToPlay' ||
        status === 'playing' ||
        status === 'paused' ||
        status === 'ended';
      const playing = status === 'playing';

      setIsLoading(loading);
      setIsPlaying(playing);
      setHasError(false);

      // Autoplay as soon as we're ready
      if (autoPlay && status === 'readyToPlay') {
        try {
          player.play();
        } catch (error) {
          console.error('Auto-play failed:', error);
        }
      }

      // Call the callback with a compatible format
      if (onPlaybackStatusUpdate) {
        onPlaybackStatusUpdate({
          isLoaded: loaded,
          isPlaying: playing,
          statusType: status,
          ...statusPayload,
        });
      }
    });

    // Add playing state listener
    player.addListener('playingChange', (playingPayload) => {
      console.log('Playing state changed:', playingPayload.isPlaying);
      setIsPlaying(playingPayload.isPlaying);
      if (onPlaybackStatusUpdate) {
        onPlaybackStatusUpdate({
          ...playingPayload,
          isLoaded: true,
          isPlaying: playingPayload.isPlaying,
          statusType: 'playing',
        });
      }
    });
  });

  const handlePlayPress = useCallback(async () => {
    try {
      if (!player) return;

      setShowPlayButton(true);

      if (hideButtonTimerRef.current) {
        clearTimeout(hideButtonTimerRef.current);
      }

      hideButtonTimerRef.current = setTimeout(() => {
        setShowPlayButton(false);
      }, 3000);

      if (isPlaying) {
        await player.pause();
      } else {
        await player.play();
      }
    } catch (error) {
      console.log('Video play/pause error:', error);
      Alert.alert('Error', 'Failed to play/pause video');
    }
  }, [player, isPlaying]);

  useEffect(() => {
    return () => {
      if (hideButtonTimerRef.current) {
        clearTimeout(hideButtonTimerRef.current);
      }
    };
  }, []);

  // Keep autoplay attempt as a fallback (e.g., when status event is missed)
  useEffect(() => {
    if (autoPlay && !isPlaying && player) {
      const timer = setTimeout(async () => {
        try {
          await player.play();
        } catch (error) {
          console.error('Auto-play retry failed:', error);
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, isPlaying, player]);

  const handleVideoPress = () => {
    if (showControls) {
      handlePlayPress();
    }
  };

  return (
    <TouchableOpacity 
      style={[{ position: 'relative' }, style]} 
      onPress={handleVideoPress}
      activeOpacity={1}
      {...props}
    >
      <VideoView
        ref={videoRef}
        style={[{ width: '100%', height: '100%' }, style]}
        player={player}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        nativeControls={false}
        contentFit="cover"
      />
      
      {/* Loading Indicator */}
      {isLoading && !hasError && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.3)'
        }}>
          <ActivityIndicator size="large" color="white" />
        </View>
      )}

      {/* Error Indicator */}
      {hasError && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <Ionicons name="warning" size={50} color="white" />
        </View>
      )}

      {/* Custom Play/Pause Button */}
      {showControls && showPlayButton && !isLoading && !hasError && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <View style={{
            backgroundColor: 'rgba(0,0,0,0.6)',
            borderRadius: 35,
            width: 70,
            height: 70,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={40}
              color="white"
              style={!isPlaying ? { marginLeft: 4 } : {}}
            />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default CustomVideoPlayer;