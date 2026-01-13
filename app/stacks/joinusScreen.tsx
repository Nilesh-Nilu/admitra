import ThemedButton from "@/components/buttons/ThemedButton";
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

const SERVICE_OPTIONS = [
  "Plumber",
  "Electrician",
  "AC Technician",
  "Carpenter",
  "Painter",
  "Beautician",
  "Cleaner",
  "Other"
];

export default function JoinUsScreen() {
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [experience, setExperience] = useState("");
  const [loading, setLoading] = useState(false);
  const [showServicePicker, setShowServicePicker] = useState(false);

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
  const handleSubmit = async () => {
    if (!fullName || !contactNumber || !email || !address || !selectedService || !experience) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Success", "Application submitted successfully! We'll contact you soon.", [
        { text: "OK", onPress: () => router.back() }
      ]);
    }, 1500);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemeHeader onBackPress={handleBackPress} title="Join Our Team" />

      {/* Hero Section */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroSection}
      >
        <View style={styles.heroIconContainer}>
          <Ionicons name="people" size={40} color={COLORS.white} />
        </View>
        <ThemedText style={styles.heroTitle}>Become a Partner</ThemedText>
        <ThemedText style={styles.heroSubtitle}>
          Join our network of skilled professionals
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
          {/* Benefits Section */}
          <View style={styles.benefitsContainer}>
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="cash-outline" size={18} color={COLORS.success} />
              </View>
              <ThemedText style={styles.benefitText}>Earn More</ThemedText>
            </View>
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="time-outline" size={18} color={COLORS.primary} />
              </View>
              <ThemedText style={styles.benefitText}>Flexible Hours</ThemedText>
            </View>
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.warning} />
              </View>
              <ThemedText style={styles.benefitText}>Verified Jobs</ThemedText>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <ThemedText style={styles.formTitle}>Application Form</ThemedText>
            <ThemedText style={styles.formSubtitle}>Fill in your details to get started</ThemedText>

            <View style={styles.formContainer}>
              {/* Full Name */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Full Name <ThemedText style={styles.required}>*</ThemedText></ThemedText>
                <ThemeInput
                  placeholder="Enter your full name"
                  value={fullName}
                  onChangeText={setFullName}
                  editable={!loading}
                  leftIcon={
                    <View style={styles.inputIconContainer}>
                      <Ionicons name="person-outline" size={18} color={COLORS.primary} />
                    </View>
                  }
                />
              </View>

              {/* Contact Number */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Contact Number <ThemedText style={styles.required}>*</ThemedText></ThemedText>
                <ThemeInput
                  placeholder="Enter your phone number"
                  value={contactNumber}
                  onChangeText={setContactNumber}
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!loading}
                  leftIcon={
                    <View style={styles.inputIconContainer}>
                      <Ionicons name="call-outline" size={18} color={COLORS.primary} />
                    </View>
                  }
                />
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Email Address <ThemedText style={styles.required}>*</ThemedText></ThemedText>
                <ThemeInput
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  editable={!loading}
                  leftIcon={
                    <View style={styles.inputIconContainer}>
                      <Ionicons name="mail-outline" size={18} color={COLORS.primary} />
                    </View>
                  }
                />
              </View>

              {/* Address */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Address <ThemedText style={styles.required}>*</ThemedText></ThemedText>
                <ThemeInput
                  placeholder="Enter your address"
                  value={address}
                  onChangeText={setAddress}
                  editable={!loading}
                  leftIcon={
                    <View style={styles.inputIconContainer}>
                      <Ionicons name="location-outline" size={18} color={COLORS.primary} />
                    </View>
                  }
                />
              </View>

              {/* Service Type */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Service Type <ThemedText style={styles.required}>*</ThemedText></ThemedText>
                <Pressable 
                  style={styles.selectButton}
                  onPress={() => setShowServicePicker(!showServicePicker)}
                  disabled={loading}
                >
                  <View style={styles.inputIconContainer}>
                    <Ionicons name="construct-outline" size={18} color={COLORS.primary} />
                  </View>
                  <ThemedText style={[styles.selectText, !selectedService && styles.placeholderText]}>
                    {selectedService || "Select your service"}
                  </ThemedText>
                  <Ionicons 
                    name={showServicePicker ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={COLORS.textLight} 
                  />
                </Pressable>

                {showServicePicker && (
                  <View style={styles.optionsContainer}>
                    {SERVICE_OPTIONS.map((option) => (
                      <Pressable
                        key={option}
                        style={[
                          styles.optionItem,
                          selectedService === option && styles.optionItemSelected
                        ]}
                        onPress={() => {
                          setSelectedService(option);
                          setShowServicePicker(false);
                        }}
                      >
                        <ThemedText style={[
                          styles.optionText,
                          selectedService === option && styles.optionTextSelected
                        ]}>
                          {option}
                        </ThemedText>
                        {selectedService === option && (
                          <Ionicons name="checkmark" size={18} color={COLORS.primary} />
                        )}
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>

              {/* Experience */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Experience (Years) <ThemedText style={styles.required}>*</ThemedText></ThemedText>
                <ThemeInput
                  placeholder="Enter years of experience"
                  value={experience}
                  onChangeText={setExperience}
                  keyboardType="numeric"
                  editable={!loading}
                  leftIcon={
                    <View style={styles.inputIconContainer}>
                      <Ionicons name="briefcase-outline" size={18} color={COLORS.primary} />
                    </View>
                  }
                />
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <Pressable 
            style={styles.submitButton} 
            onPress={handleSubmit}
            disabled={loading}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              {loading ? (
                <ThemedText style={styles.submitText}>Submitting...</ThemedText>
              ) : (
                <>
                  <ThemedText style={styles.submitText}>Submit Application</ThemedText>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
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
    paddingVertical: SIZES.padding * 1.25,
    paddingHorizontal: SIZES.padding,
    alignItems: "center",
  },
  heroIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.padding * 0.75,
  },
  heroTitle: {
    fontSize: SIZES.fontSize20,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: SIZES.fontSize.sm,
    color: "rgba(255,255,255,0.8)",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.padding,
  },
  benefitsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SIZES.padding,
  },
  benefitItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  benefitText: {
    fontSize: SIZES.fontSize12,
    color: COLORS.textLight,
    fontWeight: "500",
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
  formTitle: {
    fontSize: SIZES.fontSize18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: SIZES.fontSize.sm,
    color: COLORS.textLight,
    marginBottom: SIZES.padding,
  },
  formContainer: {
    gap: SIZES.padding,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: "600",
    color: COLORS.text,
  },
  required: {
    color: COLORS.error,
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
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius8,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.75,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectText: {
    flex: 1,
    fontSize: SIZES.fontSize14,
    color: COLORS.text,
  },
  placeholderText: {
    color: COLORS.textLight,
  },
  optionsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 8,
    overflow: "hidden",
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SIZES.padding * 0.75,
    paddingHorizontal: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionItemSelected: {
    backgroundColor: `${COLORS.primary}10`,
  },
  optionText: {
    fontSize: SIZES.fontSize14,
    color: COLORS.text,
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  submitButton: {
    marginTop: SIZES.padding,
    borderRadius: SIZES.radius12,
    overflow: "hidden",
  },
  submitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  submitText: {
    fontSize: SIZES.fontSize16,
    fontWeight: "600",
    color: COLORS.white,
  },
});
