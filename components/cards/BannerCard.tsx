import React from "react";
import { getVerifiedBannerWebsiteLink } from "@/components/post/postUtils";
import {
  Alert,
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
import { addToFavoritesApi, remoteImageSource, removeFromFavoritesApi } from "@/constants/functions";
import { addFavoriteItem, removeFavoriteById } from "@/store/reducers/userReducer";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const timeAgo = (dateStr: string) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return "Just now";
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

type BannerCardProps = {
  item: any;
  isInline?: boolean;
};

export const BannerCard = ({ item, isInline = false }: BannerCardProps) => {
  const dispatch = useDispatch();
  const favorites = useSelector((state: any) => state.entities.userReducer.favorites);
  const safeFavorites = Array.isArray(favorites) ? favorites : [];
  const productId = item?.product?.id;
  const favRecord = safeFavorites.find((fav: any) => fav.product?.id === productId);
  const isFavorited = !!favRecord;

  const handleToggleFavorite = async (e: any) => {
    e.stopPropagation();
    if (!productId) return;

    if (isFavorited) {
      dispatch(removeFavoriteById(favRecord.id));
      try { await removeFromFavoritesApi(favRecord.id); } catch { dispatch(addFavoriteItem(favRecord)); }
    } else {
      const tempRecord = { id: `temp_${productId}`, product: item.product };
      dispatch(addFavoriteItem(tempRecord));
      try {
        const res = await addToFavoritesApi(productId);
        dispatch(removeFavoriteById(`temp_${productId}`));
        if (res?.data) dispatch(addFavoriteItem(res.data));
      } catch { dispatch(removeFavoriteById(`temp_${productId}`)); }
    }
  };

  const handleVisitWebsite = async (websiteLink?: string) => {
    if (!websiteLink) {
      Alert.alert("Coming Soon", "Website link not available");
      return;
    }
    try {
      const url = websiteLink.startsWith("http")
        ? websiteLink
        : `https://${websiteLink}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
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
          params: { bannerId: String(item.id), bannerData: JSON.stringify(item) },
        })
      }
    >
      <ImageBackground
        source={remoteImageSource(item.banner_image)}
        style={styles.bannerImage}
        resizeMode="cover"
      >
        <View style={styles.typeBadge}>
          <ThemedText style={styles.typeBadgeText}>Banner</ThemedText>
        </View>
        {item.product?.user?.is_verify === 1 && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={12} color={COLORS.white} />
            <ThemedText style={styles.verifiedText}>Verified</ThemedText>
          </View>
        )}
        <TouchableOpacity style={styles.heartBtn} onPress={handleToggleFavorite} activeOpacity={0.8}>
          <Ionicons name={isFavorited ? "heart" : "heart-outline"} size={20} color={isFavorited ? "#E91E63" : COLORS.white} />
        </TouchableOpacity>
        {item.product?.name && (
          <View style={styles.bannerTitleRow}>
            <ThemedText style={styles.bannerTitle} numberOfLines={1}>
              {item.product.name}
            </ThemedText>
          </View>
        )}
        <View style={styles.bannerActions}>
          {(item.created_at || item.product?.created_at) && (
            <View style={styles.locationRow}>
              <Ionicons name="time-outline" size={11} color="#94A3B8" />
              <ThemedText style={styles.bannerTime}>{timeAgo(item.created_at || item.product?.created_at)}</ThemedText>
            </View>
          )}
          {(item.product?.user?.city?.name || item.product?.user?.state?.name) && (
            <View style={styles.timeRow}>
              <Ionicons name="location-outline" size={13} color="#64748B" />
              <ThemedText style={styles.locationText} numberOfLines={1}>
                {[item.product?.user?.city?.name, item.product?.user?.state?.name].filter(Boolean).join(", ")}
              </ThemedText>
            </View>
          )}
        </View>
        <View style={styles.btnRow}>
          <TouchableOpacity
              style={styles.bannerBtnLeft}
              activeOpacity={0.8}
              onPress={(e) => {
                e.stopPropagation();
                handleVisitWebsite(getVerifiedBannerWebsiteLink(item));
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
    height: SIZES.padding20 * 17,
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
  verifiedBadge: {
    position: "absolute",
    top: SIZES.padding20*1.8,
    left: SIZES.padding10,
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#22C55E",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.white,
  },
  bannerTitleRow: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingTop: SIZES.padding8,
    paddingHorizontal: SIZES.padding12,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  bannerActions: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingTop: SIZES.padding8,
    paddingHorizontal: SIZES.padding12,
    paddingBottom: SIZES.padding4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  bannerTime: {
    fontSize: 11,
    color: "#94A3B8",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
    marginRight: 8,
  },
  locationText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "600",
  },
  btnRow: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    overflow: "hidden",
  },
  bannerBtnLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SIZES.padding6,
    paddingVertical: SIZES.padding8,
    paddingHorizontal: SIZES.padding12,
    borderTopLeftRadius: SIZES.radius2,
    borderBottomLeftRadius: SIZES.radius2,
  },
  bannerBtnLeftText: {
    fontSize: SIZES.fontSize10,
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
    paddingVertical: SIZES.padding8,
    paddingHorizontal: SIZES.padding12,
    borderTopRightRadius: SIZES.radius2,
    borderBottomRightRadius: SIZES.radius2,
  },
  bannerBtnRightText: {
    fontSize: SIZES.fontSize10,
    fontWeight: "600",
    color: COLORS.white,
  },
});
