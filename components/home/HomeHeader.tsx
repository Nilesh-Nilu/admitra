import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { COLORS } from "@/constants/Colors";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";

const ICON_SIZE_MEDIUM = 24;
const ICON_SIZE_LARGE = 32;

type HomeHeaderProps = {
  selectedCityName: string;
  onPressLocation: () => void;
};

export const HomeHeader = ({ selectedCityName, onPressLocation }: HomeHeaderProps) => {
  return (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/images/splashImage.png")}
          style={styles.logo}
        />
      </View>
      <TouchableOpacity
        style={styles.locationSelector}
        onPress={onPressLocation}
        activeOpacity={0.8}
      >
        <View style={styles.locationIconBg}>
          <Ionicons name="location" size={16} color={COLORS.white} />
        </View>
        <View style={styles.locationTextWrap}>
          <ThemedText style={styles.locationLabel}>Deliver to</ThemedText>
          <View style={styles.locationRow}>
            <ThemedText style={styles.locationCity} numberOfLines={1}>
              {selectedCityName || "Select City"}
            </ThemedText>
            <Ionicons name="chevron-down" size={13} color={COLORS.text} />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SIZES.padding8,
  },
  logoContainer: { flexShrink: 0 },
  logo: {
    width: ICON_SIZE_LARGE + 24,
    height: ICON_SIZE_MEDIUM + 20,
    resizeMode: "contain",
  },
  locationSelector: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.padding8,
    backgroundColor: "#E8F0FE",
    paddingHorizontal: SIZES.padding12,
    paddingVertical: SIZES.padding8,
    borderRadius: SIZES.radius12,
    marginLeft: SIZES.padding12,
    minWidth: 120,
    maxWidth: 180,
  },
  locationTextWrap: {
    flex: 1,
  },
  locationIconBg: {
    width: ICON_SIZE_MEDIUM + 6,
    height: ICON_SIZE_MEDIUM + 6,
    borderRadius: (ICON_SIZE_MEDIUM + 6) / 2,
    backgroundColor: "#1E8E3E",
    justifyContent: "center",
    alignItems: "center",
  },
  locationLabel: {
    fontSize: SIZES.fontSize10,
    color: "#1565C0",
    fontWeight: "600",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.padding2,
  },
  locationCity: {
    fontSize: SIZES.fontSize12,
    fontWeight: "700",
    color: "#0D47A1",
    flexShrink: 1,
  },
});
