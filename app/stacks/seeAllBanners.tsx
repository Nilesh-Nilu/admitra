import ThemeHeader from "@/components/headers/ThemeHeader";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS } from "@/constants/Colors";
import { getBannerAdsUrl } from "@/constants/functions";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { getBannersApi } from "@/store/reducers/userReducer";
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
  const { banners } = useSelector((state: any) => state.entities.userReducer) || {};
  const safeBanners = Array.isArray(banners) ? banners : [];

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
      </ImageBackground>
      <View style={styles.bannerDescriptionContainer}>
        <ThemedText style={styles.bannerDescriptionText} numberOfLines={2}>
          {item.product.description}
        </ThemedText>
      </View>
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
    </TouchableOpacity>
  ), []);

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
    height: 140,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
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
