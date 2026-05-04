import ThemeHeader from "@/components/headers/ThemeHeader";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS } from "@/constants/Colors";
import { getApprovedProductsUrl } from "@/constants/functions";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { getApprovedProductsApi } from "@/store/reducers/userReducer";
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
  const { products } = useSelector((state: any) => state.entities.userReducer) || {};
  const safeProducts = Array.isArray(products) ? products : [];
  useEffect(() => {
    dispatch(getApprovedProductsApi(getApprovedProductsUrl));
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
        {item.approve === "approved" && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={12} color={COLORS.white} />
            <ThemedText style={styles.verifiedText}>Verified</ThemedText>
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <ThemedText style={styles.productPrice}>
          {formatPrice(item.price)}
        </ThemedText>
        <ThemedText style={styles.productTitle} numberOfLines={1}>
          {item.name}
        </ThemedText>
      </View>
    </TouchableOpacity>
  ), []);

  return (
    <ThemedView style={[styles.container]}>
      <ThemeHeader onBackPress={() => router.back()} title="Fresh Recommendations" />
      
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
          showsVerticalScrollIndicator={false}
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
  verifiedBadge: {
    position: "absolute",
    top: 8,
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
