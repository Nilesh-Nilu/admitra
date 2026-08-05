import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import AppToast from "@/components/toasts/AppToast";
import { COLORS } from "@/constants/Colors";
import { baseUrl } from "@/constants/functions";
import { setUser } from "@/store/reducers/authReducer";
import { getfcmToken } from "@/app/notification/notifications";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
    import axios from "axios";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import OtpIllustration from "./OtpIllustration";
import PrimaryBtn from "./PrimaryButton";
import SecurityNote from "./SecurityNote";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const PURPLE = "#7C6FCD";




export default function GmailPasswordScreen({ onBack }: { onBack: () => void }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    // const [email, setEmail] = useState("john@example.com");
    // const [password, setPassword] = useState("password123");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
  
    const isValid = email.trim().length > 0 && password.trim().length >= 6;
  
    const handleLogin = async () => {
      if (!isValid) return;
      setLoading(true);
      try {
        const response = await axios.post(
          `${baseUrl}/login`,
          {
            email: email.trim(),
            password: password.trim(),
          },
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );
        if (response.data.success) {
          AppToast("Login successful!");
          dispatch(setUser(response.data.user));
          await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
          await AsyncStorage.setItem("authToken", response.data.access_token);
          getfcmToken().catch((err) => console.log(err, "getfcmToken after Gmail password login"));
          router.replace("/(tabs)");
        }
      } catch (error: any) {
        console.log("LOGIN ERROR:", error.response?.data || error.message || error);
        
        let errorMsg = "Login failed. Please try again.";
        const responseData = error.response?.data;
        
        if (typeof responseData === "string" && responseData.includes("Checking your browser")) {
          errorMsg = "Cloudflare security challenge triggered. Please bypass /api/ on Cloudflare or whitelist your IP.";
        } else if (error.response?.data?.message) {
          errorMsg = error.response.data.message;
        } else if (error.message === "Network Error") {
          errorMsg = "Network error. Please check your internet connection.";
        }
        
        AppToast(errorMsg);
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <ThemedView style={[shared.container, { backgroundColor: "#F0EEFF" }]}>
        <View style={[shared.topBlob, { backgroundColor: "rgba(124,111,205,0.15)" }]} />
  
        {/* Header */}
        <View style={shared.headerRow}>
          <Pressable style={shared.backBtn} onPress={onBack}>
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </Pressable>
          <View style={[shared.langPill, { borderColor: PURPLE }]}>
            <Ionicons name="logo-google" size={14} color={PURPLE} />
            <ThemedText style={[shared.langText, { color: PURPLE }]}>Gmail</ThemedText>
          </View>
        </View>
  
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={shared.scroll} keyboardShouldPersistTaps="handled">
            <View style={shared.innerPad}>
  
              {/* Illustration */}
              <OtpIllustration bg="#EEF2FF" accent={PURPLE} icon="🔍" bubble="Gmail" />
  
              <ThemedText style={shared.heading}>Welcome Back</ThemedText>
              <ThemedText style={shared.subHeading}>Sign in with your Gmail account</ThemedText>
  
              {/* Email field */}
              <View style={[shared.fieldWrap, { marginBottom: 16 }, email.length > 0 && { borderColor: PURPLE }]}>
                <Ionicons name="mail-outline" size={20} color={COLORS.gray} />
                <TextInput
                  style={shared.fieldInput}
                  placeholder="Enter your email"
                  placeholderTextColor={COLORS.gray}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {email.length > 0 && <Ionicons name="checkmark-circle" size={20} color={PURPLE} />}
              </View>
  
              {/* Password field */}
              <View style={[shared.fieldWrap, { marginBottom: 28 }, password.length > 0 && { borderColor: PURPLE }]}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray} />
                <TextInput
                  style={shared.fieldInput}
                  placeholder="Enter your password"
                  placeholderTextColor={COLORS.gray}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={COLORS.gray} />
                </Pressable>
              </View>
  
              <PrimaryBtn label="Sign In as User" loading={loading} disabled={!isValid} color={PURPLE} onPress={handleLogin} arrow />
  
              <Pressable
                style={{ alignSelf: "center", marginTop: 6 }}
                onPress={() => router.push({ pathname: "/(auth)/loginFields", params: { role: "user" } })}
              >
                <ThemedText style={{ fontSize: 13, fontWeight: "600", color: PURPLE }}>
                  New Here? Create an Account
                </ThemedText>
              </Pressable>
  
              <View style={{ height: 24 }} />
              <SecurityNote accent={PURPLE} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ThemedView>
    );
  }

  const shared = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F5F4FF" },
    topBlob: { position: "absolute", width: 320, height: 320, borderRadius: 160, top: -120, left: -80 },
    headerRow: {
      flexDirection: "row", justifyContent: "space-between", alignItems: "center",
      paddingHorizontal: 20, paddingTop: Platform.OS === "ios" ? 56 : 36, paddingBottom: 10,
    },
    backBtn: {
      width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFFFFF",
      justifyContent: "center", alignItems: "center",
      shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
    },
    langPill: {
      flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7,
      backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1, borderColor: "#E2E8F0",
      shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
    },
    langText: { fontSize: 13, fontWeight: "600" },
    scroll: { paddingBottom: 40 },
    innerPad: { paddingHorizontal: 24, paddingTop: 16, alignItems: "center" },
  
    // illustration
    illuWrap: { width: 130, height: 130, justifyContent: "center", alignItems: "center", marginBottom: 24, position: "relative" },
    illuBox: { width: 96, height: 96, borderRadius: 18, justifyContent: "center", alignItems: "center" },
    illuBubble: { position: "absolute", top: 4, right: -8, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
    illuDots: { color: "#FFFFFF", fontSize: 12, fontWeight: "700", letterSpacing: 1 },
    illuLock: { position: "absolute", bottom: 2, right: -4, width: 26, height: 26, borderRadius: 13, justifyContent: "center", alignItems: "center" },
  
    heading: { fontSize: 24, fontWeight: "800", color: "#1E293B", textAlign: "center", marginBottom: 8 },
    subHeading: { fontSize: 14, color: "#64748B", textAlign: "center", marginBottom: 6 },
  
    editRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 26 },
    accentText: { fontSize: 16, fontWeight: "700" },
    editBtnText: { fontSize: 13, fontWeight: "600" },
  
    // phone
    phoneRow: { flexDirection: "row", width: "100%", marginBottom: 26, gap: 10 },
    cc: { paddingHorizontal: 14, paddingVertical: 16, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.5, borderColor: "#E2E8F0" },
    ccText: { fontSize: 15, fontWeight: "600", color: "#1E293B" },
    phoneInput: {
      flex: 1, paddingHorizontal: 16, paddingVertical: 16, backgroundColor: "#FFFFFF",
      borderRadius: 14, borderWidth: 1.5, borderColor: "#E2E8F0", fontSize: 16, fontWeight: "600", color: "#1E293B",
    },
  
    // generic field (email / password)
    fieldWrap: {
      flexDirection: "row", alignItems: "center", width: "100%", marginBottom: 26,
      backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.5, borderColor: "#E2E8F0",
      paddingHorizontal: 16, paddingVertical: 14, gap: 10,
    },
    fieldInput: { flex: 1, fontSize: 15, fontWeight: "500", color: "#1E293B" },
  
    // OTP boxes
    otpRow: { flexDirection: "row", gap: 10, marginBottom: 18, justifyContent: "center", width: "100%" },
    otpBox: {
      width: 48, height: 56, borderRadius: 14, borderWidth: 2, borderColor: "#E2E8F0",
      backgroundColor: "#FFFFFF", textAlign: "center", fontSize: 22, fontWeight: "700", color: "#1E293B",
    },
  
    // resend
    resendRow: { flexDirection: "row", alignItems: "center", marginBottom: 26 },
    resendLabel: { fontSize: 13, color: "#64748B" },
    resendBtn: { fontSize: 13, fontWeight: "700" },
    timerText: { fontSize: 13, fontWeight: "700" },
  
    // button
    primaryBtn: { width: "100%", borderRadius: 16, overflow: "hidden", marginBottom: 22 },
    primaryBtnDisabled: { opacity: 0.55 },
    primaryBtnGrad: { paddingVertical: 18, alignItems: "center", justifyContent: "center" },
    primaryBtnText: { fontSize: 17, fontWeight: "700", color: "#FFFFFF" },
    arrowCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center" },
  
    // security note
    secNote: {
      flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#FFFFFF",
      borderRadius: 16, padding: 16, width: "100%",
      shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
    },
    secTitle: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
    secSub: { fontSize: 12, color: "#64748B", marginTop: 2 },
  });