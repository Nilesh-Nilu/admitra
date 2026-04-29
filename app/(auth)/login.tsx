import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import AppToast from "@/components/toasts/AppToast";
import { COLORS } from "@/constants/Colors";
import { baseUrl } from "@/constants/functions";
import { setUser } from "@/store/reducers/authReducer";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { useDispatch } from "react-redux";

const { height } = Dimensions.get("window");

const ROLE_CONFIG = {
  user: {
    gradient: ["#667eea", "#764ba2"] as [string, string],
    icon: "person" as const,
    title: "Welcome Back",
    subtitle: "Sign in to browse & shop",
    formTitle: "User Sign In",
    formSubtitle: "Access your account to explore deals",
    buttonText: "Sign In as User",
    securityText: "Your data is encrypted and secure",
  },
  vendor: {
    gradient: ["#11998e", "#38ef7d"] as [string, string],
    icon: "storefront" as const,
    title: "Vendor Portal",
    subtitle: "Manage your business",
    formTitle: "Vendor Sign In",
    formSubtitle: "Access your store dashboard",
    buttonText: "Sign In as Vendor",
    securityText: "Business-grade security enabled",
  },
};

export default function LoginScreen() {
  const currentRole = "user" as keyof typeof ROLE_CONFIG;
  const config = ROLE_CONFIG[currentRole];
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  const [email, setEmail] = useState("rahulll@gmail.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const handleLogin = async () => {
    try {
      if (email.trim() && password.trim()) {
        setLoading(true);
        const response = await axios.post(`${baseUrl}/login`, {
          email: email.trim(),
          password: password.trim(),
        });

        if (response.data.success) {
          AppToast("Login successful!");
          dispatch(setUser(response.data.user));
          console.log(response.data, "response.data.user");
          await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
          await AsyncStorage.setItem("authToken", response.data.access_token);
          router.replace("/(tabs)");
        }
      }
    } catch (error: any) {
      if (error.response?.data) {
        AppToast(error.response.data.message || "Login failed");
      } else {
        AppToast("An error occurred. Please try again.");
      }
      console.log(error.response?.data, "error");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = email.trim().length > 0 && password.trim().length >= 6;

  return (
    <ThemedView style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={config.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      >
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />
        <View style={styles.bgCircle3} />
      </LinearGradient>

      {/* Header */}
      <View style={[styles.header]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </Pressable>
        {/* Role Badge */}
        <View style={styles.roleBadge}>
          <Ionicons name={config.icon} size={14} color={COLORS.white} />
          <ThemedText style={styles.roleBadgeText}>User</ThemedText>
        </View>
      </View>

      {/* Title Section */}
      <View style={styles.titleSection}>
        <View style={styles.iconWrapper}>
          <Ionicons name={config.icon} size={36} color={COLORS.white} />
        </View>
        <ThemedText style={styles.title}>{config.title}</ThemedText>
        <ThemedText style={styles.subtitle}>{config.subtitle}</ThemedText>
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
            <ThemedText style={[styles.formTitle, { color: config.gradient[0] }]}>
              {config.formTitle}
            </ThemedText>
            <ThemedText style={styles.formSubtitle}>{config.formSubtitle}</ThemedText>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabelRow}>
                <Ionicons name="mail-outline" size={16} color={config.gradient[0]} />
                <ThemedText style={styles.inputLabel}>
                  {currentRole === "vendor" ? "Business Email" : "Email"}
                </ThemedText>
              </View>
              <View style={[styles.inputContainer, email.length > 0 && { borderColor: config.gradient[0] }]}>
                <Ionicons name="mail" size={20} color={COLORS.gray} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder={currentRole === "vendor" ? "Enter your business email" : "Enter your email"}
                  placeholderTextColor={COLORS.gray}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
                {email.length > 0 && (
                  <Ionicons name="checkmark-circle" size={20} color={config.gradient[0]} />
                )}
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabelRow}>
                <Ionicons name="lock-closed-outline" size={16} color={config.gradient[0]} />
                <ThemedText style={styles.inputLabel}>Password</ThemedText>
              </View>
              <View style={[styles.inputContainer, password.length > 0 && { borderColor: config.gradient[0] }]}>
                <Ionicons name="lock-closed" size={20} color={COLORS.gray} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your password"
                  placeholderTextColor={COLORS.gray}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={COLORS.gray}
                  />
                </Pressable>
              </View>
            </View>
            {/* Login Button */}
            <Pressable
              style={[styles.loginButton, (!isFormValid || loading) && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={!isFormValid || loading}
            >
              <LinearGradient
                colors={isFormValid && !loading ? config.gradient : ["#ccc", "#aaa"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <>
                    <ThemedText style={styles.loginButtonText}>{config.buttonText}</ThemedText>
                    <View style={styles.buttonArrow}>
                      <Ionicons name="arrow-forward" size={16} color={config.gradient[0]} />
                    </View>
                  </>
                )}
              </LinearGradient>
            </Pressable>

            {/* Forgot Password Link */}
            <Pressable style={styles.forgotPassword} onPress={() =>
              router.push({ pathname: "/(auth)/loginFields", params: { role: currentRole } })}>
              <ThemedText style={[styles.forgotPasswordText, { color: config.gradient[0] }]}>
                New Here? Create an Account
              </ThemedText>
            </Pressable>
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
    justifyContent: "space-between",
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
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
  },
  roleBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.white,
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
  inputGroup: {
    marginBottom: 20,
  },
  inputLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: 10,
  },
  inputIcon: {
    marginRight: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.text,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primary,
  },
  loginButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  loginButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 18,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
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
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 30,
  },
  securityText: {
    fontSize: 13,
    fontWeight: "500",
  },
  vendorInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 16,
    paddingVertical: 10,
  },
  vendorInfoText: {
    fontSize: 12,
    color: COLORS.gray,
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
