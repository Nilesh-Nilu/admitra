import { COLORS } from "@/constants/Colors";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { ThemedText } from "../ThemedText";

interface Booking {
  id: number;
  bookingId: string;
  bookedfor: string;
  status: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
  user_id: number;
  user: {
    id: number;
    name: string;
    phone: string;
    address: string;
    landmark: string;
    agent_mob_no: string;
    email: string | null;
  };
}

// Helper to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Helper to format time
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

type ViewBookingDetailsModalProps = {
  isVisible: boolean;
  onClose: () => void;
  booking: Booking | null;
};

const ViewBookingDetailsModal: React.FC<ViewBookingDetailsModalProps> = ({
  isVisible,
  onClose,
  booking,
}) => {
  if (!booking) return null;

  const getStatusGradient = (status: string): readonly [string, string] => {
    switch (status) {
      case "booked":
        return ["#06D6A0", "#05C793"];
      case "pending":
        return ["#FFD166", "#FFC233"];
      case "completed":
        return ["#4CC9F0", "#3AB8E0"];
      case "cancelled":
        return ["#EF476F", "#E03660"];
      default:
        return [COLORS.gray, COLORS.gray];
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroImage}
          >
            <Ionicons
              name="construct"
              size={60}
              color="rgba(255,255,255,0.3)"
            />
          </LinearGradient>
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={styles.heroOverlay}
          />

          {/* Close Button */}
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.white} />
          </Pressable>

          {/* Status Badge */}
          <LinearGradient
            colors={getStatusGradient(booking.status)}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.statusBadge}
          >
            <Ionicons
              name={
                booking.status === "booked"
                  ? "checkmark-circle"
                  : booking.status === "pending"
                  ? "time"
                  : booking.status === "completed"
                  ? "checkmark-done-circle"
                  : "close-circle"
              }
              size={14}
              color={COLORS.white}
            />
            <ThemedText style={styles.statusText}>
              {getStatusLabel(booking.status)}
            </ThemedText>
          </LinearGradient>

          {/* Hero Info */}
          <View style={styles.heroInfo}>
            <ThemedText style={styles.serviceName}>
              {booking.bookedfor}
            </ThemedText>
            <View style={styles.categoryBadge}>
              <Ionicons name="receipt-outline" size={12} color={COLORS.white} />
              <ThemedText style={styles.categoryText}>
                #{booking.bookingId}
              </ThemedText>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Info Cards */}
          <View style={styles.quickInfoRow}>
            <View style={styles.quickInfoCard}>
              <View
                style={[
                  styles.quickInfoIcon,
                  { backgroundColor: `${COLORS.primary}15` },
                ]}
              >
                <Ionicons name="calendar" size={20} color={COLORS.primary} />
              </View>
              <ThemedText style={styles.quickInfoLabel}>Date</ThemedText>
              <ThemedText style={styles.quickInfoValue}>
                {formatDate(booking.created_at)}
              </ThemedText>
            </View>
            <View style={styles.quickInfoCard}>
              <View
                style={[
                  styles.quickInfoIcon,
                  { backgroundColor: `${COLORS.accentOrange}15` },
                ]}
              >
                <Ionicons name="time" size={20} color={COLORS.accentOrange} />
              </View>
              <ThemedText style={styles.quickInfoLabel}>Time</ThemedText>
              <ThemedText style={styles.quickInfoValue}>
                {formatTime(booking.created_at)}
              </ThemedText>
            </View>
          </View>

          {/* Provider Card */}
          {/* <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconContainer, { backgroundColor: `${COLORS.info}15` }]}>
                <Ionicons name="person" size={18} color={COLORS.info} />
              </View>
              <ThemedText style={styles.cardTitle}>Service Provider</ThemedText>
            </View>
            <View style={styles.providerInfo}>
              <View style={styles.providerAvatar}>
                <ThemedText style={styles.providerInitial}>
                  {booking.providerName.charAt(0).toUpperCase()}
                </ThemedText>
              </View>
              <View style={styles.providerDetails}>
                <ThemedText style={styles.providerName}>{booking.providerName}</ThemedText>
                <View style={styles.providerRating}>
                  <Ionicons name="star" size={14} color={COLORS.warning} />
                  <ThemedText style={styles.ratingText}>4.8</ThemedText>
                  <ThemedText style={styles.reviewsText}>(120 reviews)</ThemedText>
                </View>
              </View>
              <Pressable style={styles.callButton}>
                <Ionicons name="call" size={18} color={COLORS.white} />
              </Pressable>
            </View>
          </View> */}

          {/* Customer Info Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.cardIconContainer,
                  { backgroundColor: `${COLORS.secondaryBlue}15` },
                ]}
              >
                <Ionicons
                  name="person"
                  size={18}
                  color={COLORS.secondaryBlue}
                />
              </View>
              <ThemedText style={styles.cardTitle}>Customer Details</ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Name</ThemedText>
              <ThemedText style={styles.infoValue}>
                {booking.user?.name || "N/A"}
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Phone</ThemedText>
              <ThemedText style={styles.infoValue}>
                {booking.user?.phone || "N/A"}
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Address</ThemedText>
              <ThemedText style={styles.infoValue}>
                {booking.user?.address || "N/A"}
              </ThemedText>
            </View>
            {booking.user?.landmark && (
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Landmark</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {booking.user.landmark}
                </ThemedText>
              </View>
            )}
          </View>

          {/* Booking Info Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.cardIconContainer,
                  { backgroundColor: `${COLORS.secondary}15` },
                ]}
              >
                <Ionicons
                  name="document-text"
                  size={18}
                  color={COLORS.secondary}
                />
              </View>
              <ThemedText style={styles.cardTitle}>
                Booking Information
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Booking ID</ThemedText>
              <ThemedText style={styles.infoValue}>
                #{booking.bookingId}
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Service</ThemedText>
              <ThemedText style={styles.infoValue}>
                {booking.bookedfor}
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Status</ThemedText>
              <ThemedText
                style={[
                  styles.infoValue,
                  {
                    color:
                      booking.status === "booked"
                        ? COLORS.success
                        : COLORS.error,
                  },
                ]}
              >
                {getStatusLabel(booking.status)}
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Payment</ThemedText>
              <ThemedText
                style={[
                  styles.infoValue,
                  {
                    color:
                      booking.payment_status === "completed"
                        ? COLORS.success
                        : COLORS.error,
                  },
                ]}
              >
                {booking.payment_status === "completed" ? "Paid" : "Pending"}
              </ThemedText>
            </View>
          </View>

          {/* Payment Card */}
          {/* <View style={styles.paymentCard}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.paymentGradient}
            >
              <View style={styles.paymentHeader}>
                <Ionicons name="wallet" size={24} color={COLORS.white} />
                <ThemedText style={styles.paymentTitle}>Payment Summary</ThemedText>
              </View>
              <View style={styles.paymentDivider} />
              <View style={styles.paymentRow}>
                <ThemedText style={styles.paymentLabel}>Service Charge</ThemedText>
                <ThemedText style={styles.paymentValue}>{booking.amount}</ThemedText>
              </View>
              <View style={styles.paymentRow}>
                <ThemedText style={styles.paymentLabel}>Platform Fee</ThemedText>
                <ThemedText style={styles.paymentValue}>₹0</ThemedText>
              </View>
              <View style={styles.paymentTotalDivider} />
              <View style={styles.paymentRow}>
                <ThemedText style={styles.paymentTotalLabel}>Total Amount</ThemedText>
                <ThemedText style={styles.paymentTotalValue}>{booking.amount}</ThemedText>
              </View>
            </LinearGradient>
          </View> */}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {booking.status === "pending" && (
              <Pressable style={styles.cancelButton}>
                <Ionicons
                  name="close-circle-outline"
                  size={20}
                  color={COLORS.error}
                />
                <ThemedText style={styles.cancelButtonText}>
                  Cancel Booking
                </ThemedText>
              </Pressable>
            )}
            <Pressable style={styles.supportButton}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={20}
                color={COLORS.primary}
              />
              <ThemedText style={styles.supportButtonText}>
                Get Support
              </ThemedText>
            </Pressable>
          </View>

          {/* Bottom Spacing */}
          <View style={{ height: SIZES.padding * 2 }} />
        </ScrollView>
      </View>
    </Modal>
  );
};

