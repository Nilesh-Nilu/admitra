import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { FeaturedCard } from "@/components/cards/FeaturedCard";
import { COLORS } from "@/constants/Colors";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";

type HomeFeaturedAdsProps = {
  featuredAds: any[];
  onPressSeeAll: () => void;
};

export const HomeFeaturedAds = ({ featuredAds, onPressSeeAll }: HomeFeaturedAdsProps) => {
  const safeFeaturedAds = Array.isArray(featuredAds) ? featuredAds : [];

  if (safeFeaturedAds.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <ThemedText style={styles.featuredStar}>⭐</ThemedText>
          <ThemedText style={styles.sectionTitle}>Featured Ads</ThemedText>
        </View>
        {safeFeaturedAds.length > 1 && (
          <TouchableOpacity style={styles.seeAllBtn} onPress={onPressSeeAll}>
            <ThemedText style={styles.seeAllText}>See All</ThemedText>
            <Ionicons name="arrow-forward" size={15} color="#1565C0" />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {safeFeaturedAds.slice(0, 20).map((item: any) => (
          <FeaturedCard key={item.id} item={item} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: SIZES.padding20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.padding12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.padding6,
  },
  sectionTitle: {
    fontSize: SIZES.fontSize16,
    fontWeight: "700",
    color: COLORS.text,
  },
  featuredStar: { fontSize: SIZES.fontSize16 },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.padding2,
  },
  seeAllText: {
    fontSize: SIZES.fontSize12,
    fontWeight: "600",
    color: "#1565C0",
  },
  scrollContent: { gap: 10 },
});
