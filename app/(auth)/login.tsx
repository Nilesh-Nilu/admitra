import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import AppToast from "@/components/toasts/AppToast";
import { COLORS } from "@/constants/Colors";
import { baseUrl, sendOtpUrl } from "@/constants/functions";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height } = Dimensions.get("window");

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [phoneNumber, setPhoneNumber] = useState("");
  const countryCode = "+91";
  const [loading, setLoading] = useState(false);

  const handlePhoneNumberChange = (text: string) => {
    const cleanText = text.replace(/\D/g, "").slice(0, 10);
    setPhoneNumber(cleanText);
  };

  const handleGetOTP = async () => {
    try {
      if (phoneNumber.trim()) {
        setLoading(true);
        const response = await axios.post(`${baseUrl}/${sendOtpUrl}`, {
          phone: phoneNumber,
        });
        console.log(response.data, "response");
        AppToast(`${response.data.otp} is your otp`);
        if (response.data.success) {
          router.push({
            pathname: "/(auth)/otp",
            params: { mobile: phoneNumber },
          });
        }
      }
    } catch (error: any) {
      if (error.response?.data?.status === 400) {
        AppToast(error.response.data.message);
      }
      console.log(error.response?.data, "error");
    } finally {
      setLoading(false);
    }
  };

  const isPhoneValid = phoneNumber.trim().length === 10;

  return (
    <ThemedView style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      >
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />
        <View style={styles.bgCircle3} />
      </LinearGradient>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </Pressable>
      </View>

      {/* Title Section */}
      <View style={styles.titleSection}>
        <View style={styles.iconWrapper}>
          <Ionicons name="phone-portrait" size={36} color={COLORS.white} />
        </View>
        <ThemedText style={styles.title}>Welcome Back</ThemedText>
        <ThemedText style={styles.subtitle}>
          Sign in to access your account
        </ThemedText>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Form Card */}
          <View style={styles.formCard}>
            <ThemedText style={styles.formTitle}>Enter your phone number</ThemedText>
            <ThemedText style={styles.formSubtitle}>
              We&apos;ll send you a verification code
            </ThemedText>

            {/* Phone Input */}
            <View style={styles.phoneInputContainer}>
              <View style={styles.countrySection}>
                <ThemedText style={styles.flag}>🇮🇳</ThemedText>
                <ThemedText style={styles.countryCode}>{countryCode}</ThemedText>
                <Ionicons name="chevron-down" size={16} color={COLORS.gray} />
              </View>
              <View style={styles.inputDivider} />
              <TextInput
                style={styles.phoneInput}
                placeholder="Enter mobile number"
                placeholderTextColor={COLORS.gray}
                value={phoneNumber}
                onChangeText={handlePhoneNumberChange}
                keyboardType="phone-pad"
                maxLength={10}
              />
              {isPhoneValid && (
                <View style={styles.validIcon}>
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                </View>
              )}
            </View>

            {/* Get OTP Button */}
            <Pressable
              style={[styles.otpButton, (!isPhoneValid || loading) && styles.otpButtonDisabled]}
              onPress={handleGetOTP}
              disabled={!isPhoneValid || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <>
                  <ThemedText style={styles.otpButtonText}>Get OTP</ThemedText>
                  <View style={styles.buttonArrow}>
                    <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
                  </View>
                </>
              )}
            </Pressable>

            {/* Security Note */}
            <View style={styles.securityNote}>
              <Ionicons name="shield-checkmark" size={18} color={COLORS.success} />
              <ThemedText style={styles.securityText}>
                Your data is encrypted and secure
              </ThemedText>
            </View>
          </View>

          {/* Terms */}
          <View style={styles.termsSection}>
            <ThemedText style={styles.termsText}>
              By continuing, you agree to our{" "}
              <ThemedText style={styles.termsLink}>Terms of Service</ThemedText>
              {" "}and{" "}
              <ThemedText style={styles.termsLink}>Privacy Policy</ThemedText>
            </ThemedText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    overflow: "hidden",
  },
  bgCircle1: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(255,255,255,0.1)",
    top: -80,
    right: -60,
  },
  bgCircle2: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.08)",
    top: 100,
    left: -50,
  },
  bgCircle3: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.1)",
    bottom: 50,
    right: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  titleSection: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: COLORS.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 15,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: "center",
    marginBottom: 28,
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  countrySection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  flag: {
    fontSize: 22,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  inputDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.border,
  },
  phoneInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.text,
    letterSpacing: 1,
  },
  validIcon: {
    marginLeft: 8,
  },
  otpButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 24,
  },
  otpButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  otpButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.white,
  },
  buttonArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 13,
    color: COLORS.gray,
    marginHorizontal: 16,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 24,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  socialIcon: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.success + "10",
    borderRadius: 30,
  },
  securityText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.success,
  },
  termsSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  termsText: {
    fontSize: 13,
    color: COLORS.gray,
    textAlign: "center",
    lineHeight: 20,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 13,
  },
});
