import ThemedButton from "@/components/buttons/ThemedButton";
import ThemeSelect from "@/components/inputs/ThemeSelect";
import { ThemedText } from "@/components/ThemedText";
import { getUserDetailsApi, ImageUrl } from "@/constants/functions";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import CropModal from "@/components/modals/CropModal";
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
import { useDispatch, useSelector } from "react-redux";

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
  AadharImage?: string | null;
  AadharImageBack?: string | null;
  selfieverificationImage?: string | null;
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
    AadharImageBack?: string;
    selfieverificationImage?: string | boolean | null;
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
    AadharImageBack: "",
    selfieverificationImage: "",
  });
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedIdType, setSelectedIdType] = useState<string | null>(null);
  const [cropImage, setCropImage] = useState<{ uri: string; width: number; height: number; type: "aadhar" | "selfie" | "aadharBack" } | null>(null);
  const { user } = useSelector((state: any) => state.entities.authReducer);

  // Filter cities based on selected state
  const filteredCities = selectedState
    ? cities.filter((city) => city.state_id === selectedState.id)
    : [];
  const dispatch = useDispatch();
  // Initialize form with user data when modal opens
  useEffect(() => {
    if (isVisible && userData) {
      setForm({
        fullName: userData.name || "",
        mobileNumber: userData.phone || "",
        email: userData.email || "",
        address: userData.address || "",
        // AadharImage: userData.AadharImage || "",
        // AadharImageBack: userData.AadharImageBack || "",
        // selfieverificationImage: (() => { const v = userData.selfieverificationImage; if (!v || v === "0") return ""; return String(v); })(),
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

  const applyCroppedImage = (type: "aadhar" | "selfie" | "aadharBack", croppedUri: string) => {
    if (type === "aadhar") {
      setForm((prev) => ({ ...prev, AadharImage: croppedUri }));
    } else if (type === "aadharBack") {
      setForm((prev) => ({ ...prev, AadharImageBack: croppedUri }));
    } else {
      setForm((prev) => ({ ...prev, selfieverificationImage: croppedUri }));
    }
  };

  const resolveImageSize = (uri: string, fallbackW?: number, fallbackH?: number): Promise<{ width: number; height: number }> => {
    if (fallbackW && fallbackH) return Promise.resolve({ width: fallbackW, height: fallbackH });
    return new Promise((resolve) => {
      Image.getSize(
        uri,
        (width, height) => resolve({ width, height }),
        () => resolve({ width: 1000, height: 1000 })
      );
    });
  };

  const pickImage = async (type: "aadhar" | "selfie" | "aadharBack") => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "Please allow access to your photo library");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 1,
        selectionLimit: 1,
        base64: true,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const { width, height } = await resolveImageSize(asset.uri, asset.width, asset.height);
        setCropImage({ uri: asset.uri, width, height, type });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const takePhoto = async (type: "aadhar" | "selfie" | "aadharBack") => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "Please allow access to your camera");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 1,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const { width, height } = await resolveImageSize(asset.uri, asset.width, asset.height);
        setCropImage({ uri: asset.uri, width, height, type });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo");
    }
  };


  const showImageOptions = (type: "aadhar" | "selfie" | "aadharBack") => {
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
    if (selectedIdType && !form.AadharImage) {
      Alert.alert("Required", `Please upload your ${selectedIdType} photo`);
      return;
    }
    onSubmit({
      ...form,
      state: selectedState,
      city: selectedCity,
    });
    getUserDetailsApi(user?.id, dispatch, () => {
      onClose();
    });
  };

  const updateForm = (key: keyof VerificationForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isFormValid = Boolean(
    form.fullName.trim() &&
    form.mobileNumber.trim() &&
    form.email.trim() &&
    selectedState &&
    selectedCity &&
    form.address.trim() &&
    selectedIdType &&
    form.AadharImage &&
    form.selfieverificationImage
  );
  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.topBanner}>
          <ThemedText style={styles.topTitle}>
            Why Get Verified?
          </ThemedText>

          <View style={styles.benefitsRow}>
            <View style={styles.benefitCard}>
              <Ionicons name="shield-checkmark" size={22} color="#1565C0" />
              <ThemedText style={styles.benefitHeading}>
                Increase
              </ThemedText>
              <ThemedText style={styles.benefitSub}>
                Buyer Trust
              </ThemedText>
            </View>

            <View style={styles.benefitCard}>
              <Ionicons name="stats-chart" size={22} color="#1565C0" />
              <ThemedText style={styles.benefitHeading}>
                More Visibility
              </ThemedText>
              <ThemedText style={styles.benefitSub}>
                on Ads
              </ThemedText>
            </View>

            <View style={styles.benefitCard}>
              <Ionicons name="checkmark-done-circle" size={22} color="#1565C0" />
              <ThemedText style={styles.benefitHeading}>
                Verified Badge
              </ThemedText>
              <ThemedText style={styles.benefitSub}>
                on Profile
              </ThemedText>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Full Name */}
          <View style={styles.fieldContainer}>
            <ThemedText style={styles.label}>Full Name</ThemedText>

            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={18} color="#7B8794" />
              <TextInput
                style={styles.input}
                placeholder="Enter full name"
                value={form.fullName}
                onChangeText={(text) => updateForm("fullName", text)}
              />
            </View>
          </View>

          {/* Mobile */}
          <View style={styles.fieldContainer}>
            <ThemedText style={styles.label}>Mobile Number</ThemedText>

            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={18} color="#7B8794" />

              <ThemedText style={styles.countryCodeText}>
                +91
              </ThemedText>

              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="9876543210"
                keyboardType="phone-pad"
                value={form.mobileNumber}
                editable={false}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.fieldContainer}>
            <ThemedText style={styles.label}>Email (Gmail)</ThemedText>

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={18} color="#7B8794" />

              <TextInput
                style={styles.input}
                placeholder="Enter email"
                keyboardType="email-address"
                value={form.email}
                onChangeText={(text) => updateForm("email", text)}
              />
            </View>
          </View>

          {/* State & City */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <ThemeSelect
                label="State"
                placeholder="Select State"
                value={selectedState}
                items={states}
                onSelect={(state) => handleStateChange(state as State)}
              />
            </View>

            <View style={{ width: 10 }} />

            <View style={{ flex: 1 }}>
              <ThemeSelect
                label="City"
                placeholder="Select City"
                value={selectedCity}
                items={filteredCities}
                onSelect={(city) => setSelectedCity(city as City)}
                disabled={!selectedState}
              />
            </View>
          </View>

          {/* Address */}
          <View style={styles.fieldContainer}>
            <ThemedText style={styles.label}>Address / area</ThemedText>

            <TextInput
              style={styles.addressInput}
              placeholder="Enter your address"
              multiline
              value={form.address}
              onChangeText={(text) => updateForm("address", text)}
            />
          </View>

          {/* Note */}
          <View style={styles.infoBox}>
            <Ionicons
              name="information-circle"
              size={18}
              color="#1565C0"
            />

            <ThemedText style={styles.infoText}>
              ID verification se bharosa badhta hai aur verified
              sellers ko zyada visibility milti hai.
            </ThemedText>
          </View>

          {/* ID Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>
                ID Proof (Optional but Recommended)
              </ThemedText>

              <View style={styles.optionalBadge}>
                <ThemedText style={styles.optionalText}>
                  Optional
                </ThemedText>
              </View>
            </View>

            <ThemedText style={styles.sectionSubText}>
              Adding ID increases your trust score and helps in
              faster verification.
            </ThemedText>

            {/* ID Type Buttons */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 10 }}
            >
              {[
                "Aadhaar",
                "Voter ID",
                "PAN Card",
                "Driving License",
                "Other",
              ].map((item) => {
                const isSelected = selectedIdType === item;
                return (
                  <Pressable
                    key={item}
                    style={[
                      styles.idTypeButton,
                      isSelected && styles.idTypeButtonSelected,
                    ]}
                    onPress={() => setSelectedIdType(item)}
                  >
                    <ThemedText
                      style={[
                        styles.idTypeText,
                        isSelected && styles.idTypeTextSelected,
                      ]}
                    >
                      {item}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Upload ID */}
            <ThemedText style={styles.uploadTitle}>
              Upload ID Photo
            </ThemedText>

            <Pressable
              style={styles.uploadBox}
              onPress={() => showImageOptions("aadhar")}
            >
              {form.AadharImage ? (
                <Image
                  source={{
                    uri: form.AadharImage.startsWith("data:")
                      ? form.AadharImage
                      : `${ImageUrl}/${form.AadharImage}`,
                  }}
                  style={styles.uploadedImage}
                />
              ) : (
                <>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={38}
                    color="#1565C0"
                  />

                  <ThemedText style={styles.uploadBoxTitle}>
                    Tap to Upload ID Photo
                  </ThemedText>

                  <ThemedText style={styles.uploadBoxSub}>
                    JPG, PNG up to 5MB
                  </ThemedText>
                </>
              )}
            </Pressable>

            {/* Selfie */}
            <ThemedText style={[styles.uploadTitle, { marginTop: 18 }]}>
              Upload Selfie
            </ThemedText>

            <Pressable
              style={styles.uploadBox}
              onPress={() => showImageOptions("selfie")}
            >
              {form.selfieverificationImage ? (
                <Image
                  source={{
                    uri: form.selfieverificationImage.startsWith("data:")
                      ? form.selfieverificationImage
                      : `${ImageUrl}/${form.selfieverificationImage}`,
                  }}
                  style={styles.uploadedImage}
                />
              ) : (
                <>
                  <Ionicons
                    name="person-circle-outline"
                    size={40}
                    color="#1565C0"
                  />

                  <ThemedText style={styles.uploadBoxTitle}>
                    Tap to Upload Selfie
                  </ThemedText>

                  <ThemedText style={styles.uploadBoxSub}>
                    Clear face required
                  </ThemedText>
                </>
              )}
            </Pressable>
          </View>

          {/* Verified Row */}
          <View style={styles.verifiedRow}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons
                name="shield-checkmark"
                size={22}
                color="#1565C0"
              />

              <View>
                <ThemedText style={styles.verifiedTitle}>
                  Verified
                </ThemedText>

                <ThemedText style={styles.verifiedSub}>
                  Verified ads get more trust
                </ThemedText>
              </View>
            </View>

            <View style={styles.verifiedBadge}>
              <ThemedText style={styles.verifiedBadgeText}>
                Verified
              </ThemedText>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.bottomContainer}>
          <ThemedButton
            buttonText="Get Verified Now"
            disabled={!isFormValid}
            onPress={handleSubmit}
            style={[styles.verifyButton, !isFormValid && { opacity: 0.5 }]}
            textStyle={[styles.verifyButtonText, !isFormValid && { opacity: 0.5 }]}
          />
        </View>
      </View>

      {cropImage && (
        <CropModal
          visible={!!cropImage}
          imageUri={cropImage.uri}
          imageWidth={cropImage.width}
          imageHeight={cropImage.height}
          onClose={() => setCropImage(null)}
          onCrop={(croppedUri) => {
            applyCroppedImage(cropImage.type, croppedUri);
            setCropImage(null);
          }}
        />
      )}
    </Modal>
  );
};

