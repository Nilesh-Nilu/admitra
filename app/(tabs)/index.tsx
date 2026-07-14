import { BannerCard } from "@/components/cards/BannerCard";
import { FeaturedCard } from "@/components/cards/FeaturedCard";
import { ListingCard } from "@/components/cards/ListingCard";
import { HomeBannerAds } from "@/components/home/HomeBannerAds";
import { HomeCategories } from "@/components/home/HomeCategories";
import { HomeFeaturedAds } from "@/components/home/HomeFeaturedAds";
import { HomeHeader } from "@/components/home/HomeHeader";
import { HomeSearchBar } from "@/components/home/HomeSearchBar";
import { UserShimmerLoader } from "@/components/loader/UserShimmerLoader";
import { LocationModal } from "@/components/modals/LocationModal";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS } from "@/constants/Colors";
import {
  favoritesUrl,
  getApprovedProductsUrl,
  getBannerAdsUrl,
  getCategoriesUrl,
  getCitiesUrl,
  getFeaturedAdsUrl,
  getLocalitiesUrl,
  getMyFeaturedAdsUrl,
  getProductsUrl,
  getPromotionBannerApi,
  getStatesUrl,
  getSubCategoriesUrl,
  baseUrl,
  getAuthToken,
  getNormalAdsInfoApi,
  getNotifications,
} from "@/constants/functions";
import axios from "axios";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { setClearData } from "@/store/reducers/paymentReducer";
import {
  appendProductsRecieved,
  getAllProducts,
  getApprovedProductsApi,
  getBannersApi,
  getCategoriesApi,
  getCitiesApi,
  getFavoritesApi,
  getFeaturedAdsApi,
  getLocalitiesApi,
  getMyFeaturedAdsApi,
  getStatesApi,
  getSubCategoriesApi,
} from "@/store/reducers/userReducer";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - SIZES.padding * 2 - 12) / 2;

