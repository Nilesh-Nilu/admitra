import ReportModal from "@/components/modals/ReportModal";
import ThemeHeader from "@/components/headers/ThemeHeader";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  BackHandler,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { getBannerWarningApi, createConversationApi, reportProductApi, reportUserApi, addToFavoritesApi, getFavoritesListApi, removeFromFavoritesApi } from "@/constants/functions";
import AppToast from "@/components/toasts/AppToast";
import { COLORS } from "@/constants/Colors";
import ImageZoomModal from "@/components/modals/ImageZoomModal";
import RenderHTML from "react-native-render-html";
import { useDispatch, useSelector } from "react-redux";
import { getFavoritesApi, removeFavoriteById } from "@/store/reducers/userReducer";
import { favoritesUrl } from "@/constants/functions";

interface BannerData {
  id: number;
  banner_image: string;
  banner_video_url?: string;
  product?: {
    name?: string;
    description?: string;
    price?: number;
    condition?: string;
    price_negotiable?: boolean;
    [key: string]: any;
  };
  name?: string;
  description?: string;
  rating?: number;
  reviews?: number;
  website_link?: string;
}

export default function BannerDetailsScreen() {
  const params = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const dispatch = useDispatch();
  const [banner, setBanner] = useState<BannerData | null>(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const [zoomModalVisible, setZoomModalVisible] = useState(false);
  const [bannerWarnings, setBannerWarnings] = useState<any[]>([]);
  const [reportTarget, setReportTarget] = useState<"ad" | "user">("ad");

  const favorites = useSelector((state: any) => state.entities.userReducer.favorites);
  const product = banner?.product;

  const favoriteEntry = useMemo(
    () => favorites?.find((fav: any) => fav.product_id === product?.id || fav.product?.id === product?.id),
    [favorites, product?.id]
  );
  const isFavorite = !!favoriteEntry;

  const initializeBanner = useCallback(() => {
    if (params.bannerData) {
      try {
        setBanner(JSON.parse(params.bannerData as string));
      } catch (error) {
        setBanner(null);
      }
    }
  }, [params.bannerData]);

  const handleCall = () => {
    if (product?.user?.phone) {
      Linking.openURL(`tel:${product?.user?.phone}`);
    } else {
      Alert.alert("Error", "Phone number not available");
    }
  };
  useEffect(() => {
    initializeBanner();
    getBannerWarningApi().then(setBannerWarnings).catch(console.error);
    dispatch(getFavoritesApi(favoritesUrl) as any);
  }, [initializeBanner]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      router.back();
      return true;
    });
    return () => backHandler.remove();
  }, []);

  const openUrl = async (url?: string, label = "Link") => {
    if (!url) {
      Alert.alert("Coming Soon", `${label} not available`);
      return;
    }
    try {
      const full = url.startsWith("http") ? url : `https://${url}`;
      if (await Linking.canOpenURL(full)) {
        await Linking.openURL(full);
      } else {
        Alert.alert("Error", "Cannot open this URL");
      }
    } catch {
      Alert.alert("Error", `Failed to open ${label.toLowerCase()}`);
    }
  };

  const handleOpenReportModal = (target: "ad" | "user") => {
    setReportTarget(target);
    setReportReason("");
    setReportModalVisible(true);
  };

  const handleCloseReportModal = () => {
    if (!isReporting) setReportModalVisible(false);
  };

  const handleChat = async () => {
    try {
      const vendor_id = product?.user?.user_id ? product?.user?.user_id : product?.user_id;
      const response = await createConversationApi({
        vendor_id: vendor_id,
        subject: "Product inquiry",
      });
      if (response.id) {
        router.push({
          pathname: "/stacks/chatDetail",
          params: {
            conversation_id: response.id,
            receiverId: response.vendor_id,
            userName: product?.user?.name || 'Unknown',
          },
        });
      } else {
        Alert.alert("Error", "Failed to create conversation");
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const handleToggleFavorite = async () => {
    if (!product?.id) return;
    try {
      if (isFavorite && favoriteEntry) {
        const entryId = favoriteEntry.id;
        dispatch(removeFavoriteById(entryId));
        const response = await removeFromFavoritesApi(entryId);
        if (response?.status === false) {
          dispatch(getFavoritesApi(favoritesUrl) as any);
          AppToast(response?.message || "Failed to remove from favorites.");
        } else {
          AppToast(response?.message || "Removed from favorites.");
        }
      } else {
        const response = await addToFavoritesApi(Number(product.id));
        if (response?.status === false) {
          AppToast(response?.message || "Failed to add to favorites.");
        } else {
          dispatch(getFavoritesApi(favoritesUrl) as any);
          AppToast(response?.message || "Added to favorites!");
        }
      }
    } catch (error) {
      console.log(error, "error");
      dispatch(getFavoritesApi(favoritesUrl) as any);
      AppToast("Failed to update favorites. Please try again.");
    }
  };

  const handleReportProduct = async () => {
    const reason = reportReason.trim();

    if (!reason) {
      Alert.alert("Reason required", `Please enter a reason to report this ${reportTarget === "user" ? "user" : "ad"}.`);
      return;
    }

    try {
      setIsReporting(true);
      let response;
      if (reportTarget === "user") {
        const userId = product?.user?.id || product?.user?.user_id;
        if (!userId) {
          Alert.alert("Error", "Unable to report this user right now.");
          return;
        }
        response = await reportUserApi({ reported_user_id: Number(userId), reason });
      } else {
        if (!product?.id) {
          Alert.alert("Error", "Unable to report this ad right now.");
          return;
        }
        response = await reportProductApi({ product_id: Number(product.id), reason });
      }
      if (response.status === false) {
        AppToast(`Failed to report this ${reportTarget === "user" ? "user" : "ad"}. Please try again.`);
      } else {
        AppToast(response.message);
        setReportModalVisible(false);
        setReportReason("");
      }
    } catch (error) {
      console.log(error, "error");
      AppToast(`Failed to report this ${reportTarget === "user" ? "user" : "ad"}. Please try again.`);
    } finally {
      setIsReporting(false);
    }
  };

  const disclaimerHtmlWidth = width - SIZES.padding * 6;

  return (
    <ThemedView style={styles.container}>
      <ThemeHeader onBackPress={() => router.back()} title="Ad Details" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Banner Image ── */}
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => banner?.banner_image && setZoomModalVisible(true)}
          style={styles.bannerWrapper}
        >
          <Image
            source={{ uri: banner?.banner_image }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View style={styles.typeBadge}>
            <ThemedText style={styles.typeBadgeText}>Banner</ThemedText>
          </View>
          {/* Favorite pill */}
          <TouchableOpacity
            style={styles.favPill}
            onPress={handleToggleFavorite}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={18}
              color={isFavorite ? "#E91E63" : "#374151"}
            />
            <ThemedText style={[styles.favPillText, isFavorite && { color: "#E91E63" }]}>
              {isFavorite ? "Saved" : "Save"}
            </ThemedText>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* ── Product Info Card ── */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <ThemedText style={styles.title} numberOfLines={2}>
              {product?.name || "Ad Title"}
            </ThemedText>
            {product?.condition && (
              <View style={[
                styles.conditionBadge,
                product.condition.toLowerCase() === "new"
                  ? styles.conditionBadgeNew
                  : styles.conditionBadgeUsed,
              ]}>
                <ThemedText style={[
                  styles.conditionBadgeText,
                  product.condition.toLowerCase() === "new"
                    ? { color: "#166534" }
                    : { color: "#92400E" },
                ]}>
                  {product.condition}
                </ThemedText>
              </View>
            )}
          </View>

          {!!product?.price && (
            <View style={styles.priceRow}>
              <ThemedText style={styles.price}>₹{product.price}</ThemedText>
              {product?.price_negotiable && (
                <View style={styles.negotiableBadge}>
                  <Ionicons name="checkmark-circle" size={13} color="#059669" />
                  <ThemedText style={styles.negotiableText}>Negotiable</ThemedText>
                </View>
              )}
            </View>
          )}

          {!!product?.description && (
            <ThemedText style={styles.description}>{product.description}</ThemedText>
          )}

          {/* Location row */}
          {(product?.user?.city?.name || product?.user?.state?.name) && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="#64748B" />
              <ThemedText style={styles.locationText}>
                {[product?.user?.city?.name, product?.user?.state?.name].filter(Boolean).join(", ")}
              </ThemedText>
            </View>
          )}
        </View>

        {/* ── CTA Buttons ── */}
        <View style={styles.ctaRow}>
          <TouchableOpacity
            style={[styles.ctaBtn, styles.ctaBtnPrimary]}
            onPress={() => openUrl(banner?.website_link, "Website link")}
            activeOpacity={0.85}
          >
            <Ionicons name="globe-outline" size={20} color="#fff" />
            <ThemedText style={styles.ctaBtnText}>Book Now</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.ctaBtn, styles.ctaBtnRed]}
            onPress={() => openUrl(banner?.banner_video_url, "Video link")}
            activeOpacity={0.85}
          >
            <Ionicons name="play-circle" size={20} color="#fff" />
            <ThemedText style={styles.ctaBtnText}>Watch Video</ThemedText>
          </TouchableOpacity>
        </View>

        {/* ── Disclaimer ── */}
        <View style={styles.disclaimerContainer}>
          <Ionicons name="shield-checkmark" size={18} color="#1565C0" />
          <ThemedText style={styles.disclaimerText}>
            <ThemedText style={styles.disclaimerHighlight}>GAXA </ThemedText>
            किसी भी external link या content के लिए जिम्मेदार नहीं है।
          </ThemedText>
        </View>

        {bannerWarnings.map((warning: any) => (
          <View key={warning.id} style={styles.disclaimerContainer}>
            <View style={styles.disclaimerIconWrap}>
              {warning.icon ? (
                <Image source={{ uri: warning.icon }} style={styles.disclaimerIconImg} resizeMode="cover" />
              ) : (
                <Ionicons name="shield-checkmark" size={18} color="#1565C0" />
              )}
            </View>
            <RenderHTML
              contentWidth={disclaimerHtmlWidth}
              source={{ html: warning.warning_text }}
              tagsStyles={{ p: styles.disclaimerText }}
            />
          </View>
        ))}

        {/* ── Seller Actions ── */}
        <View style={styles.sectionCard}>
          <ThemedText style={styles.sectionLabel}>Contact Seller</ThemedText>

          {/* Seller identity */}
          <TouchableOpacity
            style={styles.sellerRow}
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: "/stacks/userProfile",
                params: { userData: JSON.stringify(product?.user) },
              })
            }
          >
            <View style={styles.sellerAvatar}>
              {product?.user?.profile_image ? (
                <Image source={{ uri: product.user.profile_image }} style={{ width: 38, height: 38, borderRadius: 19 }} />
              ) : (
                <Ionicons name="person-outline" size={22} color="#64748B" />
              )}
            </View>
            <View style={{ flex: 1 }}>
              {!!product?.user?.name && (
                <ThemedText style={styles.sellerName}>{product.user.name}</ThemedText>
              )}
              {(product?.user?.city?.name || product?.user?.state?.name) && (
                <View style={styles.sellerLocationRow}>
                  <Ionicons name="location-outline" size={12} color="#94A3B8" />
                  <ThemedText style={styles.sellerLocationText}>
                    {[product?.user?.city?.name, product?.user?.state?.name].filter(Boolean).join(", ")}
                  </ThemedText>
                </View>
              )}
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
          </TouchableOpacity>

          <View style={styles.contactRow}>
            <TouchableOpacity
              style={[styles.contactBtn, styles.contactBtnCall]}
              activeOpacity={0.8}
              onPress={() => handleCall()}
            >
              <View style={styles.contactBtnIcon}>
                <Ionicons name="call" size={22} color={COLORS.green} />
              </View>
              <ThemedText style={[styles.contactBtnLabel, { color: COLORS.white }]}>Call Seller</ThemedText>
              <ThemedText style={styles.contactBtnSub}>Direct call</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactBtn, styles.contactBtnChat]}
              activeOpacity={0.8}
              onPress={handleChat}
            >
              <View style={styles.contactBtnIcon}>
                <Ionicons name="chatbubble-ellipses" size={22} color="#7C3AED" />
              </View>
              <ThemedText style={[styles.contactBtnLabel, { color: "#7C3AED" }]}>Chat Seller</ThemedText>
              <ThemedText style={styles.contactBtnSub}>Send message</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Save & Report ── */}
        <View style={styles.sectionCard}>

          <View style={styles.listDivider} />

          {/* Report Ad */}
          <TouchableOpacity
            style={styles.listRow}
            activeOpacity={0.8}
            onPress={() => handleOpenReportModal("ad")}
          >
            <View style={[styles.listRowIcon, { backgroundColor: "#FEF2F2" }]}>
              <Ionicons name="flag-outline" size={20} color="#DC2626" />
            </View>
            <View style={styles.listRowText}>
              <ThemedText style={[styles.listRowTitle, { color: "#DC2626" }]}>Report Ad</ThemedText>
              <ThemedText style={styles.listRowSub}>Flag inappropriate content</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>

          <View style={styles.listDivider} />

          {/* Report User */}
          <TouchableOpacity
            style={styles.listRow}
            activeOpacity={0.8}
            onPress={() => handleOpenReportModal("user")}
          >
            <View style={[styles.listRowIcon, { backgroundColor: "#FEF2F2" }]}>
              <Ionicons name="person-remove-outline" size={20} color="#DC2626" />
            </View>
            <View style={styles.listRowText}>
              <ThemedText style={[styles.listRowTitle, { color: "#DC2626" }]}>Report User</ThemedText>
              <ThemedText style={styles.listRowSub}>Report this seller</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ReportModal
        visible={reportModalVisible}
        reason={reportReason}
        onChangeReason={setReportReason}
        onClose={handleCloseReportModal}
        onSubmit={handleReportProduct}
        isSubmitting={isReporting}
      />
      <ImageZoomModal
        visible={zoomModalVisible}
        images={banner?.banner_image ? [{ image: banner.banner_image }] : []}
        initialIndex={0}
        onClose={() => setZoomModalVisible(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  /* Banner */
  bannerWrapper: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 6,
  },
  bannerImage: {
    width: "100%",
    height: 220,
  },
  favPill: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  favPillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  }, typeBadge: {
    position: "absolute",
    top: SIZES.padding10,
    left: SIZES.padding10,
    zIndex: 2,
    backgroundColor: "#1565C0",
    paddingHorizontal: SIZES.padding8,
    paddingVertical: SIZES.padding2,
    borderRadius: SIZES.radius2,
  },
  typeBadgeText: {
    fontSize: SIZES.fontSize10 - 1,
    fontWeight: "700",
    color: COLORS.white,
  },


  /* Info Card */
  infoCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 28,
  },
  conditionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  conditionBadgeNew: {
    backgroundColor: "#DCFCE7",
  },
  conditionBadgeUsed: {
    backgroundColor: "#FEF3C7",
  },
  conditionBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
    marginBottom: 10,
  },
  price: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
  },
  negotiableBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  negotiableText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#059669",
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: "#6B7280",
    marginTop: 4,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  locationText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sellerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  sellerName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  sellerLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  sellerLocationText: {
    fontSize: 12,
    color: "#94A3B8",
  },

  /* CTA Buttons */
  ctaRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 14,
    gap: 10,
  },
  ctaBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  ctaBtnPrimary: {
    backgroundColor: "#1D4ED8",
  },
  ctaBtnRed: {
    backgroundColor: "#DC2626",
  },
  ctaBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },

  /* Disclaimer */
  disclaimerContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "#EFF6FF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  disclaimerIconWrap: {
    marginTop: 2,
  },
  disclaimerIconImg: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    color: "#1E40AF",
    lineHeight: 20,
  },
  disclaimerHighlight: {
    fontWeight: "700",
    color: "#1D4ED8",
  },

  /* Section Card */
  sectionCard: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
  },

  /* Contact Buttons */
  contactRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingBottom: 16,
    gap: 10,
  },
  contactBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 16,
  },
  contactBtnCall: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1.5,
    borderColor: "#BBF7D0",
  },
  contactBtnChat: {
    backgroundColor: "#F5F3FF",
    borderWidth: 1.5,
    borderColor: "#DDD6FE",
  },
  contactBtnIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  contactBtnLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  contactBtnSub: {
    fontSize: 11,
    color: "#94A3B8",
  },

  /* List Rows */
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  listRowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  listRowText: {
    flex: 1,
  },
  listRowTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  listRowSub: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },
  listDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginLeft: 68,
  },
});