// Replace styles with these updated styles

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },

  topBanner: {
    backgroundColor: "#FFFFFF",
    paddingTop: 55,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  topTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1565C0",
    marginBottom: 16,
  },

  benefitsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  benefitCard: {
    flex: 1,
    alignItems: "center",
  },

  benefitHeading: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
    marginTop: 6,
  },

  benefitSub: {
    fontSize: 11,
    color: "#6B7280",
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: 16,
  },

  fieldContainer: {
    marginBottom: 16,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    color: "#111827",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 52,
    gap: 10,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
  },

  countryCodeText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },

  row: {
    flexDirection: "row",
    marginBottom: 16,
  },

  addressInput: {
    minHeight: 52,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: "#111827",
  },

  infoBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
  },

  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#1565C0",
    lineHeight: 18,
  },

  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },

  optionalBadge: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  optionalText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
  },

  sectionSubText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 6,
    lineHeight: 18,
  },

  idTypeButton: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
    backgroundColor: "#FFFFFF",
  },
  idTypeButtonSelected: {
    borderColor: "#1565C0",
    backgroundColor: "#E3F2FD",
  },

  idTypeText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#111827",
  },
  idTypeTextSelected: {
    color: "#1565C0",
    fontWeight: "700",
  },

  uploadTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },

  uploadBox: {
    height: 170,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#93C5FD",
    borderRadius: 12,
    backgroundColor: "#F8FBFF",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  uploadBoxTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1565C0",
    marginTop: 8,
  },

  uploadBoxSub: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },

  uploadedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  verifiedRow: {
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  verifiedTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  verifiedSub: {
    fontSize: 12,
    color: "#6B7280",
  },

  verifiedBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  verifiedBadgeText: {
    color: "#1565C0",
    fontWeight: "700",
    fontSize: 12,
  },

  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },

  verifyButton: {
    backgroundColor: "#1565C0",
    borderRadius: 12,
    height: 54,
  },

  verifyButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

export default GetVerifiedProfileModal;
