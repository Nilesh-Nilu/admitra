import ThemeHeader from "@/components/headers/ThemeHeader";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS } from "@/constants/Colors";
import { markNotificationRead, getNotifications } from "@/constants/functions";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import {
  BackHandler,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

// ── Types ────────────────────────────────────────────────────────────────────
type NotifCategory =
  | "offer"
  | "product"
  | "system"
  | "message"
  | "payment"
  | "alert"
  | "general";

interface Notification {
  id: string;
  category: NotifCategory;
  title: string;
  body: string;
  time: string;
  isRead: boolean;
  group: "Today" | "Yesterday" | "Earlier";
}

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
  general: { icon: "notifications-outline", bg: "#E3F2FD", color: "#1565C0" },
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function NotificationsScreen() {
  const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { user } = useSelector((state: any) => state.entities.authReducer) || {};
 
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [activeTab, setActiveTab] = useState<"All" | "Unread" | "Read">("All");
    
    const fetchNotifications = async (pageNo = 1) => {
      try {
        if (pageNo === 1) {
          setLoading(true);
        }
    
        const response = await getNotifications(user?.id, pageNo);
    
        const apiData = response.data;
    
        const formattedNotifications = apiData.data.map((item: any) => ({
          id: item.id.toString(),
          title: item.title,
          body: item.message,
          isRead: item.is_read,
          time: new Date(item.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          group: getNotificationGroup(item.created_at),
          category: "general",
        }));
    
        if (pageNo === 1) {
          setNotifications(formattedNotifications);
        } else {
          setNotifications((prev) => [...prev, ...formattedNotifications]);
        }
    
        setHasMore(pageNo < apiData.last_page);
        setPage(pageNo);
      } catch (error) {
        console.log("Notification Error:", error);
      } finally {
        setLoading(false);
      }
    };
    const getNotificationGroup = (dateString: string) => {
      const date = new Date(dateString);
    
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
    
      if (date.toDateString() === today.toDateString()) {
        return "Today";
      }
    
      if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
      }
    
      return "Earlier";
    };
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
  useEffect(() => {
    fetchNotifications(1);
  }, []);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const onRefresh = () => {
    fetchNotifications(1);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchNotifications(page + 1);
    }
  };

  const markOneRead = async (id: string) => {
    try {
      await markNotificationRead(user?.id, Number(id));
  
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? {
                ...n,
                isRead: true,
              }
            : n
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  const deleteNotif = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "Unread") return !n.isRead;
    if (activeTab === "Read") return n.isRead;
    return true; // "All"
  });

  // Group data into sections with headers
  const grouped = (() => {
    const groups: ("Today" | "Yesterday" | "Earlier")[] = [
      "Today",
      "Yesterday",
      "Earlier",
    ];
    const items: (Notification | { type: "header"; label: string })[] = [];
    groups.forEach((g) => {
      const section = filteredNotifications.filter((n) => n.group === g);
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

      {/* Sub-header: tabs + mark-all-read */}

      {loading && notifications.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={grouped}
          renderItem={renderItem}
          refreshing={loading}
          onRefresh={onRefresh}
          ListEmptyComponent={renderEmpty}
          onEndReached={loadMore}
        />
      )}
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
  tabsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F0F2F5",
  },
  activeTab: {
    backgroundColor: COLORS.blue,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.gray,
  },
  activeTabText: {
    color: COLORS.white,
  },
  markAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E3F2FD",
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
    borderLeftWidth: 4,
    borderLeftColor: COLORS.blue,
    backgroundColor: "#F8FBFF",
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
