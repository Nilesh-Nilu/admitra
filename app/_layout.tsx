import Splash from "@/components/Splash";
import { useColorScheme } from "@/hooks/useColorScheme";
import { store } from "@/store/configureStore";
import {
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import VersionCheck from "react-native-version-check";
import { Alert, Linking, View } from "react-native";
import messaging from '@react-native-firebase/messaging';
import {
  requestUserPermission,
  notificationListner,
  createNotificationChannel,
  requestAndroidNotificationPermission,
  configurePushNotification,
} from '../app/notification/notifications';

SplashScreen.preventAutoHideAsync();

// ✅ Must be outside the component, at module level
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background message received:', remoteMessage);
});

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    "Poppins-Light": Poppins_300Light,
    "Poppins-Regular": Poppins_400Regular,
    "Poppins-Medium": Poppins_500Medium,
    "Poppins-SemiBold": Poppins_600SemiBold,
    "Poppins-Bold": Poppins_700Bold,
  });
  const [isSplashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
    const checkAppVersion = async () => {
      try {
        const latestVersion = await VersionCheck.getLatestVersion({
          packageName: 'com.admitra.app',
          ignoreErrors: true,
        });
        const currentVersion = VersionCheck.getCurrentVersion();
        const latest = parseFloat(latestVersion);
        const current = parseFloat(currentVersion);
        if (latest > current) {
          Alert.alert(
            'Update Required',
            'A new version of the app is available. Please update to continue using the app.',
            [{ text: 'Update Now', onPress: async () => {
              const url = await VersionCheck.getPlayStoreUrl({ packageName: 'com.admitra.app' });
              Linking.openURL(url);
            }}],
            { cancelable: false }
          );
        }
      } catch (error) {
        console.error('Error checking app version:', error);
      }
    };
    checkAppVersion();
  }, []);

  const colorScheme = useColorScheme();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        configurePushNotification();
        createNotificationChannel();
        await requestAndroidNotificationPermission();
        notificationListner();
      } catch (error) {
        console.error('Error initializing notification system:', error);
      }
    };
    initializeNotifications();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        await requestUserPermission();
      } catch (error) {
        console.error('Error setting up FCM permissions:', error);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashVisible(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!loaded || isSplashVisible) {
    return <Splash />;
  }

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider style={{ flex: 1 }}>
          <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <StatusBar style="dark" />
            <View style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="stacks" />
              </Stack>
            </View>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}