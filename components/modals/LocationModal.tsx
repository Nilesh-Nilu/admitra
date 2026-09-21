import React, { useEffect, useRef, useState } from "react";
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
  localities: any[];
  onSelectCity: (city: any) => void;
  onSelectLocality: (locality: any) => void;
};

// Step 1 → State, Step 2 → City, Step 3 → Locality
type Step = "state" | "city" | "locality";

export const LocationModal = ({
  visible,
  onClose,
  states,
  cities,
  localities,
  onSelectCity,
  onSelectLocality,
}: LocationModalProps) => {
  const [step, setStep] = useState<Step>("state");
  const [selectedState, setSelectedState] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingLocalities, setIsLoadingLocalities] = useState(false);
  const prevLocalitiesRef = useRef<any[]>([]);

  // Stop loading spinner once new localities land from Redux
  useEffect(() => {
    if (isLoadingLocalities && localities !== prevLocalitiesRef.current) {
      setIsLoadingLocalities(false);
    }
    prevLocalitiesRef.current = localities;
  }, [isLoadingLocalities, localities]);

  const safeStates = Array.isArray(states) ? states : [];
  const safeCities = Array.isArray(cities) ? cities : [];
  const safeLocalities = Array.isArray(localities) ? localities : [];

  const filteredStates = safeStates.filter((s: any) =>
    s?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCities = safeCities.filter(
    (c: any) =>
      Number(c.state_id) === Number(selectedState?.id) &&
      c?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLocalities = safeLocalities.filter(
    (l: any) =>
      Number(l.city_id) === Number(selectedCity?.id) &&
      l?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const reset = () => {
    setStep("state");
    setSelectedState(null);
    setSelectedCity(null);
    setSearchQuery("");
  };

  const handleBack = () => {
    if (step === "locality") {
      setStep("city");
      setSelectedCity(null);
      setSearchQuery("");
    } else if (step === "city") {
      setStep("state");
      setSelectedState(null);
      setSearchQuery("");
    } else {
      onClose();
      reset();
    }
  };

  const handleSelectState = (s: any) => {
    setSelectedState(s);
    setSearchQuery("");
    setStep("city");
  };

  const handleSelectCity = (cityObj: any) => {
    setSelectedCity(cityObj);
    setSearchQuery("");
    onSelectCity(cityObj);
    setStep("locality");
  };

  const handleSelectLocality = async (locality: any) => {
    onSelectLocality(locality);
    try {
      await AsyncStorage.setItem("selectedLocality", JSON.stringify(locality));
    } catch (e) {
      console.log("Error saving selected locality:", e);
    }
    reset();
    onClose();
  };

  const handleSkipLocality = () => {
    onSelectLocality(null);
    reset();
    onClose();
  };

  const headerTitle =
    step === "locality"
      ? selectedCity?.name ?? "Locality"
      : step === "city"
      ? selectedState?.name ?? "State"
      : "Location";

  const sectionLabel =
    step === "locality" ? "CHOOSE LOCALITY" : step === "city" ? "CHOOSE CITY" : "CHOOSE STATE";

  const searchPlaceholder =
    step === "locality"
      ? "Search locality, area or neighbourhood"
      : step === "city"
      ? "Search city"
      : "Search state";

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleBack}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>{headerTitle}</ThemedText>
        </View>

        {/* Search */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color={COLORS.gray} />
            <TextInput
              style={styles.searchInput}
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={COLORS.gray}
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={18} color={COLORS.gray} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedText style={styles.sectionTitle}>{sectionLabel}</ThemedText>

          {/* "All" quick-select */}
          {!searchQuery && (
            <TouchableOpacity
              style={styles.item}
              onPress={() => {
                if (step === "state") {
                  onSelectCity({ id: "", name: "All India", locationScope: "all" });
                  reset();
                  onClose();
                } else if (step === "city") {
                  onSelectCity({
                    id: "",
                    name: `All in ${selectedState?.name}`,
                    state_id: selectedState?.id,
                    locationScope: "state",
                  });
                  reset();
                  onClose();
                } else {
                  handleSkipLocality();
                }
              }}
            >
              <ThemedText style={styles.allText}>
                {step === "locality"
                  ? `All in ${selectedCity?.name}`
                  : step === "city"
                  ? `All in ${selectedState?.name}`
                  : "All India"}
              </ThemedText>
            </TouchableOpacity>
          )}

          {/* Step 1 — States */}
          {step === "state" &&
            filteredStates.map((s: any) => (
              <TouchableOpacity
                key={s.id}
                style={styles.item}
                onPress={() => handleSelectState(s)}
              >
                <ThemedText style={styles.itemText}>{s.name}</ThemedText>
                <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
              </TouchableOpacity>
            ))}

          {/* Step 2 — Cities */}
          {step === "city" &&
            filteredCities.map((c: any) => (
              <TouchableOpacity
                key={c.id}
                style={styles.item}
                onPress={() => handleSelectCity(c)}
              >
                <ThemedText style={styles.itemText}>{c.name}</ThemedText>
                <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
              </TouchableOpacity>
            ))}

          {/* Step 3 — Localities */}
          {step === "locality" && (
            <>
              {filteredLocalities.length === 0 && !searchQuery ? (
                <View style={styles.emptyWrap}>
                  <Ionicons name="location-outline" size={36} color={COLORS.gray} />
                  <ThemedText style={styles.emptyText}>No localities found for this city</ThemedText>
                  <TouchableOpacity style={styles.skipBtn} onPress={handleSkipLocality}>
                    <ThemedText style={styles.skipBtnText}>Continue without locality</ThemedText>
                  </TouchableOpacity>
                </View>
              ) : (
                filteredLocalities.map((l: any) => (
                  <TouchableOpacity
                    key={l.id}
                    style={styles.item}
                    onPress={() => handleSelectLocality(l)}
                  >
                    <View style={styles.localityLeft}>
                      <Ionicons name="location-outline" size={16} color={COLORS.primary} style={{ marginRight: 10 }} />
                      <ThemedText style={styles.itemText}>{l.name}</ThemedText>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backBtn: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.gray,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  itemText: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.text,
  },
  allText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1565C0",
  },
  localityLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  emptyWrap: {
    alignItems: "center",
    paddingTop: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: "center",
  },
  skipBtn: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  skipBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
});
