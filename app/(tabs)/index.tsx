import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS } from "@/constants/Colors";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - SIZES.padding * 2 - 12) / 2;

// Mock data for categories
const CATEGORIES = [
  { id: 1, name: "Vehicles", icon: "car-sport", color: "#4361EE", count: 1250 },
  { id: 2, name: "Property", icon: "home", color: "#06D6A0", count: 890 },
  { id: 3, name: "Electronics", icon: "phone-portrait", color: "#F72585", count: 2340 },
  { id: 4, name: "Furniture", icon: "bed", color: "#FF9F1C", count: 567 },
  { id: 5, name: "Fashion", icon: "shirt", color: "#8B5CF6", count: 1890 },
  { id: 6, name: "Jobs", icon: "briefcase", color: "#14B8A6", count: 432 },
  { id: 7, name: "Services", icon: "construct", color: "#EC4899", count: 789 },
  { id: 8, name: "More", icon: "grid", color: "#6366F1", count: null },
];

// Mock data for featured listings
const FEATURED_LISTINGS = [
  {
    id: 1,
    title: "iPhone 14 Pro Max - Like New",
    price: 85000,
    location: "Mumbai, Maharashtra",
    image: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400",
    condition: "Like New",
    verified: true,
    postedAt: "2 hours ago",
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
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedCity, setSelectedCity] = useState("Mumbai");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const formatPrice = (price: number, isMonthly?: boolean) => {
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L${isMonthly ? "/mo" : ""}`;
    }
    return `₹${price.toLocaleString("en-IN")}${isMonthly ? "/mo" : ""}`;
  };

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
      {/* Location Selector */}
      <TouchableOpacity style={styles.locationSelector}>
        <Ionicons name="location" size={20} color={COLORS.primary} />
        <View style={styles.locationText}>
          <ThemedText style={styles.locationLabel}>Your Location</ThemedText>
          <View style={styles.locationRow}>
            <ThemedText style={styles.locationCity}>{selectedCity}</ThemedText>
            <Ionicons name="chevron-down" size={16} color={COLORS.text} />
          </View>
        </View>
      </TouchableOpacity>

      {/* Notification Bell */}
      <TouchableOpacity style={styles.notificationBtn}>
        <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
        <View style={styles.notificationBadge} />
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => (
    <TouchableOpacity
      style={styles.searchContainer}
      onPress={() => router.push("/(tabs)/search")}
      activeOpacity={0.8}
    >
      <Ionicons name="search" size={20} color={COLORS.gray} />
      <ThemedText style={styles.searchPlaceholder}>
        Search cars, mobiles, properties...
      </ThemedText>
      <View style={styles.searchFilter}>
        <Ionicons name="options-outline" size={18} color={COLORS.primary} />
      </View>
    </TouchableOpacity>
  );

  const renderCategories = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Browse Categories</ThemedText>
        <TouchableOpacity>
          <ThemedText style={styles.seeAll}>See All</ThemedText>
        </TouchableOpacity>
      </View>
      <View style={styles.categoriesGrid}>
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryCard}
            activeOpacity={0.7}
            onPress={() => router.push({
              pathname: "/(tabs)/search",
              params: { category: category.name }
            })}
          >
            <View style={[styles.categoryIcon, { backgroundColor: category.color + "15" }]}>
              <Ionicons name={category.icon as any} size={24} color={category.color} />
            </View>
            <ThemedText style={styles.categoryName}>{category.name}</ThemedText>
            {category.count && (
              <ThemedText style={styles.categoryCount}>{category.count}+ Ads</ThemedText>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderListingCard = ({ item }: { item: typeof FEATURED_LISTINGS[0] }) => (
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
            <ThemedText style={styles.verifiedText}>Verified</ThemedText>
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
          <ThemedText style={styles.listingTime}>{item.postedAt}</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFeaturedListings = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Fresh Recommendations</ThemedText>
        <TouchableOpacity>
          <ThemedText style={styles.seeAll}>See All</ThemedText>
        </TouchableOpacity>
      </View>
      <FlatList
        data={FEATURED_LISTINGS}
        renderItem={renderListingCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.listingsRow}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.sellBanner}
      >
        <View style={styles.sellBannerContent}>
          <Ionicons name="camera" size={32} color={COLORS.white} />
          <View style={styles.sellBannerText}>
            <ThemedText style={styles.sellBannerTitle}>Sell Your Items</ThemedText>
            <ThemedText style={styles.sellBannerSubtitle}>
              Post free ads and reach millions of buyers
            </ThemedText>
          </View>
        </View>
        <TouchableOpacity
          style={styles.sellButton}
          onPress={() => router.push("/(tabs)/post")}
        >
          <ThemedText style={styles.sellButtonText}>Start Selling</ThemedText>
          <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderHeader()}
        {renderSearchBar()}
        {renderQuickActions()}
        {renderCategories()}
        {renderFeaturedListings()}
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
  },
  locationSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationText: {
    gap: 2,
  },
  locationLabel: {
    fontSize: 12,
    color: COLORS.gray,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationCity: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  notificationBadge: {
    position: "absolute",
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accentOrange,
  },

  /* Search */
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },

  /* Categories */
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  categoryCard: {
    width: (width - SIZES.padding * 2 - 36) / 4,
    alignItems: "center",
    gap: 8,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryName: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },
  categoryCount: {
    fontSize: 10,
    color: COLORS.gray,
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  listingLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  listingLocationText: {
    fontSize: 11,
    color: COLORS.gray,
    flex: 1,
  },
  listingTime: {
    fontSize: 10,
    color: COLORS.gray,
  },
});
