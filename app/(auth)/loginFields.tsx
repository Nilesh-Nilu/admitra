import ThemeInput from "@/components/inputs/ThemeInput";
import ThemeSelect from "@/components/inputs/ThemeSelect";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import AppToast from "@/components/toasts/AppToast";
import { COLORS } from "@/constants/Colors";
import {
  baseUrl,
  getCitiesUrl,
  getStatesUrl,
  getLocalitiesUrl,
  signupUrl,
  updateUserProfileUrl
} from "@/constants/functions";
import { setUser, updateUserProfile } from "@/store/reducers/authReducer";
import { getCitiesApi, getStatesApi, getLocalitiesApi } from "@/store/reducers/userReducer";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

const { height } = Dimensions.get("window");

const ROLE_CONFIG = {
  user: {
    gradient: ["#667eea", "#764ba2"] as [string, string],
    icon: "person" as const,
    title: "Create User Account",
    subtitle: "Join to browse, buy and connect with sellers",
    headerIcon: "person-add",
  },
  vendor: {
    gradient: ["#11998e", "#38ef7d"] as [string, string],
    icon: "storefront" as const,
    title: "Create Vendor Account",
    subtitle: "Start selling and grow your business",
    headerIcon: "storefront",
  },
};

const PASSWORD_RULES = [
  {
    key: "length",
    label: "At least 8 characters",
    test: (value: string) => value.length >= 8,
  },
  {
    key: "letter",
    label: "At least 1 letter",
    test: (value: string) => /[A-Za-z]/.test(value),
  },
  {
    key: "number",
    label: "At least 1 number",
    test: (value: string) => /\d/.test(value),
  },
  {
    key: "special",
    label: "At least 1 special character",
    test: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
] as const;

const SignupScreen = () => {
  const insets = useSafeAreaInsets();
  const { user: userParam } = useLocalSearchParams<{ user?: any }>();
  const {states,cities,localities} = useSelector((state: any) => state.entities.userReducer);
  const [selectedRole] = useState<"user" | "vendor">("user");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [aadharPhoto, setAadharPhoto] = useState<string | null>(null);
  const [selfiePhoto, setSelfiePhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedState, setSelectedState] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [selectedLocality, setSelectedLocality] = useState<any>(null);
  const dispatch = useDispatch();
  
  const config = ROLE_CONFIG[selectedRole];

  // Filter cities based on selected state
  const filteredCities = selectedState
    ? cities?.filter((city: any) => city.state_id === selectedState.id)
    : [];

  const filteredLocalities = selectedCity
    ? localities?.filter((locality: any) => locality.city_id === selectedCity.id)
    : [];

  const handlePhoneChange = (text: string) => {
    const cleanText = text.replace(/\D/g, "").slice(0, 10);
    setMobile(cleanText);
  };

  const handleStateSelect = (state: any) => {
    setSelectedState(state);
    setSelectedCity(null); // Reset city when state changes
    setSelectedLocality(null); // Reset locality when state changes
  };

  const handleCitySelect = (city: any) => {
    setSelectedCity(city);
    setSelectedLocality(null); // Reset locality when city changes
  };

  const handleLocalitySelect = (locality: any) => {
    setSelectedLocality(locality);
  };

  useEffect(() => {
    dispatch(getStatesApi(getStatesUrl));
    dispatch(getCitiesApi(getCitiesUrl));
    dispatch(getLocalitiesApi(getLocalitiesUrl));

    
    let parsedUser = null;
    if (userParam) {
      try {
        parsedUser = typeof userParam === 'string' ? JSON.parse(userParam) : userParam;
        console.log(parsedUser, "parsedUser");
      } catch (e) {
        console.log("Error parsing userParam", e);
      }
    }

    if(parsedUser){
      setName(parsedUser.name || "");
      setEmail(parsedUser.email || "");
      setMobile(parsedUser.phone || "");
      setAddress(parsedUser.address || "");
      setAadharPhoto(parsedUser.AadharImage || "");
      setSelfiePhoto(parsedUser.selfieverificationImage || "");
    }

  }, [dispatch, userParam]);

  const pickImage = async (type: "aadhar" | "selfie") => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "Please allow access to your photo library");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: type === "aadhar" ? [16, 9] : [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.base64) {
          const mimeType = asset.mimeType || "image/jpeg";
          if (type === "aadhar") {
            setAadharPhoto(`data:${mimeType};base64,${asset.base64}`);
          } else {
            setSelfiePhoto(`data:${mimeType};base64,${asset.base64}`);
          }
        } else {
          Alert.alert("Error", "Failed to get image data. Please try again.");
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const takePhoto = async (type: "aadhar" | "selfie") => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "Please allow access to your camera");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: type === "aadhar" ? [16, 9] : [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.base64) {
          const mimeType = asset.mimeType || "image/jpeg";
          if (type === "aadhar") {
            setAadharPhoto(`data:${mimeType};base64,${asset.base64}`);
          } else {
            setSelfiePhoto(`data:${mimeType};base64,${asset.base64}`);
          }
        } else {
          Alert.alert("Error", "Failed to get image data. Please try again.");
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const showImageOptions = (type: "aadhar" | "selfie") => {
    Alert.alert(
      "Select Image",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: () => takePhoto(type),
        },
        {
          text: "Choose from Library",
          onPress: () => pickImage(type),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const passwordRuleStatus = PASSWORD_RULES.map((rule) => ({
    ...rule,
    passed: rule.test(password),
  }));
  const passwordRulesPassed = passwordRuleStatus.every((rule) => rule.passed);

  const handleSignup = async () => {
    try {
      if (name.trim() && mobile.trim() && passwordRulesPassed) {
        setLoading(true);
        
        const payload = {
          name: name.trim(),
          email: email.trim() || "",
          password: password.trim(),
          role: "user",
          phone: mobile.trim(),
          address: address.trim() || "",
          AadharImage: aadharPhoto || "",
          state_id: selectedState?.id || null,
          city_id: selectedCity?.id || null,
          locality_id: selectedLocality?.id || null,
          selfieverificationImage: selfiePhoto || "",
          Isagreeprivacy: true
        };

        const response = await axios.post(
          `${baseUrl}/${signupUrl}`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        dispatch(setUser(response.data.data));
        if (response.data) {
          AppToast("Signup successful!");
          router.push({ pathname: "/(auth)/login", params: { role: "user" } });
        }
      }
    } catch (error: any) {
      console.log(error.response.data, "error");
      // Check if backend response has 'errors' object with fields (e.g., email error)
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstFieldWithError = Object.keys(errors)[0];
        const firstErrorMsg = Array.isArray(errors[firstFieldWithError]) ? errors[firstFieldWithError][0] : "Signup failed";
        AppToast(firstErrorMsg);
      } else {
        AppToast(error.response?.data?.message || "Signup failed");
      }
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await dispatch(updateUserProfile(updateUserProfileUrl, {
        name: name.trim(),
        email: email.trim() || "",
        password: password.trim(),
        role: "user",
        phone: mobile.trim(),
        address: address.trim() || "",
        AadharImage: aadharPhoto || "",
        state_id: selectedState?.id || null,
        city_id: selectedCity?.id || null,
        locality_id: selectedLocality?.id || null,
        selfieverificationImage: selfiePhoto || "",
        Isagreeprivacy: true
      }));
      AppToast("Profile updated successfully!");
      router.push("/(tabs)");
    } catch (error: any) {
      console.log(error, "error");
      AppToast(error.response.data.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  const baseValidation =
    name.trim().length > 0 &&
    mobile.trim().length === 10 &&
    email.trim().length > 0 &&
    passwordRulesPassed &&
    confirmPassword.trim().length >= 6 &&
    password === confirmPassword &&
    address.trim().length > 0 &&
    selectedState !== null &&
    selectedCity !== null &&
    selectedLocality !== null &&
    aadharPhoto !== null &&
    selfiePhoto !== null;

  const isFormValid = baseValidation;

  const baseCompletedFields = [
    name.trim().length > 0,
    mobile.trim().length === 10,
    email.trim().length > 0,
    passwordRulesPassed,
    confirmPassword.trim().length >= 6 && password === confirmPassword,
    address.trim().length > 0,
    selectedState !== null,
    selectedCity !== null,
    selectedLocality !== null,
    aadharPhoto !== null,
    selfiePhoto !== null,
  ].filter(Boolean).length;


  const totalFields = 11;
  const completedFields = baseCompletedFields;
  const progress = (completedFields / totalFields) * 100;

  return (
    <ThemedView style={styles.container}>
      {/* Background Pattern */}
      <LinearGradient
        colors={config.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      >
        <View style={styles.patternCircle1} />
        <View style={styles.patternCircle2} />
        <View style={styles.patternCircle3} />
      </LinearGradient>


      {/* Title Section */}
      <View style={styles.titleSection}>
        <View style={styles.iconWrapper}>
          <Ionicons name={config.headerIcon as any} size={32} color={COLORS.white} />
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
          keyboardShouldPersistTaps="handled"
        >
          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Role Selection */}
            <View style={styles.roleSection}>
              <View style={styles.inputLabelRow}>
                <Ionicons name="people-outline" size={16} color={config.gradient[0]} />
                <ThemedText style={styles.inputLabel}>Role</ThemedText>
              </View>
              <View style={[styles.roleCard, styles.roleCardSelected, { borderColor: ROLE_CONFIG.user.gradient[0] }]}>
                <LinearGradient
                  colors={ROLE_CONFIG.user.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.roleCardIcon}
                >
                  <Ionicons name="person" size={22} color={COLORS.white} />
                </LinearGradient>
                <View style={styles.roleCardText}>
                  <ThemedText style={styles.roleCardTitle}>User</ThemedText>
                  <ThemedText style={styles.roleCardSubtitle}>Buy & sell</ThemedText>
                </View>
                <View
                  style={[
                    styles.roleCheckbox,
                    {
                      backgroundColor: ROLE_CONFIG.user.gradient[0],
                      borderColor: ROLE_CONFIG.user.gradient[0],
                    },
                  ]}
                >
                  <Ionicons name="checkmark" size={14} color={COLORS.white} />
                </View>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <ThemedText style={styles.progressLabel}>Profile Completion</ThemedText>
                <ThemedText style={[styles.progressValue, { color: config.gradient[0] }]}>{Math.round(progress)}%</ThemedText>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: config.gradient[0] }]} />
              </View>
            </View>

            {/* Form Fields */}
            <View style={styles.formFields}>

              {/* Name Input */}
              <View style={styles.inputGroup}>
                <View style={styles.inputLabelRow}>
                  <Ionicons name="person-outline" size={16} color={config.gradient[0]} />
                  <ThemedText style={styles.inputLabel}>Full Name</ThemedText>
                  <ThemedText style={styles.required}>*</ThemedText>
                </View>
                <ThemeInput
                  label="Enter your name"
                  value={name}
                  onChangeText={setName}
                  editable={!loading}
                  containerStyle={styles.inputContainer}
                />
              </View>

              {/* Mobile Input */}
              <View style={styles.inputGroup}>
                <View style={styles.inputLabelRow}>
                  <Ionicons name="call-outline" size={16} color={config.gradient[0]} />
                  <ThemedText style={styles.inputLabel}>Mobile Number</ThemedText>
                  <ThemedText style={styles.required}>*</ThemedText>
                </View>
                <ThemeInput
                  label="Enter mobile number"
                  value={mobile}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={userParam !== undefined ? false : true}
                  containerStyle={styles.inputContainer}
                />
          
              </View>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <View style={styles.inputLabelRow}>
                  <Ionicons name="mail-outline" size={16} color={config.gradient[0]} />
                  <ThemedText style={styles.inputLabel}>{selectedRole === "vendor" ? "Business Email" : "Email"}</ThemedText>
                  <ThemedText style={styles.required}>*</ThemedText>
                </View>
                <ThemeInput
                  label={selectedRole === "vendor" ? "Enter business email" : "Enter email"}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  editable={!loading}
                  containerStyle={styles.inputContainer}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <View style={styles.inputLabelRow}>
                  <Ionicons name="lock-closed-outline" size={16} color={config.gradient[0]} />
                  <ThemedText style={styles.inputLabel}>Password</ThemedText>
                  <ThemedText style={styles.required}>*</ThemedText>
                </View>
                <View style={styles.passwordContainer}>
                  <ThemeInput
                    label="Enter password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    editable={!loading}
                    containerStyle={styles.inputContainer}
                  />
                  <Pressable
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color={COLORS.gray}
                    />
                  </Pressable>
                </View>
                <View style={styles.passwordHintContainer}>
                  {passwordRuleStatus.map((rule) => (
                    <View key={rule.key} style={styles.passwordHintRow}>
                      <Ionicons
                        name={rule.passed ? "checkmark-circle" : "ellipse-outline"}
                        size={14}
                        color={rule.passed ? COLORS.success : COLORS.gray}
                      />
                      <ThemedText
                        style={[
                          styles.passwordHintText,
                          rule.passed && styles.passwordHintTextPassed,
                        ]}
                      >
                        {rule.label}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputGroup}>
                <View style={styles.inputLabelRow}>
                  <Ionicons name="lock-closed-outline" size={16} color={config.gradient[0]} />
                  <ThemedText style={styles.inputLabel}>Confirm Password</ThemedText>
                  <ThemedText style={styles.required}>*</ThemedText>
                </View>
                <View style={styles.passwordContainer}>
                  <ThemeInput
                    label="Re-enter password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    editable={!loading}
                    containerStyle={styles.inputContainer}
                  />
                  <Pressable
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color={COLORS.gray}
                    />
                  </Pressable>
                </View>
                {confirmPassword.length > 0 && password !== confirmPassword && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={14} color={COLORS.error} />
                    <ThemedText style={styles.errorText}>Passwords do not match</ThemedText>
                  </View>
                )}
              </View>

              {/* State Dropdown */}
              <View style={styles.inputGroup}>
                <ThemeSelect
                  label="State"
                  placeholder="Select State"
                  value={selectedState}
                  items={states || []}
                  onSelect={handleStateSelect}
                  disabled={loading}
                  required={true}
                  icon="map-outline"
                />
              </View>

              {/* City Dropdown */}
              <View style={styles.inputGroup}>
                <ThemeSelect
                  label="City"
                  placeholder={selectedState ? "Select City" : "Select State First"}
                  value={selectedCity}
                  items={filteredCities}
                  onSelect={handleCitySelect}
                  disabled={loading || !selectedState}
                  required={true}
                  icon="business-outline"
                />
              </View>
              {/* Locality Dropdown */}
              <View style={styles.inputGroup}>
                <ThemeSelect
                  label="Locality"
                  placeholder={selectedLocality ? "Select Locality" : "Select City First"}
                  value={selectedLocality}
                  items={filteredLocalities}
                  onSelect={handleLocalitySelect}
                  disabled={loading || !selectedCity}
                  required={true}
                  icon="location-outline"
                />
              </View>

              {/* Address Input */}
              <View style={styles.inputGroup}>
                <View style={styles.inputLabelRow}>
                  <Ionicons name="home-outline" size={16} color={config.gradient[0]} />
                  <ThemedText style={styles.inputLabel}>{selectedRole === "vendor" ? "Business Address" : "Address"}</ThemedText>
                  <ThemedText style={styles.required}>*</ThemedText>
                </View>
                <ThemeInput
                  label={selectedRole === "vendor" ? "Enter your business address" : "Enter your full address"}
                  value={address}
                  onChangeText={setAddress}
                  editable={!loading}
                  containerStyle={styles.inputContainer}
                />
              </View>

              {/* Aadhar Photo Upload */}
              <View style={styles.inputGroup}>
                <View style={styles.inputLabelRow}>
                  <Ionicons name="card-outline" size={16} color={config.gradient[0]} />
                  <ThemedText style={styles.inputLabel}>{selectedRole === "vendor" ? "Business ID / Aadhar" : "Aadhar Photo"}</ThemedText>
                  <ThemedText style={styles.required}>*</ThemedText>
                </View>
                <Pressable
                  style={styles.imageUploadButton}
                  onPress={() => showImageOptions("aadhar")}
                  disabled={loading}
                >
                  {aadharPhoto ? (
                    <View style={styles.imagePreviewContainer}>
                      <Image source={{ uri: aadharPhoto }} style={styles.imagePreview} />
                      <View style={styles.imageOverlay}>
                        <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                        <ThemedText style={styles.imageSuccessText}>Uploaded</ThemedText>
                      </View>
                      <Pressable
                        style={styles.changeImageButton}
                        onPress={() => showImageOptions("aadhar")}
                      >
                        <Ionicons name="camera-outline" size={16} color={COLORS.white} />
                        <ThemedText style={styles.changeImageText}>Change</ThemedText>
                      </Pressable>
                    </View>
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                      <Ionicons name="cloud-upload-outline" size={32} color={COLORS.gray} />
                      <ThemedText style={styles.uploadText}>Upload Aadhar Photo</ThemedText>
                      <ThemedText style={styles.uploadSubtext}>Tap to select or take photo</ThemedText>
                    </View>
                  )}
                </Pressable>
              </View>

              {/* Selfie Verification Upload */}
              <View style={styles.inputGroup}>
                <View style={styles.inputLabelRow}>
                  <Ionicons name="camera-outline" size={16} color={config.gradient[0]} />
                  <ThemedText style={styles.inputLabel}>Selfie Verification</ThemedText>
                  <ThemedText style={styles.required}>*</ThemedText>
                </View>
                <Pressable
                  style={styles.imageUploadButton}
                  onPress={() => showImageOptions("selfie")}
                  disabled={loading}
                >
                  {selfiePhoto ? (
                    <View style={styles.imagePreviewContainer}>
                      <Image source={{ uri: selfiePhoto }} style={styles.imagePreview} />
                      <View style={styles.imageOverlay}>
                        <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                        <ThemedText style={styles.imageSuccessText}>Uploaded</ThemedText>
                      </View>
                      <Pressable
                        style={styles.changeImageButton}
                        onPress={() => showImageOptions("selfie")}
                      >
                        <Ionicons name="camera-outline" size={16} color={COLORS.white} />
                        <ThemedText style={styles.changeImageText}>Change</ThemedText>
                      </Pressable>
                    </View>
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                      <Ionicons name="person-outline" size={32} color={COLORS.gray} />
                      <ThemedText style={styles.uploadText}>Upload Selfie</ThemedText>
                      <ThemedText style={styles.uploadSubtext}>Tap to select or take photo</ThemedText>
                    </View>
                  )}
                </Pressable>
              </View>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Button */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          style={[styles.submitButton, (!isFormValid || loading) && styles.submitButtonDisabled]}
          onPress={userParam ? handleUpdateProfile : handleSignup}
          disabled={!isFormValid || loading}
        >
          <LinearGradient
            colors={isFormValid && !loading ? config.gradient : ["#ccc", "#aaa"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitButtonGradient}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <>
                <ThemedText style={styles.submitButtonText}>
                  {selectedRole === "vendor" ? "Create Vendor Account" : "Create Account"}
                </ThemedText>
                <View style={styles.submitButtonArrow}>
                  <Ionicons name="arrow-forward" size={16} color={config.gradient[0]} />
                </View>
              </>
            )}
          </LinearGradient>
        </Pressable>
      </View>

    </ThemedView>
  );
};

export default SignupScreen;

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
    height: height * 0.35,
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
    top: 80,
    left: -40,
  },
  patternCircle3: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.12)",
    bottom: 40,
    right: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  headerCenter: {
    alignItems: "center",
  },
  stepText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.white,
  },
  titleSection: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.white,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 10,
  },
  roleSection: {
    marginBottom: 24,
  },
  roleOptions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  roleCard: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: 10,
  },
  roleCardSelected: {
    backgroundColor: "#f8f9ff",
  },
  roleCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  roleCardText: {
    alignItems: "center",
  },
  roleCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
  roleCardSubtitle: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 2,
  },
  roleCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  progressSection: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.success,
    borderRadius: 4,
  },
  formFields: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  required: {
    fontSize: 14,
    color: COLORS.error,
    fontWeight: "600",
  },
  optional: {
    fontSize: 12,
    color: COLORS.gray,
  },
  inputContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  passwordContainer: {
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 16,
    zIndex: 10,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
  },
  passwordHintContainer: {
    gap: 6,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  passwordHintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  passwordHintText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  passwordHintTextPassed: {
    color: COLORS.success,
  },
  bottomSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  submitButton: {
    borderRadius: 14,
    overflow: "hidden",
  },
  submitButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 16,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
  },
  submitButtonArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },
  imageUploadButton: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    overflow: "hidden",
    backgroundColor: COLORS.background,
  },
  uploadPlaceholder: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  uploadSubtext: {
    fontSize: 12,
    color: COLORS.gray,
  },
  imagePreviewContainer: {
    position: "relative",
    height: 200,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageOverlay: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageSuccessText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.success,
  },
  changeImageButton: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  changeImageText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.white,
  },
});
