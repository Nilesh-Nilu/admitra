import ThemeHeader from "@/components/headers/ThemeHeader";
import PasswordField from "@/components/login/PasswordField";
import PrimaryBtn from "@/components/login/PrimaryButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import AppToast from "@/components/toasts/AppToast";
import { forgotPasswordApi, getApiErrorMessage, resetPasswordApi } from "@/constants/functions";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";

const PURPLE = "#7C6FCD";
const MIN_PASSWORD = 6;

export default function ForgotPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState(params.email || "");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isEmailValid = /^\S+@\S+\.\S+$/.test(email.trim());
  const isResetValid =
    otp.trim().length >= 4 && password.length >= MIN_PASSWORD && password === confirmPassword;

  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/(auth)/login"));

  const handleSendOtp = async () => {
    if (!isEmailValid) return;
    setLoading(true);
    try {
      const res = await forgotPasswordApi(email.trim());
      if (res?.success === false) {
        AppToast(res?.message || "Could not send OTP. Please try again.");
        return;
      }
      AppToast(res?.message || "OTP sent to your email");
      setStep("reset");
    } catch (error) {
      AppToast(getApiErrorMessage(error, "Could not send OTP. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (password !== confirmPassword) {
      AppToast("Passwords do not match");
      return;
    }
    if (!isResetValid) return;
    setLoading(true);
    try {
      const res = await resetPasswordApi({
        email: email.trim(),
        otp: otp.trim(),
        password,
        password_confirmation: confirmPassword,
      });
      if (res?.success === false) {
        AppToast(res?.message || "Could not reset password. Please try again.");
        return;
      }
      AppToast(res?.message || "Password reset successfully. Please sign in.");
      goBack();
    } catch (error) {
      AppToast(getApiErrorMessage(error, "Could not reset password. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemeHeader onBackPress={step === "reset" ? () => setStep("email") : goBack} title="Forgot Password" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.iconCircle}>
            <Ionicons name={step === "email" ? "key-outline" : "shield-checkmark-outline"} size={36} color={PURPLE} />
          </View>

          {step === "email" ? (
            <>
              <ThemedText style={styles.heading}>Reset your password</ThemedText>
              <ThemedText style={styles.subHeading}>
                Enter the email linked to your account. We will send you an OTP.
              </ThemedText>
              <PasswordField
                icon="mail-outline"
                secure={false}
                accent={PURPLE}
                placeholder="Enter your email"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <PrimaryBtn label="Send OTP" loading={loading} disabled={!isEmailValid} color={PURPLE} onPress={handleSendOtp} arrow />
            </>
          ) : (
            <>
              <ThemedText style={styles.heading}>Create new password</ThemedText>
              <ThemedText style={styles.subHeading}>
                Enter the OTP sent to <ThemedText style={styles.emailText}>{email.trim()}</ThemedText>
              </ThemedText>
              <PasswordField
                icon="keypad-outline"
                secure={false}
                accent={PURPLE}
                placeholder="Enter OTP"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
              />
              <PasswordField
                accent={PURPLE}
                placeholder={`New password (min ${MIN_PASSWORD} characters)`}
                value={password}
                onChangeText={setPassword}
              />
              <PasswordField
                accent={PURPLE}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <ThemedText style={styles.errorText}>Passwords do not match</ThemedText>
              )}
              <PrimaryBtn label="Reset Password" loading={loading} disabled={!isResetValid} color={PURPLE} onPress={handleReset} />
              <Pressable onPress={handleSendOtp} disabled={loading} style={styles.linkBtn}>
                <ThemedText style={styles.linkText}>Didn&apos;t get the OTP? Resend</ThemedText>
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F4FF" },
  scroll: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40, alignItems: "center" },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EEEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  heading: { fontSize: 22, fontWeight: "800", color: "#1E293B", textAlign: "center", marginBottom: 8 },
  subHeading: { fontSize: 14, color: "#64748B", textAlign: "center", marginBottom: 24, lineHeight: 20 },
  emailText: { fontSize: 14, fontWeight: "700", color: PURPLE },
  errorText: { alignSelf: "flex-start", fontSize: 12, color: "#DC2626", marginTop: -8, marginBottom: 12 },
  linkBtn: { alignSelf: "center", marginTop: 4, padding: 6 },
  linkText: { fontSize: 13, fontWeight: "600", color: PURPLE },
});
