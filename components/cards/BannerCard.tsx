import React from "react";
import {
  Dimensions,
  ImageBackground,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { COLORS } from "@/constants/Colors";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type BannerCardProps = {
  item: any;
  isInline?: boolean;
};

export const BannerCard = ({ item, isInline = false }: BannerCardProps) => {
  const handleVisitWebsite = async (websiteLink?: string) => {
    if (websiteLink) {
      try {
        const url = websiteLink.startsWith("http")
          ? websiteLink
          : `https://${websiteLink}`;
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        }
      } catch (error) {
        console.log("Error opening website:", error);
      }
    }
  };

  const handleWatchVideo = async (videoUrl?: string) => {
    if (videoUrl) {
      try {
        const url = videoUrl.startsWith("http")
          ? videoUrl
          : `https://${videoUrl}`;
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        }
      } catch (error) {
        console.log("Error opening video:", error);
      }
    }
  };

  return (
    <TouchableOpacity
      key={item.id}
      style={[styles.bannerCard, isInline ? styles.inlineBannerCard : styles.horizontalBannerCard]}
      activeOpacity={0.9}
      onPress={() =>
        router.push({
          pathname: "/stacks/bannerDetails",
          params: { bannerData: JSON.stringify(item) },
        })
      }
    >
      <ImageBackground
        source={{ uri: item.banner_image }}
        style={styles.bannerImage}
        resizeMode="cover"
      >
        <View style={styles.bannerActions}>
          <TouchableOpacity
            style={styles.bannerBtnLeft}
            activeOpacity={0.8}
            onPress={(e) => {
              e.stopPropagation();
              handleVisitWebsite(item.website_link);
            }}
          >
            <Ionicons name="globe-outline" size={16} color="#1565C0" />
            <ThemedText style={styles.bannerBtnLeftText}>Visit Website</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bannerBtnRight}
            activeOpacity={0.8}
            onPress={(e) => {
              e.stopPropagation();
              handleWatchVideo(item.banner_video_url);
            }}
          >
            <Ionicons name="play-circle" size={16} color={COLORS.white} />
            <ThemedText style={styles.bannerBtnRightText}>Watch Video</ThemedText>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

export default BannerCard;

const styles = StyleSheet.create({
  bannerCard: {
    height: SIZES.padding20 * 11,
    borderRadius: 8,
    overflow: "hidden",
  },
  horizontalBannerCard: {
    width: SCREEN_WIDTH - SIZES.padding * 2,
  },
  inlineBannerCard: {
    width: "100%",
    marginBottom: 14,
    marginTop: 8,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  bannerActions: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: COLORS.white,
    paddingVertical: SIZES.padding10,
    paddingHorizontal: SIZES.padding12,
  },
  bannerBtnLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SIZES.padding6,
    paddingVertical: SIZES.padding10,
    paddingHorizontal: SIZES.padding12,
    borderTopLeftRadius: SIZES.radius2,
    borderBottomLeftRadius: SIZES.radius2,
  },
  bannerBtnLeftText: {
    fontSize: SIZES.fontSize12,
    fontWeight: "600",
    color: "#1565C0",
  },
  bannerBtnRight: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SIZES.padding6,
    backgroundColor: "#E53935",
    paddingVertical: SIZES.padding10,
    paddingHorizontal: SIZES.padding12,
    borderTopRightRadius: SIZES.radius2,
    borderBottomRightRadius: SIZES.radius2,
  },
  bannerBtnRightText: {
    fontSize: SIZES.fontSize12,
    fontWeight: "600",
    color: COLORS.white,
  },
});
