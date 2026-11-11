import AdIdBadge from "@/components/badges/AdIdBadge";
import ReportButton from "@/components/buttons/ReportButton";
import ReportModal from "@/components/modals/ReportModal";
import ImageZoomModal from "@/components/modals/ImageZoomModal";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS } from "@/constants/Colors";
import { addToFavoritesApi, createConversationApi, getCallManagementApi, getFavoritesListApi, getProductByIdApi, removeFromFavoritesApi, reportProductApi, reportUserApi } from "@/constants/functions";
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
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import AppToast from "@/components/toasts/AppToast";
import ThemeHeader from "@/components/headers/ThemeHeader";
import ThemeLoader from "@/components/loader/ThemeLoader";

const { width: screenWidth } = Dimensions.get("window");
const IMAGE_HEIGHT = screenWidth * 0.65;

export default function ProductDetailsScreen() {
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { user: currentUser } = useSelector((state: any) => state.entities.authReducer) || {};
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [product, setProduct] = useState<any>(null);
  const [zoomModalVisible, setZoomModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const [reportUserModalVisible, setReportUserModalVisible] = useState(false);
  const [reportUserReason, setReportUserReason] = useState("");
  const [isReportingUser, setIsReportingUser] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<number | null>(null);
  const [favLoading, setFavLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [callManagement, setCallManagement] = useState<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const initializeProduct = useCallback(() => {
    if (params.productData) {
      try {
        getCallManagementApi().then((res) => {
          setCallManagement(res.status);
          setLoading(false);
        }).catch((err) => {
          setCallManagement(true);
        });
        const parsedProduct = JSON.parse(params.productData as any);
        // Show list payload immediately so address/city/state are visible
        // while the detail API loads (that endpoint often returns null location).
        setProduct(parsedProduct);
        getProductByIdApi(parsedProduct.id as any).then((res) => {
          const apiProduct = res.data || {};
          const listUser = parsedProduct?.user || {};
          const apiUser = apiProduct?.user || {};
          setProduct({
            ...parsedProduct,
            ...apiProduct,
            is_featured: parsedProduct.is_featured ?? apiProduct?.is_featured,
            is_banner: parsedProduct.is_banner ?? apiProduct?.is_banner,
            user: {
              ...listUser,
              ...apiUser,
              // Prefer list/nav values when detail API strips location fields
              address: apiUser.address || listUser.address || null,
              city_id: apiUser.city_id ?? listUser.city_id ?? null,
              state_id: apiUser.state_id ?? listUser.state_id ?? null,
              city: apiUser.city || listUser.city || null,
              state: apiUser.state || listUser.state || null,
            },
          });
        }).catch((err) => {
          setLoading(false);
        });
      } catch (error) {
        setProduct(null);
      }
    }
  }, [params.productData]);
  
  useEffect(() => {
    initializeProduct();
  }, [initializeProduct]);

  useEffect(() => {
    if (!product?.id) return;
    getFavoritesListApi().then((res) => {
      const list = Array.isArray(res) ? res : (res?.data || []);
      const match = list.find((f: any) => f.product_id === product.id || f.product?.id === product.id);
      if (match) {
        setIsFavorite(true);
        setFavoriteId(match.id);
      }
    }).catch(() => { });
  }, [product?.id]);

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (screenWidth - 32));
    setActiveImageIndex(index);
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
            userName: product?.user.name,
          },
        });
      } else {
        Alert.alert("Error", "Failed to create conversation");
      }
    } catch (error) {
    }
  };

  const handleToggleFavorite = async () => {
    if (favLoading) return;
    setFavLoading(true);
    try {
      if (isFavorite && favoriteId) {
        await removeFromFavoritesApi(favoriteId);
        setIsFavorite(false);
        setFavoriteId(null);
        AppToast("Removed from saved ads");
      } else {
        const res = await addToFavoritesApi(product.id);
        setIsFavorite(true);
        setFavoriteId(res?.data?.id || res?.id || null);
        AppToast("Saved to favorites");
      }
    } catch {
      AppToast("Failed to update favorites");
    } finally {
      setFavLoading(false);
    }
  };

  const handleCall = () => {
    const phoneNumber = product?.user?.phone || "+919876543210";
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const productImages = product?.images || [];
  const isVerifiedSeller = product?.user?.is_verify === 1;
  // List payloads flag the plan either directly or only via plan_info.plan_type.
  const planType = String(product?.plan_info?.plan_type || product?.product_type || "").toLowerCase();
  const isFeaturedAd = Boolean(product?.is_featured || product?.featured || planType === "featured");
  const isBannerAd = Boolean(product?.is_banner || product?.banner || planType === "banner");
  const sellerId = product?.user?.user_id ?? product?.user?.id ?? product?.user_id;
  const currentUserId = currentUser?.id ?? currentUser?.user_id;
  const isOwnListing =
    sellerId != null &&
    currentUserId != null &&
    Number(sellerId) === Number(currentUserId);

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
      AppToast("Failed to report this ad. Please try again.");
    }
  };


  const handleReportUser = async () => {
    const reason = reportUserReason.trim();
    if (!reason) {
      Alert.alert("Reason required", "Please enter a reason to report this user.");
      return;
    }
    const userId = product?.user?.id || product?.user_id;
    if (!userId) {
      Alert.alert("Error", "Unable to report this user right now.");
      return;
    }
    try {
      setIsReportingUser(true);
      const response = await reportUserApi({ reported_user_id: Number(userId), reason });
      if (response.status === false) {
        AppToast(response.message || "Failed to report user. Please try again.");
      } else {
        AppToast(response.message || "User reported successfully");
        setReportUserModalVisible(false);
        setReportUserReason("");
      }
    } catch(error) {
      AppToast("Failed to report user. Please try again.");
    } finally {
      setIsReportingUser(false);
    }
  };

  if (!product || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ThemeLoader />
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>

      {/* Header */}
      <ThemeHeader onBackPress={() => router.back()} title="Ad Details" />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
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
                    resizeMode="contain"
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

          {/* Type Badge */}
          {isFeaturedAd && (
            <View style={[styles.typeBadge, { backgroundColor: "#E65100" }]}>
              <Ionicons name="star" size={11} color="#fff" />
              <ThemedText style={styles.typeBadgeText}>Featured</ThemedText>
            </View>
          )}
          {!isFeaturedAd && !isBannerAd && (
            <View style={[styles.typeBadge, { backgroundColor: "#2E7D32" }]}>
              <Ionicons name="card" size={11} color="#fff" />
              <ThemedText style={styles.typeBadgeText}>Normal</ThemedText>
            </View>
          )}
          <AdIdBadge kind={(isBannerAd ? "banner" : isFeaturedAd ? "featured" : "normal")} id={product?.id} />
          <ReportButton product={product} />
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
          <TouchableOpacity
            style={styles.sellerRow}
            activeOpacity={0.8}
            onPress={() => {
              router.push({
                pathname: "/stacks/userProfile",
                params: { userData: JSON.stringify(product?.user) },
              })
            }}
          >
            <View style={styles.sellerAvatar}>
              {product?.user?.selfieverificationImage ? (
                <Image source={{ uri: product.user.selfieverificationImage }} style={{ width: 44, height: 44, borderRadius: 22 }} />
              ) : (
                <Ionicons name="person-outline" size={24} color={COLORS.text} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.sellerName}>{product?.user?.name}</ThemedText>
              <ThemedText style={styles.sellerLocation}>
                {[product?.user?.address, product?.user?.city?.name, product?.user?.state?.name]
                  .filter(Boolean)
                  .join(", ") || product?.city}
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        {/* Product Details */}
        <View style={styles.cardSection}>
          {product?.user?.address && (
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Address:</ThemedText>
              <ThemedText style={styles.detailValue}>{product.user.address}</ThemedText>
            </View>
          )}
          {product?.user?.city?.name && (
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>City:</ThemedText>
              <ThemedText style={styles.detailValue}>{product.user.city.name}</ThemedText>
            </View>
          )}
          {product?.user?.state?.name && (
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>State:</ThemedText>
              <ThemedText style={styles.detailValue}>{product.user.state.name}</ThemedText>
            </View>
          )}
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

          {/* Additional / Custom Fields */}
          {Array.isArray(product?.custom_fields) && product.custom_fields.length > 0 &&
            product.custom_fields.map((field: any, index: number) => (
              field?.name && field?.value ? (
                <View key={`${field.name}-${index}`} style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>{field.name}:</ThemedText>
                  <ThemedText style={styles.detailValue}>{field.value}</ThemedText>
                </View>
              ) : null
            ))}

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
        {!isOwnListing && (
          <View style={styles.reportRow}>
            <TouchableOpacity onPress={handleOpenReportModal} activeOpacity={0.8} style={styles.reportBtn}>
              <Ionicons name="flag-outline" size={14} color={COLORS.error} />
              <ThemedText style={styles.reportAdText}>Report Ad</ThemedText>
            </TouchableOpacity>
            <View style={styles.reportDivider} />
            <TouchableOpacity onPress={() => { setReportUserReason(""); setReportUserModalVisible(true); }} activeOpacity={0.8} style={styles.reportBtn}>
              <Ionicons name="person-remove-outline" size={14} color={COLORS.error} />
              <ThemedText style={styles.reportAdText}>Report User</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        {(isFeaturedAd || callManagement === true) && (
          <TouchableOpacity style={styles.callButton} onPress={handleCall} activeOpacity={0.8}>
            <Ionicons name="call" size={18} color={COLORS.white} />
            <ThemedText style={styles.callBtnText}>Call</ThemedText>
          </TouchableOpacity>
        )}
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

      {/* Report Ad Modal */}
      <ReportModal
        visible={reportModalVisible}
        reason={reportReason}
        onChangeReason={setReportReason}
        onClose={handleCloseReportModal}
        onSubmit={handleReportProduct}
        isSubmitting={isReporting}
      />

      {/* Report User Modal */}
      <ReportModal
        visible={reportUserModalVisible}
        reason={reportUserReason}
        onChangeReason={setReportUserReason}
        onClose={() => { if (!isReportingUser) setReportUserModalVisible(false); }}
        onSubmit={handleReportUser}
        isSubmitting={isReportingUser}
        title="Report User"
        subtitle="Tell us why you are reporting this user."
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
    flexGrow: 1,
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding16,
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
    flex: 1,
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
  reportRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 12,
  },
  reportBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  reportDivider: {
    width: 1,
    height: 18,
    backgroundColor: COLORS.border,
  },
  reportAdText: {
    fontSize: 14,
    color: COLORS.error,
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
  typeBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  favPill: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favPillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
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
