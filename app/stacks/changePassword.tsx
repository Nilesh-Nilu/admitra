import ThemeHeader from "@/components/headers/ThemeHeader";
import PrimaryBtn from "@/components/login/PrimaryButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import AppToast from "@/components/toasts/AppToast";
import { COLORS } from "@/constants/Colors";
import { forgotPasswordApi, getApiErrorMessage } from "@/constants/functions";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";

/**
 * Change password uses the same email OTP flow as Forgot Password: an OTP is sent to the
 * signed-in user's email, then the new password is set on the next screen.
 */
export default function ChangePasswordScreen() {
  const { user } = useSelector((state: any) => state.entities.authReducer) || {};
  const email = String(user?.email || "").trim();
  const [loading, setLoading] = useState(false);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/(tabs)/profile"));

  const handleSendOtp = async () => {
    if (!email) {
      AppToast("No email is linked to your account");
      return;
    }
    setLoading(true);
    try {
      const res = await forgotPasswordApi(email);
      if (res?.success === false) {
        AppToast(res?.message || "Could not send OTP. Please try again.");
        return;
      }
      AppToast(res?.message || "OTP sent to your email");
      router.push({ pathname: "/(auth)/forgotPassword" as any, params: { email, step: "reset" } });
    } catch (error) {
      AppToast(getApiErrorMessage(error, "Could not send OTP. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemeHeader onBackPress={goBack} title="Change Password" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <ThemedText style={styles.subHeading}>
            We will send a one-time password (OTP) to your email. Enter it on the next screen with your new password.
          </ThemedText>
          <ThemedText style={styles.email}>{email || "No email linked to this account"}</ThemedText>
        </View>
        <PrimaryBtn label="Send OTP" loading={loading} disabled={!email} color={COLORS.primary} onPress={handleSendOtp} arrow />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20, paddingBottom: 40, gap: 16 },
  card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, gap: 8 },
  subHeading: { fontSize: 13, color: "#64748B", lineHeight: 19 },
  email: { fontSize: 15, fontWeight: "700", color: COLORS.text },
});
