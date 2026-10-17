import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { MatrimonyCard } from "@/components/cards/MatrimonyCard";
import { COLORS } from "@/constants/Colors";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { getMatrimonyProfilesApi } from "@/constants/functions";

type HomeMatrimonyProfilesProps = {
  onPressSeeAll: () => void;
};

export const HomeMatrimonyProfiles = ({ onPressSeeAll }: HomeMatrimonyProfilesProps) => {
  const [profiles, setProfiles] = useState<any[]>([]);

  // Refresh on focus so a profile posted from the Post tab shows up on return.
  useFocusEffect(
    useCallback(() => {
      getMatrimonyProfilesApi(1, 20)
        .then((paginator: any) => setProfiles(Array.isArray(paginator?.data) ? paginator.data : []))
        .catch((error: any) => console.log(error?.response?.status || error, "matrimony profiles"));
    }, [])
  );

  if (profiles.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <ThemedText style={styles.sectionIcon}>💍</ThemedText>
          <ThemedText style={styles.sectionTitle}>Matrimony</ThemedText>
        </View>
        {profiles.length > 1 && (
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
        {profiles.map((item: any) => (
          <MatrimonyCard key={item.id} item={item} />
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
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: SIZES.padding6 },
  sectionIcon: { fontSize: SIZES.fontSize16 },
  sectionTitle: { fontSize: SIZES.fontSize16, fontWeight: "700", color: COLORS.text },
  seeAllBtn: { flexDirection: "row", alignItems: "center", gap: SIZES.padding2 },
  seeAllText: { fontSize: SIZES.fontSize12, fontWeight: "600", color: "#1565C0" },
  scrollContent: { gap: 10, paddingBottom: 4 },
});
