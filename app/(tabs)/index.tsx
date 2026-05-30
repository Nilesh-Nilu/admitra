import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { BannerCard } from "@/components/cards/BannerCard";
import { FeaturedCard } from "@/components/cards/FeaturedCard";
import { ListingCard } from "@/components/cards/ListingCard";
import { UserShimmerLoader } from "@/components/loader/UserShimmerLoader";
import { LocationModal } from "@/components/modals/LocationModal";
import { COLORS } from "@/constants/Colors";
import {
  getApprovedProductsUrl,
  getBannerAdsUrl,
  getCategoriesUrl,
  getCitiesUrl,
  getFeaturedAdsUrl,
  getProductsByLocationUrl,
  getPromotionBannerApi,
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
import { useRouter } from "expo-router";
import { useEffect, useState, useMemo } from "react";
import {
  Dimensions,
  FlatList,
  Linking,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HomeHeader } from "@/components/home/HomeHeader";
import { HomeSearchBar } from "@/components/home/HomeSearchBar";
import { HomeCategories } from "@/components/home/HomeCategories";
import { HomeBannerAds } from "@/components/home/HomeBannerAds";
import { HomeFeaturedAds } from "@/components/home/HomeFeaturedAds";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - SIZES.padding * 2 - 12) / 2;

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { loader, cities, categories, products, banners, featuredAds, states } =
    useSelector((state: any) => state.entities.userReducer) || {};
  const { user } = useSelector((state: any) => state.entities.authReducer) || {};
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [isCityInitialized, setIsCityInitialized] = useState(false);
  const [promotionBanners, setPromotionBanners] = useState<any>([]);

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
    getPromotionBannerApi().then((res) => {
      setPromotionBanners(res);
    });
  }, [selectedCity?.id]);

  const handleCategoryPress = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    if (categoryId !== null) {
      router.push({
        pathname: "/stacks/categories",
        params: { selectedCategory: categoryId.toString() },
      });
    }
  };

  const createMixedFeed = () => {
    const rows: any[] = [];
    if (!filteredProducts || filteredProducts.length === 0) return rows;

    let productIndex = 0;
    let bannerIndex = 0;
    let featuredIndex = 0;

    const safeBannersArr = Array.isArray(safeBanners) ? safeBanners : [];
    const featuredAdsArr = Array.isArray(featuredAds) ? featuredAds : [];

    while (productIndex < filteredProducts.length) {
      // 1. Add 5 normal products
      const normalChunk = filteredProducts.slice(productIndex, productIndex + 5);
      productIndex += 5;

      // Group normal products in rows of 2
      for (let i = 0; i < normalChunk.length; i += 2) {
        rows.push({
          type: "products_row",
          data: normalChunk.slice(i, i + 2),
        });
      }

      // 2. Add 1 banner ad
      if (safeBannersArr.length > 0) {
        rows.push({
          type: "banner_row",
          data: safeBannersArr[bannerIndex % safeBannersArr.length],
        });
        bannerIndex++;
      }

      // 3. Add 2 featured ads in a single row
      if (featuredAdsArr.length > 0) {
        const fChunk: any[] = [];
        fChunk.push(featuredAdsArr[featuredIndex % featuredAdsArr.length]);
        featuredIndex++;

        if (featuredAdsArr.length > 1) {
          fChunk.push(featuredAdsArr[featuredIndex % featuredAdsArr.length]);
          featuredIndex++;
        } else {
          fChunk.push(featuredAdsArr[0]);
        }

        rows.push({
          type: "featured_row",
          data: fChunk,
        });
      }
    }

    return rows;
  };

  const mixedFeed = useMemo(() => {
    return createMixedFeed();
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

  return (
    <ThemedView style={styles.container}>
      {loader ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <HomeHeader
            selectedCityName={selectedCity?.name || safeCities[0]?.name || "Select City"}
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
                selectedCityName={selectedCity?.name || safeCities[0]?.name || "Select City"}
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
              </View>
            </>
          }
          ListFooterComponent={<View style={{ height: 100 }} />}
          showsVerticalScrollIndicator={false}
        />
      )}
      <LocationModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        states={Array.isArray(states) ? states : []}
        cities={safeCities}
        onSelectCity={setSelectedCity}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5", top: -SIZES.padding8 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: SIZES.padding },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.padding12,
  },
  sectionTitle: { fontSize: SIZES.fontSize16, fontWeight: "700", color: COLORS.text },
});
