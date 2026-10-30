import ThemeHeader from "@/components/headers/ThemeHeader";
import PasswordField from "@/components/login/PasswordField";
import PrimaryBtn from "@/components/login/PrimaryButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import AppToast from "@/components/toasts/AppToast";
import { COLORS } from "@/constants/Colors";
import { changePasswordApi, getApiErrorMessage } from "@/constants/functions";
import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet } from "react-native";
import { useSelector } from "react-redux";

const MIN_PASSWORD = 6;

export default function ChangePasswordScreen() {
  const { user } = useSelector((state: any) => state.entities.authReducer) || {};
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid =
    currentPassword.length > 0 && password.length >= MIN_PASSWORD && password === confirmPassword;

  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/(tabs)/profile"));

  const handleSubmit = async () => {
    if (password === currentPassword) {
      AppToast("New password must be different from the current one");
      return;
    }
    if (!isValid) return;
    setLoading(true);
    try {
      const res = await changePasswordApi({
        current_password: currentPassword,
        password,
        password_confirmation: confirmPassword,
      });
      if (res?.success === false) {
        AppToast(res?.message || "Could not change password. Please try again.");
        return;
      }
      AppToast(res?.message || "Password changed successfully");
      goBack();
    } catch (error) {
      AppToast(getApiErrorMessage(error, "Could not change password. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemeHeader onBackPress={goBack} title="Change Password" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <ThemedText style={styles.subHeading}>
            Use at least {MIN_PASSWORD} characters. You will use the new password to sign in with your email.
          </ThemedText>
          <PasswordField placeholder="Current password" value={currentPassword} onChangeText={setCurrentPassword} />
          <PasswordField placeholder="New password" value={password} onChangeText={setPassword} />
          <PasswordField placeholder="Confirm new password" value={confirmPassword} onChangeText={setConfirmPassword} />
          {confirmPassword.length > 0 && password !== confirmPassword && (
            <ThemedText style={styles.errorText}>Passwords do not match</ThemedText>
          )}
          <PrimaryBtn label="Update Password" loading={loading} disabled={!isValid} color={COLORS.primary} onPress={handleSubmit} />
          <Pressable
            style={styles.linkBtn}
            onPress={() => router.push({ pathname: "/(auth)/forgotPassword" as any, params: { email: user?.email || "" } })}
          >
            <ThemedText style={styles.linkText}>Forgot your current password?</ThemedText>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20, paddingBottom: 40 },
  subHeading: { fontSize: 13, color: "#64748B", marginBottom: 20, lineHeight: 19 },
  errorText: { fontSize: 12, color: "#DC2626", marginTop: -8, marginBottom: 12 },
  linkBtn: { alignSelf: "center", padding: 6 },
  linkText: { fontSize: 13, fontWeight: "600", color: COLORS.primary },
});
