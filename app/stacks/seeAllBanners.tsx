import ThemeHeader from "@/components/headers/ThemeHeader";
import { getVerifiedBannerWebsiteLink } from "@/components/post/postUtils";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS } from "@/constants/Colors";
import { addToFavoritesApi, getBannerAdsUrl, removeFromFavoritesApi } from "@/constants/functions";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { addFavoriteItem, getBannersApi, removeFavoriteById } from "@/store/reducers/userReducer";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import {
  BackHandler,
  Dimensions,
  FlatList,
  ImageBackground,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BANNER_WIDTH = SCREEN_WIDTH - SIZES.padding * 2;

export default function SeeAllBannersScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { banners, favorites } = useSelector((state: any) => state.entities.userReducer) || {};
  const safeBanners = Array.isArray(banners) ? banners : [];
  const safeFavorites = Array.isArray(favorites) ? favorites : [];

  const isFavorited = (item: any) =>
    safeFavorites.some((fav: any) => fav.product?.id === item.product?.id);

  const handleToggleFavorite = async (e: any, item: any) => {
    e.stopPropagation();
    const productId = item.product?.id;
    if (!productId) return;
    const favRecord = safeFavorites.find((fav: any) => fav.product?.id === productId);
    if (favRecord) {
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

  useEffect(() => {
    dispatch(getBannersApi(getBannerAdsUrl));
  }, []);

  useEffect(() => {
    const backAction = () => {
      router.back();
      return true;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [router]);

  const timeAgo = (dateStr: string) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 1) return "Just now";
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
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

  const renderBannerItem = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity
      key={item.id}
      style={styles.bannerCard}
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
        <View style={styles.bannerBadge}>
          <ThemedText style={styles.bannerBadgeText}>Banner</ThemedText>
        </View>
        {item.product?.user?.is_verify === 1 && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={12} color={COLORS.white} />
            <ThemedText style={styles.verifiedText}>Verified</ThemedText>
          </View>
        )}
        <TouchableOpacity
          style={styles.heartBtn}
          onPress={(e) => handleToggleFavorite(e, item)}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={isFavorited(item) ? "heart" : "heart-outline"}
            size={22}
            color={isFavorited(item) ? "#E91E63" : "#fff"}
          />
        </TouchableOpacity>
      </ImageBackground>
      <View style={styles.bannerDescriptionContainer}>
        <ThemedText style={styles.bannerDescriptionText} numberOfLines={2}>
          {item.product.description}
        </ThemedText>
        {(item.product?.user?.city?.name || item.product?.user?.state?.name) && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={13} color="#64748B" />
            <ThemedText style={styles.locationText}>
              {[item.product?.user?.city?.name, item.product?.user?.state?.name].filter(Boolean).join(", ")}
            </ThemedText>
          </View>
        )}
        {(item.created_at || item.product?.created_at) ? (
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={11} color="#94A3B8" />
            <ThemedText style={styles.bannerTime}>{timeAgo(item.created_at || item.product?.created_at)}</ThemedText>
          </View>
        ) : null}
      </View>
      <View style={styles.bannerActions}>
        {getVerifiedBannerWebsiteLink(item) ? (
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
        ) : null}
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
    </TouchableOpacity>
  ), [safeFavorites]);

  return (
    <ThemedView style={[styles.container]}>
      <ThemeHeader onBackPress={() => router.push("/(tabs)")} title="All Banner Ads" />
      {safeBanners.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="images-outline" size={64} color={COLORS.gray} />
          <ThemedText style={styles.emptyText}>No banners available</ThemedText>
        </View>
      ) : (
        <FlatList
          data={safeBanners}
          renderItem={renderBannerItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  listContainer: {
    padding: SIZES.padding,
    gap: 16,
  },
  bannerCard: {
    width: BANNER_WIDTH,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: COLORS.white,
    elevation: 8,
  },
  bannerImage: {
    width: "100%",
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  heartBtn: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#1565C0",
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  bannerBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.white,
    textTransform: "uppercase",
  },
  verifiedBadge: {
    position: "absolute",
    top: 36,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#22C55E",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.white,
  },
  bannerDescriptionContainer: {
    padding: 12,
    backgroundColor: COLORS.white,
  },
  bannerDescriptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.black,
    lineHeight: 20,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 6,
  },
  bannerTime: {
    fontSize: 10,
    color: "#94A3B8",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  locationText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  bannerActions: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  bannerBtnLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  bannerBtnLeftText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1565C0",
  },
  bannerBtnRight: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#E53935",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  bannerBtnRightText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.white,
  },
  bannerVideoContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: COLORS.black,
  },
  bannerVideo: {
    width: "100%",
    height: "100%",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    fontWeight: "500",
  },
});
