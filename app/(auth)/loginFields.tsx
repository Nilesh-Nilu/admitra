import ThemeInput from "@/components/inputs/ThemeInput";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS } from "@/constants/Colors";
import {
  baseUrl,
  getSubscriptionApi,
  getUserDetailsApi,
  updateUrl,
} from "@/constants/functions";
import { setUser } from "@/store/reducers/authReducer";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";

const { height } = Dimensions.get("window");

const SignupScreen = () => {
  const { mobileParam, id } = useLocalSearchParams<{
    mobileParam: string;
    id: string;
  }>();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [agentMobile, setAgentMobile] = useState("");
  const [landmark, setLandmark] = useState("");
  const [address, setAddress] = useState("");
  const [aadharPhoto, setAadharPhoto] = useState<string | null>(null);
  const [selfiePhoto, setSelfiePhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handlePhoneChange = (text: string) => {
    const cleanText = text.replace(/\D/g, "").slice(0, 10);
    setMobile(cleanText);
  };

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
      });

      if (!result.canceled && result.assets[0]) {
        if (type === "aadhar") {
          setAadharPhoto(result.assets[0].uri);
        } else {
          setSelfiePhoto(result.assets[0].uri);
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
      });

      if (!result.canceled && result.assets[0]) {
        if (type === "aadhar") {
          setAadharPhoto(result.assets[0].uri);
        } else {
          setSelfiePhoto(result.assets[0].uri);
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

  useEffect(() => {
    if (mobileParam) {
      setMobile(mobileParam);
    }
  }, [mobileParam]);

  const handleSignup = async () => {
    try {
      if (name.trim() && mobile.trim()) {
        setLoading(true);
        const authToken = await AsyncStorage.getItem("authToken");
        
        const formData = new FormData();
        formData.append("name", name.trim());
        formData.append("agent_mob_no", agentMobile.trim() || "");
        formData.append("landmark", landmark.trim() || "");
        formData.append("address", address.trim() || "");
        
        // Add aadhar photo if exists
        if (aadharPhoto) {
          const aadharFile: any = {
            uri: aadharPhoto,
            type: "image/jpeg",
            name: "aadhar.jpg",
          };
          formData.append("aadhar_photo", aadharFile);
        }
        
        // Add selfie photo if exists
        if (selfiePhoto) {
          const selfieFile: any = {
            uri: selfiePhoto,
            type: "image/jpeg",
            name: "selfie.jpg",
          };
          formData.append("selfie_photo", selfieFile);
        }

        const response = await axios.put(
          `${baseUrl}/${updateUrl}/${id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        dispatch(setUser(response.data.data));
        if (response.data) {
          const subscription = await getSubscriptionApi(id);
          if (subscription.data.length > 0) {
            await getUserDetailsApi(id, dispatch, () => {
              router.replace("/(tabs)");
            });
          } else {
            router.push("/stacks/packages");
          }
        }
      }
    } catch (error: any) {
      console.log(error.response.data, "errors");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    name.trim().length > 0 &&
    mobile.trim().length === 10 &&
    landmark.trim().length > 0 &&
    address.trim().length > 0 &&
    aadharPhoto !== null &&
    selfiePhoto !== null;

  const completedFields = [
    name.trim().length > 0,
    mobile.trim().length === 10,
    landmark.trim().length > 0,
    address.trim().length > 0,
    aadharPhoto !== null,
    selfiePhoto !== null,
  ].filter(Boolean).length;

  const progress = (completedFields / 6) * 100;

  return (
    <ThemedView style={styles.container}>
      {/* Background Pattern */}
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
        <View style={styles.headerCenter}>
          <ThemedText style={styles.stepText}>Final Step</ThemedText>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* Title Section */}
      <View style={styles.titleSection}>
        <View style={styles.iconWrapper}>
          <Ionicons name="person-add" size={32} color={COLORS.white} />
        </View>
        <ThemedText style={styles.title}>Complete Your Profile</ThemedText>
        <ThemedText style={styles.subtitle}>
          Tell us a bit about yourself to get started
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
            {/* Progress Bar */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <ThemedText style={styles.progressLabel}>Profile Completion</ThemedText>
                <ThemedText style={styles.progressValue}>{Math.round(progress)}%</ThemedText>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
            </View>

            {/* Form Fields */}
            <View style={styles.formFields}>
              {/* Name Input */}
              <View style={styles.inputGroup}>
                <View style={styles.inputLabelRow}>
                  <Ionicons name="person-outline" size={16} color={COLORS.primary} />
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
                  <Ionicons name="call-outline" size={16} color={COLORS.primary} />
                  <ThemedText style={styles.inputLabel}>Mobile Number</ThemedText>
                  <ThemedText style={styles.required}>*</ThemedText>
                </View>
                <ThemeInput
                  label="Enter mobile number"
                  value={mobile}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!loading}
                  containerStyle={styles.inputContainer}
                />
              </View>

              {/* Agent Mobile Input */}
              <View style={styles.inputGroup}>
                <View style={styles.inputLabelRow}>
                  <Ionicons name="people-outline" size={16} color={COLORS.gray} />
                  <ThemedText style={styles.inputLabel}>Agent Mobile</ThemedText>
                  <ThemedText style={styles.optional}>(Optional)</ThemedText>
                </View>
                <ThemeInput
                  label="Enter agent's number"
                  value={agentMobile}
                  onChangeText={setAgentMobile}
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!loading}
                  containerStyle={styles.inputContainer}
                />
              </View>

              {/* Landmark Input */}
              <View style={styles.inputGroup}>
                <View style={styles.inputLabelRow}>
                  <Ionicons name="location-outline" size={16} color={COLORS.primary} />
                  <ThemedText style={styles.inputLabel}>Landmark</ThemedText>
                  <ThemedText style={styles.required}>*</ThemedText>
                </View>
                <ThemeInput
                  label="Enter a nearby landmark"
                  value={landmark}
                  onChangeText={setLandmark}
                  editable={!loading}
                  containerStyle={styles.inputContainer}
                />
              </View>

              {/* Address Input */}
              <View style={styles.inputGroup}>
                <View style={styles.inputLabelRow}>
                  <Ionicons name="home-outline" size={16} color={COLORS.primary} />
                  <ThemedText style={styles.inputLabel}>Address</ThemedText>
                  <ThemedText style={styles.required}>*</ThemedText>
                </View>
                <ThemeInput
                  label="Enter your full address"
                  value={address}
                  onChangeText={setAddress}
                  editable={!loading}
                  containerStyle={styles.inputContainer}
                />
              </View>

              {/* Aadhar Photo Upload */}
              <View style={styles.inputGroup}>
                <View style={styles.inputLabelRow}>
                  <Ionicons name="card-outline" size={16} color={COLORS.primary} />
                  <ThemedText style={styles.inputLabel}>Aadhar Photo</ThemedText>
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
                  <Ionicons name="camera-outline" size={16} color={COLORS.primary} />
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
          onPress={handleSignup}
          disabled={!isFormValid || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <ThemedText style={styles.submitButtonText}>Complete Setup</ThemedText>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
            </>
          )}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
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
