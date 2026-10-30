import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function StacksLayout() {
  return (
    // Android only: slide pages in from the right (iOS keeps its native default).
    <Stack screenOptions={Platform.OS === "android" ? { animation: "ios_from_right" } : undefined}>
      <Stack.Screen name="policy" options={{ headerShown: false }} />
      <Stack.Screen name="search" options={{ headerShown: false }} />
      <Stack.Screen name="contactUs" options={{ headerShown: false }} />
      <Stack.Screen name="productDetails" options={{ headerShown: false }} />
      <Stack.Screen name="chatDetail" options={{ headerShown: false }} />
      <Stack.Screen name="categories" options={{ headerShown: false }} />
      <Stack.Screen name="bannerDetails" options={{ headerShown: false }} />
      <Stack.Screen name="seeAllBanners" options={{ headerShown: false }} />
      <Stack.Screen name="seeAllFeatured" options={{ headerShown: false }} />
      <Stack.Screen name="seeAllFresh" options={{ headerShown: false }} />
      <Stack.Screen name="seeAllMatrimony" options={{ headerShown: false }} />
      <Stack.Screen name="matrimonyProfileDetails" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="verificationSuccess" options={{ headerShown: false }} />
      <Stack.Screen name="verificationPending" options={{ headerShown: false }} />
      <Stack.Screen name="userProfile" options={{ headerShown: false }} />
      <Stack.Screen name="changePassword" options={{ headerShown: false }} />
    </Stack>
  );
}