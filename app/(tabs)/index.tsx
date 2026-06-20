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
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - SIZES.padding * 2 - 12) / 2;

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { loader, cities, categories, products, banners, featuredAds, states, localities } =
    useSelector((state: any) => state.entities.userReducer) || {};
  const { user } = useSelector((state: any) => state.entities.authReducer) || {};
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [selectedLocality, setSelectedLocality] = useState<any>(null);
  const [isCityInitialized, setIsCityInitialized] = useState(false);
  const [promotionBanners, setPromotionBanners] = useState<any>([]);
  const [currentPage, setCurrentPage] = useState(1);
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
    dispatch(getCategoriesApi(getCategoriesUrl));
    dispatch(getSubCategoriesApi(`${getSubCategoriesUrl}`));
    dispatch(getStatesApi(getStatesUrl));
    dispatch(getCitiesApi(getCitiesUrl));
    dispatch(setClearData(null));
    dispatch(getApprovedProductsApi(getApprovedProductsUrl));
    dispatch(getBannersApi(getBannerAdsUrl));
    dispatch(getFeaturedAdsApi(getFeaturedAdsUrl));
    dispatch(getFavoritesApi(favoritesUrl));
  }, []);

  useEffect(() => {
    if (selectedCity?.id) {
      // Reset pagination when city changes
      if (prevCityIdRef.current !== selectedCity.id) {
        prevCityIdRef.current = selectedCity.id;
        setCurrentPage(1);
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
    getPromotionBannerApi().then((res) => {
      setPromotionBanners(res);
    });
  }, [selectedCity?.id]);

  const loadMoreProducts = useCallback(async () => {
    console.log('[Pagination] onEndReached fired — hasMore:', hasMoreRef.current, 'isLoading:', isLoadingMoreRef.current, 'page:', currentPageRef.current);
    if (!hasMoreRef.current || isLoadingMoreRef.current) return;
    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);
    const nextPage = currentPageRef.current + 1;
    try {
      const authHeaders = await getAuthToken();
      const url = `${baseUrl}/${getProductsUrl}?per_page=20&page=${nextPage}`;
      console.log('[Pagination] fetching:', url);
      const response = await axios.get(url, authHeaders);
      const raw = response.data;
      // API shape: { status, data: { current_page, data: [...], last_page, next_page_url } }
      const paginator = raw?.data;
      const list = Array.isArray(paginator) ? paginator : Array.isArray(paginator?.data) ? paginator.data : [];
      console.log('[Pagination] page', nextPage, '— items:', list.length, '— last_page:', paginator?.last_page);
      dispatch(appendProductsRecieved({ data: list }) as any);
      const noMore = !paginator?.next_page_url
        || (paginator?.last_page != null && nextPage >= paginator.last_page);
      if (noMore) {
        hasMoreRef.current = false;
        setHasMoreProducts(false);
      }
      currentPageRef.current = nextPage;
      setCurrentPage(nextPage);
    } catch (e: any) {
      console.log('[Pagination] error:', e?.message, e?.response?.status);
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
          data={mixedFeed}
          renderItem={renderMixedRow}
          keyExtractor={(_, index) => index.toString()}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          ListHeaderComponent={
            <>
              <HomeHeader
                selectedCityName={fullName ? fullName : selectedCity?.name || safeCities[0]?.name || "Select City"}
                onPressLocation={() => setShowLocationModal(true)}
              />
              <HomeSearchBar
                onPressSearch={() => router.push("/stacks/search")}
                onPressHelp={() => Linking.openURL("https://wa.me/919876543210")}
                onPressFavorites={() => router.push("/(tabs)/myListing")}
                onPressNotifications={() => router.push("/stacks/notifications")}
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
                  Fresh Recommendations
                </ThemedText>
                <TouchableOpacity style={styles.seeAllBtn} onPress={() => router.push({ pathname: "/stacks/seeAllFresh" })}>
                  <ThemedText style={styles.seeAllText}>See All</ThemedText>
                  <Ionicons name="arrow-forward" size={15} color="#1565C0" />
                </TouchableOpacity>
              </View>
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
});
