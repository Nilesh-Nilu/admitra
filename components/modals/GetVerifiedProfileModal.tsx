import ThemedButton from "@/components/buttons/ThemedButton";
import ThemeSelect from "@/components/inputs/ThemeSelect";
import { ThemedText } from "@/components/ThemedText";
import { COLORS } from "@/constants/Colors";
import { ImageUrl } from "@/constants/functions";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

interface State {
  id: number;
  name: string;
}

interface City {
  id: number;
  name: string;
  state_id: number;
}

interface VerificationForm {
  fullName: string;
  mobileNumber: string;
  email: string;
  address: string;
  AadharImage: string | null;
  selfieverificationImage: string | null;
}

type GetVerifiedProfileModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (data: VerificationForm & { state: State | null; city: City | null }) => void;
  userData?: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    AadharImage?: string;
    selfieverificationImage?: string;
    state_id?: number;
    city_id?: number;
  };
  states: State[];
  cities: City[];
};

const GetVerifiedProfileModal: React.FC<GetVerifiedProfileModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
  userData,
  states,
  cities,
}) => {
  const [form, setForm] = useState<VerificationForm>({
    fullName: "",
    mobileNumber: "",
    email: "",
    address: "",
    AadharImage: "",
    selfieverificationImage: "",
  });
  console.log(form, "form");
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  // Filter cities based on selected state
  const filteredCities = selectedState
    ? cities.filter((city) => city.state_id === selectedState.id)
    : [];

  // Initialize form with user data when modal opens
  useEffect(() => {
    if (isVisible && userData) {
      setForm({
        fullName: userData.name || "",
        mobileNumber: userData.phone || "",
        email: userData.email || "",
        address: userData.address || "",
        AadharImage: userData.AadharImage || "",
        selfieverificationImage: userData.selfieverificationImage || null,
      });

      const userState = states.find((s) => s.id === userData.state_id) || null;
      const userCity = cities.find((c) => c.id === userData.city_id) || null;
      setSelectedState(userState);
      setSelectedCity(userCity);
    }
  }, [isVisible, userData, states, cities]);

  const handleStateChange = (state: State) => {
    setSelectedState(state);
    setSelectedCity(null); // Reset city when state changes
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
        aspect: type === "aadhar" ? [16, 9] : [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.base64) {
          const mimeType = asset.mimeType || "image/jpeg";
          if (type === "aadhar") {
            setForm((prev) => ({ ...prev, AadharImage: `data:${mimeType};base64,${asset.base64}` }));
          } else {
            setForm((prev) => ({ ...prev, selfieverificationImage: `data:${mimeType};base64,${asset.base64}` }));
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
        aspect: type === "aadhar" ? [16, 9] : [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.base64) {
          const mimeType = asset.mimeType || "image/jpeg";
          if (type === "aadhar") {
            setForm((prev) => ({ ...prev, AadharImage: `data:${mimeType};base64,${asset.base64}` }));
          } else {
            setForm((prev) => ({ ...prev, selfieverificationImage: `data:${mimeType};base64,${asset.base64}` }));
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

  const handleSubmit = () => {
    // Validation
    if (!form.fullName.trim()) {
      Alert.alert("Required", "Please enter your full name");
      return;
    }
    if (!form.mobileNumber.trim()) {
      Alert.alert("Required", "Please enter your mobile number");
      return;
    }
    if (!form.email.trim()) {
      Alert.alert("Required", "Please enter your email address");
      return;
    }
    if (!selectedState) {
      Alert.alert("Required", "Please select your state");
      return;
    }
    if (!selectedCity) {
      Alert.alert("Required", "Please select your city");
      return;
    }
    if (!form.address.trim()) {
      Alert.alert("Required", "Please enter your address");
      return;
    }

    onSubmit({
      ...form,
      state: selectedState,
      city: selectedCity,
    });
  };

  const updateForm = (key: keyof VerificationForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Blue Header */}
        <LinearGradient
          colors={["#1565C0", "#1E88E5"]}
          style={styles.header}
        >
          {/* Close Button */}
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.white} />
          </Pressable>

          {/* Header Content */}
          <View style={styles.headerContent}>
            <ThemedText style={styles.headerTitle}>Get Verified Profile</ThemedText>
            <View style={styles.benefitsContainer}>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark" size={16} color={COLORS.white} />
                <ThemedText style={styles.benefitText}>Increase Trust</ThemedText>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark" size={16} color={COLORS.white} />
                <ThemedText style={styles.benefitText}>Get More Views</ThemedText>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark" size={16} color={COLORS.white} />
                <ThemedText style={styles.benefitText}>Trusted Seller Badge</ThemedText>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Form Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Full Name */}
          <View style={styles.fieldContainer}>
            <ThemedText style={styles.label}>Full Name</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor={COLORS.gray}
              value={form.fullName}
              onChangeText={(text) => updateForm("fullName", text)}
            />
          </View>

          {/* Mobile Number */}
          <View style={styles.fieldContainer}>
            <ThemedText style={styles.label}>Mobile Number</ThemedText>
            <View style={styles.mobileInputContainer}>
              <View style={styles.countryCode}>
                <ThemedText style={styles.countryCodeText}>+91</ThemedText>
              </View>
              <TextInput
                style={styles.mobileInput}
                placeholder="9876543210"
                placeholderTextColor={COLORS.gray}
                keyboardType="phone-pad"
                maxLength={10}
                value={form.mobileNumber}
                onChangeText={(text) => updateForm("mobileNumber", text)}
                editable={false} // Phone is usually verified separately
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.fieldContainer}>
            <ThemedText style={styles.label}>Email (Gmail)</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={COLORS.gray}
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(text) => updateForm("email", text)}
            />
          </View>

          {/* State Dropdown */}
          <ThemeSelect
            label="State"
            placeholder="Select State"
            value={selectedState}
            items={states}
            onSelect={(state) => handleStateChange(state as State)}
            containerStyle={styles.fieldContainer}
          />

          {/* City Dropdown */}
          <ThemeSelect
            label="City"
            placeholder="Select City"
            value={selectedCity}
            items={filteredCities}
            onSelect={(city) => setSelectedCity(city as City)}
            disabled={!selectedState}
            containerStyle={styles.fieldContainer}
          />

          {/* Address */}
          <View style={styles.fieldContainer}>
            <ThemedText style={styles.label}>Address</ThemedText>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Enter your full address"
              placeholderTextColor={COLORS.gray}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              value={form.address}
              onChangeText={(text) => updateForm("address", text)}
            />
            <ThemedText style={styles.helperText}>
              This address will be shown on your profile
            </ThemedText>
          </View>

          {/* Upload ID Proof */}
          <View style={styles.fieldContainer}>
            <ThemedText style={styles.label}>
              Upload ID Proof <ThemedText style={styles.subLabel}>(Aadhaar / PAN / Voter ID)</ThemedText>
            </ThemedText>
            <Pressable
              style={styles.imageUploadButton}
              onPress={() => showImageOptions("aadhar")}
            >
              {form.AadharImage ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: `${ImageUrl}/${form?.AadharImage}` || form.AadharImage }} style={styles.imagePreview} />
                  <View style={styles.imageOverlay}>
                    <Ionicons name="cloud-upload-outline" size={24} color={COLORS.success} />
                    <ThemedText style={styles.imageSuccessText}>Upload</ThemedText>
                  </View>
                </View>
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Ionicons name="cloud-upload-outline" size={32} color={COLORS.gray} />
                  <ThemedText style={styles.uploadText}>Upload ID Card</ThemedText>
                  <ThemedText style={styles.uploadSubtext}>Tap to select or take photo</ThemedText>
                </View>
              )}
            </Pressable>
          </View>

          {/* Upload Selfie */}
          <View style={styles.fieldContainer}>
            <ThemedText style={styles.label}>
              Upload Selfie <ThemedText style={styles.subLabel}>(Clear face required)</ThemedText>
            </ThemedText>
            <Pressable
              style={styles.imageUploadButton}
              onPress={() => showImageOptions("selfie")}
            >
              {form.selfieverificationImage ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: `${ImageUrl}/${form?.selfieverificationImage}` || form.selfieverificationImage }} style={styles.imagePreview} />
                  <View style={styles.imageOverlay}>
                    <Ionicons name="cloud-upload-outline" size={24} color={COLORS.success} />
                    <ThemedText style={styles.imageSuccessText}>Upload</ThemedText>
                  </View>
                </View>
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Ionicons name="person-outline" size={32} color={COLORS.gray} />
                  <ThemedText style={styles.uploadText}>Take Selfie</ThemedText>
                  <ThemedText style={styles.uploadSubtext}>Tap to select or take photo</ThemedText>
                </View>
              )}
            </Pressable>
          </View>

          {/* Security Note */}
          <View style={styles.securityNote}>
            <Ionicons name="shield-checkmark" size={16} color={COLORS.gray} />
            <ThemedText style={styles.securityText}>
              Your data is secure and only used for verification.
            </ThemedText>
          </View>

          {/* Spacing for bottom button */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.bottomContainer}>
          <ThemedButton
            buttonText="Verify Now"
            onPress={handleSubmit}
            style={styles.verifyButton}
            textStyle={styles.verifyButtonText}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SIZES.padding * 3,
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding * 1.5,
  },
  closeButton: {
    position: "absolute",
    top: SIZES.padding * 2.5,
    left: SIZES.padding,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: SIZES.fontSize22,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: SIZES.padding,
  },
  benefitsContainer: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  benefitText: {
    fontSize: SIZES.fontSize14,
    color: COLORS.white,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.padding,
    gap: SIZES.padding,
  },
  fieldContainer: {
    gap: 8,
  },
  label: {
    fontSize: SIZES.fontSize14,
    fontWeight: "600",
    color: COLORS.text,
  },
  subLabel: {
    fontSize: SIZES.fontSize12,
    fontWeight: "400",
    color: COLORS.gray,
  },
  input: {
    height: SIZES.height * 0.065,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius10,
    paddingHorizontal: SIZES.padding,
    fontSize: SIZES.fontSize16,
    color: COLORS.text,
  },
  multilineInput: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  helperText: {
    fontSize: SIZES.fontSize12,
    color: COLORS.gray,
    marginTop: 4,
  },
  mobileInputContainer: {
    flexDirection: "row",
    gap: 10,
  },
  countryCode: {
    height: SIZES.height * 0.065,
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius10,
    paddingHorizontal: SIZES.padding,
    justifyContent: "center",
    alignItems: "center",
  },
  countryCodeText: {
    fontSize: SIZES.fontSize16,
    fontWeight: "600",
    color: COLORS.text,
  },
  mobileInput: {
    flex: 1,
    height: SIZES.height * 0.065,
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius10,
    paddingHorizontal: SIZES.padding,
    fontSize: SIZES.fontSize16,
    color: COLORS.text,
  },
  imageUploadButton: {
    height: SIZES.height * 0.18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius10,
    borderStyle: "dashed",
    overflow: "hidden",
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.padding,
  },
  uploadText: {
    fontSize: SIZES.fontSize14,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 8,
  },
  uploadSubtext: {
    fontSize: SIZES.fontSize12,
    color: COLORS.gray,
    marginTop: 4,
  },
  imagePreviewContainer: {
    flex: 1,
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  imageSuccessText: {
    fontSize: SIZES.fontSize14,
    fontWeight: "600",
    color: COLORS.white,
  },
  changeImageButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  changeImageText: {
    fontSize: SIZES.fontSize12,
    fontWeight: "500",
    color: COLORS.white,
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: SIZES.padding,
  },
  securityText: {
    fontSize: SIZES.fontSize12,
    color: COLORS.gray,
    textAlign: "center",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
    paddingBottom: SIZES.padding * 2,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  verifyButton: {
    backgroundColor: "#00C853",
    borderRadius: SIZES.radius10,
  },
  verifyButtonText: {
    fontSize: SIZES.fontSize16,
    fontWeight: "700",
  },
});

export default GetVerifiedProfileModal;
