import ThemeHeader from "@/components/headers/ThemeHeader";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS } from "@/constants/Colors";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { useSelector } from "react-redux";

const { width } = Dimensions.get("window");


const getStatusConfig = (status: string) => {
  switch (status) {
    case "approved":
      return {
        color: COLORS.success,
        bgColor: COLORS.success + "15",
        icon: "checkmark-circle",
        label: "Approved",
      };
    case "pending":
      return {
        color: "#f5af19",
        bgColor: "#f5af1915",
        icon: "time",
        label: "Pending",
      };
    case "rejected":
      return {
        color: COLORS.error,
        bgColor: COLORS.error + "15",
        icon: "close-circle",
        label: "Rejected",
      };
    default:
      return {
        color: COLORS.gray,
        bgColor: COLORS.gray + "15",
        icon: "help-circle",
        label: "Unknown",
      };
  }
};

export default function MyListingsScreen() {
  const router = useRouter();
  const { approvedProducts } = useSelector((state: any) => state.entities.userReducer) || {};
  const safeProducts = approvedProducts || [];
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const openDetailModal = (item: any) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const closeDetailModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  const formatPrice = (price: number) => {
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`;
    }
    return `₹${price.toLocaleString("en-IN")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const renderStats = () => {
    const approved = safeProducts.filter((p: any) => p.approve === "approved").length;
    const pending = safeProducts.filter((p: any) => p.approve === "pending").length;
    const rejected = safeProducts.filter((p: any) => p.approve === "rejected").length;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: COLORS.success + "15" }]}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
          </View>
          <ThemedText style={styles.statValue}>{approved}</ThemedText>
          <ThemedText style={styles.statLabel}>Approved</ThemedText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: "#f5af1915" }]}>
            <Ionicons name="time" size={20} color="#f5af19" />
          </View>
          <ThemedText style={styles.statValue}>{pending}</ThemedText>
          <ThemedText style={styles.statLabel}>Pending</ThemedText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: COLORS.error + "15" }]}>
            <Ionicons name="close-circle" size={20} color={COLORS.error} />
          </View>
          <ThemedText style={styles.statValue}>{rejected}</ThemedText>
          <ThemedText style={styles.statLabel}>Rejected</ThemedText>
        </View>
      </View>
    );
  };

  const renderListingCard = ({ item }: { item: any }) => {
    const statusConfig = getStatusConfig(item.approve);
    const firstImage = item.images && item.images.length > 0 ? item.images[0].image_path : null;

    return (
      <TouchableOpacity
        style={styles.listingCard}
        activeOpacity={0.8}
        onPress={() => openDetailModal(item)}
      >
        {/* Product Image */}
        {firstImage ? (
          <Image
            source={{ uri: firstImage }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <LinearGradient
              colors={["#11998e", "#38ef7d"]}
              style={styles.imagePlaceholderGradient}
            >
              <Ionicons name="cube" size={32} color={COLORS.white} />
            </LinearGradient>
          </View>
        )}

        {/* Product Info */}
        <View style={styles.listingInfo}>
          <View style={styles.listingHeader}>
            <ThemedText style={styles.listingTitle} numberOfLines={1}>
              {item.name}
            </ThemedText>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
              <Ionicons name={statusConfig.icon as any} size={12} color={statusConfig.color} />
              <ThemedText style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </ThemedText>
            </View>
          </View>

          <ThemedText style={styles.listingDescription} numberOfLines={2}>
            {item.description || "No description"}
          </ThemedText>

          <View style={styles.listingFooter}>
            <ThemedText style={styles.listingPrice}>{formatPrice(item.price)}</ThemedText>
            <View style={styles.listingDate}>
              <Ionicons name="calendar-outline" size={12} color={COLORS.gray} />
              <ThemedText style={styles.listingDateText}>
                {formatDate(item.created_at)}
              </ThemedText>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="cube-outline" size={64} color={COLORS.gray} />
      </View>
      <ThemedText style={styles.emptyTitle}>No Listings Yet</ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        Start selling by creating your first listing
      </ThemedText>
    </View>
  );

  const renderDetailModal = () => {
    if (!selectedItem) return null;
    const statusConfig = getStatusConfig(selectedItem.approve);

    return (
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeDetailModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Product Details</ThemedText>
              <TouchableOpacity onPress={closeDetailModal} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Product Images */}
              {selectedItem.images && selectedItem.images.length > 0 ? (
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  style={styles.modalImageScroll}
                >
                  {selectedItem.images.map((img: any, index: number) => (
                    <Image
                      key={index}
                      source={{ uri: img.image_path }}
                      style={styles.modalImage}
                      resizeMode="cover"
                    />
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.modalImagePlaceholder}>
                  <LinearGradient
                    colors={["#11998e", "#38ef7d"]}
                    style={styles.modalImagePlaceholderGradient}
                  >
                    <Ionicons name="cube" size={48} color={COLORS.white} />
                  </LinearGradient>
                </View>
              )}

              {/* Image Count Indicator */}
              {selectedItem.images && selectedItem.images.length > 1 && (
                <View style={styles.imageCountBadge}>
                  <Ionicons name="images" size={12} color={COLORS.white} />
                  <ThemedText style={styles.imageCountText}>
                    {selectedItem.images.length} photos
                  </ThemedText>
                </View>
              )}

              {/* Product Info */}
              <View style={styles.modalBody}>
                {/* Status Badge */}
                <View style={[styles.modalStatusBadge, { backgroundColor: statusConfig.bgColor }]}>
                  <Ionicons name={statusConfig.icon as any} size={16} color={statusConfig.color} />
                  <ThemedText style={[styles.modalStatusText, { color: statusConfig.color }]}>
                    {statusConfig.label}
                  </ThemedText>
                </View>

                {/* Title & Price */}
                <ThemedText style={styles.modalProductTitle}>{selectedItem.name}</ThemedText>
                <ThemedText style={styles.modalProductPrice}>{formatPrice(selectedItem.price)}</ThemedText>

                {/* Category */}
                {selectedItem.category && (
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="folder-outline" size={18} color={COLORS.gray} />
                    <ThemedText style={styles.modalInfoLabel}>Category:</ThemedText>
                    <ThemedText style={styles.modalInfoValue}>{selectedItem.category.name}</ThemedText>
                  </View>
                )}

                {/* Sub Category */}
                {selectedItem.sub_category && (
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="pricetag-outline" size={18} color={COLORS.gray} />
                    <ThemedText style={styles.modalInfoLabel}>Sub Category:</ThemedText>
                    <ThemedText style={styles.modalInfoValue}>{selectedItem.sub_category.name}</ThemedText>
                  </View>
                )}

                {/* Date */}
                <View style={styles.modalInfoRow}>
                  <Ionicons name="calendar-outline" size={18} color={COLORS.gray} />
                  <ThemedText style={styles.modalInfoLabel}>Posted:</ThemedText>
                  <ThemedText style={styles.modalInfoValue}>{formatDate(selectedItem.created_at)}</ThemedText>
                </View>

                {/* Description */}
                <View style={styles.modalDescriptionSection}>
                  <ThemedText style={styles.modalDescriptionLabel}>Description</ThemedText>
                  <ThemedText style={styles.modalDescription}>
                    {selectedItem.description || "No description provided"}
                  </ThemedText>
                </View>
              </View>
            </ScrollView>

            {/* Close Button */}
            <TouchableOpacity style={styles.modalCloseButton} onPress={closeDetailModal}>
              <ThemedText style={styles.modalCloseButtonText}>Close</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemeHeader onBackPress={() => router.back()} title="My Listings" />
      <FlatList
        data={safeProducts}
        renderItem={renderListingCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={safeProducts.length > 0 ? renderStats : null}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => {}}
            tintColor={COLORS.primary}
          />
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

      {/* Product Detail Modal */}
      {renderDetailModal()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.padding,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  listContent: {
    padding: SIZES.padding,
    paddingBottom: 100,
  },

  /* Stats */
  statsContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 12,
  },

  /* Listing Card */
  listingCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: "hidden",
  },
  imagePlaceholderGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listingInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  listingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  listingTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  listingDescription: {
    fontSize: 12,
    color: COLORS.gray,
    lineHeight: 16,
    marginVertical: 4,
  },
  listingFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listingPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#11998e",
  },
  listingDate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  listingDateText: {
    fontSize: 11,
    color: COLORS.gray,
  },
  listingActions: {
    justifyContent: "space-between",
    marginLeft: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primary + "10",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: COLORS.error + "10",
  },

  /* Empty State */
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.gray + "15",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: "center",
    marginBottom: 24,
  },
  emptyButton: {
    borderRadius: 14,
    overflow: "hidden",
  },
  emptyButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.white,
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.padding,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  modalImageScroll: {
    height: 220,
  },
  modalImage: {
    width: width,
    height: 220,
  },
  modalImagePlaceholder: {
    height: 180,
    margin: SIZES.padding,
    borderRadius: 16,
    overflow: "hidden",
  },
  modalImagePlaceholderGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageCountBadge: {
    position: "absolute",
    top: 190,
    right: SIZES.padding,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  imageCountText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: "500",
  },
  modalBody: {
    padding: SIZES.padding,
  },
  modalStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 12,
  },
  modalStatusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  modalProductTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  modalProductPrice: {
    fontSize: 24,
    fontWeight: "800",
    color: "#11998e",
    marginBottom: 16,
  },
  modalInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalInfoLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  modalInfoValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "right",
  },
  modalDescriptionSection: {
    marginTop: 16,
  },
  modalDescriptionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 22,
  },
  modalCloseButton: {
    marginHorizontal: SIZES.padding,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
  },
});
