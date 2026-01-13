import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS } from "@/constants/Colors";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - SIZES.padding * 2 - 12) / 2;

// Filter options
const CATEGORIES = ["All", "Vehicles", "Property", "Electronics", "Furniture", "Fashion", "Jobs", "Services"];
const CONDITIONS = ["All", "New", "Like New", "Used", "Refurbished"];
const SORT_OPTIONS = ["Most Recent", "Price: Low to High", "Price: High to Low", "Nearest First"];

// Mock search results
const SEARCH_RESULTS = [
  {
    id: 1,
    title: "iPhone 14 Pro Max - Like New",
    price: 85000,
    location: "Mumbai, Maharashtra",
    image: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400",
    condition: "Like New",
    verified: true,
    postedAt: "2 hours ago",
    category: "Electronics",
  },
  {
    id: 2,
    title: "2BHK Apartment for Rent",
    price: 25000,
    location: "Bangalore, Karnataka",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
    condition: "New",
    verified: true,
    postedAt: "5 hours ago",
    isMonthly: true,
    category: "Property",
  },
  {
    id: 3,
    title: "Honda City 2020 - Petrol",
    price: 950000,
    location: "Delhi, NCR",
    image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400",
    condition: "Used",
    verified: false,
    postedAt: "1 day ago",
    category: "Vehicles",
  },
  {
    id: 4,
    title: "MacBook Pro M2 - 512GB",
    price: 125000,
    location: "Pune, Maharashtra",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
    condition: "Like New",
    verified: true,
    postedAt: "3 hours ago",
    category: "Electronics",
  },
  {
    id: 5,
    title: "Sofa Set - 5 Seater",
    price: 35000,
    location: "Chennai, Tamil Nadu",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
    condition: "Used",
    verified: false,
    postedAt: "6 hours ago",
    category: "Furniture",
  },
  {
    id: 6,
    title: "Samsung 55\" Smart TV",
    price: 45000,
    location: "Hyderabad, Telangana",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400",
    condition: "New",
    verified: true,
    postedAt: "12 hours ago",
    category: "Electronics",
  },
];

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(params.category as string || "All");
  const [selectedCondition, setSelectedCondition] = useState("All");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [selectedSort, setSelectedSort] = useState("Most Recent");
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState(SEARCH_RESULTS);

  useEffect(() => {
    if (params.category) {
      setSelectedCategory(params.category as string);
    }
  }, [params.category]);

  const formatPrice = (price: number, isMonthly?: boolean) => {
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L${isMonthly ? "/mo" : ""}`;
    }
    return `₹${price.toLocaleString("en-IN")}${isMonthly ? "/mo" : ""}`;
  };

  const applyFilters = () => {
    let filtered = [...SEARCH_RESULTS];
    
    if (selectedCategory !== "All") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    if (selectedCondition !== "All") {
      filtered = filtered.filter(item => item.condition === selectedCondition);
    }
    
    if (priceRange.min) {
      filtered = filtered.filter(item => item.price >= parseInt(priceRange.min));
    }
    
    if (priceRange.max) {
      filtered = filtered.filter(item => item.price <= parseInt(priceRange.max));
    }
    
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setResults(filtered);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSelectedCategory("All");
    setSelectedCondition("All");
    setPriceRange({ min: "", max: "" });
    setSelectedSort("Most Recent");
    setResults(SEARCH_RESULTS);
  };

  const renderListingCard = ({ item }: { item: typeof SEARCH_RESULTS[0] }) => (
    <TouchableOpacity
      style={styles.listingCard}
      activeOpacity={0.9}
      onPress={() => router.push({
        pathname: "/stacks/productDetails",
        params: { productData: JSON.stringify(item) }
      })}
    >
      <View style={styles.listingImageContainer}>
        <Image source={{ uri: item.image }} style={styles.listingImage} />
        <TouchableOpacity style={styles.favoriteBtn}>
          <Ionicons name="heart-outline" size={18} color={COLORS.white} />
        </TouchableOpacity>
        {item.verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={12} color={COLORS.white} />
          </View>
        )}
        <View style={styles.conditionBadge}>
          <ThemedText style={styles.conditionText}>{item.condition}</ThemedText>
        </View>
      </View>
      <View style={styles.listingInfo}>
        <ThemedText style={styles.listingPrice}>
          {formatPrice(item.price, item.isMonthly)}
        </ThemedText>
        <ThemedText style={styles.listingTitle} numberOfLines={2}>
          {item.title}
        </ThemedText>
        <View style={styles.listingMeta}>
          <View style={styles.listingLocation}>
            <Ionicons name="location-outline" size={12} color={COLORS.gray} />
            <ThemedText style={styles.listingLocationText} numberOfLines={1}>
              {item.location}
            </ThemedText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={[styles.filterModal, { paddingTop: insets.top }]}>
        <View style={styles.filterHeader}>
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <Ionicons name="close" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <ThemedText style={styles.filterTitle}>Filters</ThemedText>
          <TouchableOpacity onPress={clearFilters}>
            <ThemedText style={styles.clearText}>Clear</ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.filterContent} showsVerticalScrollIndicator={false}>
          {/* Category Filter */}
          <View style={styles.filterSection}>
            <ThemedText style={styles.filterSectionTitle}>Category</ThemedText>
            <View style={styles.filterOptions}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.filterChip,
                    selectedCategory === cat && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <ThemedText
                    style={[
                      styles.filterChipText,
                      selectedCategory === cat && styles.filterChipTextActive,
                    ]}
                  >
                    {cat}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Condition Filter */}
          <View style={styles.filterSection}>
            <ThemedText style={styles.filterSectionTitle}>Condition</ThemedText>
            <View style={styles.filterOptions}>
              {CONDITIONS.map((cond) => (
                <TouchableOpacity
                  key={cond}
                  style={[
                    styles.filterChip,
                    selectedCondition === cond && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedCondition(cond)}
                >
                  <ThemedText
                    style={[
                      styles.filterChipText,
                      selectedCondition === cond && styles.filterChipTextActive,
                    ]}
                  >
                    {cond}
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
      <View style={[styles.searchHeader, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
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

      {/* Active Filters */}
      {(selectedCategory !== "All" || selectedCondition !== "All") && (
      <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.activeFilters}
          contentContainerStyle={styles.activeFiltersContent}
        >
          {selectedCategory !== "All" && (
            <View style={styles.activeFilterChip}>
              <ThemedText style={styles.activeFilterText}>{selectedCategory}</ThemedText>
              <TouchableOpacity onPress={() => setSelectedCategory("All")}>
                <Ionicons name="close" size={16} color={COLORS.primary} />
              </TouchableOpacity>
                  </View>
          )}
          {selectedCondition !== "All" && (
            <View style={styles.activeFilterChip}>
              <ThemedText style={styles.activeFilterText}>{selectedCondition}</ThemedText>
              <TouchableOpacity onPress={() => setSelectedCondition("All")}>
                <Ionicons name="close" size={16} color={COLORS.primary} />
              </TouchableOpacity>
                  </View>
          )}
        </ScrollView>
      )}

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <ThemedText style={styles.resultsCount}>{results.length} results found</ThemedText>
        <TouchableOpacity style={styles.sortBtn}>
          <ThemedText style={styles.sortText}>{selectedSort}</ThemedText>
          <Ionicons name="chevron-down" size={16} color={COLORS.gray} />
        </TouchableOpacity>
        </View>

      {/* Results Grid */}
      {results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderListingCard}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.listingsRow}
          contentContainerStyle={styles.listingsContainer}
          showsVerticalScrollIndicator={false}
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
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  activeFiltersContent: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    gap: 8,
  },
  activeFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary + "15",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  activeFilterText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primary,
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
  conditionBadge: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  conditionText: {
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
