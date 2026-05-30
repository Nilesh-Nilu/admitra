import ThemeHeader from "@/components/headers/ThemeHeader";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  BackHandler,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ── Types ────────────────────────────────────────────────────────────────────
type NotifCategory =
  | "offer"
  | "product"
  | "system"
  | "message"
  | "payment"
  | "alert";

interface Notification {
  id: string;
  category: NotifCategory;
  title: string;
  body: string;
  time: string;
  isRead: boolean;
  group: "Today" | "Yesterday" | "Earlier";
}

// ── Static demo data (replace with API/Redux later) ──────────────────────────
const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    category: "offer",
    title: "Special Offer Just for You! 🎉",
    body: "Post your Banner Ad for just ₹29 for 28 days. Reach more customers today!",
    time: "2 min ago",
    isRead: false,
    group: "Today",
  },
  {
    id: "2",
    category: "product",
    title: "Your Ad is Live",
    body: "Your listing 'Samsung Galaxy S23' is now live and visible to buyers.",
    time: "1 hr ago",
    isRead: false,
    group: "Today",
  },
  {
    id: "3",
    category: "message",
    title: "New Message from Buyer",
    body: "Rahul Kumar sent you a message: \"Is the price negotiable?\"",
    time: "3 hrs ago",
    isRead: false,
    group: "Today",
  },
  {
    id: "4",
    category: "payment",
    title: "Payment Successful ✅",
    body: "₹299 paid for Featured Ad plan. Your ad will be promoted for 28 days.",
    time: "5 hrs ago",
    isRead: true,
    group: "Today",
  },
  {
    id: "5",
    category: "product",
    title: "Ad Approved",
    body: "Your listing 'Honda Activa 6G' has been approved by our team.",
    time: "Yesterday, 9:30 AM",
    isRead: true,
    group: "Yesterday",
  },
  {
    id: "6",
    category: "message",
    title: "New Message from Seller",
    body: "Priya Sharma replied: \"Yes, you can pick it up from Ranchi tomorrow.\"",
    time: "Yesterday, 11:00 AM",
    isRead: true,
    group: "Yesterday",
  },
  {
    id: "7",
    category: "alert",
    title: "Ad Expiring Soon ⚠️",
    body: "Your ad 'Dell Laptop Core i5' expires in 2 days. Renew now to stay visible.",
    time: "Yesterday, 6:00 PM",
    isRead: false,
    group: "Yesterday",
  },
  {
    id: "8",
    category: "system",
    title: "App Updated Successfully",
    body: "Admitra v2.1 is now installed. Enjoy faster performance and new features.",
    time: "3 days ago",
    isRead: true,
    group: "Earlier",
  },
  {
    id: "9",
    category: "offer",
    title: "Weekend Special Offer 🛍️",
    body: "Get 50% off on Featured Ads this weekend only. Don't miss out!",
    time: "5 days ago",
    isRead: true,
    group: "Earlier",
  },
  {
    id: "10",
    category: "system",
    title: "Welcome to Admitra!",
    body: "Thank you for joining. Post your first free ad and start selling today.",
    time: "7 days ago",
    isRead: true,
    group: "Earlier",
  },
];

// ── Category metadata ─────────────────────────────────────────────────────────
const CATEGORY_META: Record<
  NotifCategory,
  { icon: keyof typeof Ionicons.glyphMap; bg: string; color: string }
