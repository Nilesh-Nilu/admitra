import Splash from "@/components/Splash";
import { useColorScheme } from "@/hooks/useColorScheme";
import { store } from "@/store/configureStore";
import {
  Roboto_100Thin,
  Roboto_300Light,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
  Roboto_900Black,
} from "@expo-google-fonts/roboto";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import VersionCheck from "react-native-version-check";
import { Alert, Linking, View } from "react-native";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    // Roboto fonts
    "Roboto-Thin": Roboto_100Thin,
    "Roboto-Light": Roboto_300Light,
    "Roboto-Regular": Roboto_400Regular,
    "Roboto-Medium": Roboto_500Medium,
    "Roboto-Bold": Roboto_700Bold,
    "Roboto-Black": Roboto_900Black,
  });
  const [isSplashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
    const checkAppVersion = async () => {
      try {
        const latestVersion = await VersionCheck.getLatestVersion({
          packageName:'com.admitra.app',
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
    const timer = setTimeout(() => {
      setSplashVisible(false);
    }, 1000); // 2 seconds delay

    return () => clearTimeout(timer);
  }, []);

  if (!loaded || isSplashVisible) {
    return <Splash />;
  }

  return (
    <Provider store={store}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider style={{ flex: 1 }}>
            <ThemeProvider
              value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
              <StatusBar style="dark" />
              <View style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
                <Slot />
              </View>
            </ThemeProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
    </Provider>
  );
}
