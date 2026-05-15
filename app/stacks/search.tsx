import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS } from "@/constants/Colors";
import { getCategoriesUrl, getSubCategoriesUrl } from "@/constants/functions";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { getCategoriesApi, getSubCategoriesApi } from "@/store/reducers/userReducer";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  BackHandler
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - SIZES.padding * 2 - 12) / 2;

// Filter options
const SORT_OPTIONS = ["Most Recent", "Price: Low to High", "Price: High to Low"];


export default function SearchScreen() {

  const router = useRouter();
  const params = useLocalSearchParams();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { products, categories } = useSelector((state: any) => state.entities.userReducer) || {};

  const safeProducts = products || [];
  const safeCategories = categories || [];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    params.categoryId ? parseInt(params.categoryId as string) : null
  );
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [selectedSort, setSelectedSort] = useState("Most Recent");
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState(safeProducts);


  useEffect(() => {
    if (params.categoryId) {
      setSelectedCategory(parseInt(params.categoryId as string));
      dispatch(getSubCategoriesApi(`${getSubCategoriesUrl}/${params.categoryId}`));
    } else {
      dispatch(getSubCategoriesApi(`${getSubCategoriesUrl}`));
    }
  }, [params.category, params.categoryId]);
  useEffect(() => {
    const backAction = () => {
      dispatch(getCategoriesApi(getCategoriesUrl));
      dispatch(getSubCategoriesApi(`${getSubCategoriesUrl}`));
      router.back();
      return true;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [router]);

  // Auto-filter when products, category, or search query changes (but NOT price range - that's manual)
  useEffect(() => {
    if (safeProducts.length > 0) {
      filterResults();
    }
  }, [safeProducts, selectedCategory, searchQuery, selectedSort]);

  const formatPrice = (price: number, isMonthly?: boolean) => {
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L${isMonthly ? "/mo" : ""}`;
    }
    return `₹${price.toLocaleString("en-IN")}${isMonthly ? "/mo" : ""}`;
  };

  // Core filtering logic (doesn't close modal)
  const filterResults = () => {
    if (safeProducts.length === 0) {
      setResults([]);
      return;
    }

    let filtered = [...safeProducts];

    // Filter by category
    if (selectedCategory !== null) {
      filtered = filtered.filter(item => item.category_id === selectedCategory);
    }

    // Filter by price range
    if (priceRange.min) {
      filtered = filtered.filter(item => item.price >= parseInt(priceRange.min));
    }

    if (priceRange.max) {
      filtered = filtered.filter(item => item.price <= parseInt(priceRange.max));
    }

    // Filter by search query (search in name and description)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.name?.toLowerCase().includes(query)
      );
    }

    // Sort results
    switch (selectedSort) {
      case "Price: Low to High":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "Price: High to Low":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "Most Recent":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      default:
        break;
    }

    setResults(filtered);
  };

  // Called when "Apply Filters" button is pressed - applies filters AND closes modal
  const applyFilters = () => {
    filterResults();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setPriceRange({ min: "", max: "" });
    setSelectedSort("Most Recent");
    setSearchQuery("");
    setResults(safeProducts);
  };

  useFocusEffect(
    useCallback(() => {
      return () => {
        clearFilters();
      };
    }, [])
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
        <Image
          source={{ uri: item.images?.[0]?.image }}
          style={styles.listingImage}
        />
        {item.approve === "approved" && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={12} color={COLORS.white} />
          </View>
        )}
        {item.category?.name && (
          <View style={styles.categoryBadge}>
            <ThemedText style={styles.categoryBadgeText}>{item.category.name}</ThemedText>
          </View>
        )}
      </View>
      <View style={styles.listingInfo}>
        <ThemedText style={styles.listingPrice}>
          {formatPrice(item.price)}
        </ThemedText>
        <ThemedText style={styles.listingTitle} numberOfLines={2}>
          {item.name}
        </ThemedText>
        {item.description && (
          <ThemedText style={styles.listingDescription} numberOfLines={1}>
            {item.description}
          </ThemedText>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={[styles.filterModal]}>
        <View style={styles.filterHeader}>
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <Ionicons name="close" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <ThemedText style={styles.filterTitle}>Filters</ThemedText>
          <TouchableOpacity onPress={clearFilters}>
            <ThemedText style={styles.clearText}>Clear</ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.filterContent}>
          {/* Category Filter */}
          <View style={styles.filterSection}>
            <ThemedText style={styles.filterSectionTitle}>Category</ThemedText>
            <View style={styles.filterOptions}>
              {/* All Option */}
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedCategory === null && styles.filterChipActive,
                ]}
                onPress={() => setSelectedCategory(null)}
              >
                <ThemedText
                  style={[
                    styles.filterChipText,
                    selectedCategory === null && styles.filterChipTextActive,
                  ]}
                >
                  All
                </ThemedText>
              </TouchableOpacity>
              {safeCategories.map((cat: any) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.filterChip,
                    selectedCategory === cat.id && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <ThemedText
                    style={[
                      styles.filterChipText,
                      selectedCategory === cat.id && styles.filterChipTextActive,
                    ]}
                  >
                    {cat.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>


          {/* Price Range */}
          <View style={styles.filterSection}>
            <ThemedText style={styles.filterSectionTitle}>Price Range</ThemedText>
            <View style={styles.priceInputs}>
              <TextInput
                style={styles.priceInput}
                placeholder="Min"
                placeholderTextColor={COLORS.gray}
                keyboardType="numeric"
                value={priceRange.min}
                onChangeText={(text) => setPriceRange({ ...priceRange, min: text })}
              />
              <ThemedText style={styles.priceSeparator}>to</ThemedText>
              <TextInput
                style={styles.priceInput}
                placeholder="Max"
                placeholderTextColor={COLORS.gray}
                keyboardType="numeric"
                value={priceRange.max}
                onChangeText={(text) => setPriceRange({ ...priceRange, max: text })}
              />
            </View>
          </View>

          {/* Sort By */}
          <View style={styles.filterSection}>
            <ThemedText style={styles.filterSectionTitle}>Sort By</ThemedText>
            <View style={styles.filterOptions}>
              {SORT_OPTIONS.map((sort) => (
                <TouchableOpacity
                  key={sort}
                  style={[
                    styles.filterChip,
                    selectedSort === sort && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedSort(sort)}
                >
                  <ThemedText
                    style={[
                      styles.filterChipText,
                      selectedSort === sort && styles.filterChipTextActive,
                    ]}
                  >
                    {sort}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={[styles.filterFooter, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
            <ThemedText style={styles.applyButtonText}>Apply Filters</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Search Header */}
      <View style={[styles.searchHeader]}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={COLORS.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for anything..."
            placeholderTextColor={COLORS.gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={applyFilters}
            returnKeyType="search"
            autoFocus={true}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={COLORS.gray} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <ThemedText style={styles.resultsCount}>{results?.length || 0} results found</ThemedText>
        <TouchableOpacity style={styles.sortBtn}>
          <ThemedText style={styles.sortText}>{selectedSort}</ThemedText>
          <Ionicons name="chevron-down" size={16} color={COLORS.gray} />
        </TouchableOpacity>
      </View>

      {/* Results Grid */}
      {results && results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderListingCard}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.listingsRow}
          contentContainerStyle={styles.listingsContainer}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={64} color={COLORS.gray} />
          <ThemedText style={styles.emptyTitle}>No Results Found</ThemedText>
          <ThemedText style={styles.emptySubtitle}>
            Try adjusting your filters or search terms
          </ThemedText>
          <TouchableOpacity style={styles.clearFiltersBtn} onPress={clearFilters}>
            <ThemedText style={styles.clearFiltersBtnText}>Clear Filters</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {renderFilterModal()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  /* Search Header */
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SIZES.padding,
    paddingBottom: 16,
    gap: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },

  /* Active Filters */
  activeFilters: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  activeFiltersContent: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 10,
    alignItems: "center",
  },
  activeFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary + "15",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    gap: 4,
  },
  activeFilterText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primary,
    lineHeight: 16,
  },

  /* Results Header */
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
  },
  resultsCount: {
    fontSize: 14,
    color: COLORS.gray,
  },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sortText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: "500",
  },

  /* Listings */
  listingsContainer: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 100,
  },
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
  favoriteBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  verifiedBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: COLORS.success,
    padding: 6,
    borderRadius: 6,
  },
  categoryBadge: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.white,
  },
  listingInfo: {
    padding: 12,
    gap: 4,
  },
  listingPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
  },
  listingTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    lineHeight: 18,
  },
  listingDescription: {
    fontSize: 11,
    color: COLORS.gray,
    lineHeight: 14,
  },
  listingMeta: {
    marginTop: 4,
  },
  listingLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  listingLocationText: {
    fontSize: 11,
    color: COLORS.gray,
  },

  /* Empty State */
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SIZES.padding * 2,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: "center",
    marginTop: 8,
  },
  clearFiltersBtn: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  clearFiltersBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
  },

  /* Filter Modal */
  filterModal: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SIZES.padding,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  clearText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  filterContent: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
  },
  filterSection: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: COLORS.text,
  },
  filterChipTextActive: {
    color: COLORS.white,
    fontWeight: "600",
  },
  priceInputs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  priceInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  priceSeparator: {
    fontSize: 14,
    color: COLORS.gray,
  },
  filterFooter: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
  },
});
