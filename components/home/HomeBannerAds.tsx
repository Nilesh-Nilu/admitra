import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { BannerCard } from "@/components/cards/BannerCard";
import { COLORS } from "@/constants/Colors";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BANNER_WIDTH = SCREEN_WIDTH- SIZES.padding * 2;;
const ICON_SIZE_SMALL = 12;

type HomeBannerAdsProps = {
  banners: any[];
  promotionBanners: any[];
  onPressSeeAll: () => void;
};

export const HomeBannerAds = ({ promotionBanners, banners, onPressSeeAll }: HomeBannerAdsProps) => {
  const [bannerIndex, setBannerIndex] = useState(0);
  const bannerScrollRef = useRef<ScrollView>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const safeBanners = Array.isArray(banners) ? banners : [];

  // Banner auto-play
  useEffect(() => {
    if (safeBanners.length <= 1) return;

    const startAutoPlay = () => {
      autoPlayRef.current = setInterval(() => {
        setBannerIndex((prev) => {
          const nextIndex = (prev + 1) % safeBanners.length;
          bannerScrollRef.current?.scrollTo({
            x: nextIndex * BANNER_WIDTH,
            animated: true,
          });
          return nextIndex;
        });
      }, 3000);
    };

    const stopAutoPlay = () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    };

    startAutoPlay();
    return stopAutoPlay;
  }, [safeBanners.length]);

  const handleBannerTouchStart = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  };

  const handleBannerTouchEnd = () => {
    if (safeBanners.length <= 1) return;
    autoPlayRef.current = setInterval(() => {
      setBannerIndex((prev) => {
        const nextIndex = (prev + 1) % safeBanners.length;
        bannerScrollRef.current?.scrollTo({
          x: nextIndex * BANNER_WIDTH,
          animated: true,
        });
        return nextIndex;
      });
    }, 3000);
  };

  if (safeBanners.length === 0) return null;

  return (
    <View style={styles.section}>
      {/* ── Top Text Banner ── */}
      <>
        {promotionBanners?.map((banner) => (
          <View key={banner.id} style={styles.topTextBanner}>
            <View style={styles.topTextBannerLeft}>
              {banner.icon ? (
                <Image
                  source={{ uri: banner.icon }}
                  style={{ width: 32, height: 32, marginRight: 8, borderRadius: 4 }}
                />
              ) : (
                <Ionicons name="megaphone-outline" size={22} color="#1565C0" style={{ marginRight: 8 }} />
              )}
              <ThemedText style={styles.topTextBannerLeftText}>
                {banner.business_text}
              </ThemedText>
            </View>

            <View style={styles.topTextBannerHighlight}>
              <ThemedText style={styles.topTextBannerHighlightText}>
                {banner.offer_text}
              </ThemedText>
            </View>

            <View style={styles.topTextBannerRight}>
              {banner.features?.map((feature: any, index: number) => (
                <View key={index} style={styles.topTextBannerRightItem}>
                  <Ionicons name="checkmark-circle" size={13} color="#1565C0" />
                  <ThemedText style={styles.topTextBannerRightText}>{feature}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        ))}
      </>

      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Banner Ads</ThemedText>
        <TouchableOpacity style={styles.seeAllBtn} onPress={onPressSeeAll}>
          <ThemedText style={styles.seeAllText}>See All</ThemedText>
          <Ionicons name="arrow-forward" size={15} color="#1565C0" />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={bannerScrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / BANNER_WIDTH);
          setBannerIndex(idx);
        }}
        scrollEventThrottle={16}
        onTouchStart={handleBannerTouchStart}
        onTouchEnd={handleBannerTouchEnd}
        onScrollBeginDrag={handleBannerTouchStart}
        onScrollEndDrag={handleBannerTouchEnd}
      >
        {safeBanners.map((b: any) => (
          <BannerCard key={b.id} item={b} />
        ))}
      </ScrollView>

      {safeBanners.length > 1 && (
        <View style={styles.bannerDots}>
          {safeBanners.map((_: any, i: number) => (
            <View
              key={i}
              style={[
                styles.bannerDot,
                i === bannerIndex && styles.bannerDotActive,
              ]}
            />
          ))}
        </View>
      )}

      {/* ── Bottom Text Banner ── */}
      <View style={styles.bottomTextBanner}>
        <View style={styles.bottomTextBannerLeft}>
          <ThemedText style={styles.bottomTextBannerStar}>⭐</ThemedText>
          <ThemedText style={styles.bottomTextBannerLeftText}>
            {'सेलर से डायरेक्ट कॉल करने के लिए\nफीचर्ड एड पर एड डालें'}
          </ThemedText>
          <View style={styles.bottomTextBannerHighlight}>
            <ThemedText style={styles.bottomTextBannerHighlightText}>{'सिर्फ ₹19 में 28 दिन'}</ThemedText>
          </View>
        </View>
        <View style={styles.bottomTextBannerRight}>
          <View style={styles.bottomTextBannerRightItem}>
            <Ionicons name="checkmark-circle" size={13} color="#F9A825" />
            <ThemedText style={styles.bottomTextBannerRightText}>टॉप प्लेसमेंट मिलेगा</ThemedText>
          </View>
          <View style={styles.bottomTextBannerRightItem}>
            <Ionicons name="checkmark-circle" size={13} color="#F9A825" />
            <ThemedText style={styles.bottomTextBannerRightText}>ज्यादा विजिबिलिटी</ThemedText>
          </View>
          <View style={styles.bottomTextBannerRightItem}>
            <Ionicons name="checkmark-circle" size={13} color="#F9A825" />
            <ThemedText style={styles.bottomTextBannerRightText}>बेस्ट कॉल की सुविधा</ThemedText>
          </View>
          <View style={styles.bottomTextBannerRightItem}>
            <Ionicons name="checkmark-circle" size={13} color="#F9A825" />
            <ThemedText style={styles.bottomTextBannerRightText}>सेलर से डायरेक्ट कॉल</ThemedText>
          </View>
        </View>
      </View>
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
  sectionTitle: {
    fontSize: SIZES.fontSize16,
    fontWeight: "700",
    color: COLORS.text,
  },
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
  bannerDots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SIZES.padding4,
    marginTop: SIZES.padding10,
  },
  bannerDot: {
    width: SIZES.padding4,
    height: SIZES.padding4,
    borderRadius: SIZES.padding4 / 2,
    backgroundColor: "#D0D0D0",
  },
  bannerDotActive: {
    backgroundColor: "#1565C0",
    width: ICON_SIZE_SMALL + 4,
    borderRadius: SIZES.padding4 / 2,
  },
  topTextBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F0FE",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#BBDEFB",
  },
  topTextBannerLeft: {
    flex: 1.4,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  topTextBannerLeftText: {
    fontSize: 10,
    color: "#0D47A1",
    fontWeight: "600",
    // lineHeight: 16,
    flex: 1,
  },
  topTextBannerHighlight: {
    backgroundColor: "#FDD835",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  topTextBannerHighlightText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#212121",
    textAlign: "center",
    // lineHeight: 15,
  },
  topTextBannerRight: {
    flex: 1.1,
    // gap: 2,
  },
  topTextBannerRightItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  topTextBannerRightText: {
    fontSize: 9,
    color: "#1565C0",
    fontWeight: "500",
    flexShrink: 1,
  },
  bottomTextBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFDE7",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#FFE082",
  },
  bottomTextBannerStar: {
    fontSize: 22,
    marginRight: 6,
  },
  bottomTextBannerLeft: {
    flex: 1.4,
    gap: 6,
  },
  bottomTextBannerLeftText: {
    fontSize: 10,
    color: "#5D4037",
    fontWeight: "600",
    // lineHeight: 16,
  },
  bottomTextBannerHighlight: {
    backgroundColor: "#FDD835",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  bottomTextBannerHighlightText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#212121",
  },
  bottomTextBannerRight: {
    flex: 1.1,
    gap: 4,
  },
  bottomTextBannerRightItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  bottomTextBannerRightText: {
    fontSize: 9,
    color: "#5D4037",
    fontWeight: "500",
    flexShrink: 1,
  },
});
