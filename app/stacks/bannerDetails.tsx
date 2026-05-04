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
  View,
} from "react-native";
import WebView from "react-native-webview";
import { reportProductApi } from "@/constants/functions";
import AppToast from "@/components/toasts/AppToast";
import { COLORS } from "@/constants/Colors";

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
  const [banner, setBanner] = useState<BannerData | null>(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  const initializeBanner = useCallback(() => {
    if (params.bannerData) {
      try {
        const parsedBanner = JSON.parse(params.bannerData as string);
        setBanner(parsedBanner);
      } catch (error) {
        console.error("Error parsing banner data:", error);
        setBanner(null);
      }
    }
  }, [params.bannerData]);
  console.log(banner, "banner");
  useEffect(() => {
    initializeBanner();
  }, [initializeBanner]);

  useEffect(() => {
    const backAction = () => {
      router.back();
      return true;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, []);

  const handleVisitWebsite = async () => {
    if (banner?.website_link) {
      try {
        const url = banner.website_link.startsWith("http")
          ? banner.website_link
          : `https://${banner.website_link}`;
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          Alert.alert("Error", "Cannot open this URL");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to open website");
      }
    } else {
      Alert.alert("Coming Soon", "Website link not available");
    }
  };

  const handleWatchVideo = async () => {
    if (banner?.banner_video_url) {
      try {
        const url = banner.banner_video_url.startsWith("http")
          ? banner.banner_video_url
          : `https://${banner.banner_video_url}`;
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          Alert.alert("Error", "Cannot open this video URL");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to open video");
      }
    } else {
      Alert.alert("Coming Soon", "Video link not available");
    }
  };

  const handleOpenReportModal = () => {
    setReportReason("");
    setReportModalVisible(true);
  };

  const handleCloseReportModal = () => {
    if (!isReporting) {
      setReportModalVisible(false);
    }
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
      console.log(error, "error");
      AppToast("Failed to report this ad. Please try again.");
    }
  };


  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <ThemeHeader onBackPress={() => router.push("/(tabs)")} title="Ad Actions" />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Banner Image / Video */}
        <View style={styles.bannerContainer}>
            <Image
              source={{ uri: banner?.banner_image }}
              style={styles.bannerImage}
              resizeMode="cover"
            />
        </View>

        {/* Ad Info */}
        <View style={styles.infoSection}>
          <ThemedText style={styles.title}>
            {banner?.product?.name || "Best AC Service Offer"}
          </ThemedText>
          <ThemedText style={styles.description}>
            {banner?.product?.description || "AC Installation, Repairing & Maintenance"}
          </ThemedText>
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <ThemedText style={styles.dividerText}>Choose an option to continue</ThemedText>
          <View style={styles.dividerLine} />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {/* Visit Website */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleVisitWebsite}
            activeOpacity={0.8}
          >
            <View style={[styles.iconCircle, { backgroundColor: "#E8F0FE" }]}>
              <Ionicons name="globe-outline" size={28} color="#1565C0" />
            </View>
            <View style={styles.actionTextContainer}>
              <ThemedText style={styles.actionTitle}>Visit Website</ThemedText>
              <ThemedText style={styles.actionSubtitle}>Open seller website</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          {/* Watch Video */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleWatchVideo}
            activeOpacity={0.8}
          >
            <View style={[styles.iconCircle, { backgroundColor: "#FFEBEE" }]}>
              <Ionicons name="play-circle" size={28} color="#D32F2F" />
            </View>
            <View style={styles.actionTextContainer}>
              <ThemedText style={[styles.actionTitle, { color: "#D32F2F" }]}>
                Watch Video
              </ThemedText>
              <ThemedText style={styles.actionSubtitle}>See product demo video</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerContainer}>
          <View style={styles.disclaimerIcon}>
            <Ionicons name="shield-checkmark" size={20} color="#1565C0" />
          </View>
          <ThemedText style={styles.disclaimerText}>
            <ThemedText style={styles.disclaimerHighlight}>GAXA </ThemedText>
            किसी भी external link या content के लिए जिम्मेदार नहीं है।
          </ThemedText>
        </View>
        <TouchableOpacity onPress={handleOpenReportModal} activeOpacity={0.8}>
          <ThemedText style={styles.reportAdText}>Report Ad</ThemedText>
        </TouchableOpacity>
      </ScrollView>

      {/* Report Modal */}
      <ReportModal
        visible={reportModalVisible}
        reason={reportReason}
        onChangeReason={setReportReason}
        onClose={handleCloseReportModal}
        onSubmit={handleReportProduct}
        isSubmitting={isReporting}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.padding,
    paddingVertical: 15,
    backgroundColor: "#1565C0",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  placeholder: {
    width: 36,
  },
  content: {
    flex: 1,
  },
  bannerContainer: {
    marginHorizontal: SIZES.padding,
    marginTop: SIZES.padding,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  bannerImage: {
    width: "100%",
    height: BANNER_HEIGHT,
  },
  bannerVideoContainer: {
    width: "100%",
    height: BANNER_HEIGHT,
    backgroundColor: "#000",
  },
  bannerVideo: {
    width: "100%",
    height: "100%",
  },
  infoSection: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 20,
  },
  reportAdText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: "center",
    fontWeight: "700",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: "#666",
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    color: "#666",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SIZES.padding,
    marginTop: 24,
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    fontSize: 14,
    color: "#666",
    marginHorizontal: 12,
  },
  actionsContainer: {
    paddingHorizontal: SIZES.padding,
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1565C0",
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: "#888",
  },
  disclaimerContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: SIZES.padding,
    marginTop: 24,
    marginBottom: 30,
    padding: 16,
    backgroundColor: "#E8F0FE",
    borderRadius: 12,
    gap: 12,
  },
  disclaimerIcon: {
    marginTop: 2,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    color: "#444",
    lineHeight: 20,
  },
  disclaimerHighlight: {
    fontWeight: "700",
    color: "#1565C0",
  },
});
