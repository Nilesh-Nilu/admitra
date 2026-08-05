import messaging from '@react-native-firebase/messaging';
import { getApps } from '@react-native-firebase/app';
import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseUrl, delay } from '../../constants/functions';
import { ASYNC_VARIBLES, NOTIFICATION_MESSAGES } from '../../constants/data';
import axios from 'axios';
import { PermissionsAndroid, Platform, Linking } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

// Resolves once the device reports an active, internet-reachable connection,
// or after `timeoutMs` elapses (so a flaky detector can't block FCM setup forever).
const waitForNetworkConnection = (timeoutMs = 10000) => {
  return new Promise(resolve => {
    let settled = false;
    let unsubscribe;

    const finish = isConnected => {
      if (settled) return;
      settled = true;
      if (unsubscribe) unsubscribe();
      clearTimeout(timer);
      resolve(isConnected);
    };

    const timer = setTimeout(() => finish(false), timeoutMs);

    NetInfo.fetch()
      .then(state => {
        if (state.isConnected && state.isInternetReachable !== false) {
          finish(true);
          return;
        }
        unsubscribe = NetInfo.addEventListener(state => {
          if (state.isConnected && state.isInternetReachable !== false) {
            finish(true);
          }
        });
      })
      .catch(() => finish(false));
  });
};

global.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const isFirebaseReady = () => {
  try {
    return getApps().length > 0;
  } catch (error) {
    console.error('Error checking Firebase status:', error);
    return false;
  }
};

// notifications.js
export const createNotificationChannel = () => {
  PushNotification.createChannel(
    {
      channelId: 'gaxa',
      channelName: 'gaxa.ai',
      channelDescription: 'gaxa.ai',
      soundName: 'default',
      importance: 4,
      vibrate: true,
    },
    (created) => console.log(`Notification channel created: ${created}`),
  );
};

export const configurePushNotification = () => {
  PushNotification.configure({
    onRegister: function (token) {
      console.log('TOKEN:', token);
    },

   onNotification: function (notification) {
      console.log('LOCAL NOTIFICATION ==>', notification);

      if (notification.userInteraction) {
        console.log('Notification was tapped by user');
      }
    },

    onAction: function (notification) {
      console.log('ACTION:', notification.action);
      console.log('NOTIFICATION:', notification);

    },

    onRegistrationError: function(err) {
      console.error(err.message, err);
    },

    permissions: {
      alert: false,
      badge: false,
      sound: false,
    },
    popInitialNotification: true,
    requestPermissions: false,
  });
};

export const requestAndroidNotificationPermission = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      console.log('Android 13+ notification permission:', granted);
    } catch (err) {
      console.warn('Failed to request notification permission', err);
    }
  }
};

/**
 * Check if notifications are enabled in system settings.
 * Android 13+: checks POST_NOTIFICATIONS. iOS: checks Firebase messaging authorization.
 */
export const checkNotificationPermission = async () => {
  if (Platform.OS === 'android') {
    if (Platform.Version >= 33) {
      try {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        return granted;
      } catch {
        return false;
      }
    }
    return true;
  }
  // iOS: check via Firebase messaging
  if (!isFirebaseReady()) return true;
  try {
    const hasPermission = await messaging().hasPermission();
    return !!hasPermission;
  } catch {
    return false;
  }
};

/**
 * Open app settings so user can enable notifications.
 */
export const openAppSettings = () => {
  Linking.openSettings();
};
export const requestUserPermission = async () => {
  if (!isFirebaseReady()) {
    console.warn(
      'Firebase not initialized. Skipping notification permission request.',
    );
    return;
  }

  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      // console.log('Authorization status:', authStatus);
      getfcmToken();
    }
  } catch (error) {
    console.error('Error requesting user permission:', error);
  }
};

// Exported so login flows can (re)send the FCM token to the server right
// after a successful login, instead of waiting for the next app launch —
// requestUserPermission() (called once at app mount) runs before the user
// is authenticated, so sendTokenToServer silently no-ops without a token.
export const getfcmToken = async () => {
  if (!isFirebaseReady()) {
    console.warn('Firebase not initialized. Skipping FCM token retrieval.');
    return;
  }

  try {
    let fcmToken = await AsyncStorage.getItem(ASYNC_VARIBLES.FCM_TOKEN);
    
    if (!fcmToken || fcmToken === 'null' || fcmToken === 'undefined') {
      try {
        const token = await messaging().getToken();
        if (token && typeof token === 'string') {
          console.log('FCM Token received:', token);
          
          try {
            await AsyncStorage.setItem(ASYNC_VARIBLES.FCM_TOKEN, token);
          } catch (storageError) {
            console.error('Error saving FCM token to storage:', storageError);
          }
          
          // Send token to your server
          await sendTokenToServer(token);
          
          // Subscribe to general topics for all users
          await subscribeToAllUsersTopics();
        } else {
          console.warn('Invalid or empty FCM token received');
        }
      } catch (tokenError) {
        console.error('Error getting FCM token:', tokenError);
      }
    } else {
      // Token exists, send to server
      await sendTokenToServer(fcmToken);
    }
  } catch (error) {
    console.error('Error in getfcmToken:', error);
  }
};

