import { BannerCard } from "@/components/cards/BannerCard";
import { FeaturedCard } from "@/components/cards/FeaturedCard";
import { ListingCard } from "@/components/cards/ListingCard";
import { HomeBannerAds } from "@/components/home/HomeBannerAds";
import { HomeCategories } from "@/components/home/HomeCategories";
import { HomeFeaturedAds } from "@/components/home/HomeFeaturedAds";
import { HomeHeader } from "@/components/home/HomeHeader";
import { HomeMatrimonyProfiles } from "@/components/home/HomeMatrimonyProfiles";
import { HomeSearchBar } from "@/components/home/HomeSearchBar";
import { UserShimmerLoader } from "@/components/loader/UserShimmerLoader";
import { LocationModal } from "@/components/modals/LocationModal";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS } from "@/constants/Colors";
import {
  favoritesUrl,
  getBannerAdsUrl,
  getCategoriesUrl,
  getCitiesUrl,
  getFeaturedAdsUrl,
  getLocalitiesUrl,
  getProductsUrl,
  getPromotionBannerApi,
  getStatesUrl,
  getSubCategoriesUrl,
  baseUrl,
  getAuthToken,
  getNormalAdsInfoApi,
  getNotifications,
  isValidImageUri,
  logoutUser,
} from "@/constants/functions";
import axios from "axios";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { setClearData } from "@/store/reducers/paymentReducer";
import {
  appendProductsRecieved,
  clearProducts,
  getAllProducts,
  getBannersApi,
  getCategoriesApi,
  getCitiesApi,
  getFavoritesApi,
  getFeaturedAdsApi,
  getLocalitiesApi,
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
  const hasBootstrappedRef = useRef(false);
  const lastFetchedProductsKeyRef = useRef<string | null>(null);
  const isCheckingNotificationsRef = useRef(false);
  const isInitializingCityRef = useRef(false);
  const { cities, categories, products, banners, featuredAds, states, localities } =
    useSelector((state: any) => state.entities.userReducer) || {};
  const { user } = useSelector((state: any) => state.entities.authReducer) || {};
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [selectedLocality, setSelectedLocality] = useState<any>(null);
  const [isLocationFilterEnabled, setIsLocationFilterEnabled] = useState(false);
  const [locationRequestVersion, setLocationRequestVersion] = useState(0);
  const [isCityInitialized, setIsCityInitialized] = useState(false);
  const [promotionBanners, setPromotionBanners] = useState<any>([]);
  const [normalAdsInfo, setNormalAdsInfo] = useState<any>(null);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [isInitialHomeLoading, setIsInitialHomeLoading] = useState(true);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const isLoadingMoreRef = useRef(false);
  const currentPageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const hasFinishedInitialHomeLoadRef = useRef(false);
  const finishInitialHomeLoading = useCallback(() => {
    if (hasFinishedInitialHomeLoadRef.current) return;

    hasFinishedInitialHomeLoadRef.current = true;
    setIsInitialHomeLoading(false);
  }, []);
  const safeLocalities = useMemo(() => (Array.isArray(localities) ? localities : []), [localities]);
  const safeProducts = Array.isArray(products) ? products : [];
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeCities = useMemo(() => (Array.isArray(cities) ? cities : []), [cities]);
  const safeBanners = useMemo(() => (Array.isArray(banners) ? banners : []), [banners]);
  const getProductsRequestUrl = useCallback((page = 1) => {
    const locationScope = selectedCity?.locationScope;
    const isStateOnly = locationScope === "state" || !selectedCity?.id;
    const stateId = selectedCity?.state_id;
    const cityId = isStateOnly ? null : selectedCity?.id;
    const localityId = isStateOnly ? null : selectedLocality?.id;

    if (isLocationFilterEnabled && stateId) {
      const locationUrl = `${getProductsUrl}/filter/location?state_id=${encodeURIComponent(stateId)}${cityId ? `&city_id=${encodeURIComponent(cityId)}` : ""}${localityId ? `&locality_id=${encodeURIComponent(localityId)}` : ""}`;
      return page > 1 ? `${locationUrl}&page=${page}` : locationUrl;
    }

    return `${getProductsUrl}?per_page=20&page=${page}`;
  }, [isLocationFilterEnabled, selectedCity?.id, selectedCity?.locationScope, selectedCity?.state_id, selectedLocality?.id]);
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


  useFocusEffect(
    useCallback(() => {
      if (isCheckingNotificationsRef.current) return;

      isCheckingNotificationsRef.current = true;
      checkUnreadNotifications().finally(() => {
        isCheckingNotificationsRef.current = false;
      });
    }, [checkUnreadNotifications])
  );

  // Effect 1: Initialize city only (localities aren't loaded yet at this point)
  useEffect(() => {
    const initializeCity = async () => {
      if (safeCities.length === 0 || isCityInitialized || isInitializingCityRef.current) return;

      isInitializingCityRef.current = true;
      try {
        // Priority 1: Keep the location explicitly selected on this device.
        const savedCityJson = await AsyncStorage.getItem("selectedCity");
        if (savedCityJson) {
          const savedCity = JSON.parse(savedCityJson);
          if (savedCity?.locationScope === "all" || (savedCity?.locationScope === "state" && savedCity?.state_id)) {
            setIsLocationFilterEnabled(savedCity.locationScope === "state");
            setSelectedCity(savedCity);
            setSelectedLocality(null);
            setIsCityInitialized(true);
            return;
          }
          const savedCityFromList = safeCities.find((c: any) => Number(c.id) === Number(savedCity.id));
          if (savedCityFromList) {
            const savedLocationFilter = await AsyncStorage.getItem("isLocationFilterEnabled");
            setIsLocationFilterEnabled(savedLocationFilter === "true");
            setSelectedCity({ ...savedCityFromList, locationScope: savedCity.locationScope });
            setIsCityInitialized(true);
            return;
          }
        }
        // Priority 2: Use the profile city only when this device has no saved choice.
        if (user?.city_id) {
          const userCity = safeCities.find((c: any) => Number(c.id) === Number(user.city_id));
          if (userCity) {
            setSelectedCity(userCity);
            setIsCityInitialized(true);
            return;
          }
        }
        // Priority 3: Default to first city.
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
  }, [safeCities, user?.city_id, isCityInitialized]);

  // Effect 2: Initialize locality once localities are fetched for the selected city
  useEffect(() => {
    if (safeLocalities.length === 0 || selectedLocality) return;
    if (selectedCity?.locationScope === "state" || selectedCity?.locationScope === "all" || !selectedCity?.id) {
      return;
    }
    const initializeLocality = async () => {
      try {
        // Priority 1: Restore the locality explicitly selected on this device.
        const savedLocalityJson = await AsyncStorage.getItem("selectedLocality");
        if (savedLocalityJson === "" || savedLocalityJson === "null") {
          return;
        }
        if (savedLocalityJson) {
          const savedLocality = JSON.parse(savedLocalityJson);
          const savedLocalityFromList = safeLocalities.find((l: any) => Number(l.id) === Number(savedLocality.id));
          if (savedLocalityFromList) {
            setSelectedLocality(savedLocalityFromList);
            return;
          }
        }
        // Priority 2: Use the profile locality only when this device has no saved choice.
        const savedCityJson = await AsyncStorage.getItem("selectedCity");
        if (savedCityJson) {
          return;
        }
        if (user?.locality_id) {
          const userLocality = safeLocalities.find((l: any) => Number(l.id) === Number(user.locality_id));
          if (userLocality) {
            setSelectedLocality(userLocality);
          }
        }
      } catch (error) {
        console.log("Error initializing locality:", error);
      }
    };
    initializeLocality();
  }, [safeLocalities, selectedCity?.id, selectedCity?.locationScope, selectedLocality, user?.locality_id]);

  useEffect(() => {
    if (hasBootstrappedRef.current) return;
    hasBootstrappedRef.current = true;

    getPromotionBannerApi().then((res) => {
      setPromotionBanners(res);
    });
    dispatch(getCategoriesApi(getCategoriesUrl));
    dispatch(getSubCategoriesApi(`${getSubCategoriesUrl}`));
    dispatch(getStatesApi(getStatesUrl));
    const citiesRequest = dispatch(getCitiesApi(getCitiesUrl)) as unknown as Promise<unknown>;
    citiesRequest.catch((error) => {
      console.log("Error loading home cities:", error);
      finishInitialHomeLoading();
    });
    dispatch(setClearData(null));
    dispatch(getBannersApi(getBannerAdsUrl));
    dispatch(getFeaturedAdsApi(getFeaturedAdsUrl));
    dispatch(getFavoritesApi(favoritesUrl));
    getNormalAdsInfoApi()
      .then((res: any) => {
        setNormalAdsInfo(res);
      })
      .catch((err) => {
        if (err.message === "Unauthenticated") {
          logoutUser(dispatch, router, "user");
        }
      });

  }, [dispatch, finishInitialHomeLoading, router]);

  useEffect(() => {
    const locationScope = selectedCity?.locationScope;
    const isStateOnly = locationScope === "state" || !selectedCity?.id;
    const cityId = isStateOnly ? null : selectedCity?.id;
    const stateId = selectedCity?.state_id;
    const localityId = isStateOnly ? null : selectedLocality?.id;
    if (selectedCity) {
      const requestKey = isLocationFilterEnabled && stateId
        ? `location:${stateId}:${cityId || "all"}:${localityId || "all"}:${locationRequestVersion}`
        : `all:${locationRequestVersion}`;

      if (lastFetchedProductsKeyRef.current === requestKey) return;
      lastFetchedProductsKeyRef.current = requestKey;

      setHasMoreProducts(true);
      currentPageRef.current = 1;
      hasMoreRef.current = true;
      isLoadingMoreRef.current = false;

      if (cityId) {
        dispatch(getLocalitiesApi(`${getLocalitiesUrl}?city_id=${cityId}`));
      }
      dispatch(clearProducts(requestKey));
      const productsRequest = dispatch(
        getAllProducts(getProductsRequestUrl(1), requestKey)
      ) as unknown as Promise<unknown>;

      productsRequest
        .then((response: any) => {
          if (lastFetchedProductsKeyRef.current !== requestKey) return;

          const paginator = response?.data;
          const noMore = !paginator?.next_page_url
            || (paginator?.last_page != null && paginator.current_page >= paginator.last_page);
          if (noMore) {
            hasMoreRef.current = false;
            setHasMoreProducts(false);
          }
        })
        .catch((error) => {
          console.log("Error loading home products:", error);
        })
        .finally(() => {
          finishInitialHomeLoading();
        });
    }
  }, [dispatch, finishInitialHomeLoading, getProductsRequestUrl, isLocationFilterEnabled, locationRequestVersion, selectedCity, selectedCity?.id, selectedCity?.state_id, selectedLocality?.id]);

  const loadMoreProducts = useCallback(async () => {
    if (!hasMoreRef.current || isLoadingMoreRef.current) return;
    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);
    const nextPage = currentPageRef.current + 1;
    const requestKey = lastFetchedProductsKeyRef.current;
    try {
      const authHeaders = await getAuthToken();
      const url = `${baseUrl}/${getProductsRequestUrl(nextPage)}`;
      const response = await axios.get(url, authHeaders);
      const raw = response.data;
      // API shape: { status, data: { current_page, data: [...], last_page, next_page_url } }
      const paginator = raw?.data;
      const list = Array.isArray(paginator) ? paginator : Array.isArray(paginator?.data) ? paginator.data : [];
      dispatch(appendProductsRecieved({ data: list, requestKey }) as any);
      const noMore = !paginator?.next_page_url
        || (paginator?.last_page != null && nextPage >= paginator.last_page);
      if (noMore) {
        hasMoreRef.current = false;
        setHasMoreProducts(false);
      }
      currentPageRef.current = nextPage;
    } catch {
      // console.log('[Pagination] error:', e?.message, e?.response?.status);
    }
    isLoadingMoreRef.current = false;
    setIsLoadingMore(false);
  }, [dispatch, getProductsRequestUrl]);

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
  const handleSelectCity = async (city: any) => {
    const locationScope = city?.locationScope || (city?.id ? "city" : city?.state_id ? "state" : "all");
    const selectedLocation = { ...city, locationScope };
    const shouldFilterByLocation = locationScope !== "all" && Boolean(selectedLocation.state_id);
    setSelectedCity(selectedLocation);
    setSelectedLocality(null);
    setIsLocationFilterEnabled(shouldFilterByLocation);
    setLocationRequestVersion((version) => version + 1);
    savedHomeScrollY = 0;
    hasRestoredScrollRef.current = false;
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    });
    await AsyncStorage.multiSet([
      ["selectedCity", JSON.stringify(selectedLocation)],
      ["selectedLocality", ""],
      ["isLocationFilterEnabled", shouldFilterByLocation ? "true" : "false"],
    ]);
  };

  const handleSelectLocality = async (locality: any) => {
    setSelectedLocality(locality);
    setLocationRequestVersion((version) => version + 1);
    savedHomeScrollY = 0;
    hasRestoredScrollRef.current = false;
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    });
    await AsyncStorage.setItem(
      "selectedLocality",
      locality ? JSON.stringify(locality) : ""
    );
  };

  const fullName = [selectedLocality?.name,selectedCity?.name].filter(Boolean).join(", ");
  return (
    <ThemedView style={styles.container}>
      {isInitialHomeLoading ? (
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
          extraData={locationRequestVersion}
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
              <HomeMatrimonyProfiles
                  onPressSeeAll={() => router.push({ pathname: "/stacks/seeAllMatrimony" })}
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
                  activeOpacity={0.8}
                >
                  <View style={styles.topTextBannerLeft}>
                    {isValidImageUri(normalAdsInfo.icon) ? (
                      <Image
                        source={{ uri: normalAdsInfo.icon }}
                        style={{ width: 32, height: 32, marginRight: 8, borderRadius: 4, flexShrink: 0 }}
                      />
                    ) : (
                      <Ionicons name="megaphone-outline" size={22} color="#1565C0" style={{ marginRight: 8, flexShrink: 0 }} />
                    )}
                    <ThemedText
                      style={styles.topTextBannerLeftText}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {normalAdsInfo.title}
                    </ThemedText>
                  </View>

                  <View style={styles.topTextBannerHighlight}>
                    <ThemedText
                      style={styles.topTextBannerHighlightText}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
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
                <ThemedText style={styles.footerEndText}>You&apos;re all caught up</ThemedText>
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
        onSelectCity={handleSelectCity}
        onSelectLocality={handleSelectLocality}
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
    width: "100%",
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E8F0FE",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#BBDEFB",
    overflow: "hidden",
  },
  topTextBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    overflow: "hidden",
  },
  topTextBannerLeftText: {
    fontSize: 13,
    color: "#0D47A1",
    fontWeight: "700",
    flexShrink: 1,
    minWidth: 0,
    lineHeight: 18,
    includeFontPadding: false,
  },
  topTextBannerHighlight: {
    maxWidth: "36%",
    minWidth: 0,
    backgroundColor: "#1565C0",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 10,
    flexShrink: 0,
  },
  topTextBannerHighlightText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
    flexShrink: 1,
  },
});
