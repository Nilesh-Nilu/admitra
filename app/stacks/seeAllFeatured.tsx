import ThemeHeader from "@/components/headers/ThemeHeader";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS } from "@/constants/Colors";
import { getFeaturedAdsUrl } from "@/constants/functions";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { getFeaturedAdsApi } from "@/store/reducers/userReducer";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { router } from "expo-router";
import { useCallback, useEffect } from "react";
import {
  BackHandler,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - SIZES.padding * 2 - 12) / 2;

export default function SeeAllFeaturedScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { featuredAds } = useSelector((state: any) => state.entities.userReducer) || {};
  const safeFeatured = Array.isArray(featuredAds) ? featuredAds : [];

  useEffect(() => {
    dispatch(getFeaturedAdsApi(getFeaturedAdsUrl));
  }, []);

  useEffect(() => {
    const backAction = () => {
      router.back();
      return true;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [router]);

  const formatPrice = (price: number) => {
    if (price >= 100000) {
      return "₹" + (price / 100000).toFixed(1) + "L";
    } else if (price >= 1000) {
      return "₹" + (price / 1000).toFixed(1) + "K";
    }
    return "₹" + price;
  };

  const renderFeaturedItem = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.featuredCard}
      activeOpacity={0.9}
      onPress={() =>
        router.push({
          pathname: "/stacks/productDetails",
          params: { productData: JSON.stringify(item) },
        })
      }
    >
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: item.images?.[0]?.image_path || item.images?.[0]?.image || item.product_images?.[0],
          }}
          style={styles.featuredImage}
          resizeMode="cover"
        />
        <View style={styles.featuredBadge}>
          <ThemedText style={styles.featuredBadgeText}>⭐</ThemedText>
        </View>
      </View>
      <View style={styles.featuredInfo}>
        <ThemedText style={styles.featuredTitle} numberOfLines={1}>
          {item.name}
        </ThemedText>
        <ThemedText style={styles.featuredPrice}>
          {formatPrice(item.price)}
        </ThemedText>
      </View>
    </TouchableOpacity>
  ), []);

  return (
    <ThemedView style={[styles.container]}>
      <ThemeHeader onBackPress={() => router.back()} title="All Featured Ads" />
        {safeFeatured.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="star-outline" size={64} color={COLORS.gray} />
          <ThemedText style={styles.emptyText}>No featured ads available</ThemedText>
        </View>
      ) : (
        <FlatList
          data={safeFeatured}
          renderItem={renderFeaturedItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
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
    paddingBottom: 100,
  },
  columnWrapper: {
    gap: 12,
    marginBottom: 12,
  },
  featuredCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    position: "relative",
  },
  featuredImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  featuredBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 4,
    elevation: 2,
  },
  featuredBadgeText: {
    fontSize: 12,
  },
  featuredInfo: {
    padding: 10,
  },
  featuredTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  featuredPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1565C0",
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