// Function to send FCM token to your server
const sendTokenToServer = async (token, retriesLeft = 2) => {
  try {
    if (!token || typeof token !== 'string') {
      console.log('Invalid FCM token provided');
      return;
    }

    const isConnected = await waitForNetworkConnection();
    if (!isConnected) {
      if (retriesLeft > 0) {
        console.log(`No network connection yet, retrying FCM token send (${retriesLeft} left)...`);
        return sendTokenToServer(token, retriesLeft - 1);
      }
      console.warn('No network connection available, skipping FCM token send.');
      return;
    }

    const authToken = await AsyncStorage.getItem("authToken");
   if(!authToken){
    console.log('No auth token found, skipping FCM token send.');
    return;
   }
    try {
        const response = await axios.post(
          `${baseUrl}/save-fcm-token`,
          {
           fcm_token: token,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authToken}`,
            },
            timeout: 8000,
          }
        );

        if (response && response.status === 200) {
          console.log('FCM token saved to server successfully');
        }
      } catch (apiError) {
        // A generic "Network Error" (no response received) can happen even when
        // NetInfo reports connected, e.g. right at cold start before DNS/interface
        // is truly ready. Retry the request itself with backoff before giving up.
        const isNetworkError = !apiError.response;
        if (isNetworkError && retriesLeft > 0) {
          console.log(`Network error sending FCM token, retrying (${retriesLeft} left)...`);
          await sleep(1500 * (3 - retriesLeft));
          return sendTokenToServer(token, retriesLeft - 1);
        }
        // Handle 401 errors gracefully during app initialization
        console.error('API error when sending FCM token:', apiError.message);
        // Don't throw - just log and continue
      }
  } catch (error) {
    console.error('Error sending FCM token to server:', error);
    // Don't re-throw to prevent app crashes
  }
};

export const notificationListner = async () => {
  if (!isFirebaseReady()) {
    console.warn(
      'Firebase not initialized. Skipping notification listeners setup.',
    );
    return;
  }

  try {
    // Handle notification when app is opened from background
    messaging().onNotificationOpenedApp(remoteMessage => {
      try {
        console.log('Notification caused app to open from background state');
        
        // Add null safety checks
        if (!remoteMessage) {
          console.log('Background notification: remoteMessage is null or undefined');
          return;
        }
        delay();
       // Handle specific notification types
        
        // Handle notification action here with error handling
        handleNotificationAction(remoteMessage);
      } catch (error) {
        console.error('Error handling background notification tap:', error);
        // Don't re-throw to prevent crashes
      }
    });

    // Handle notification when app is opened from quit state
    messaging()
      .getInitialNotification()
      .then(async remoteMessage => {
        try {
          if (remoteMessage) {
            console.log('Quit state notification data:', remoteMessage.notification);
            // Handle notification action here with error handling
            handleNotificationAction(remoteMessage);
          } else {
            console.log('No initial notification found');
          }
        } catch (error) {
          console.error('Error handling quit state notification:', error);
          // Don't re-throw to prevent crashes
        }
      })
      .catch(error => {
        console.error('Error getting initial notification:', error);
        // Continue app flow even if initial notification check fails
      });

    // Background message handler is registered once in index.js as recommended.

    // Handle token refresh
    messaging().onTokenRefresh(async token => {
      try {
        console.log('FCM token refreshed:', token);
        
        // Add validation for token
        if (!token || typeof token !== 'string') {
          console.error('Invalid FCM token received in refresh:', token);
          return;
        }

        // Store token with error handling
        try {
          await AsyncStorage.setItem(ASYNC_VARIBLES.FCM_TOKEN, token);
          console.log('New FCM token stored successfully');
        } catch (storageError) {
          console.error('Error storing refreshed FCM token:', storageError);
        }

        // Optionally send token to server
        try {
          await sendTokenToServer(token);
        } catch (serverError) {
          console.error('Error sending refreshed token to server:', serverError);
          // Continue even if server update fails
        }
      } catch (error) {
        console.error('Error handling token refresh:', error);
        // Don't re-throw to prevent crashes
      }
    });
  } catch (error) {
    console.error('Error setting up notification listeners:', error);
  }
};

// Handle notification actions (navigation, etc.)
const handleNotificationAction = remoteMessage => {
  try {
    // Add comprehensive null safety checks
    if (!remoteMessage) {
      console.log('handleNotificationAction: remoteMessage is null or undefined');
      return;
    }

    const data = remoteMessage.data;
    if (!data || typeof data !== 'object') {
      console.log('handleNotificationAction: No valid data found in notification');
      return;
    }

    const { type, params } = data;

    // Validate type exists and is string
    if (!type || typeof type !== 'string') {
      console.log('handleNotificationAction: Invalid or missing notification type');
      return;
    }

    // You can add navigation logic here based on notification data
    switch (type) {
      case 'match_update':
        // Navigate to match details
        console.log('Navigate to match:', params);
        break;
      case 'contest_result':
        // Navigate to contest results
        console.log('Navigate to contest results:', params);
        break;
      case 'new_contest':
        // Navigate to new contest
        console.log('Navigate to new contest:', params);
        break;
      default:
        console.log('Unknown notification type:', type);
    }
  } catch (error) {
    console.error('Error handling notification action:', error);
    // Don't re-throw to prevent app crashes
  }
};

const ensureChannelReady = async (channelId = 'gaxa') => {
  return new Promise((resolve) => {
    if (Platform.OS !== 'android') return resolve(true);
    try {
      PushNotification.channelExists(channelId, (exists) => resolve(exists));
    } catch {
      resolve(false);
    }
  });
};

export const schedulePushNotification = async (title, message, notificationData = {}) => {
  if (Platform.OS !== 'android') return; // fix: don't touch iOS

  try {
    // Enhanced input validation
    if (!title || !message) {
      console.log('schedulePushNotification: Missing title or message');
      return;
    }
    if (typeof title !== 'string' || typeof message !== 'string') {
      console.log('schedulePushNotification: Title and message must be strings');
      return;
    }
    if (!title.trim().length || !message.trim().length) {
      console.log('schedulePushNotification: Title and message cannot be empty');
      return;
    }

    // Suppress test or placeholder notifications universally (foreground/background/quit)
    if (title === NOTIFICATION_MESSAGES.TESTING.title) {
      console.log("schedulePushNotification: Suppressing notification with title 'testing'");
      return;
    }

    // Android 13+ runtime permission check to avoid native crashes
    if (Platform.Version >= 33) {
      try {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (!granted) {
          console.log('schedulePushNotification: Notification permission not granted, skipping');
          return;
        }
      } catch (permErr) {
        console.log('schedulePushNotification: Permission check failed, skipping', permErr);
        return;
      }
    }

    // Add timeout to prevent hanging
    const hasChannel = await Promise.race([
      ensureChannelReady('gaxa'),
      new Promise((resolve) => setTimeout(() => resolve(false), 3000)) // 3 second timeout
    ]);
    
    if (!hasChannel) {
      console.log('Notification channel not ready or timeout — skipping notification');
      return;
    }

    // Additional safety check before showing notification
    try {
      PushNotification.localNotification({
        channelId: 'gaxa',
        title: title.trim(),
        message: message.trim(),
        playSound: true,
        soundName: 'default',
        autoCancel: true,
        allowWhileIdle: true,
        userInfo: {
          ...notificationData,
          notificationTitle: title.trim(),
          notificationBody: message.trim()
        },
        // priority and importance are controlled by the channel; avoid passing mismatched types here
      });
      console.log('Local notification scheduled successfully');
    } catch (notificationError) {
      console.error('Error showing local notification:', notificationError);
      // Don't re-throw to prevent crashes
    }
  } catch (err) {
    console.error('Error in schedulePushNotification:', err);
    // Don't re-throw to prevent app crashes
  }
};


// Subscribe all users to general topics
const subscribeToAllUsersTopics = async () => {
  if (!isFirebaseReady()) {
    console.warn('Firebase not initialized. Skipping topic subscription.');
    return;
  }

  try {
    // Subscribe to topic for all users - this allows sending notifications to everyone
    const topics = ['all_users', 'general_updates'];
    
    for (const topic of topics) {
      try {
        await messaging().subscribeToTopic(topic);
        console.log(`Successfully subscribed to topic: ${topic}`);
      } catch (topicError) {
        console.error(`Error subscribing to topic ${topic}:`, topicError);
        // Continue with other topics even if one fails
      }
    }
  } catch (error) {
    console.error('Error in subscribeToAllUsersTopics:', error);
  }
};

// Function to refresh FCM token
export const refreshFCMToken = async () => {
  if (!isFirebaseReady()) {
    console.warn('Firebase not initialized. Skipping FCM token refresh.');
    return;
  }

  try {
    console.log('Refreshing FCM token...');
    // Get a new token
    const newToken = await messaging().getToken();
    if (newToken && typeof newToken === 'string') {
      console.log('New FCM token received:', newToken.substring(0, 20) + '...');
      
      // Store the new token
      await AsyncStorage.setItem(ASYNC_VARIBLES.FCM_TOKEN, newToken);
      console.log('New FCM token stored successfully');
      
      // Send new token to server
      await sendTokenToServer(newToken);
      
      // Subscribe to topics again
      await subscribeToAllUsersTopics();
      
      return newToken;
    } else {
      console.warn('Failed to get new FCM token');
      return null;
    }
  } catch (error) {
    console.error('Error refreshing FCM token:', error);
    return null;
  }
};

export default {
  requestUserPermission,
  notificationListner,
  schedulePushNotification,
  configurePushNotification,
  refreshFCMToken,
  checkNotificationPermission,
  openAppSettings,
  getfcmToken,
};
