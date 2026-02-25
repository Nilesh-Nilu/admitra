import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS } from "@/constants/Colors";
import { getApprovedProductsUrl, getCategoriesUrl, getCitiesUrl, getProductsUrl, getStatesUrl, getSubCategoriesUrl } from "@/constants/functions";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { setClearData } from "@/store/reducers/paymentReducer";
import { getApprovedProductsApi, getCategoriesApi, getCitiesApi, getProductsApi, getStatesApi, getSubCategoriesApi } from "@/store/reducers/userReducer";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - SIZES.padding * 2 - 12) / 2;

// Shimmer effect component
const ShimmerBlock = ({ style, animatedValue }: { style: any; animatedValue: Animated.Value }) => {
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View style={[style, { overflow: "hidden", backgroundColor: COLORS.border }]}>
      <Animated.View
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(255,255,255,0.5)",
          transform: [{ translateX }],
        }}
      />
    </View>
  );
};

// User View Shimmer
const UserShimmerLoader = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <View>
      {/* Search Bar Shimmer */}
      <ShimmerBlock
        style={{ height: 50, borderRadius: 12, marginBottom: 20 }}
        animatedValue={animatedValue}
      />

      {/* Categories Shimmer */}
      <View style={{ marginBottom: 24 }}>
        <ShimmerBlock
          style={{ width: 150, height: 20, borderRadius: 10, marginBottom: 16 }}
          animatedValue={animatedValue}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[1, 2, 3, 4, 5].map((item) => (
            <View key={item} style={{ marginRight: 12, alignItems: "center" }}>
              <ShimmerBlock
                style={{ width: 60, height: 60, borderRadius: 30 }}
                animatedValue={animatedValue}
              />
              <ShimmerBlock
                style={{ width: 50, height: 12, borderRadius: 6, marginTop: 8 }}
                animatedValue={animatedValue}
              />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Listings Shimmer */}
      <View style={{ marginBottom: 24 }}>
        <ShimmerBlock
          style={{ width: 180, height: 20, borderRadius: 10, marginBottom: 16 }}
          animatedValue={animatedValue}
        />
        <View style={{ flexDirection: "row", flexWrap: "wrap",justifyContent: "space-between" }}>
          {[1, 2, 3, 4].map((item) => (
            <View
              key={item}
              style={{
                width: CARD_WIDTH,
                backgroundColor: COLORS.white,
                borderRadius: 16,
                padding: 10,
              }}
            >
              <ShimmerBlock
                style={{ width: "100%", height: 120, borderRadius: 12 }}
                animatedValue={animatedValue}
              />
              <ShimmerBlock
                style={{ width: "60%", height: 18, borderRadius: 9, marginTop: 12 }}
                animatedValue={animatedValue}
              />
              <ShimmerBlock
                style={{ width: "90%", height: 14, borderRadius: 7, marginTop: 8 }}
                animatedValue={animatedValue}
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { loader, cities, categories, products } = useSelector((state: any) => state.entities.userReducer) || {};
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  // Ensure arrays are defined
  const safeProducts = products || [];
  const safeCategories = categories || [];
  const safeCities = cities || [];


  // Filter products based on selected category
  const filteredProducts = selectedCategory
    ? safeProducts.filter((product: any) => product.category_id === selectedCategory)
    : safeProducts

  const handleCategoryPress = (categoryId: number) => {
    setSelectedCategory(categoryId);
    router.push({
      pathname: "/stacks/categories",
      params: { selectedCategory: categoryId.toString() },
    });
  };

  useEffect(() => {
    dispatch(getCategoriesApi(getCategoriesUrl));
    dispatch(getSubCategoriesApi(`${getSubCategoriesUrl}`));
    dispatch(getProductsApi(getProductsUrl));
    dispatch(getStatesApi(getStatesUrl));
    dispatch(getCitiesApi(getCitiesUrl));
    dispatch(setClearData(null));
    dispatch(getApprovedProductsApi(getApprovedProductsUrl)); // keeps my listings in sync
  }, []);

  const formatPrice = (price: number, isMonthly?: boolean) => {
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L${isMonthly ? "/mo" : ""}`;
    }
    return `₹${price.toLocaleString("en-IN")}${isMonthly ? "/mo" : ""}`;
  };

  const renderHeader = () => (
    <View style={[styles.header]}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image source={require("@/assets/images/splashImage.png")} style={styles.logo} />
      </View>

      {/* Location Selector */}
      <TouchableOpacity style={styles.locationSelector}>
        <View style={styles.locationIconBg}>
          <Ionicons name="location" size={18} color={COLORS.white} />
        </View>
        <View style={styles.locationText}>
          <ThemedText style={styles.locationLabel}>Deliver to</ThemedText>
          <View style={styles.locationRow}>
            <ThemedText style={styles.locationCity} numberOfLines={1}>
              {safeCities[0]?.name || "Select Location"}
            </ThemedText>
            <Ionicons name="chevron-down" size={14} color={COLORS.primary} />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => (
    <TouchableOpacity
      style={styles.searchContainer}
      onPress={() => router.push("/stacks/search")}
      activeOpacity={0.8}
    >
      <Ionicons name="search" size={20} color={COLORS.gray} />
      <ThemedText style={styles.searchPlaceholder}>
        Search cars, mobiles, properties...
      </ThemedText>
    </TouchableOpacity>
  );

  const renderCategories = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Browse Categories</ThemedText>
        <View style={styles.sectionHeaderRight}>
          {selectedCategory && (
            <TouchableOpacity onPress={() => setSelectedCategory(null)}>
              <ThemedText style={styles.clearFilter}>Clear Filter</ThemedText>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => router.push("/stacks/categories")}
            style={styles.seeAllBtn}
          >
            <ThemedText style={styles.seeAllText}>See All</ThemedText>
            <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        {/* All Categories Option */}
        <TouchableOpacity
          style={[
            styles.categoryChip,
            selectedCategory === null && styles.categoryChipSelected,
          ]}
          activeOpacity={0.7}
          onPress={() => setSelectedCategory(null)}
        >
          <View style={[
            styles.categoryChipIcon,
            selectedCategory === null && styles.categoryChipIconSelected,
          ]}>
            <Ionicons
              name="grid"
              size={20}
              color={selectedCategory === null ? COLORS.white : COLORS.primary}
            />
          </View>
          <ThemedText style={[
            styles.categoryChipText,
            selectedCategory === null && styles.categoryChipTextSelected,
          ]}>
            All
          </ThemedText>
        </TouchableOpacity>

        {safeCategories.map((category: any) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.categoryChipSelected,
            ]}
            activeOpacity={0.7}
            onPress={() => handleCategoryPress(category.id)}
          >
            <Image
              source={{ uri: category.image }}
              style={[
                styles.categoryChipImage,
                selectedCategory === category.id && styles.categoryChipImageSelected,
              ]}
            />
            <ThemedText style={[
              styles.categoryChipText,
              selectedCategory === category.id && styles.categoryChipTextSelected,
            ]}>
              {category.name}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderListingCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.listingCard}
      activeOpacity={0.9}
      onPress={() => router.push({
        pathname: "/stacks/productDetails",
        params: { productData: JSON.stringify(item) }
      })}
    >
      <View style={styles.listingImageContainer}>
        <Image source={{ uri: item.images[0].image }} style={styles.listingImage} />
        {item.approve === "approved" && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={12} color={COLORS.white} />
            <ThemedText style={styles.verifiedText}>Verified</ThemedText>
          </View>
        )}
      </View>
      <View style={styles.listingInfo}>
        <ThemedText style={styles.listingPrice}>
          {formatPrice(item.price, item.isMonthly)}
        </ThemedText>
        <ThemedText style={styles.listingTitle} numberOfLines={2}>
          {item.name}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  const getSelectedCategoryName = () => {
    if (!selectedCategory) return null;
    const category = safeCategories.find((c: any) => c.id === selectedCategory);
    return category?.name || null;
  };

  const renderFeaturedListings = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <ThemedText style={styles.sectionTitle}>
            {selectedCategory ? getSelectedCategoryName() : "Fresh Recommendations"}
          </ThemedText>
          {selectedCategory && (
            <View style={styles.filterBadge}>
              <ThemedText style={styles.filterBadgeText}>
                {filteredProducts.length} items
              </ThemedText>
            </View>
          )}
        </View>
        {filteredProducts.length > 4 && (
          <TouchableOpacity
            onPress={() => router.push({
              pathname: "/stacks/search",
              params: selectedCategory ? { categoryId: selectedCategory } : {}
            })}
            style={styles.seeAllBtn}
          >
            <ThemedText style={styles.seeAllText}>See All</ThemedText>
            <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>
      {filteredProducts.length > 0 ? (
        <FlatList
          data={filteredProducts.slice(0, 4)}
          renderItem={renderListingCard}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.listingsRow}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color={COLORS.gray} />
          <ThemedText style={styles.emptyStateTitle}>No items found</ThemedText>
          <ThemedText style={styles.emptyStateSubtitle}>
            No products available in this category
          </ThemedText>
          <TouchableOpacity
            style={styles.emptyStateButton}
            onPress={() => setSelectedCategory(null)}
          >
            <ThemedText style={styles.emptyStateButtonText}>View All Products</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {loader ? (
          <UserShimmerLoader />
        ) : (
          <>
            {renderSearchBar()}
            {renderCategories()}
            {renderFeaturedListings()}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SIZES.padding,
  },

  /* Header */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 8,
  },
  logoContainer: {
    flex: 1,
  },
  logo: {
    width: 50,
    height: 40,
    resizeMode: "contain",
  },
  locationSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  locationIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  locationText: {
    gap: 2,
  },
  locationLabel: {
    fontSize: 11,
    color: COLORS.gray,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationCity: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    maxWidth: 100,
  },

  /* Search */
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginBottom: 20,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
    color: COLORS.gray,
  },
  searchFilter: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primary + "10",
    justifyContent: "center",
    alignItems: "center",
  },

  /* Quick Actions */
  quickActions: {
    marginBottom: 24,
  },
  sellBanner: {
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  sellBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  sellBannerText: {
    flex: 1,
  },
  sellBannerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 4,
  },
  sellBannerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },
  sellButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  sellButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
  },

  /* Sections */
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  clearFilter: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.error,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  filterBadge: {
    backgroundColor: COLORS.primary + "15",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },

  /* Categories */
  categoriesScroll: {
    paddingRight: 16,
    gap: 12,
  },
  categoryChip: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    minWidth: 80,
  },
  categoryChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  categoryChipIconSelected: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  categoryChipImage: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  categoryChipImageSelected: {
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },
  categoryChipTextSelected: {
    color: COLORS.white,
  },

  /* Empty State */
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: "center",
  },
  emptyStateButton: {
    marginTop: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
  },

  /* Listings */
  listingsRow: {
    gap: 12,
    marginBottom: 12,
  },
  listingCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  listingImageContainer: {
    width: "100%",
    height: CARD_WIDTH * 0.85,
    position: "relative",
  },
  listingImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  verifiedBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.white,
  },
  listingInfo: {
    padding: 12,
    gap: 6,
  },
  listingPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
  },
  listingTitle: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
  },

});
