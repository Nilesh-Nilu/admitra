import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS } from "@/constants/Colors";
import {
  getApprovedProductsUrl,
  getBannerAdsUrl,
  getCategoriesUrl,
  getCitiesUrl,
  getFeaturedAdsUrl,
  getProductsByLocationUrl,
  getStatesUrl,
  getSubCategoriesUrl
} from "@/constants/functions";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { setClearData } from "@/store/reducers/paymentReducer";
import {
  getApprovedProductsApi,
  getBannersApi,
  getCategoriesApi,
  getCitiesApi,
  getFeaturedAdsApi,
  getProductsApiwithcityId,
  getStatesApi,
  getSubCategoriesApi,
} from "@/store/reducers/userReducer";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - SIZES.padding * 2 - 12) / 2;
const FEATURED_CARD_WIDTH = SCREEN_WIDTH * 0.38;
const BANNER_WIDTH = SCREEN_WIDTH;

const ShimmerBlock = ({
  style,
  animatedValue,
}: {
  style: any;
  animatedValue: Animated.Value;
}) => {
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

const UserShimmerLoader = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <View>
      <ShimmerBlock
        style={{ height: 48, borderRadius: 12, marginBottom: 20 }}
        animatedValue={animatedValue}
      />
      <View style={{ marginBottom: 24 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={{ marginRight: 16, alignItems: "center" }}>
              <ShimmerBlock
                style={{ width: 52, height: 52, borderRadius: 14 }}
                animatedValue={animatedValue}
              />
              <ShimmerBlock
                style={{ width: 40, height: 10, borderRadius: 5, marginTop: 6 }}
                animatedValue={animatedValue}
              />
            </View>
          ))}
        </ScrollView>
      </View>
      <ShimmerBlock
        style={{ height: 140, borderRadius: 14, marginBottom: 24 }}
        animatedValue={animatedValue}
      />
      <View style={{ marginBottom: 24 }}>
        <ShimmerBlock
          style={{ width: 160, height: 18, borderRadius: 9, marginBottom: 14 }}
          animatedValue={animatedValue}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={{ marginRight: 12 }}>
              <ShimmerBlock
                style={{
                  width: FEATURED_CARD_WIDTH,
                  height: 180,
                  borderRadius: 12,
                }}
                animatedValue={animatedValue}
              />
            </View>
          ))}
        </ScrollView>
      </View>
      <ShimmerBlock
        style={{ width: 200, height: 18, borderRadius: 9, marginBottom: 14 }}
        animatedValue={animatedValue}
      />
      <View style={{ flexDirection: "row", gap: 12 }}>
        {[1, 2].map((i) => (
          <ShimmerBlock
            key={i}
            style={{ width: CARD_WIDTH, height: 200, borderRadius: 12 }}
            animatedValue={animatedValue}
          />
        ))}
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { loader, cities, categories, products, banners, featuredAds } =
    useSelector((state: any) => state.entities.userReducer) || {};
  const { user } = useSelector((state: any) => state.entities.authReducer) || {};
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showCitySheet, setShowCitySheet] = useState(false);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [isCityInitialized, setIsCityInitialized] = useState(false);
  const [bannerIndex, setBannerIndex] = useState(0);
  const bannerScrollRef = useRef<ScrollView>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const safeProducts = products || [];
  const safeCategories = categories || [];
  const safeCities = Array.isArray(cities) ? cities : [];
  const safeBanners = Array.isArray(banners) ? banners : [];

  const filteredProducts = selectedCategory
    ? safeProducts.filter((p: any) => p.category_id === selectedCategory)
    : safeProducts;

  // Initialize city based on user profile, saved city, or default to first city
  useEffect(() => {
    const initializeCity = async () => {
      if (safeCities.length === 0 || isCityInitialized) return;

      try {
        // Priority 1: User's city from profile
        if (user?.city_id) {
          const userCity = safeCities.find((c: any) => Number(c.id) === Number(user.city_id));
          if (userCity) {
            setSelectedCity(userCity);
            await AsyncStorage.setItem("selectedCity", JSON.stringify(userCity));
            setIsCityInitialized(true);
            return;
          }
        }

        // Priority 2: Saved city from AsyncStorage
        const savedCityJson = await AsyncStorage.getItem("selectedCity");
        if (savedCityJson) {
          const savedCity = JSON.parse(savedCityJson);
          const stillExists = safeCities.some((c: any) => Number(c.id) === Number(savedCity.id));
          if (stillExists) {
            setSelectedCity(savedCity);
            setIsCityInitialized(true);
            return;
          }
        }

        // Priority 3: Default to first city
        setSelectedCity(safeCities[0]);
        setIsCityInitialized(true);
      } catch (error) {
        console.log("Error initializing city:", error);
        // Fallback to first city on error
        if (safeCities.length > 0) {
          setSelectedCity(safeCities[0]);
          setIsCityInitialized(true);
        }
      }
    };

    initializeCity();
  }, [safeCities, user, isCityInitialized]);

  useEffect(() => {
    dispatch(getCategoriesApi(getCategoriesUrl));
    dispatch(getSubCategoriesApi(`${getSubCategoriesUrl}`));
    dispatch(getStatesApi(getStatesUrl));
    dispatch(getCitiesApi(getCitiesUrl));
    dispatch(setClearData(null));
    dispatch(getApprovedProductsApi(getApprovedProductsUrl));
    dispatch(getBannersApi(getBannerAdsUrl));
    dispatch(getFeaturedAdsApi(getFeaturedAdsUrl));
  }, []);

  useEffect(() => {
    if (selectedCity?.id) {
      dispatch(
        getProductsApiwithcityId(
          `${getProductsByLocationUrl}?city_id=${selectedCity.id}`
        )
      );
    }
  }, [selectedCity?.id]);

  // Banner auto-play
  useEffect(() => {
    if (safeBanners.length <= 1) return;

    const startAutoPlay = () => {
      autoPlayRef.current = setInterval(() => {
        setBannerIndex((prev) => {
          const nextIndex = (prev + 1) % safeBanners.length;
          bannerScrollRef.current?.scrollTo({
            x: nextIndex * BANNER_WIDTH,
            animated: true,
          });
          return nextIndex;
        });
      }, 3000);
    };

    const stopAutoPlay = () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    };

    startAutoPlay();
    return stopAutoPlay;
  }, [safeBanners.length]);

  const handleBannerTouchStart = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  };

  const handleBannerTouchEnd = () => {
    if (safeBanners.length <= 1) return;
    autoPlayRef.current = setInterval(() => {
      setBannerIndex((prev) => {
        const nextIndex = (prev + 1) % safeBanners.length;
        bannerScrollRef.current?.scrollTo({
          x: nextIndex * BANNER_WIDTH,
          animated: true,
        });
        return nextIndex;
      });
    }, 3000);
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

  const handleCategoryPress = (categoryId: number) => {
    setSelectedCategory(categoryId);
    router.push({
      pathname: "/stacks/categories",
      params: { selectedCategory: categoryId.toString() },
    });
  };

  const formatPrice = (price: number) => {
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
    return `₹${price.toLocaleString("en-IN")}`;
  };

  const timeAgo = (dateStr: string) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} mins ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  // ── Header ──
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/images/splashImage.png")}
          style={styles.logo}
        />
      </View>
      <TouchableOpacity
        style={styles.locationSelector}
        onPress={() => setShowCitySheet(true)}
        activeOpacity={0.8}
      >
        <View style={styles.locationIconBg}>
          <Ionicons name="location" size={16} color={COLORS.white} />
        </View>
        <View>
          <ThemedText style={styles.locationLabel}>Deliver to</ThemedText>
          <View style={styles.locationRow}>
            <ThemedText style={styles.locationCity} numberOfLines={1}>
              {selectedCity?.name || safeCities[0]?.name || "Select City"}
            </ThemedText>
            <Ionicons name="chevron-down" size={13} color={COLORS.text} />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  // ── Search Bar ──
  const renderSearchBar = () => (
    <View style={styles.searchRow}>
      <TouchableOpacity
        style={styles.searchContainer}
        onPress={() => router.push("/stacks/search")}
        activeOpacity={0.8}
      >
        <Ionicons name="search" size={18} color={COLORS.gray} />
        <ThemedText style={styles.searchPlaceholder}>
          Search cars, mobiles, properties..
        </ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.whatsappBtn}
        onPress={() => Linking.openURL("https://wa.me/919876543210")}
        activeOpacity={0.8}
      >
        <Ionicons name="logo-whatsapp" size={16} color={COLORS.white} />
        <ThemedText style={styles.whatsappText}>WhatsApp Help</ThemedText>
      </TouchableOpacity>
    </View>
  );

  // ── Categories Row ──
  const renderCategories = () => (
    <View style={styles.categoriesSection}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        {/* "All" chip */}
        <TouchableOpacity
          style={styles.categoryItem}
          activeOpacity={0.7}
          onPress={() => router.push({
            pathname: "/stacks/categories",
            params: { selectedCategory: null }
          })}
        >
          <View
            style={[
              styles.categoryIconBox,
              selectedCategory === null && styles.categoryIconBoxActive,
            ]}
          >
            <Ionicons
              name="grid"
              size={22}
              color={selectedCategory === null ? COLORS.white : "#1565C0"}
            />
          </View>
          <ThemedText
            style={[
              styles.categoryLabel,
              selectedCategory === null && styles.categoryLabelActive,
            ]}
          >
            All
          </ThemedText>
        </TouchableOpacity>

        {safeCategories.map((cat: any) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.categoryItem}
            activeOpacity={0.7}
            onPress={() => handleCategoryPress(cat.id)}
          >
            <View
              style={[
                styles.categoryIconBox,
                selectedCategory === cat.id && styles.categoryIconBoxActive,
              ]}
            >
              {cat.image ? (
                <Image source={{ uri: cat.image }} style={styles.categoryImg} />
              ) : (
                <Ionicons name="pricetag" size={22} color="#1565C0" />
              )}
            </View>
            <ThemedText
              style={[
                styles.categoryLabel,
                selectedCategory === cat.id && styles.categoryLabelActive,
              ]}
              numberOfLines={1}
            >
              {cat.name}
            </ThemedText>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.categoryItem}
          activeOpacity={0.7}
          onPress={() => router.push("/stacks/categories")}
        >
          <View style={styles.categoryIconBox}>
            <Ionicons name="ellipsis-horizontal" size={22} color="#1565C0" />
          </View>
          <ThemedText style={styles.categoryLabel}>More</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderBannerAds = () => {
    if (safeBanners.length === 0) return null;
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Banner Ads</ThemedText>
          {safeBanners.length > 0 && (
            <TouchableOpacity
              style={styles.seeAllBtn}
              onPress={() =>
                router.push({
                  pathname: "/stacks/seeAllBanners",
                })
              }
            >
              <ThemedText style={styles.seeAllText}>See All</ThemedText>
              <Ionicons name="arrow-forward" size={15} color="#1565C0" />
            </TouchableOpacity>
          )}
        </View>
        <ScrollView
          ref={bannerScrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => {
            const idx = Math.round(
              e.nativeEvent.contentOffset.x / BANNER_WIDTH
            );
            setBannerIndex(idx);
          }}
          scrollEventThrottle={16}
          onTouchStart={handleBannerTouchStart}
          onTouchEnd={handleBannerTouchEnd}
          onScrollBeginDrag={handleBannerTouchStart}
          onScrollEndDrag={handleBannerTouchEnd}
        >
          {safeBanners.map((b: any) => (
            <TouchableOpacity
              key={b.id}
              style={styles.bannerCard}
              activeOpacity={0.9}
              onPress={() =>
                router.push({
                  pathname: "/stacks/bannerDetails",
                  params: { bannerData: JSON.stringify(b) },
                })
              }
            >
              <ImageBackground
                source={{ uri: b.banner_image }}
                style={styles.bannerImage}
                resizeMode="cover"
              >
                <View style={styles.bannerActions}>
                  <TouchableOpacity
                    style={styles.bannerBtnLeft}
                    activeOpacity={0.8}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleVisitWebsite(b.website_link);
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
                      handleWatchVideo(b.banner_video_url);
                    }}
                  >
                    <Ionicons name="play-circle" size={16} color={COLORS.white} />
                    <ThemedText style={styles.bannerBtnRightText}>Watch Video</ThemedText>
                  </TouchableOpacity>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {safeBanners.length > 1 && (
          <View style={styles.bannerDots}>
            {safeBanners.map((_: any, i: number) => (
              <View
                key={i}
                style={[
                  styles.bannerDot,
                  i === bannerIndex && styles.bannerDotActive,
                ]}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  // ── Featured Ads (horizontal scroll) ──
  const renderFeaturedAds = () => {
    if (featuredAds.length === 0) return null;
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <ThemedText style={styles.featuredStar}>⭐</ThemedText>
            <ThemedText style={styles.sectionTitle}>Featured Ads</ThemedText>
          </View>
          {featuredAds.length > 1 && (
            <TouchableOpacity
              style={styles.seeAllBtn}
              onPress={() =>
                router.push({
                  pathname: "/stacks/seeAllFeatured",
                })
              }
            >
              <ThemedText style={styles.seeAllText}>See All</ThemedText>
              <Ionicons name="arrow-forward" size={15} color="#1565C0" />
            </TouchableOpacity>
          )}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10 }}
        >
          {featuredAds.slice(0, 8).map((item: any) => (
            <TouchableOpacity
              key={item.id}
              style={styles.featuredCard}
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: "/stacks/productDetails",
                  params: { productData: JSON.stringify(item) },
                })
              }
            >
              <View style={styles.featuredBadge}>
                <ThemedText style={styles.featuredBadgeText}>Featured</ThemedText>
              </View>
              <Image
                source={{ uri: item.images?.[0]?.image_path || item.images?.[0]?.image }}
                style={styles.featuredImg}
              />
              <View style={styles.featuredInfo}>
                <ThemedText style={styles.featuredPrice}>
                  {formatPrice(item.price)}
                </ThemedText>
                <ThemedText style={styles.featuredLocation} numberOfLines={1}>
                  {item.user?.city?.name || item.city || "India"}
                </ThemedText>
                <ThemedText style={styles.featuredTime}>
                  {timeAgo(item.created_at)}
                </ThemedText>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // ── Fresh Recommendations (2-col grid) ──
  const renderListingCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.listingCard}
      activeOpacity={0.9}
      onPress={() =>
        router.push({
          pathname: "/stacks/productDetails",
          params: { productData: JSON.stringify(item) },
        })
      }
    >
      <View style={styles.listingImgWrap}>
        <Image
          source={{ uri: item.images?.[0]?.image_path || item.images?.[0]?.image }}
          style={styles.listingImg}
        />
        {item.approve === "approved" && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={12} color={COLORS.white} />
            <ThemedText style={styles.verifiedText}>Verified</ThemedText>
          </View>
        )}
      </View>
      <View style={styles.listingInfo}>
        <ThemedText style={styles.listingPrice}>
          {formatPrice(item.price)}
        </ThemedText>
        <ThemedText style={styles.listingTitle} numberOfLines={1}>
          {item.name}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  const renderRecommendations = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Fresh Recommendations</ThemedText>
        {filteredProducts.length > 2 && (
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={() =>
              router.push({
                pathname: "/stacks/seeAllFresh",
              })
            }
          >
            <ThemedText style={styles.seeAllText}>See All</ThemedText>
            <Ionicons name="arrow-forward" size={15} color="#1565C0" />
          </TouchableOpacity>
        )}
      </View>
      {filteredProducts.length > 0 ? (
        <FlatList
          data={filteredProducts.slice(0, 6)}
          renderItem={renderListingCard}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.listingsRow}
          scrollEnabled={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={44} color={COLORS.gray} />
          <ThemedText style={styles.emptyTitle}>No items found</ThemedText>
          <ThemedText style={styles.emptySub}>
            No products available in this category
          </ThemedText>
        </View>
      )}
    </View>
  );

  // ── City Bottom Sheet ──
  const renderCityBottomSheet = () => (
    <Modal
      visible={showCitySheet}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCitySheet(false)}
    >
      <Pressable
        style={styles.cityOverlay}
        onPress={() => setShowCitySheet(false)}
      />
      <View style={styles.citySheet}>
        <View style={styles.cityHandle} />
        <View style={styles.citySheetHeader}>
          <ThemedText style={styles.citySheetTitle}>Select City</ThemedText>
          <TouchableOpacity onPress={() => setShowCitySheet(false)}>
            <Ionicons name="close" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        <ScrollView
          style={{ marginTop: 4 }}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {safeCities.map((city: any) => {
            const selected = Number(selectedCity?.id) === Number(city?.id);
            return (
              <TouchableOpacity
                key={String(city.id)}
                style={[styles.cityItem, selected && styles.cityItemSel]}
                activeOpacity={0.75}
                onPress={async () => {
                  setSelectedCity(city);
                  setShowCitySheet(false);
                  try {
                    await AsyncStorage.setItem("selectedCity", JSON.stringify(city));
                  } catch (error) {
                    console.log("Error saving city:", error);
                  }
                }}
              >
                <View>
                  <ThemedText
                    style={[styles.cityName, selected && styles.cityNameSel]}
                  >
                    {city?.name}
                  </ThemedText>
                  {!!city?.state?.name && (
                    <ThemedText style={styles.cityState}>
                      {city.state.name}
                    </ThemedText>
                  )}
                </View>
                <Ionicons
                  name={selected ? "checkmark-circle" : "ellipse-outline"}
                  size={selected ? 20 : 18}
                  color={selected ? "#1565C0" : COLORS.gray}
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
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
            {renderBannerAds()}
            {renderFeaturedAds()}
            {renderRecommendations()}
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
      {renderCityBottomSheet()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5", top: -8 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: SIZES.padding },

  /* ── Header ── */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  logoContainer: { flex: 1 },
  logo: { width: 56, height: 44, resizeMode: "contain" },
  locationSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  locationIconBg: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#1E8E3E",
    justifyContent: "center",
    alignItems: "center",
  },
  locationLabel: { fontSize: 10, color: COLORS.gray },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  locationCity: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
    maxWidth: 90,
  },

  /* ── Search ── */
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: SIZES.padding,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  searchPlaceholder: { flex: 1, fontSize: 13, color: COLORS.gray },
  whatsappBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#25D366",
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 10,
  },
  whatsappText: { fontSize: 10, fontWeight: "700", color: COLORS.white },

  /* ── Categories ── */
  categoriesSection: { marginBottom: 16 },
  categoriesScroll: { gap: 14, paddingRight: 8 },
  categoryItem: { alignItems: "center", width: 60 },
  categoryIconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    marginBottom: 5,
    overflow: "hidden",
  },
  categoryIconBoxActive: {
    backgroundColor: "#1565C0",
    borderColor: "#1565C0",
  },
  categoryImg: { width: 50, height: 50, borderRadius: 14 },
  categoryLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },
  categoryLabelActive: { color: "#1565C0", fontWeight: "700" },

  /* ── Sections ── */
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  featuredStar: { fontSize: 16 },
  seeAllBtn: { flexDirection: "row", alignItems: "center", gap: 3 },
  seeAllText: { fontSize: 13, fontWeight: "600", color: "#1565C0" },

  /* ── Banner ── */
  bannerCard: {
    width: BANNER_WIDTH,
    height: 180,
    borderRadius: 0,
    overflow: "hidden",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  bannerActions: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    paddingHorizontal: 12,
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
  bannerDots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
    marginTop: 10,
  },
  bannerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D0D0D0",
  },
  bannerDotActive: { backgroundColor: "#1565C0", width: 16, borderRadius: 3 },

  /* ── Featured ── */
  featuredCard: {
    width: FEATURED_CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#FFD400",
  },
  featuredBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    zIndex: 2,
    backgroundColor: "#FF6B35",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  featuredBadgeText: { fontSize: 9, fontWeight: "700", color: COLORS.white },
  featuredImg: {
    width: "100%",
    height: FEATURED_CARD_WIDTH * 0.75,
    resizeMode: "cover",
  },
  featuredInfo: { padding: 8, gap: 2 },
  featuredPrice: { fontSize: 14, fontWeight: "800", color: COLORS.text },
  featuredLocation: { fontSize: 11, color: COLORS.gray },
  featuredTime: { fontSize: 10, color: COLORS.gray },

  /* ── Recommendations Grid ── */
  listingsRow: { gap: 12, marginBottom: 12 },
  listingCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  listingImgWrap: {
    width: "100%",
    height: CARD_WIDTH * 0.85,
    position: "relative",
  },
  listingImg: { width: "100%", height: "100%", resizeMode: "cover" },
  verifiedBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E8E3E",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  verifiedText: { fontSize: 9, fontWeight: "700", color: COLORS.white },
  listingInfo: { padding: 10, gap: 4 },
  listingPrice: { fontSize: 15, fontWeight: "800", color: COLORS.text },
  listingTitle: { fontSize: 12, color: COLORS.gray, lineHeight: 16 },

  /* ── Empty ── */
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 10,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  emptySub: { fontSize: 13, color: COLORS.gray, textAlign: "center" },
  emptyBtn: {
    marginTop: 8,
    backgroundColor: "#1565C0",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyBtnText: { fontSize: 13, fontWeight: "600", color: COLORS.white },

  /* ── City Sheet ── */
  cityOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)" },
  citySheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "62%",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  cityHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: "center",
    marginBottom: 12,
  },
  citySheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  citySheetTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  cityItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  cityItemSel: {
    borderColor: "#1565C0",
    backgroundColor: "#1565C0" + "0D",
  },
  cityName: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  cityNameSel: { color: "#1565C0" },
  cityState: { marginTop: 2, fontSize: 12, color: COLORS.gray },
});
