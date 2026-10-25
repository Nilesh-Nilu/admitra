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
    (created) => {},
  );
};

export const configurePushNotification = () => {
  PushNotification.configure({
    onRegister: function (token) {
    },

   onNotification: function (notification) {

      if (notification.userInteraction) {
      }
    },

    onAction: function (notification) {

    },

    onRegistrationError: function(err) {
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
    } catch (err) {
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
    return;
  }

  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      getfcmToken();
    }
  } catch (error) {
  }
};

// Exported so login flows can (re)send the FCM token to the server right
// after a successful login, instead of waiting for the next app launch —
// requestUserPermission() (called once at app mount) runs before the user
// is authenticated, so sendTokenToServer silently no-ops without a token.
export const getfcmToken = async () => {
  if (!isFirebaseReady()) {
    return;
  }

  try {
    let fcmToken = await AsyncStorage.getItem(ASYNC_VARIBLES.FCM_TOKEN);
    
    if (!fcmToken || fcmToken === 'null' || fcmToken === 'undefined') {
      try {
        const token = await messaging().getToken();
        if (token && typeof token === 'string') {
          
          try {
            await AsyncStorage.setItem(ASYNC_VARIBLES.FCM_TOKEN, token);
          } catch (storageError) {
          }
          
          // Send token to your server
          await sendTokenToServer(token);
          
          // Subscribe to general topics for all users
          await subscribeToAllUsersTopics();
        } else {
        }
      } catch (tokenError) {
      }
    } else {
      // Token exists, send to server
      await sendTokenToServer(fcmToken);
    }
  } catch (error) {
  }
};

// Function to send FCM token to your server
const sendTokenToServer = async (token, retriesLeft = 2) => {
  try {
    if (!token || typeof token !== 'string') {
      return;
    }

    const isConnected = await waitForNetworkConnection();
    if (!isConnected) {
      if (retriesLeft > 0) {
        return sendTokenToServer(token, retriesLeft - 1);
      }
      return;
    }

    const authToken = await AsyncStorage.getItem("authToken");
   if(!authToken){
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
        }
      } catch (apiError) {
        // A generic "Network Error" (no response received) can happen even when
        // NetInfo reports connected, e.g. right at cold start before DNS/interface
        // is truly ready. Retry the request itself with backoff before giving up.
        const isNetworkError = !apiError.response;
        if (isNetworkError && retriesLeft > 0) {
          await sleep(1500 * (3 - retriesLeft));
          return sendTokenToServer(token, retriesLeft - 1);
        }
        // Handle 401 errors gracefully during app initialization
        // Don't throw - just log and continue
      }
  } catch (error) {
    // Don't re-throw to prevent app crashes
  }
};

export const notificationListner = async () => {
  if (!isFirebaseReady()) {
    return;
  }

  try {
    // Handle notification when app is opened from background
    messaging().onNotificationOpenedApp(remoteMessage => {
      try {
        
        // Add null safety checks
        if (!remoteMessage) {
          return;
        }
        delay();
       // Handle specific notification types
        
        // Handle notification action here with error handling
        handleNotificationAction(remoteMessage);
      } catch (error) {
        // Don't re-throw to prevent crashes
      }
    });

    // Handle notification when app is opened from quit state
    messaging()
      .getInitialNotification()
      .then(async remoteMessage => {
        try {
          if (remoteMessage) {
            // Handle notification action here with error handling
            handleNotificationAction(remoteMessage);
          } else {

          }
        } catch (error) {
          // Don't re-throw to prevent crashes
        }
      })
      .catch(error => {
        // Continue app flow even if initial notification check fails
      });

    // Background message handler is registered once in index.js as recommended.

    // Handle token refresh
    messaging().onTokenRefresh(async token => {
      try {
        
        // Add validation for token
        if (!token || typeof token !== 'string') {
          return;
        }

        // Store token with error handling
        try {
          await AsyncStorage.setItem(ASYNC_VARIBLES.FCM_TOKEN, token);
        } catch (storageError) {
        }

        // Optionally send token to server
        try {
          await sendTokenToServer(token);
        } catch (serverError) {
          // Continue even if server update fails
        }
      } catch (error) {
        // Don't re-throw to prevent crashes
      }
    });
  } catch (error) {
  }
};

// Handle notification actions (navigation, etc.)
const handleNotificationAction = remoteMessage => {
  try {
    // Add comprehensive null safety checks
    if (!remoteMessage) {
      return;
    }

    const data = remoteMessage.data;
    if (!data || typeof data !== 'object') {
      return;
    }

    const { type, params } = data;

    // Validate type exists and is string
    if (!type || typeof type !== 'string') {
      return;
    }

    // You can add navigation logic here based on notification data
    switch (type) {
      case 'match_update':
        // Navigate to match details
        break;
      case 'contest_result':
        // Navigate to contest results
        break;
      case 'new_contest':
        // Navigate to new contest
        break;
      default:
    }
  } catch (error) {
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
      return;
    }
    if (typeof title !== 'string' || typeof message !== 'string') {
      return;
    }
    if (!title.trim().length || !message.trim().length) {
      return;
    }

    // Suppress test or placeholder notifications universally (foreground/background/quit)
    if (title === NOTIFICATION_MESSAGES.TESTING.title) {
      return;
    }

    // Android 13+ runtime permission check to avoid native crashes
    if (Platform.Version >= 33) {
      try {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (!granted) {
          return;
        }
      } catch (permErr) {
        return;
      }
    }

    // Add timeout to prevent hanging
    const hasChannel = await Promise.race([
      ensureChannelReady('gaxa'),
      new Promise((resolve) => setTimeout(() => resolve(false), 3000)) // 3 second timeout
    ]);
    
    if (!hasChannel) {
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
    } catch (notificationError) {
      // Don't re-throw to prevent crashes
    }
  } catch (err) {
    // Don't re-throw to prevent app crashes
  }
};


// Subscribe all users to general topics
const subscribeToAllUsersTopics = async () => {
  if (!isFirebaseReady()) {
    return;
  }

  try {
    // Subscribe to topic for all users - this allows sending notifications to everyone
    const topics = ['all_users', 'general_updates'];
    
    for (const topic of topics) {
      try {
        await messaging().subscribeToTopic(topic);
      } catch (topicError) {
        // Continue with other topics even if one fails
      }
    }
  } catch (error) {
  }
};

// Function to refresh FCM token
export const refreshFCMToken = async () => {
  if (!isFirebaseReady()) {
    return;
  }

  try {
    // Get a new token
    const newToken = await messaging().getToken();
    if (newToken && typeof newToken === 'string') {
      
      // Store the new token
      await AsyncStorage.setItem(ASYNC_VARIBLES.FCM_TOKEN, newToken);
      
      // Send new token to server
      await sendTokenToServer(newToken);
      
      // Subscribe to topics again
      await subscribeToAllUsersTopics();
      
      return newToken;
    } else {
      return null;
    }
  } catch (error) {
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
