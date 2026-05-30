import ReportModal from "@/components/modals/ReportModal";
import ThemeHeader from "@/components/headers/ThemeHeader";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  Dimensions,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { getBannerWarningApi, reportProductApi } from "@/constants/functions";
import AppToast from "@/components/toasts/AppToast";
import { COLORS } from "@/constants/Colors";
import ImageZoomModal from "@/components/modals/ImageZoomModal";
import RenderHTML from "react-native-render-html";

const { width: screenWidth } = Dimensions.get("window");
const BANNER_HEIGHT = screenWidth * 0.5;

interface BannerData {
  id: number;
  banner_image: string;
  banner_video_url?: string;
  product?: {
    name?: string;
    description?: string;
    price?: number;
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
  const { width: screenWidth } = useWindowDimensions();
  const [banner, setBanner] = useState<BannerData | null>(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const [zoomModalVisible, setZoomModalVisible] = useState(false);
  const [bannerWarnings, setBannerWarnings] = useState<any[]>([]);

  const initializeBanner = useCallback(() => {
    if (params.bannerData) {
      try {
        setBanner(JSON.parse(params.bannerData as string));
      } catch (error) {
        console.error("Error parsing banner data:", error);
        setBanner(null);
      }
    }
  }, [params.bannerData]);

  useEffect(() => {
    initializeBanner();
    getBannerWarningApi().then(setBannerWarnings).catch(console.error);
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

  const handleOpenReportModal = () => {
    setReportReason("");
    setReportModalVisible(true);
  };

  const handleCloseReportModal = () => {
    if (!isReporting) setReportModalVisible(false);
  };

  const handleReportProduct = async () => {
    const reason = reportReason.trim();
    if (!reason) {
      Alert.alert("Reason required", "Please enter a reason to report this ad.");
      return;
    }
    if (!banner?.product?.id) {
      Alert.alert("Error", "Unable to report this ad right now.");
      return;
    }
    try {
      setIsReporting(true);
      const response = await reportProductApi({
        product_id: Number(banner.product.id),
        reason,
      });
      if (response.status === false) {
        AppToast("Failed to report this ad. Please try again.");
      } else {
        AppToast(response.message);
        setReportModalVisible(false);
        setReportReason("");
      }
    } catch (error) {
      console.error(error);
      AppToast("Failed to report this ad. Please try again.");
    } finally {
      setIsReporting(false);
    }
  };

  const disclaimerHtmlWidth = screenWidth - SIZES.padding * 6;

  const DefaultDisclaimer = () => (
    <View style={styles.disclaimerContainer}>
      <View style={styles.disclaimerIcon}>
        <Ionicons name="shield-checkmark" size={20} color="#1565C0" />
      </View>
      <ThemedText style={styles.disclaimerText}>
        <ThemedText style={styles.disclaimerHighlight}>GAXA </ThemedText>
        किसी भी external link या content के लिए जिम्मेदार नहीं है।
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemeHeader onBackPress={() => router.push("/(tabs)")} title="Ad Actions" />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Banner Image ── */}
        <View style={styles.bannerContainer}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => banner?.banner_image && setZoomModalVisible(true)}
          >
            <Image
              source={{ uri: banner?.banner_image }}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </View>

        {/* ── Ad Info ── */}
        <View style={styles.infoSection}>
          <ThemedText style={styles.title}>
            {banner?.product?.name || "Best AC Service Offer"}
          </ThemedText>
          <ThemedText style={styles.description}>
            {banner?.product?.description || "AC Installation, Repairing & Maintenance"}
          </ThemedText>
          {!!banner?.product?.price && (
            <ThemedText style={styles.price}>₹{banner.product.price}</ThemedText>
          )}
        </View>

        {/* ── Divider ── */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <ThemedText style={styles.dividerText}>Choose an option to continue</ThemedText>
          <View style={styles.dividerLine} />
        </View>

        {/* ── Primary Actions ── */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openUrl(banner?.website_link, "Website link")}
            activeOpacity={0.8}
          >
            <View style={[styles.iconCircle, { backgroundColor: "#E8F0FE" }]}>
              <Ionicons name="globe-outline" size={26} color="#1565C0" />
            </View>
            <View style={styles.actionTextContainer}>
              <ThemedText style={styles.actionTitle}>Book Now</ThemedText>
              <ThemedText style={styles.actionSubtitle}>Open seller website</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#BDBDBD" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openUrl(banner?.banner_video_url, "Video link")}
            activeOpacity={0.8}
          >
            <View style={[styles.iconCircle, { backgroundColor: "#FFEBEE" }]}>
              <Ionicons name="play-circle" size={26} color="#C62828" />
            </View>
            <View style={styles.actionTextContainer}>
              <ThemedText style={[styles.actionTitle, { color: "#C62828" }]}>
                Watch Video
              </ThemedText>
              <ThemedText style={styles.actionSubtitle}>See product demo video</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#BDBDBD" />
          </TouchableOpacity>
        </View>
        <DefaultDisclaimer />
        {/* ── Warnings / Disclaimers ── */}
        {
          bannerWarnings.map((warning: any) => (
            <View key={warning.id} style={styles.disclaimerContainer}>
              <View style={styles.disclaimerIcon}>
                {warning.icon ? (
                  <Image
                    source={{ uri: warning.icon }}
                    style={styles.disclaimerIconImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons name="shield-checkmark" size={20} color="#1565C0" />
                )}
              </View>
              <RenderHTML
                contentWidth={disclaimerHtmlWidth}
                source={{ html: warning.warning_text }}
                tagsStyles={{ p: styles.disclaimerText }}
              />
            </View>
          ))
}

        {/* ── Seller Action Cards ── */}
        <View style={styles.sellerActionsCard}>
          {/* Row 1: Call + Chat */}
          <View style={styles.sellerActionsRow}>
            <TouchableOpacity
              style={[styles.sellerActionBtn, styles.sellerActionBtnBorderRight]}
              activeOpacity={0.75}
              onPress={() => Alert.alert("Call Seller", "Feature coming soon!")}
            >
              <View style={[styles.sellerActionIcon, { backgroundColor: "#E8F5E9" }]}>
                <Ionicons name="call" size={20} color="#2E7D32" />
              </View>
              <View style={styles.sellerActionText}>
                <ThemedText style={[styles.sellerActionTitle, { color: "#2E7D32" }]}>
                  Call Seller
                </ThemedText>
                <ThemedText style={styles.sellerActionSub}>Talk to seller</ThemedText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sellerActionBtn}
              activeOpacity={0.75}
              onPress={() => Alert.alert("Chat", "Feature coming soon!")}
            >
              <View style={[styles.sellerActionIcon, { backgroundColor: "#F3E5F5" }]}>
                <Ionicons name="chatbubble-ellipses" size={20} color="#7B1FA2" />
              </View>
              <View style={styles.sellerActionText}>
                <ThemedText style={[styles.sellerActionTitle, { color: "#7B1FA2" }]}>
                  Chat with Seller
                </ThemedText>
                <ThemedText style={styles.sellerActionSub}>Message seller</ThemedText>
              </View>
            </TouchableOpacity>
          </View>

          {/* Row 2: Report */}
          <View style={[styles.sellerActionsRow, styles.rowBorderTop]}>
            <TouchableOpacity
              style={[styles.reportBtn, styles.sellerActionBtnBorderRight]}
              activeOpacity={0.8}
              onPress={handleOpenReportModal}
            >
              <ThemedText style={styles.reportBtnTitle}>Report Ad</ThemedText>
              <ThemedText style={styles.reportBtnSub}>Report this ad</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.reportBtn}
              activeOpacity={0.8}
              onPress={() => Alert.alert("Report User", "Feature coming soon!")}
            >
              <ThemedText style={styles.reportBtnTitle}>Report User</ThemedText>
              <ThemedText style={styles.reportBtnSub}>Report this user</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Row 3: Favorites */}
          <View style={styles.rowBorderTop}>
            <TouchableOpacity
              style={styles.favBtn}
              activeOpacity={0.75}
              onPress={() => Alert.alert("Favorites", "Feature coming soon!")}
            >
              <View style={[styles.sellerActionIcon, { backgroundColor: "#FCE4EC" }]}>
                <Ionicons name="heart" size={20} color="#E91E63" />
              </View>
              <View style={styles.sellerActionText}>
                <ThemedText style={styles.favBtnTitle}>Add to Favorites</ThemedText>
                <ThemedText style={styles.sellerActionSub}>Save this ad for later</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#BDBDBD" style={{ marginLeft: "auto" }} />
            </TouchableOpacity>
          </View>
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
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 60,
  },

  /* Banner */
  bannerContainer: {
    marginHorizontal: SIZES.padding,
    marginTop: SIZES.padding,
    borderRadius: 16,
    overflow: "hidden",
  },
  bannerImage: {
    width: "100%",
    height: BANNER_HEIGHT,
  },

  /* Info */
  infoSection: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 18,
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginTop: 4,
  },