> = {
  offer: { icon: "pricetag", bg: "#FFF3E0", color: "#E65100" },
  product: { icon: "cube-outline", bg: "#E8F5E9", color: "#2E7D32" },
  system: { icon: "settings-outline", bg: "#EDE7F6", color: "#4527A0" },
  message: { icon: "chatbubble-ellipses-outline", bg: "#E3F2FD", color: "#1565C0" },
  payment: { icon: "card-outline", bg: "#E8F5E9", color: "#1B5E20" },
  alert: { icon: "warning-outline", bg: "#FFF8E1", color: "#F57F17" },
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] =
    useState<Notification[]>(INITIAL_NOTIFICATIONS);

  useEffect(() => {
    const backAction = () => {
      router.back();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, [router]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markOneRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const deleteNotif = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Group data into sections with headers
  const grouped = (() => {
    const groups: ("Today" | "Yesterday" | "Earlier")[] = [
      "Today",
      "Yesterday",
      "Earlier",
    ];
    const items: (Notification | { type: "header"; label: string })[] = [];
    groups.forEach((g) => {
      const section = notifications.filter((n) => n.group === g);
      if (section.length > 0) {
        items.push({ type: "header", label: g });
        items.push(...section);
      }
    });
    return items;
  })();

  const renderItem = ({
    item,
  }: {
    item: Notification | { type: "header"; label: string };
  }) => {
    if ("type" in item && item.type === "header") {
      return (
        <View style={styles.groupHeader}>
          <ThemedText style={styles.groupHeaderText}>{item.label}</ThemedText>
        </View>
      );
    }

    const notif = item as Notification;
    const meta = CATEGORY_META[notif.category];

    return (
      <TouchableOpacity
        style={[styles.card, !notif.isRead && styles.cardUnread]}
        activeOpacity={0.75}
        onPress={() => markOneRead(notif.id)}
      >
        {/* Unread dot */}
        {!notif.isRead && <View style={styles.unreadDot} />}

        {/* Icon badge */}
        <View style={[styles.iconBadge, { backgroundColor: meta.bg }]}>
          <Ionicons name={meta.icon} size={20} color={meta.color} />
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <View style={styles.cardTopRow}>
            <ThemedText
              style={[styles.cardTitle, !notif.isRead && styles.cardTitleBold]}
              numberOfLines={1}
            >
              {notif.title}
            </ThemedText>
            <ThemedText style={styles.cardTime}>{notif.time}</ThemedText>
          </View>
          <ThemedText style={styles.cardBody} numberOfLines={2}>
            {notif.body}
          </ThemedText>
        </View>

        {/* Delete */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => deleteNotif(notif.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={16} color={COLORS.gray} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name="notifications-off-outline" size={56} color="#BBDEFB" />
      </View>
      <ThemedText style={styles.emptyTitle}>All Caught Up!</ThemedText>
      <ThemedText style={styles.emptySub}>
        You have no notifications right now.{"\n"}Check back later.
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={[styles.container]}>
      {/* Header */}
      <ThemeHeader onBackPress={() => router.back()} title="Notifications" />

      {/* Sub-header: unread count + mark-all-read */}
      {(unreadCount > 0) && (
        <View style={styles.subHeader}>
          <View style={styles.subHeaderLeft}>
            <View style={styles.unreadBadge}>
              <ThemedText style={styles.unreadBadgeText}>
                {unreadCount} unread
              </ThemedText>
            </View>
          </View>
          <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead} activeOpacity={0.75}>
            <Ionicons name="checkmark-done-outline" size={16} color={COLORS.blue} />
            <ThemedText style={styles.markAllText}>Mark all as read</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {/* List */}
      <FlatList
        data={grouped}
        renderItem={renderItem}
        keyExtractor={(item, i) =>
          "type" in item ? `header-${i}` : (item as Notification).id
        }
        contentContainerStyle={[
          styles.listContent,
          notifications.length === 0 && styles.listEmpty,
        ]}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  /* Sub-header */
  subHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF0F4",
  },
  subHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  unreadBadge: {
    backgroundColor: "#E3F2FD",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  unreadBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.blue,
  },
  markAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.blue,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.blue,
  },

  /* List */
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  listEmpty: {
    flex: 1,
    justifyContent: "center",
  },

  /* Group header */
  groupHeader: {
    paddingVertical: 6,
    marginTop: 8,
    marginBottom: 4,
  },
  groupHeaderText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.gray,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  /* Card */
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    position: "relative",
  },
  cardUnread: {
    backgroundColor: "#EEF4FF",
    borderLeftWidth: 3,
    borderLeftColor: COLORS.blue,
  },
  unreadDot: {
    position: "absolute",
    top: 14,
    left: 6,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.blue,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.text,
  },
  cardTitleBold: {
    fontWeight: "700",
    color: "#0D47A1",
  },
  cardTime: {
    fontSize: 10,
    color: COLORS.gray,
    flexShrink: 0,
  },
  cardBody: {
    fontSize: 12,
    color: COLORS.textLight,
    lineHeight: 18,
  },
  deleteBtn: {
    padding: 2,
    alignSelf: "flex-start",
  },

  /* Empty */
  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
    gap: 14,
  },
  emptyIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.gray,
    textAlign: "center",
    lineHeight: 20,
  },
});
