import ThemeHeader from "@/components/headers/ThemeHeader";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS } from "@/constants/Colors";
import { addToFavoritesApi, getProductsUrl, removeFromFavoritesApi } from "@/constants/functions";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { addFavoriteItem, getAllProducts, removeFavoriteById } from "@/store/reducers/userReducer";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
import { useDispatch, useSelector } from "react-redux";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - SIZES.padding * 2 - 12) / 2;

export default function SeeAllFreshScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { products, favorites } = useSelector((state: any) => state.entities.userReducer) || {};
  const safeProducts = Array.isArray(products)
    ? products.filter((product: any) => {
        const type = String(product?.product_type || product?.plan_info?.plan_type || "normal").toLowerCase();
        return type === "normal";
      })
    : [];
  const safeFavorites = Array.isArray(favorites) ? favorites : [];

  useEffect(() => {
    if (safeProducts.length === 0) {
      dispatch(getAllProducts(`${getProductsUrl}?per_page=20&page=1`));
    }
  }, []);

  useEffect(() => {
    const backAction = () => {
      router.back();
      return true;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [router]);

  const isFavorited = (item: any) =>
    safeFavorites.some((fav: any) => fav.product?.id === item.id);

  const handleToggleFavorite = async (e: any, item: any) => {
    e.stopPropagation();
    const favRecord = safeFavorites.find((fav: any) => fav.product?.id === item.id);
    if (favRecord) {
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

  const formatPrice = (price: number) => {
    if (price >= 100000) return "₹" + (price / 100000).toFixed(1) + "L";
    if (price >= 1000) return "₹" + (price / 1000).toFixed(1) + "K";
    return "₹" + price;
  };

  const timeAgo = (dateStr: string) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 1) return "Just now";
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  const renderProductItem = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.productCard}
      activeOpacity={0.9}
      onPress={() =>
        router.push({
          pathname: "/stacks/productDetails",
          params: { productData: JSON.stringify(item) },
        })
      }
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{
            uri: item.images?.[0]?.image_path || item.images?.[0]?.image || item.product_images?.[0],
          }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.typeBadge}>
          <ThemedText style={styles.typeBadgeText}>Normal</ThemedText>
        </View>
        {item.approve === "approved" && (
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
            size={18}
            color={isFavorited(item) ? "#E91E63" : "#fff"}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.productInfo}>
        <ThemedText style={styles.productPrice}>
          {formatPrice(item.price)}
        </ThemedText>
        <ThemedText style={styles.productTitle} numberOfLines={1}>
          {item.name}
        </ThemedText>
        <ThemedText numberOfLines={1} style={styles.productLocation}>
            {[item.user?.city?.name || item.city, item.user?.state?.name].filter(Boolean).join(", ")}
          </ThemedText>
        {item.created_at ? (
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={11} color="#94A3B8" />
            <ThemedText style={styles.productTime}>{timeAgo(item.created_at)}</ThemedText>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  ), [safeFavorites]);

  return (
    <ThemedView style={[styles.container]}>
      <ThemeHeader onBackPress={() => router.back()} title="All Normal Ads" />
      {safeProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={64} color={COLORS.gray} />
          <ThemedText style={styles.emptyText}>No products available</ThemedText>
        </View>
      ) : (
        <FlatList
          data={safeProducts}
          renderItem={renderProductItem}
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
  productCard: {
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
  imageWrapper: {
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: 140,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  typeBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#2E7D32",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.white,
  },
  verifiedBadge: {
    position: "absolute",
    top: 34,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: "600",
  },
  heartBtn: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  productInfo: {
    padding: 10,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1565C0",
    marginBottom: 4,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
  },
  productLocation: {
    fontSize: 10,
    color: COLORS.gray,
    fontWeight: "500",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 4,
  },
  productTime: {
    fontSize: 10,
    color: "#94A3B8",
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
