import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { FeaturedCard } from "@/components/cards/FeaturedCard";
import { COLORS } from "@/constants/Colors";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { getFeaturedAdsInfoApi, logoutUser } from "@/constants/functions";
import { useDispatch } from "react-redux";
import { useRouter } from "expo-router";

type HomeFeaturedAdsProps = {
  featuredAds: any[];
  onPressSeeAll: () => void;
};

export const HomeFeaturedAds = ({ featuredAds, onPressSeeAll }: HomeFeaturedAdsProps) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const safeFeaturedAds = Array.isArray(featuredAds) ? featuredAds : [];
  const [featuredAdsInfo, setFeaturedAdsInfo] = useState<any>(null);
  useEffect(() => {
    getFeaturedAdsInfoApi()
      .then((res: any) => {
        setFeaturedAdsInfo(res);
      })
      .catch((err) => {
        if (err.message === "Unauthenticated") {
          logoutUser(dispatch, router, "user");
        }
      });
  }, []);
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
      {featuredAdsInfo && (
        <TouchableOpacity style={styles.topTextBanner} activeOpacity={0.85}>
          <View style={styles.topTextBannerIconWrap}>
            {featuredAdsInfo.icon ? (
              <Image
                source={{ uri: featuredAdsInfo.icon }}
                style={styles.topTextBannerIcon}
              />
            ) : (
              <Ionicons name="megaphone-outline" size={20} color="#1565C0" />
            )}
          </View>
          <View style={styles.topTextBannerBody}>
            <ThemedText style={styles.topTextBannerTitle} numberOfLines={2}>
              {featuredAdsInfo.title}
            </ThemedText>
          </View>
          <View style={styles.topTextBannerBtn}>
            <ThemedText style={styles.topTextBannerBtnText}>   {featuredAdsInfo.feature_points}</ThemedText>
          </View>
        </TouchableOpacity>
      )}
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
  topTextBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
    gap: 10,
  },
  topTextBannerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  topTextBannerIcon: {
    width: 35,
    height: 35,
    borderRadius: 8,
  },
  topTextBannerBody: {
    flex: 1,
    gap: 2,
  },
  topTextBannerTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E3A5F",
  },
  topTextBannerSub: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "400",
  },
  topTextBannerBtn: {
    backgroundColor: "#1565C0",
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  topTextBannerBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
