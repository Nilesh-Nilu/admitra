import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS } from "@/constants/Colors";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
  Dimensions,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function ProductDetailsScreen() {
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [product, setProduct] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const initializeProduct = useCallback(() => {
    if (params.productData && typeof params.productData === "string") {
      try {
        const parsedProduct = JSON.parse(params.productData);
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

  const handleBackPress = () => {
    router.back();
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / screenWidth);
    setActiveImageIndex(index);
  };

  const handleImageScrollTo = (index: number) => {
    setActiveImageIndex(index);
    scrollViewRef.current?.scrollTo({
      x: index * screenWidth,
      animated: true,
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this listing: ${product?.title || "Great deal!"}\nPrice: ₹${product?.price?.toLocaleString("en-IN")}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleChat = () => {
    router.push({
      pathname: "/stacks/chatDetail",
      params: {
        productId: product?.id,
        productTitle: product?.title,
        sellerId: product?.sellerId || 1,
      },
    });
  };

  const handleCall = () => {
    const phoneNumber = product?.phone || "+919876543210";
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleMakeOffer = () => {
    Alert.alert(
      "Make an Offer",
      `Current price: ₹${product?.price?.toLocaleString("en-IN")}\n\nThis feature will allow you to send a price offer to the seller.`,
      [{ text: "OK" }]
    );
  };

  const formatPrice = (price: number, isMonthly?: boolean) => {
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L${isMonthly ? "/mo" : ""}`;
    }
    return `₹${price?.toLocaleString("en-IN")}${isMonthly ? "/mo" : ""}`;
  };

  const DUMMY_IMAGES = [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
  ];

  const productImages = product?.image ? [product.image] : DUMMY_IMAGES;
  const productTitle = product?.title || "Product";
  const productPrice = product?.price || 0;

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
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={22}
              color={isFavorite ? COLORS.error : COLORS.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Image Gallery */}
        <View style={styles.imageSection}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {productImages.map((image: string, index: number) => (
              <View key={index} style={styles.imagePage}>
                <Image
                  source={{ uri: image }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              </View>
            ))}
          </ScrollView>

          {/* Image Counter */}
          <View style={styles.imageCounter}>
            <ThemedText style={styles.imageCounterText}>
              {activeImageIndex + 1}/{productImages.length}
            </ThemedText>
          </View>

          {/* Condition Badge */}
          {product?.condition && (
            <View style={styles.conditionBadge}>
              <ThemedText style={styles.conditionText}>{product.condition}</ThemedText>
            </View>
          )}
        </View>

        {/* Image Thumbnails */}
        {productImages.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailContainer}
            contentContainerStyle={styles.thumbnailContent}
          >
            {productImages.map((image: string, index: number) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.thumbnail,
                  index === activeImageIndex && styles.thumbnailActive,
                ]}
                onPress={() => handleImageScrollTo(index)}
              >
                <Image source={{ uri: image }} style={styles.thumbnailImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Product Info */}
        <View style={styles.infoSection}>
          {/* Price */}
          <ThemedText style={styles.price}>
            {formatPrice(productPrice, product?.isMonthly)}
          </ThemedText>

          {/* Title */}
          <ThemedText style={styles.title}>{productTitle}</ThemedText>

          {/* Location & Time */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={16} color={COLORS.gray} />
              <ThemedText style={styles.metaText}>
                {product?.location || "Mumbai, Maharashtra"}
              </ThemedText>
            </View>
            <View style={styles.metaDot} />
            <ThemedText style={styles.metaText}>
              {product?.postedAt || "Today"}
            </ThemedText>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={18} color={COLORS.gray} />
              <ThemedText style={styles.statText}>234 views</ThemedText>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="heart-outline" size={18} color={COLORS.gray} />
              <ThemedText style={styles.statText}>12 likes</ThemedText>
            </View>
          </View>
        </View>

        {/* Seller Info */}
        <View style={styles.sellerSection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Seller Information</ThemedText>
          </View>
          <TouchableOpacity style={styles.sellerCard}>
            <Image
              source={{ uri: "https://i.pravatar.cc/150?img=11" }}
              style={styles.sellerAvatar}
            />
            <View style={styles.sellerInfo}>
              <View style={styles.sellerNameRow}>
                <ThemedText style={styles.sellerName}>Rahul Kumar</ThemedText>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                  <ThemedText style={styles.verifiedText}>Verified</ThemedText>
                </View>
              </View>
              <ThemedText style={styles.sellerMeta}>Member since Jan 2023</ThemedText>
              <View style={styles.sellerStats}>
                <View style={styles.sellerStatItem}>
                  <Ionicons name="star" size={14} color={COLORS.warning} />
                  <ThemedText style={styles.sellerStatText}>4.8 (24 reviews)</ThemedText>
                </View>
                <View style={styles.sellerStatDot} />
                <ThemedText style={styles.sellerStatText}>45 listings</ThemedText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Description</ThemedText>
          </View>
          <ThemedText style={styles.description}>
            {product?.description ||
              "This item is in excellent condition. Well maintained and fully functional. Selling because upgrading to a new model. Price is slightly negotiable for serious buyers. Feel free to message for any questions."}
          </ThemedText>
        </View>

        {/* Details */}
        <View style={styles.detailsSection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Details</ThemedText>
          </View>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <ThemedText style={styles.detailLabel}>Condition</ThemedText>
              <ThemedText style={styles.detailValue}>
                {product?.condition || "Like New"}
              </ThemedText>
            </View>
            <View style={styles.detailItem}>
              <ThemedText style={styles.detailLabel}>Category</ThemedText>
              <ThemedText style={styles.detailValue}>
                {product?.category || "Electronics"}
              </ThemedText>
            </View>
            <View style={styles.detailItem}>
              <ThemedText style={styles.detailLabel}>Posted</ThemedText>
              <ThemedText style={styles.detailValue}>
                {product?.postedAt || "2 hours ago"}
              </ThemedText>
            </View>
            <View style={styles.detailItem}>
              <ThemedText style={styles.detailLabel}>Ad ID</ThemedText>
              <ThemedText style={styles.detailValue}>
                #{product?.id || "12345"}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Safety Tips */}
        <View style={styles.safetySection}>
          <LinearGradient
            colors={[COLORS.info + "15", COLORS.primary + "10"]}
            style={styles.safetyCard}
          >
            <Ionicons name="shield-checkmark" size={24} color={COLORS.info} />
            <View style={styles.safetyContent}>
              <ThemedText style={styles.safetyTitle}>Safety Tips</ThemedText>
              <ThemedText style={styles.safetyText}>
                Meet in public places • Check the item before paying • Don't share personal info
              </ThemedText>
            </View>
          </LinearGradient>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.bottomButtons}>
          <TouchableOpacity style={styles.chatButton} onPress={handleChat}>
            <Ionicons name="chatbubble-outline" size={20} color={COLORS.primary} />
            <ThemedText style={styles.chatButtonText}>Chat</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.callButton} onPress={handleCall}>
            <Ionicons name="call-outline" size={20} color={COLORS.success} />
            <ThemedText style={styles.callButtonText}>Call</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.offerButton} onPress={handleMakeOffer}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.offerButtonGradient}
            >
              <ThemedText style={styles.offerButtonText}>Make Offer</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    paddingHorizontal: SIZES.padding,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },

  scrollContent: {
    paddingBottom: 20,
  },

  /* Image Section */
  imageSection: {
    height: screenHeight * 0.4,
    backgroundColor: COLORS.lightGray,
    position: "relative",
  },
  imagePage: {
    width: screenWidth,
    height: screenHeight * 0.4,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  imageCounter: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageCounterText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.white,
  },
  conditionBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  conditionText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.white,
  },

  /* Thumbnails */
  thumbnailContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: 12,
  },
  thumbnailContent: {
    paddingHorizontal: SIZES.padding,
    gap: 10,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  thumbnailActive: {
    borderColor: COLORS.primary,
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },

  /* Info Section */
  infoSection: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    marginTop: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.gray,
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gray,
  },
  statsRow: {
    flexDirection: "row",
    gap: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: COLORS.gray,
  },

  /* Seller Section */
  sellerSection: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    marginTop: 8,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  sellerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  sellerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.success + "15",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.success,
  },
  sellerMeta: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 6,
  },
  sellerStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sellerStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sellerStatText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  sellerStatDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.gray,
  },

  /* Description Section */
  descriptionSection: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    marginTop: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
  },

  /* Details Section */
  detailsSection: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    marginTop: 8,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  detailItem: {
    width: "45%",
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },

  /* Safety Section */
  safetySection: {
    padding: SIZES.padding,
    paddingTop: 8,
  },
  safetyCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    padding: 16,
    borderRadius: 16,
  },
  safetyContent: {
    flex: 1,
  },
  safetyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.info,
    marginBottom: 4,
  },
  safetyText: {
    fontSize: 12,
    color: COLORS.text,
    lineHeight: 18,
  },

  /* Bottom Bar */
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  bottomButtons: {
    flexDirection: "row",
    gap: 10,
  },
  chatButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  chatButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
  },
  callButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.success,
    backgroundColor: COLORS.white,
  },
  callButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.success,
  },
  offerButton: {
    flex: 1.5,
    borderRadius: 12,
    overflow: "hidden",
  },
  offerButtonGradient: {
    paddingVertical: 14,
    alignItems: "center",
  },
  offerButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.white,
  },
});