// Survives the Home screen unmounting/remounting when navigating to a stack screen and back
let savedHomeScrollY = 0;

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const flatListRef = useRef<FlatList>(null);
  const hasRestoredScrollRef = useRef(false);
  const { loader, cities, categories, products, banners, featuredAds, states, localities } =
    useSelector((state: any) => state.entities.userReducer) || {};
  const { user } = useSelector((state: any) => state.entities.authReducer) || {};
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [selectedLocality, setSelectedLocality] = useState<any>(null);
  const [isCityInitialized, setIsCityInitialized] = useState(false);
  const [promotionBanners, setPromotionBanners] = useState<any>([]);
  const [normalAdsInfo, setNormalAdsInfo] = useState<any>(null);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const prevCityIdRef = useRef<any>(null);
  const isLoadingMoreRef = useRef(false);
  const currentPageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const safeLocalities = Array.isArray(localities) ? localities : [];
  const safeProducts = products || [];
  const safeCategories = categories || [];
  const safeCities = Array.isArray(cities) ? cities : [];
  const safeBanners = Array.isArray(banners) ? banners : [];

  const filteredProducts = selectedCategory
    ? safeProducts.filter((p: any) => p.category_id === selectedCategory)
    : safeProducts;

  const checkUnreadNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await getNotifications(user.id, 1, 1);
      setHasUnreadNotifications((response?.data?.data?.length || 0) > 0);
    } catch (error) {
      console.log(error, "Failed to fetch unread notifications");
    }
  }, [user?.id]);

  useEffect(() => {
    checkUnreadNotifications();
  }, [checkUnreadNotifications]);

  useFocusEffect(
    useCallback(() => {
      checkUnreadNotifications();
    }, [checkUnreadNotifications])
  );

  // Effect 1: Initialize city only (localities aren't loaded yet at this point)
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
          const cityExists = safeCities.some((c: any) => Number(c.id) === Number(savedCity.id));
          if (cityExists) {
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
        if (safeCities.length > 0) {
          setSelectedCity(safeCities[0]);
          setIsCityInitialized(true);
        }
      }
    };
    initializeCity();
  }, [safeCities, user, isCityInitialized]);

  // Effect 2: Initialize locality once localities are fetched for the selected city
  useEffect(() => {
    if (safeLocalities.length === 0 || selectedLocality) return;
    const initializeLocality = async () => {
      try {
        // Priority 1: User's locality from profile
        if (user?.locality_id) {
          const userLocality = safeLocalities.find((l: any) => Number(l.id) === Number(user.locality_id));
          if (userLocality) {
            setSelectedLocality(userLocality);
            await AsyncStorage.setItem("selectedLocality", JSON.stringify(userLocality));
            return;
          }
        }
        // Priority 2: Saved locality from AsyncStorage
        const savedLocalityJson = await AsyncStorage.getItem("selectedLocality");
        if (savedLocalityJson) {
          const savedLocality = JSON.parse(savedLocalityJson);
          const localityExists = safeLocalities.some((l: any) => Number(l.id) === Number(savedLocality.id));
          if (localityExists) {
            setSelectedLocality(savedLocality);
          }
        }
      } catch (error) {
        console.log("Error initializing locality:", error);
      }
    };
    initializeLocality();
  }, [safeLocalities, user?.locality_id]);

  useEffect(() => {
    getPromotionBannerApi().then((res) => {
      setPromotionBanners(res);
    });
    dispatch(getCategoriesApi(getCategoriesUrl));
    dispatch(getSubCategoriesApi(`${getSubCategoriesUrl}`));
    dispatch(getStatesApi(getStatesUrl));
    dispatch(getCitiesApi(getCitiesUrl));
    dispatch(setClearData(null));
    dispatch(getApprovedProductsApi(getApprovedProductsUrl));
    dispatch(getBannersApi(getBannerAdsUrl));
    dispatch(getFeaturedAdsApi(getFeaturedAdsUrl));
    dispatch(getFavoritesApi(favoritesUrl));
    getNormalAdsInfoApi().then((res: any) => {
      setNormalAdsInfo(res);
    });

  }, []);

  useEffect(() => {
    if (selectedCity?.id) {
      // Reset pagination when city changes
      if (prevCityIdRef.current !== selectedCity.id) {
        prevCityIdRef.current = selectedCity.id;
        setHasMoreProducts(true);
        currentPageRef.current = 1;
        hasMoreRef.current = true;
        isLoadingMoreRef.current = false;
      }
      dispatch(getLocalitiesApi(`${getLocalitiesUrl}?city_id=${selectedCity.id}`));
      dispatch(
        getAllProducts(
          `${getProductsUrl}?per_page=20&page=1`
        )
      );
    }
    dispatch(getMyFeaturedAdsApi(`${getMyFeaturedAdsUrl}`));

  }, [selectedCity?.id]);

  const loadMoreProducts = useCallback(async () => {
    if (!hasMoreRef.current || isLoadingMoreRef.current) return;
    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);
    const nextPage = currentPageRef.current + 1;
    try {
      const authHeaders = await getAuthToken();
      const url = `${baseUrl}/${getProductsUrl}?per_page=20&page=${nextPage}`;
      const response = await axios.get(url, authHeaders);
      const raw = response.data;
      // API shape: { status, data: { current_page, data: [...], last_page, next_page_url } }
      const paginator = raw?.data;
      const list = Array.isArray(paginator) ? paginator : Array.isArray(paginator?.data) ? paginator.data : [];
      dispatch(appendProductsRecieved({ data: list }) as any);
      const noMore = !paginator?.next_page_url
        || (paginator?.last_page != null && nextPage >= paginator.last_page);
      if (noMore) {
        hasMoreRef.current = false;
        setHasMoreProducts(false);
      }
      currentPageRef.current = nextPage;
    } catch (e: any) {
      // console.log('[Pagination] error:', e?.message, e?.response?.status);
    }
    isLoadingMoreRef.current = false;
    setIsLoadingMore(false);
  }, [dispatch]);

  const handleCategoryPress = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    if (categoryId !== null) {
      router.push({
        pathname: "/stacks/categories",
        params: { selectedCategory: categoryId.toString() },
      });
    }
  };

  const mixedFeed = useMemo(() => {
    const rows: any[] = [];
    if (!filteredProducts || filteredProducts.length === 0) return rows;

    const safeBannersArr = Array.isArray(safeBanners) ? safeBanners : [];
    const featuredAdsArr = Array.isArray(featuredAds) ? featuredAds : [];

    let productIndex = 0;
    let bannerIndex = 0;
    let featuredIndex = 0;

    while (productIndex < filteredProducts.length) {
      // 20 products per chunk (matches per_page)
      const normalChunk = filteredProducts.slice(productIndex, productIndex + 20);
      productIndex += 20;

      // Group products in rows of 2
      for (let i = 0; i < normalChunk.length; i += 2) {
        rows.push({ type: "products_row", data: normalChunk.slice(i, i + 2) });
      }

      // 1 banner ad after each chunk
      if (safeBannersArr.length > 0) {
        rows.push({
          type: "banner_row",
          data: safeBannersArr[bannerIndex % safeBannersArr.length],
        });
        bannerIndex++;
      }

      // 2 featured ads after each chunk
      if (featuredAdsArr.length > 0) {
        const fChunk: any[] = [featuredAdsArr[featuredIndex % featuredAdsArr.length]];
        featuredIndex++;
        fChunk.push(featuredAdsArr[featuredIndex % featuredAdsArr.length]);
        featuredIndex++;
        rows.push({ type: "featured_row", data: fChunk });
      }
    }

    return rows;
  }, [filteredProducts, safeBanners, featuredAds]);

  const renderMixedRow = ({ item }: { item: any }) => {
    if (item.type === "products_row") {
      return (
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
          {item.data.map((prod: any) => (
            <ListingCard key={prod.id} item={prod} />
          ))}
          {item.data.length === 1 && <View style={{ width: CARD_WIDTH }} />}
        </View>
      );
    }
    if (item.type === "banner_row") {
      return <BannerCard item={item.data} isInline />;
    }
    if (item.type === "featured_row") {
      return (
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
          {item.data.map((feat: any, idx: number) => (
            <FeaturedCard key={feat.id ? `${feat.id}-${idx}` : idx.toString()} item={feat} isInline />
          ))}
          {item.data.length === 1 && <View style={{ width: "48%" }} />}
        </View>
      );
    }
    return null;
  };
  const fullName = `${selectedCity?.name + ","}${selectedLocality?.name || ""}`
  return (
    <ThemedView style={styles.container}>
      {loader ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <HomeHeader
            selectedCityName={
              fullName
                ? fullName
                : selectedCity?.name
                ? safeCities[0]?.name || "Select City"
                : "Select City"
            }
            onPressLocation={() => setShowLocationModal(true)}
          />
          <UserShimmerLoader />
        </ScrollView>
      ) : (
        <FlatList
          ref={flatListRef}
          data={mixedFeed}
          renderItem={renderMixedRow}
          keyExtractor={(_, index) => index.toString()}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          onScroll={(e) => {
            savedHomeScrollY = e.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
          onContentSizeChange={() => {
            if (!hasRestoredScrollRef.current && savedHomeScrollY > 0) {
              hasRestoredScrollRef.current = true;
              requestAnimationFrame(() => {
                flatListRef.current?.scrollToOffset({ offset: savedHomeScrollY, animated: false });
              });
            }
          }}
          ListHeaderComponent={
            <>
              <HomeHeader
                selectedCityName={fullName ? fullName : selectedCity?.name || safeCities[0]?.name || "Select City"}
                onPressLocation={() => setShowLocationModal(true)}
              />
              <HomeSearchBar
                onPressSearch={() => router.push("/stacks/search")}
                onPressHelp={() => Linking.openURL("https://wa.me/917870660015")}
                onPressFavorites={() => router.push("/(tabs)/myListing")}
                onPressNotifications={() => router.push("/stacks/notifications")}
                hasUnreadNotifications={hasUnreadNotifications}
              />
              <HomeCategories
                categories={safeCategories}
                selectedCategory={selectedCategory}
                onPressCategory={handleCategoryPress}
                onPressMore={() => router.push("/stacks/categories")}
              />
              <HomeBannerAds
                promotionBanners={promotionBanners}
                banners={safeBanners.slice(0, 10)}
                onPressSeeAll={() => router.push({ pathname: "/stacks/seeAllBanners" })}
              />
              <HomeFeaturedAds
                featuredAds={featuredAds}
                onPressSeeAll={() => router.push({ pathname: "/stacks/seeAllFeatured" })}
              />
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>
                  Normal Ads
                </ThemedText>
                <TouchableOpacity style={styles.seeAllBtn} onPress={() => router.push({ pathname: "/stacks/seeAllFresh" })}>
                  <ThemedText style={styles.seeAllText}>See All</ThemedText>
                  <Ionicons name="arrow-forward" size={15} color="#1565C0" />
                </TouchableOpacity>
              </View>
              {normalAdsInfo && (
                <TouchableOpacity
                  style={styles.topTextBanner}
                  // onPress={() => router.push("/(tabs)/post")}
                  activeOpacity={0.8}
                >
                  <View style={styles.topTextBannerLeft}>
                    {normalAdsInfo.icon ? (
                      <Image
                        source={{ uri: normalAdsInfo.icon }}
                        style={{ width: 32, height: 32, marginRight: 8, borderRadius: 4 }}
                      />
                    ) : (
                      <Ionicons name="megaphone-outline" size={22} color="#1565C0" style={{ marginRight: 8 }} />
                    )}
                    <ThemedText style={styles.topTextBannerLeftText}>
                      {normalAdsInfo.title}
                    </ThemedText>
                  </View>

                  <View style={styles.topTextBannerHighlight}>
                    <ThemedText style={styles.topTextBannerHighlightText}>
                      {normalAdsInfo.button_label}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              )}
            </>
          }
          onEndReached={loadMoreProducts}
          onEndReachedThreshold={0.15}
          ListFooterComponent={
            <View style={styles.footerLoader}>
              {isLoadingMore ? (
                <>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <ThemedText style={styles.footerLoaderText}>Loading more...</ThemedText>
                </>
              ) : !hasMoreProducts ? (
                <ThemedText style={styles.footerEndText}>You're all caught up</ThemedText>
              ) : null}
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
      <LocationModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        states={Array.isArray(states) ? states : []}
        cities={safeCities}
        localities={safeLocalities}
        onSelectCity={setSelectedCity}
        onSelectLocality={setSelectedLocality}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5", top: -SIZES.padding8 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: SIZES.padding },
  footerLoader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 20,
    marginBottom: 80,
  },
  footerLoaderText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "500",
  },
  footerEndText: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "500",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.padding12,
  },
  sectionTitle: { fontSize: SIZES.fontSize16, fontWeight: "700", color: COLORS.text },
  seeAllBtn: { flexDirection: "row", alignItems: "center", gap: 2 },
  seeAllText: { fontSize: SIZES.fontSize12, fontWeight: "600", color: "#1565C0" },
  topTextBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E8F0FE",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#BBDEFB",
  },
  topTextBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  topTextBannerLeftText: {
    fontSize: 13,
    color: "#0D47A1",
    fontWeight: "700",
    flexShrink: 1,
  },
  topTextBannerHighlight: {
    backgroundColor: "#1565C0",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 10,
  },
  topTextBannerHighlightText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
