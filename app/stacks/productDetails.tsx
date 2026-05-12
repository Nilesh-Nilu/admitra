import ReportModal from "@/components/modals/ReportModal";
import ImageZoomModal from "@/components/modals/ImageZoomModal";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS } from "@/constants/Colors";
import { createConversationApi, reportProductApi } from "@/constants/functions";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
  Dimensions,
  Image,
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppToast from "@/components/toasts/AppToast";
import ThemeHeader from "@/components/headers/ThemeHeader";

const { width: screenWidth } = Dimensions.get("window");
const IMAGE_HEIGHT = screenWidth * 0.65;

export default function ProductDetailsScreen() {
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [product, setProduct] = useState<any>(null);
  const [zoomModalVisible, setZoomModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const initializeProduct = useCallback(() => {
    if (params.productData) {
      try {
        const parsedProduct = JSON.parse(params.productData as any);
        setProduct(parsedProduct);
      } catch (error) {
        console.error("Error parsing product data:", error);
        setProduct(null);
      }
    }
  }, [params.productData]);

  useEffect(() => {
    initializeProduct();
  }, [initializeProduct]);

  useEffect(() => {
    const backAction = () => {
      router.back();
      return true;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, []);

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (screenWidth - 32));
    setActiveImageIndex(index);
  };

  const handleChat = async () => {
    try {
      const vendor_id = product?.user?.user_id? product?.user?.user_id : product?.user_id;
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
            userName: product?.user.name,
          },
        });
      } else {
        Alert.alert("Error", "Failed to create conversation");
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const handleCall = () => {
    const phoneNumber = product?.user?.phone || "+919876543210";
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${product?.name} for ₹${product?.price} on Admitra!`,
      });
    } catch (_) {}
  };

  const productImages = product?.images || [];
  const isVerifiedSeller = product?.user?.is_verify === 1;

  const handleImagePress = (index: number) => {
    setSelectedImageIndex(index);
    setZoomModalVisible(true);
  };

  const handleZoomModalClose = () => {
    setZoomModalVisible(false);
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

    if (!product?.id) {
      Alert.alert("Error", "Unable to report this ad right now.");
      return;
    }

    try {
      setIsReporting(true);
        const response = await reportProductApi({
          product_id: Number(product.id),
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


  if (!product) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <ThemeHeader onBackPress={() => router.push("/(tabs)")} title="Ad Details" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Image Card */}
        <View style={styles.imageCard}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {productImages.length > 0 ? (
              productImages.map((image: any, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={styles.imagePage}
                  onPress={() => handleImagePress(index)}
                  activeOpacity={0.9}
                >
                  <Image
                    source={{ uri: image.image_path || image.image }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                  <View style={styles.zoomHint}>
                    <Ionicons name="expand-outline" size={20} color="rgba(255,255,255,0.8)" />
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.imagePage}>
                <View style={styles.noImagePlaceholder}>
                  <Ionicons name="image-outline" size={48} color={COLORS.gray} />
                </View>
              </View>
            )}
          </ScrollView>

          {productImages.length > 1 && (
            <View style={styles.dotsRow}>
              {productImages.map((_: any, i: number) => (
                <View
                  key={i}
                  style={[styles.dot, i === activeImageIndex && styles.dotActive]}
                />
              ))}
            </View>
          )}
        </View>
        {/* Title + Price Row */}
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <ThemedText style={styles.title} numberOfLines={2}>
              {product?.name || "Product"}
            </ThemedText>
            <ThemedText style={styles.price}>₹{product?.price}</ThemedText>
          </View>
        </View>

        {/* Verified Seller Badge */}
        <View style={styles.cardSection}>
        {isVerifiedSeller && (
          <View style={styles.verifiedBadge}>
            <View style={styles.verifiedIconCircle}>
              <Ionicons name="shield-checkmark" size={14} color={COLORS.white} />
            </View>
            <ThemedText style={styles.verifiedLabel}>Verified Seller</ThemedText>
            <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
          </View>
        )}
          {/* Seller Row */}
          <View style={styles.sellerRow}>
            <View style={styles.sellerAvatar}>
              <Ionicons name="person-outline" size={24} color={COLORS.text} />
            </View>
            <View>
              <ThemedText style={styles.sellerName}>{product?.user?.name}</ThemedText>
              <ThemedText style={styles.sellerLocation}>
                {product?.user?.city?.name || product?.city}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Product Details */}
        <View style={styles.cardSection}>
          {product?.condition && (
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Condition:</ThemedText>
              <ThemedText style={styles.detailValue}>{product.condition}</ThemedText>
            </View>
          )}
          {product?.model && (
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Model:</ThemedText>
              <ThemedText style={styles.detailValue}>{product.model}</ThemedText>
            </View>
          )}
          {product?.category?.name && (
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Category:</ThemedText>
              <ThemedText style={styles.detailValue}>{product.category.name}</ThemedText>
            </View>
          )}
          {product?.sub_category?.name && (
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Sub-Category:</ThemedText>
              <ThemedText style={styles.detailValue}>{product.sub_category.name}</ThemedText>
            </View>
          )}
          {product?.created_at && (
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Posted:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {new Date(product.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </ThemedText>
            </View>
          )}

          {/* Description */}
          {product?.description && (
            <View style={styles.descriptionBlock}>
              <ThemedText style={styles.detailLabel}>Description:</ThemedText>
              <ThemedText style={styles.descriptionText}>
                {product.description}
              </ThemedText>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={handleOpenReportModal} activeOpacity={0.8}>
          <ThemedText style={styles.reportAdText}>Report Ad</ThemedText>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity style={styles.callButton} onPress={handleCall} activeOpacity={0.8}>
          <Ionicons name="call" size={18} color={COLORS.white} />
          <ThemedText style={styles.callBtnText}>Call</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.chatButton} onPress={handleChat} activeOpacity={0.8}>
          <Ionicons name="chatbubble-ellipses" size={18} color={COLORS.white} />
          <ThemedText style={styles.chatBtnText}>Chat</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Zoom Modal */}
      <ImageZoomModal
        visible={zoomModalVisible}
        images={productImages}
        initialIndex={selectedImageIndex}
        onClose={handleZoomModalClose}
        onIndexChange={setSelectedImageIndex}
      />

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
    backgroundColor: "#F0F0F0",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.white,
  },

  scrollContent: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 16,
  },

  /* Image Card */
  imageCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
  },
  imagePage: {
    width: screenWidth - 32,
    height: IMAGE_HEIGHT,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  noImagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#D0D0D0",
  },
  dotActive: {
    backgroundColor: "#1565C0",
    width: 20,
    borderRadius: 4,
  },

  /* Title */
  titleSection: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
    lineHeight: 23,
  },
  price: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
  },

  /* Seller Card */
  cardSection: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 14,
  },
  verifiedIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.success,
    justifyContent: "center",
    alignItems: "center",
  },
  verifiedLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.success,
  },
  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primary + "20",
  },
  sellerName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
  sellerLocation: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 2,
  },

  /* Details */
  detailRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    marginRight: 6,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.text,
  },
  descriptionBlock: {
    marginTop: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
    marginTop: 6,
  },
  reportAdText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: "center",
    fontWeight: "700",
  },
  /* Bottom Bar */
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 10,
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  callButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#1E8E3E",
  },
  callBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.white,
  },
  chatButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#1565C0",
  },
  chatBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.white,
  },
  zoomHint: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
    padding: 8,
  },
});
