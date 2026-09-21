import ThemedButton from "@/components/buttons/ThemedButton";
import ThemeSelect from "@/components/inputs/ThemeSelect";
import { ThemedText } from "@/components/ThemedText";
import { COLORS } from "@/constants/Colors";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { getLocalitiesApi } from "@/store/reducers/userReducer";
import { getLocalitiesUrl } from "@/constants/functions";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
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

interface Locality {
  id: number;
  name: string;
  city_id: number;
}

interface UserData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  street?: string;
  pincode?: string;
  state_id?: number;
  city_id?: number;
  locality_id?: number;
}

type EditProfileModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    email: string;
    phone: string;
    address: string;
    street: string;
    pincode: string;
    state_id: number | null;
    city_id: number | null;
    locality_id: number | null;
  }) => void;
  userData: UserData;
  states: State[];
  cities: City[];
  localities: Locality[];
};

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isVisible,
  onClose,
  onSave,
  userData,
  states,
  cities,
  localities,
}) => {
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    street: "",
    pincode: "",
  });
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedLocality, setSelectedLocality] = useState<Locality | null>(null);
  const dispatch = useDispatch();

  const filteredCities = selectedState
    ? cities.filter((city) => city.state_id === selectedState.id)
    : [];

  const filteredLocalities = selectedCity
    ? (localities || []).filter((l) => l.city_id === selectedCity.id)
    : [];

  // Initialize form when modal opens
  useEffect(() => {
    if (isVisible && userData) {
      setEditForm({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        address: userData.address || "",
        street: userData.street || "",
        pincode: userData.pincode || "",
      });

      const userState = states.find((s) => s.id === userData.state_id) || null;
      const userCity = cities.find((c) => c.id === userData.city_id) || null;
      setSelectedState(userState);
      setSelectedCity(userCity);
      setSelectedLocality(null);
    }
  }, [isVisible, userData, states, cities]);

  // The store only holds localities for the last fetched city, so load them for the selected one
  useEffect(() => {
    if (isVisible && selectedCity?.id) {
      dispatch(getLocalitiesApi(`${getLocalitiesUrl}?city_id=${selectedCity.id}`) as any);
    }
  }, [isVisible, selectedCity?.id, dispatch]);

  // Restore the user's saved locality once its list has loaded
  useEffect(() => {
    if (!isVisible || selectedLocality || !userData?.locality_id) return;
    if (selectedCity?.id !== userData.city_id) return;
    const match = (localities || []).find((l) => l.id === userData.locality_id);
    if (match) setSelectedLocality(match);
  }, [isVisible, localities, selectedCity?.id, selectedLocality, userData]);

  const handleStateChange = (state: State) => {
    setSelectedState(state);
    setSelectedCity(null);
    setSelectedLocality(null);
  };

  const handleCityChange = (city: City) => {
    setSelectedCity(city);
    setSelectedLocality(null);
  };

  const handleSave = () => {
    onSave({
      ...editForm,
      state_id: selectedState?.id || null,
      city_id: selectedCity?.id || null,
      locality_id: selectedLocality?.id || null,
    });
  };

  const updateForm = (key: keyof typeof editForm, value: string) => {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Edit Profile</ThemedText>
              <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalForm}
            >
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Name</ThemedText>
                <TextInput
                  style={styles.input}
                  value={editForm.name}
                  onChangeText={(t) => updateForm("name", t)}
                  placeholder="Enter your name"
                  placeholderTextColor={COLORS.gray}
                />
              </View>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Email</ThemedText>
                <TextInput
                  style={[styles.input, { color: COLORS.gray }]}
                  value={editForm.email}
                  editable={false}
                  placeholder="Email"
                  placeholderTextColor={COLORS.gray}
                />
              </View>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Phone</ThemedText>
                <TextInput
                  style={[styles.input, { color: COLORS.gray }]}
                  value={editForm.phone}
                  editable={false}
                  placeholder="Phone"
                  placeholderTextColor={COLORS.gray}
                />
              </View>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Address</ThemedText>
                <TextInput
                  style={styles.input}
                  value={editForm.address}
                  onChangeText={(t) => updateForm("address", t)}
                  placeholder="Enter your address"
                  placeholderTextColor={COLORS.gray}
                />
              </View>
              <View style={styles.inputGroup}>
                <ThemeSelect
                  label="State"
                  placeholder="Select State"
                  value={selectedState}
                  items={states || []}
                  onSelect={(state) => handleStateChange(state as State)}
                  icon="map-outline"
                />
              </View>
              <View style={styles.inputGroup}>
                <ThemeSelect
                  label="City"
                  placeholder={selectedState ? "Select City" : "Select State First"}
                  value={selectedCity}
                  items={filteredCities}
                  onSelect={(city) => handleCityChange(city as City)}
                  disabled={!selectedState}
                  icon="business-outline"
                />
              </View>
              <View style={styles.inputGroup}>
                <ThemeSelect
                  label="Locality"
                  placeholder={selectedCity ? "Select Locality" : "Select City First"}
                  value={selectedLocality}
                  items={filteredLocalities}
                  onSelect={(locality) => setSelectedLocality(locality as Locality)}
                  disabled={!selectedCity}
                  icon="location-outline"
                />
              </View>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Pincode</ThemedText>
                <TextInput
                  style={styles.input}
                  value={editForm.pincode?.toString()}
                  onChangeText={(t) => updateForm("pincode", t)}
                  placeholder="Enter pincode"
                  placeholderTextColor={COLORS.gray}
                  keyboardType="numeric"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <ThemedButton
                buttonText="Cancel"
                onPress={onClose}
                style={styles.modalCancelBtn}
                textStyle={styles.modalCancelBtnText}
              />
              <ThemedButton
                buttonText="Save Changes"
                onPress={handleSave}
                style={styles.modalSaveBtn}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.padding,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  modalForm: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: SIZES.padding,
    paddingTop: 20,
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  modalCancelBtnText: {
    color: COLORS.text,
  },
  modalSaveBtn: {
    flex: 1,
  },
});

export default EditProfileModal;
