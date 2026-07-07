import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { COLORS } from "@/constants/Colors";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";

type HomeSearchBarProps = {
  onPressSearch: () => void;
  onPressHelp: () => void;
  onPressFavorites: () => void;
  onPressNotifications: () => void;
  hasUnreadNotifications?: boolean;
};

export const HomeSearchBar = ({
  onPressSearch,
  onPressHelp,
  onPressFavorites,
  onPressNotifications,
  hasUnreadNotifications = false,
}: HomeSearchBarProps) => {
  return (
    <View style={styles.searchRow}>
      <TouchableOpacity
        style={styles.searchContainer}
        onPress={onPressSearch}
        activeOpacity={0.8}
      >
        <Ionicons name="search" size={18} color={COLORS.gray} />
        <ThemedText style={styles.searchPlaceholder}>
          Search cars, mobiles, properties..
        </ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.whatsappBtn}
        onPress={onPressHelp}
        activeOpacity={0.8}
      >
        <Ionicons name="logo-whatsapp" size={16} color={COLORS.white} />
        <ThemedText style={styles.whatsappText}>Help</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity onPress={onPressFavorites} activeOpacity={0.8}>
        <Ionicons name="heart-outline" size={22} color={COLORS.black} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onPressNotifications} activeOpacity={0.8} style={{ position: "relative" }}>
        <Ionicons name="notifications-outline" size={22} color={COLORS.black} />
        {hasUnreadNotifications && (
          <View
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              width: 9,
              height: 9,
              borderRadius: 4.5,
              backgroundColor: "#FF3636",
              borderWidth: 1,
              borderColor: COLORS.white,
            }}
          />
        )}
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.padding8,
    marginBottom: SIZES.padding,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius8,
    paddingHorizontal: SIZES.padding12,
    paddingVertical: SIZES.padding12,
    gap: SIZES.padding8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: SIZES.fontSize10,
    color: COLORS.gray,
  },
  whatsappBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.padding4,
    backgroundColor: "#25D366",
    paddingHorizontal: SIZES.padding10,
    paddingVertical: SIZES.padding12,
    borderRadius: SIZES.radius8,
  },
  whatsappText: {
    fontSize: SIZES.fontSize10,
    fontWeight: "700",
    color: COLORS.white,
  },
});