  /* Divider */
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SIZES.padding,
    marginTop: 22,
    marginBottom: 16,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    fontSize: 13,
    color: "#999",
  },

  /* Primary actions */
  actionsContainer: {
    paddingHorizontal: SIZES.padding,
    gap: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#F8F9FA",
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: "#E8E8E8",
    gap: 14,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1565C0",
    marginBottom: 3,
  },
  actionSubtitle: {
    fontSize: 12,
    color: "#888",
  },

  /* Disclaimer */
  disclaimerContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: SIZES.padding,
    marginTop: 14,
    padding: 14,
    backgroundColor: "#E8F0FE",
    borderRadius: 12,
    gap: 10,
  },
  disclaimerIcon: {
    marginTop: 1,
    flexShrink: 0,
  },
  disclaimerIconImage: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    color: "#1a3a6e",
    lineHeight: 20,
  },
  disclaimerHighlight: {
    fontWeight: "700",
    color: "#1565C0",
  },

  /* Seller action cards */
  sellerActionsCard: {
    marginHorizontal: SIZES.padding,
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: "#E0E0E0",
    overflow: "hidden",
  },
  sellerActionsRow: {
    flexDirection: "row",
  },
  rowBorderTop: {
    borderTopWidth: 0.5,
    borderTopColor: "#E0E0E0",
  },
  sellerActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
    backgroundColor: COLORS.white,
  },
  sellerActionBtnBorderRight: {
    borderRightWidth: 0.5,
    borderRightColor: "#E0E0E0",
  },
  sellerActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sellerActionText: {
    flex: 1,
  },
  sellerActionTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  sellerActionSub: {
    fontSize: 11,
    color: "#9E9E9E",
  },
  reportBtn: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: "#E53935",
    gap: 2,
  },
  reportBtnTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  reportBtnSub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
  },
  favBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
    backgroundColor: COLORS.white,
  },
  favBtnTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
});
