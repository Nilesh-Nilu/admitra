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
import { useDispatch, useSelector } from "react-redux";
import { ThemedText } from "@/components/ThemedText";
import { COLORS } from "@/constants/Colors";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { addToFavoritesApi, removeFromFavoritesApi } from "@/constants/functions";
import { addFavoriteItem, removeFavoriteById } from "@/store/reducers/userReducer";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type BannerCardProps = {
  item: any;
  isInline?: boolean;
};

export const BannerCard = ({ item, isInline = false }: BannerCardProps) => {
  const dispatch = useDispatch();
  const favorites = useSelector((state: any) => state.entities.userReducer.favorites) || [];
  const favRecord = favorites.find((fav: any) => fav.product?.id === item.id);
  const isFavorited = !!favRecord;

  const handleToggleFavorite = async (e: any) => {
    e.stopPropagation();
    if (isFavorited) {
      dispatch(removeFavoriteById(favRecord.id));
      try { await removeFromFavoritesApi(favRecord.id); } catch { dispatch(addFavoriteItem(favRecord)); }
    } else {
      const tempRecord = { id: `temp_${item.id}`, product: item };
      dispatch(addFavoriteItem(tempRecord));
      try {
        const res = await addToFavoritesApi(item.id);
        dispatch(removeFavoriteById(`temp_${item.id}`));
        if (res?.data) dispatch(addFavoriteItem(res.data));
      } catch { dispatch(removeFavoriteById(`temp_${item.id}`)); }
    }
  };

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
        <View style={styles.typeBadge}>
          <ThemedText style={styles.typeBadgeText}>Banner</ThemedText>
        </View>
        <TouchableOpacity style={styles.heartBtn} onPress={handleToggleFavorite} activeOpacity={0.8}>
          <Ionicons name={isFavorited ? "heart" : "heart-outline"} size={20} color={isFavorited ? "#E91E63" : COLORS.white} />
        </TouchableOpacity>
        <View style={styles.bannerActions}>
          {(item.product?.user?.city?.name || item.product?.user?.state?.name) && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={13} color="#64748B" />
              <ThemedText style={styles.locationText} numberOfLines={1}>
                {[item.product?.user?.city?.name, item.product?.user?.state?.name].filter(Boolean).join(", ")}
              </ThemedText>
            </View>
          )}
          <View style={styles.btnRow}>
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
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

export default BannerCard;

const styles = StyleSheet.create({
  bannerCard: {
    height: SIZES.padding20 * 15,
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
  typeBadge: {
    position: "absolute",
    top: SIZES.padding10,
    left: SIZES.padding10,
    zIndex: 2,
    backgroundColor: "#1565C0",
    paddingHorizontal: SIZES.padding8,
    paddingVertical: SIZES.padding2,
    borderRadius: SIZES.radius2,
  },
  typeBadgeText: {
    fontSize: SIZES.fontSize10 - 1,
    fontWeight: "700",
    color: COLORS.white,
  },
  heartBtn: {
    position: "absolute",
    top: SIZES.padding10,
    right: SIZES.padding10,
    zIndex: 2,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    padding: SIZES.padding6,
  },
  bannerActions: {
    flexDirection: "column",
    width: "100%",
    backgroundColor: COLORS.white,
    paddingTop: SIZES.padding8,
    paddingHorizontal: SIZES.padding12,
    paddingBottom: SIZES.padding10,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
    flex: 1,
  },
  btnRow: {
    flexDirection: "row",
    width: "100%",
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
