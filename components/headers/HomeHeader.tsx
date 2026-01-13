import { ThemedText } from "@/components/ThemedText";
import { COLORS } from "@/constants/Colors";
import { getLocationListApi, getServicesByLocationIdApi } from "@/constants/functions";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { setCategoriesByLocationId, setSelectedCity } from "@/store/reducers/userReducer";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

interface HomeHeaderProps {
  searchQuery: string;
  onSearchChange: () => void;
  showPromoBanners?: boolean;
  onCityChange?: (city: string) => void;
  editable?: boolean;
}

const HomeHeader = ({
  searchQuery,
  onSearchChange,
  showPromoBanners = true,
  onCityChange,
  editable = true,
}: HomeHeaderProps) => {
  const { user } = useSelector((state: any) => state.entities.authReducer);
  const { selectedCity } = useSelector(
    (state: any) => state.entities.userReducer
  );
  const [locations, setLocations] = useState<any>({});
  const [showCityModal, setShowCityModal] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const dispatch = useDispatch();
  const filteredCities = locations?.data?.filter((city: any) =>
    city?.district?.toLowerCase()?.includes(citySearch?.toLowerCase())
  );
  useEffect(() => {
    getLocationListApi(setLocations);
  }, []);

  const handleCitySelect = async (city: any, locationId: string) => {
  try {
    dispatch(setSelectedCity(city));
    setShowCityModal(false);
    setCitySearch("");
    onCityChange?.(city);
    await AsyncStorage.setItem('selectedCityDetails',JSON.stringify({id:locationId,name:city}))
    await getServicesByLocationIdApi(locationId,dispatch);
  } catch (error) {
    console.log(error, "error");
  }
  };

  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.greetingContainer}>
          <ThemedText style={styles.greeting}>
            {showPromoBanners ? `Hello, ${user?.name || "User"}` : ""}
          </ThemedText>
          <ThemedText style={styles.welcomeText}>Welcome back!</ThemedText>
        </View>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={() => setShowCityModal(true)}
          activeOpacity={0.8}
        >
          <View style={styles.locationIcon}>
            <Ionicons name="location" size={16} color={COLORS.primary} />
          </View>
          <ThemedText style={styles.cityText}>{selectedCity}</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <Pressable style={styles.searchContainer} onPress={onSearchChange}>
        <View style={styles.searchIconWrapper}>
          <Ionicons name="search" size={20} color={COLORS.primary} />
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder={
            showPromoBanners ? "Search services..." : "Search products..."
          }
          placeholderTextColor={COLORS.gray}
          value={searchQuery}
          onChangeText={onSearchChange}
          editable={editable}
        />
        <View style={styles.filterButton}>
          <Ionicons name="options-outline" size={20} color={COLORS.textLight} />
        </View>
      </Pressable>

      {/* City Selection Modal */}
      <Modal
        visible={showCityModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowCityModal(false);
          setCitySearch("");
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
              <ThemedText style={styles.modalTitle}>Select Your City</ThemedText>
              <TouchableOpacity
                onPress={() => {
                  setShowCityModal(false);
                  setCitySearch("");
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* City Search */}
            <View style={styles.modalSearchContainer}>
              <Ionicons name="search" size={18} color={COLORS.gray} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search city..."
                placeholderTextColor={COLORS.gray}
                value={citySearch}
                onChangeText={setCitySearch}
              />
            </View>

            {/* City List */}
            <FlatList
              data={filteredCities || []}
              keyExtractor={(item) => item?.id?.toString() || item?.district}
              renderItem={({ item }) => {
                const cityName = item?.district || item?.state || "Unknown";
                const isSelected = selectedCity === cityName;
                return (
                  <TouchableOpacity
                    style={[
                      styles.cityItem,
                      isSelected && styles.cityItemSelected,
                    ]}
                    onPress={() => handleCitySelect(cityName, item?.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.cityItemContent}>
                      <Ionicons
                        name="location-outline"
                        size={20}
                        color={isSelected ? COLORS.primary : COLORS.gray}
                      />
                      <View>
                        <ThemedText
                          style={[
                            styles.cityItemText,
                            isSelected && styles.cityItemTextSelected,
                          ]}
                        >
                          {cityName}
                        </ThemedText>
                        {item?.state && item?.district && (
                          <ThemedText style={styles.stateText}>
                            {item.state}
                          </ThemedText>
                        )}
                      </View>
                    </View>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={COLORS.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
              contentContainerStyle={styles.cityListContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Ionicons name="location-outline" size={40} color={COLORS.gray} />
                  <ThemedText style={styles.emptyText}>No cities found</ThemedText>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

export default React.memo(HomeHeader);

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding * 2.5,
    paddingBottom: SIZES.padding * 1.5,
    gap: SIZES.padding,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greetingContainer: {
    gap: 2,
  },
  greeting: {
    fontSize: SIZES.fontSize24,
    fontWeight: "700",
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  welcomeText: {
    fontSize: SIZES.fontSize14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  locationIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },
  cityText: {
    fontSize: SIZES.fontSize14,
    color: COLORS.white,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 4,
    paddingVertical: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary + "10",
    justifyContent: "center",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    fontSize: SIZES.fontSize16,
    color: COLORS.text,
    paddingHorizontal: 12,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    paddingBottom: SIZES.padding * 2,
  },
  modalHeader: {
    alignItems: "center",
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding * 0.5,
    paddingBottom: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gray,
    marginBottom: SIZES.padding,
  },
  modalTitle: {
    fontSize: SIZES.fontSize20,
    fontWeight: "700",
    color: COLORS.text,
  },
  closeButton: {
    position: "absolute",
    right: SIZES.padding,
    top: SIZES.padding,
    padding: 8,
  },
  modalSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    marginHorizontal: SIZES.padding,
    marginVertical: SIZES.padding,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: SIZES.fontSize16,
    color: COLORS.text,
  },
  cityListContent: {
    paddingHorizontal: SIZES.padding,
  },
  cityItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.8,
    borderRadius: 12,
    marginBottom: 8,
  },
  cityItemSelected: {
    backgroundColor: COLORS.primary + "10",
  },
  cityItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cityItemText: {
    fontSize: SIZES.fontSize16,
    color: COLORS.text,
    fontWeight: "500",
  },
  cityItemTextSelected: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  stateText: {
    fontSize: SIZES.fontSize12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  emptyList: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SIZES.padding * 3,
    gap: SIZES.padding,
  },
  emptyText: {
    fontSize: SIZES.fontSize14,
    color: COLORS.gray,
  },
});