export default ViewBookingDetailsModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  heroSection: {
    height: 220,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  closeButton: {
    position: "absolute",
    top: SIZES.padding * 2.5,
    left: SIZES.padding,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadge: {
    position: "absolute",
    top: SIZES.padding * 2.5,
    right: SIZES.padding,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: COLORS.white,
    fontSize: SIZES.fontSize12,
    fontWeight: "700",
  },
  heroInfo: {
    position: "absolute",
    bottom: SIZES.padding,
    left: SIZES.padding,
    right: SIZES.padding,
  },
  serviceName: {
    fontSize: SIZES.fontSize24,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: SIZES.fontSize12,
    color: COLORS.white,
    fontWeight: "500",
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    padding: SIZES.padding,
    gap: SIZES.padding,
  },
  quickInfoRow: {
    flexDirection: "row",
    gap: SIZES.padding,
  },
  quickInfoCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius16,
    padding: SIZES.padding,
    alignItems: "center",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  quickInfoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickInfoLabel: {
    fontSize: SIZES.fontSize12,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  quickInfoValue: {
    fontSize: SIZES.fontSize14,
    fontWeight: "600",
    color: COLORS.text,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius16,
    padding: SIZES.padding,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: SIZES.padding,
  },
  cardIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: SIZES.fontSize16,
    fontWeight: "600",
    color: COLORS.text,
  },
  providerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  providerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  providerInitial: {
    fontSize: SIZES.fontSize20,
    fontWeight: "700",
    color: COLORS.white,
  },
  providerDetails: {
    flex: 1,
  },
  providerName: {
    fontSize: SIZES.fontSize16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  providerRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: SIZES.fontSize14,
    fontWeight: "600",
    color: COLORS.text,
  },
  reviewsText: {
    fontSize: SIZES.fontSize12,
    color: COLORS.textLight,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.success,
    justifyContent: "center",
    alignItems: "center",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: SIZES.fontSize14,
    color: COLORS.textLight,
  },
  infoValue: {
    fontSize: SIZES.fontSize14,
    fontWeight: "600",
    color: COLORS.text,
  },
  paymentCard: {
    borderRadius: SIZES.radius16,
    overflow: "hidden",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  paymentGradient: {
    padding: SIZES.padding,
  },
  paymentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: SIZES.padding * 0.5,
  },
  paymentTitle: {
    fontSize: SIZES.fontSize18,
    fontWeight: "700",
    color: COLORS.white,
  },
  paymentDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginVertical: SIZES.padding * 0.5,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  paymentLabel: {
    fontSize: SIZES.fontSize14,
    color: "rgba(255,255,255,0.8)",
  },
  paymentValue: {
    fontSize: SIZES.fontSize14,
    fontWeight: "500",
    color: COLORS.white,
  },
  paymentTotalDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginVertical: SIZES.padding * 0.5,
  },
  paymentTotalLabel: {
    fontSize: SIZES.fontSize16,
    fontWeight: "600",
    color: COLORS.white,
  },
  paymentTotalValue: {
    fontSize: SIZES.fontSize20,
    fontWeight: "700",
    color: COLORS.white,
  },
  actionButtons: {
    gap: SIZES.padding * 0.75,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: `${COLORS.error}10`,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: SIZES.radius12,
    paddingVertical: SIZES.padding * 0.8,
  },
  cancelButtonText: {
    fontSize: SIZES.fontSize16,
    fontWeight: "600",
    color: COLORS.error,
  },
  supportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: `${COLORS.primary}10`,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: SIZES.radius12,
    paddingVertical: SIZES.padding * 0.8,
  },
  supportButtonText: {
    fontSize: SIZES.fontSize16,
    fontWeight: "600",
    color: COLORS.primary,
  },
});
