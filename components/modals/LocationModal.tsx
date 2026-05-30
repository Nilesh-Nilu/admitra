import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { COLORS } from "@/constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

type LocationModalProps = {
  visible: boolean;
  onClose: () => void;
  states: any[];
  cities: any[];
  onSelectCity: (city: any) => void;
};

export const LocationModal = ({
  visible,
  onClose,
  states,
  cities,
  onSelectCity,
}: LocationModalProps) => {
  const [selectedLocationState, setSelectedLocationState] = useState<any>(null);
  const [locationSearchQuery, setLocationSearchQuery] = useState("");

  const safeStates = Array.isArray(states) ? states : [];
  const safeCities = Array.isArray(cities) ? cities : [];

  const filteredStates = safeStates.filter((s: any) =>
    s?.name?.toLowerCase().includes(locationSearchQuery.toLowerCase())
  );
  const filteredCities = safeCities.filter(
    (c: any) =>
      Number(c.state_id) === Number(selectedLocationState?.id) &&
      c?.name?.toLowerCase().includes(locationSearchQuery.toLowerCase())
  );

  const handleCloseModal = () => {
    if (selectedLocationState) {
      setSelectedLocationState(null);
      setLocationSearchQuery("");
    } else {
      onClose();
      setLocationSearchQuery("");
    }
  };

  const handleSelectCityObj = async (cityObj: any) => {
    onSelectCity(cityObj);
    onClose();
    setSelectedLocationState(null);
    setLocationSearchQuery("");
    try {
      await AsyncStorage.setItem("selectedCity", JSON.stringify(cityObj));
    } catch (e) {
      console.log("Error saving selected city:", e);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleCloseModal}
    >
      <View style={styles.locationModalContainer}>
        {/* Header */}
        <View style={styles.locationModalHeader}>
          <TouchableOpacity onPress={handleCloseModal} style={styles.locationModalBackBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <ThemedText style={styles.locationModalTitle}>
            {selectedLocationState ? selectedLocationState.name : "Location"}
          </ThemedText>
        </View>

        {/* Search Bar */}
        <View style={styles.locationModalSearchWrapper}>
          <View style={styles.locationModalSearchBox}>
            <Ionicons name="search" size={20} color={COLORS.gray} />
            <TextInput
              style={styles.locationModalSearchInput}
              placeholder="Search city, area or neighbourhood"
              value={locationSearchQuery}
              onChangeText={setLocationSearchQuery}
              placeholderTextColor={COLORS.gray}
            />
          </View>
        </View>

        {/* List */}
        <ScrollView
          style={styles.locationModalList}
          contentContainerStyle={styles.locationModalListContent}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedText style={styles.locationModalSectionTitle}>
            {selectedLocationState ? "CHOOSE CITY" : "CHOOSE STATE"}
          </ThemedText>

          {/* "All in ..." option */}
          {!locationSearchQuery && (
            <TouchableOpacity
              style={styles.locationModalItem}
              onPress={() => {
                let cityObj: any = {};
                if (selectedLocationState) {
                  cityObj = {
                    id: "",
                    name: `All in ${selectedLocationState.name}`,
                    state_id: selectedLocationState.id,
                  };
                } else {
                  cityObj = { id: "", name: "All India" };
                }
                handleSelectCityObj(cityObj);
              }}
            >
              <ThemedText style={styles.locationModalAllText}>
                {selectedLocationState
                  ? `All in ${selectedLocationState.name}`
                  : "All in India"}
              </ThemedText>
            </TouchableOpacity>
          )}

          {/* State List */}
          {!selectedLocationState &&
            filteredStates.map((s: any) => (
              <TouchableOpacity
                key={s.id}
                style={styles.locationModalItem}
                onPress={() => {
                  setSelectedLocationState(s);
                  setLocationSearchQuery("");
                }}
              >
                <ThemedText style={styles.locationModalItemText}>{s.name}</ThemedText>
                <Ionicons name="chevron-forward" size={18} color={COLORS.text} />
              </TouchableOpacity>
            ))}

          {/* City List */}
          {selectedLocationState &&
            filteredCities.map((c: any) => (
              <TouchableOpacity
                key={c.id}
                style={styles.locationModalItem}
                onPress={() => handleSelectCityObj(c)}
              >
                <ThemedText style={styles.locationModalItemText}>{c.name}</ThemedText>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  locationModalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  locationModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  locationModalBackBtn: {
    marginRight: 16,
  },
  locationModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  locationModalSearchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  locationModalSearchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  locationModalSearchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.text,
  },
  locationModalList: {
    flex: 1,
  },
  locationModalListContent: {
    paddingBottom: 20,
  },
  locationModalSectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.gray,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  locationModalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  locationModalAllText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1565C0",
  },
  locationModalItemText: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.text,
  },
});
