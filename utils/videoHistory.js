import AsyncStorage from '@react-native-async-storage/async-storage';

const VIDEO_PROGRESS_KEY = 'video_progress';

// Save video progress
export const saveVideoProgress = async (videoId, progress) => {
  try {
    const existingProgress = await loadVideoProgress();
    existingProgress[videoId] = {
      ...existingProgress[videoId],
      ...progress,
      lastUpdated: new Date().toISOString(),
    };
    await AsyncStorage.setItem(VIDEO_PROGRESS_KEY, JSON.stringify(existingProgress));
  } catch (error) {
  }
};

// Load video progress
export const loadVideoProgress = async () => {
  try {
    const progress = await AsyncStorage.getItem(VIDEO_PROGRESS_KEY);
    return progress ? JSON.parse(progress) : {};
  } catch (error) {
    return {};
  }
};

// Get progress for a specific video
export const getVideoProgress = async (videoId) => {
  try {
    const progress = await loadVideoProgress();
    return progress[videoId] || null;
  } catch (error) {
    return null;
  }
};

// Debounced update map to prevent excessive AsyncStorage operations
const pendingUpdates = new Map();
const UPDATE_DEBOUNCE_TIME = 3000; // 3 seconds

// Update current time for a video with debouncing
export const updateVideoTime = async (videoId, currentTime, duration) => {
  try {
    // Clear any existing pending update for this video
    if (pendingUpdates.has(videoId)) {
      clearTimeout(pendingUpdates.get(videoId));
    }
    
    // Set up debounced update
    const timeoutId = setTimeout(async () => {
      try {
        const progress = await loadVideoProgress();
        if (!progress[videoId]) {
          progress[videoId] = {};
        }
        
        // Only update if the time has actually changed significantly
        const existingTime = progress[videoId].currentTime || 0;
        if (Math.abs(currentTime - existingTime) >= 5) { // Only update if at least 5 seconds difference
          progress[videoId].currentTime = currentTime;
          progress[videoId].duration = duration;
          progress[videoId].lastUpdated = new Date().toISOString();
          
          await AsyncStorage.setItem(VIDEO_PROGRESS_KEY, JSON.stringify(progress));
        }
      } catch (error) {
      } finally {
        pendingUpdates.delete(videoId);
      }
    }, UPDATE_DEBOUNCE_TIME);
    
    pendingUpdates.set(videoId, timeoutId);
  } catch (error) {
  }
};

// Clear progress for a specific video
export const clearVideoProgress = async (videoId) => {
  try {
    const progress = await loadVideoProgress();
    delete progress[videoId];
    await AsyncStorage.setItem(VIDEO_PROGRESS_KEY, JSON.stringify(progress));
  } catch (error) {
  }
};

// Clear all video progress
export const clearAllVideoProgress = async () => {
  try {
    await AsyncStorage.removeItem(VIDEO_PROGRESS_KEY);
  } catch (error) {
  }
};

// Clean up pending updates for a specific video or all videos
export const cleanupPendingUpdates = (videoId = null) => {
  try {
    if (videoId) {
      // Clean up specific video
      if (pendingUpdates.has(videoId)) {
        clearTimeout(pendingUpdates.get(videoId));
        pendingUpdates.delete(videoId);
      }
    } else {
      // Clean up all pending updates
      for (const [, timeoutId] of pendingUpdates.entries()) {
        clearTimeout(timeoutId);
      }
      pendingUpdates.clear();
    }
  } catch (error) {
  }
};

// Force immediate update (bypass debouncing) - useful for app backgrounding
export const forceUpdateVideoTime = async (videoId, currentTime, duration) => {
  try {
    // Clean up any pending update first
    cleanupPendingUpdates(videoId);
    
    const progress = await loadVideoProgress();
    if (!progress[videoId]) {
      progress[videoId] = {};
    }
    
    progress[videoId].currentTime = currentTime;
    progress[videoId].duration = duration;
    progress[videoId].lastUpdated = new Date().toISOString();
    
    await AsyncStorage.setItem(VIDEO_PROGRESS_KEY, JSON.stringify(progress));
  } catch (error) {
  }
};

// Format time duration
export const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// Check if video should resume (if watched more than 10 seconds)
export const shouldResumeVideo = (progress) => {
  if (!progress || !progress.currentTime) return false;
  return progress.currentTime > 10; // Resume if watched more than 10 seconds
};
