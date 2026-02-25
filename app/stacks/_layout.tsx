import { Stack } from "expo-router";

export default function StacksLayout() {
  return (
    <Stack>
      <Stack.Screen name="policy" options={{ headerShown: false }} />
      <Stack.Screen name="search" options={{ headerShown: false }} />
      <Stack.Screen name="contactUs" options={{ headerShown: false }} />
      <Stack.Screen name="faqScreen" options={{ headerShown: false }} />
      <Stack.Screen name="termsConditions" options={{ headerShown: false }} />
      <Stack.Screen name="refundPolicy" options={{ headerShown: false }} />
      <Stack.Screen name="productDetails" options={{ headerShown: false }} />
      <Stack.Screen name="chatDetail" options={{ headerShown: false }} />
      <Stack.Screen name="categories" options={{ headerShown: false }} />
    </Stack>
  );
}