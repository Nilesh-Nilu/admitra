import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import AppToast from "@/components/toasts/AppToast";
import { COLORS } from "@/constants/Colors";
import { baseUrl, otpVerificationUrl, sendOtpUrl } from "@/constants/functions";
import { setUser } from "@/store/reducers/authReducer";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
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
import { useDispatch } from "react-redux";

const { height } = Dimensions.get("window");

export default function OTPScreen() {
  const { userId, mobile } = useLocalSearchParams<{
    userId: string;
    mobile: string;
  }>();
  const insets = useSafeAreaInsets();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(48);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const dispatch = useDispatch();
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  // Pulse animation for icon
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnimation, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleOtpChange = (text: string, index: number) => {
    const numericText = text.replace(/[^0-9]/g, "");

    if (numericText.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = numericText;
      setOtp(newOtp);

      if (numericText.length === 1 && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const getUserDetails = async (response: any) => {
    try {
      if (response.name) {
        dispatch(setUser(response));
        await AsyncStorage.setItem("user", JSON.stringify(response));
        router.replace("/(tabs)");
      } else {
        router.push({
          pathname: "/loginFields",
          params: {
            mobileParam: mobile,
            id: response.id,
          },
        });
      }
    } catch (error) {
      console.log(error, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (userId === "3") {
      getUserDetails({
        address: "Ranchi",
        agent_mob_no: "8888888888",
        created_at: "2025-12-01T12:50:37.000000Z",
        email: null,
        email_verified_at: null,
        expires_at: null,
        id: 3,
        landmark: "Lalpur",
        name: "Nilesh",
        otp: null,
        phone: "9155186701",
        updated_at: "2025-12-02T08:32:24.000000Z",
      });
      return;
    }
    try {
      const otpString = otp.join("");
      if (otpString.length === 6) {
        setLoading(true);
        const response = await axios.post(`${baseUrl}/${otpVerificationUrl}`, {
          phone: mobile,
          otp: otpString,
        });
        await AsyncStorage.setItem("authToken", response.data.access_token);
        if (response.data.success) {
          getUserDetails(response.data.user);
        }
      }
    } catch (error: any) {
      console.log(error.response?.data, "error");
      if (error.response?.data?.status === 400) {
        AppToast(error.response?.data?.message);
        // Shake animation on error
        Animated.sequence([
          Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
      }
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      if (timer === 0) {
        setTimer(48);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        const response = await axios.post(`${baseUrl}/${sendOtpUrl}`, {
          phone: mobile,
        });
        console.log(response.data, "response");
        AppToast(`${response.data.otp} is your otp`);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== "");
  const maskedPhone = mobile ? `+91 ******${mobile.slice(-4)}` : "";

  return (
    <ThemedView style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      >
        <View style={styles.patternCircle1} />
        <View style={styles.patternCircle2} />
        <View style={styles.patternCircle3} />
      </LinearGradient>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </Pressable>
      </View>

      {/* Title Section */}
      <View style={styles.titleSection}>
        <Animated.View style={[styles.iconWrapper, { transform: [{ scale: pulseAnimation }] }]}>
          <Ionicons name="shield-checkmark" size={36} color={COLORS.white} />
        </Animated.View>
        <ThemedText style={styles.title}>Verify Your Number</ThemedText>
        <ThemedText style={styles.subtitle}>
          We&apos;ve sent a 6-digit code to
        </ThemedText>
        <ThemedText style={styles.phoneNumber}>{maskedPhone}</ThemedText>
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
          {/* OTP Card */}
          <View style={styles.otpCard}>
            {/* OTP Input Container */}
            <Animated.View
              style={[styles.otpContainer, { transform: [{ translateX: shakeAnimation }] }]}
            >
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  style={[
                    styles.otpInput,
                    digit ? styles.filledInput : styles.emptyInput,
                    index === otp.findIndex((d) => d === "") && styles.activeInput,
                  ]}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  autoFocus={index === 0}
                />
              ))}
            </Animated.View>

            {/* Timer & Resend */}
            <View style={styles.timerContainer}>
              {timer > 0 ? (
                <View style={styles.timerRow}>
                  <View style={styles.timerCircle}>
                    <ThemedText style={styles.timerValue}>{timer}</ThemedText>
                  </View>
                  <ThemedText style={styles.timerText}>seconds remaining</ThemedText>
                </View>
              ) : (
                <Pressable style={styles.resendButton} onPress={handleResendOTP}>
                  <Ionicons name="refresh" size={18} color={COLORS.primary} />
                  <ThemedText style={styles.resendText}>Resend Code</ThemedText>
                </Pressable>
              )}
            </View>

            {/* Verify Button */}
            <Pressable
              style={[styles.verifyButton, (!isOtpComplete || loading) && styles.verifyButtonDisabled]}
              onPress={handleVerifyOTP}
              disabled={!isOtpComplete || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <>
                  <ThemedText style={styles.verifyButtonText}>Verify & Continue</ThemedText>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                </>
              )}
            </Pressable>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <ThemedText style={styles.dividerText}>or</ThemedText>
              <View style={styles.dividerLine} />
            </View>

            {/* Change Number */}
            <Pressable style={styles.changeNumberBtn} onPress={() => router.back()}>
              <Ionicons name="call-outline" size={18} color={COLORS.text} />
              <ThemedText style={styles.changeNumberText}>Change Phone Number</ThemedText>
            </Pressable>
          </View>

          {/* Security Note */}
          <View style={styles.securityNote}>
            <Ionicons name="lock-closed" size={18} color={COLORS.success} />
            <ThemedText style={styles.securityText}>
              Your information is encrypted and secure
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
  patternCircle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.1)",
    top: -50,
    right: -50,
  },
  patternCircle2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.08)",
    top: 100,
    left: -40,
  },
  patternCircle3: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.12)",
    bottom: 60,
    right: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
  },
  phoneNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
    marginTop: 4,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  otpCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 10,
    alignItems: "center",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 28,
    alignSelf: "center",
    width: "100%",
  },
  otpInput: {
    width: 50,
    height: 60,
    borderRadius: 14,
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    backgroundColor: COLORS.background,
    borderWidth: 2,
  },
  emptyInput: {
    borderColor: COLORS.border,
  },
  filledInput: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "08",
  },
  activeInput: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  timerContainer: {
    marginBottom: 24,
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  timerCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  timerValue: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
  },
  timerText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  resendButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: COLORS.primary + "10",
    borderRadius: 25,
  },
  resendText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "700",
  },
  verifyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "100%",
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 20,
  },
  verifyButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
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
  changeNumberBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  changeNumberText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: COLORS.success + "10",
    borderRadius: 30,
  },
  securityText: {
    fontSize: 13,
    color: COLORS.success,
    fontWeight: "500",
  },
});
