import ThemeHeader from "@/components/headers/ThemeHeader";
import ThemeInput from "@/components/inputs/ThemeInput";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS } from "@/constants/Colors";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChangePasswordScreen() {
  const insets = useSafeAreaInsets();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);

  const handleBackPress = () => {
    router.back();
  };
  useEffect(() => {
    const backAction = () => {
      router.replace("/(tabs)/profile");
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, []);
  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { level: 0, text: "", color: COLORS.textLight };
    if (password.length < 6) return { level: 1, text: "Weak", color: COLORS.error };
    if (password.length < 8) return { level: 2, text: "Fair", color: COLORS.warning };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { level: 4, text: "Strong", color: COLORS.success };
    }
    return { level: 3, text: "Good", color: COLORS.primary };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New password and confirm password do not match");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Success", "Password changed successfully", [
        { text: "OK", onPress: () => router.back() }
      ]);
    }, 1500);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemeHeader onBackPress={handleBackPress} title="Change Password" />

      {/* Hero Section */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroSection}
      >
        <View style={styles.heroIconContainer}>
          <Ionicons name="shield-checkmark" size={40} color={COLORS.white} />
        </View>
        <ThemedText style={styles.heroTitle}>Secure Your Account</ThemedText>
        <ThemedText style={styles.heroSubtitle}>
          Create a strong password to protect your account
        </ThemedText>
      </LinearGradient>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Security Tips */}
          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb-outline" size={18} color={COLORS.warning} />
              <ThemedText style={styles.tipsTitle}>Password Tips</ThemedText>
            </View>
            <View style={styles.tipsList}>
              <ThemedText style={styles.tipItem}>• Use at least 8 characters</ThemedText>
              <ThemedText style={styles.tipItem}>• Include uppercase & lowercase letters</ThemedText>
              <ThemedText style={styles.tipItem}>• Add numbers and special characters</ThemedText>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <View style={styles.formContainer}>
              {/* Old Password */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Current Password</ThemedText>
                <ThemeInput
                  placeholder="Enter current password"
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  secureTextEntry={!showOldPassword}
                  editable={!loading}
                  leftIcon={
                    <View style={styles.inputIconContainer}>
                      <Ionicons name="lock-closed-outline" size={18} color={COLORS.primary} />
                    </View>
                  }
                  rightIcon={
                    <Pressable
                      onPress={() => setShowOldPassword(!showOldPassword)}
                      disabled={loading}
                      style={styles.eyeButton}
                    >
                      <Ionicons
                        name={showOldPassword ? "eye" : "eye-off"}
                        size={20}
                        color={COLORS.textLight}
                      />
                    </Pressable>
                  }
                />
              </View>

              {/* New Password */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>New Password</ThemedText>
                <ThemeInput
                  placeholder="Enter new password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  editable={!loading}
                  leftIcon={
                    <View style={styles.inputIconContainer}>
                      <Ionicons name="key-outline" size={18} color={COLORS.primary} />
                    </View>
                  }
                  rightIcon={
                    <Pressable
                      onPress={() => setShowNewPassword(!showNewPassword)}
                      disabled={loading}
                      style={styles.eyeButton}
                    >
                      <Ionicons
                        name={showNewPassword ? "eye" : "eye-off"}
                        size={20}
                        color={COLORS.textLight}
                      />
                    </Pressable>
                  }
                />
                
                {/* Password Strength Indicator */}
                {newPassword.length > 0 && (
                  <View style={styles.strengthContainer}>
                    <View style={styles.strengthBars}>
                      {[1, 2, 3, 4].map((level) => (
                        <View
                          key={level}
                          style={[
                            styles.strengthBar,
                            {
                              backgroundColor: level <= passwordStrength.level 
                                ? passwordStrength.color 
                                : COLORS.border
                            }
                          ]}
                        />
                      ))}
                    </View>
                    <ThemedText style={[styles.strengthText, { color: passwordStrength.color }]}>
                      {passwordStrength.text}
                    </ThemedText>
                  </View>
                )}
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Confirm New Password</ThemedText>
                <ThemeInput
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  editable={!loading}
                  leftIcon={
                    <View style={styles.inputIconContainer}>
                      <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.primary} />
                    </View>
                  }
                  rightIcon={
                    <Pressable
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={loading}
                      style={styles.eyeButton}
                    >
                      <Ionicons
                        name={showConfirmPassword ? "eye" : "eye-off"}
                        size={20}
                        color={COLORS.textLight}
                      />
                    </Pressable>
                  }
                />
                
                {/* Match Indicator */}
                {confirmPassword.length > 0 && (
                  <View style={styles.matchContainer}>
                    <Ionicons 
                      name={newPassword === confirmPassword ? "checkmark-circle" : "close-circle"} 
                      size={16} 
                      color={newPassword === confirmPassword ? COLORS.success : COLORS.error} 
                    />
                    <ThemedText style={[
                      styles.matchText,
                      { color: newPassword === confirmPassword ? COLORS.success : COLORS.error }
                    ]}>
                      {newPassword === confirmPassword ? "Passwords match" : "Passwords don't match"}
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Update Button */}
          <Pressable 
            style={styles.updateButton} 
            onPress={handleChangePassword}
            disabled={loading}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.updateGradient}
            >
              {loading ? (
                <ThemedText style={styles.updateText}>Updating...</ThemedText>
              ) : (
                <>
                  <Ionicons name="shield-checkmark" size={20} color={COLORS.white} />
                  <ThemedText style={styles.updateText}>Update Password</ThemedText>
                </>
              )}
            </LinearGradient>
          </Pressable>
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
  heroSection: {
    paddingVertical: SIZES.padding * 1.5,
    paddingHorizontal: SIZES.padding,
    alignItems: "center",
  },
  heroIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.padding,
  },
  heroTitle: {
    fontSize: SIZES.fontSize22,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: SIZES.fontSize14,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.padding,
  },
  tipsCard: {
    backgroundColor: `${COLORS.warning}10`,
    borderRadius: SIZES.radius12,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    borderWidth: 1,
    borderColor: `${COLORS.warning}30`,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  tipsTitle: {
    fontSize: SIZES.fontSize14,
    fontWeight: "600",
    color: COLORS.text,
  },
  tipsList: {
    gap: 4,
  },
  tipItem: {
    fontSize: SIZES.fontSize12,
    color: COLORS.textLight,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius12,
    padding: SIZES.padding,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formContainer: {
    gap: SIZES.padding * 1.25,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: SIZES.fontSize14,
    fontWeight: "600",
    color: COLORS.text,
  },
  inputIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  eyeButton: {
    padding: 8,
  },
  strengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.padding,
    marginTop: 4,
  },
  strengthBars: {
    flexDirection: "row",
    gap: 4,
    flex: 1,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: SIZES.fontSize12,
    fontWeight: "600",
  },
  matchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  matchText: {
    fontSize: SIZES.fontSize12,
    fontWeight: "500",
  },
  updateButton: {
    marginTop: SIZES.padding,
    borderRadius: SIZES.radius12,
    overflow: "hidden",
  },
  updateGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  updateText: {
    fontSize: SIZES.fontSize16,
    fontWeight: "600",
    color: COLORS.white,
  },
});
