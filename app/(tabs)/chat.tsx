import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS } from "@/constants/Colors";
import { getConversationApi } from "@/constants/functions";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

// Shimmer skeleton component
const ShimmerItem = ({ animatedValue }: { animatedValue: Animated.Value }) => {
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View style={styles.chatItem}>
      {/* Avatar Skeleton */}
      <View style={styles.skeletonAvatar}>
        <Animated.View
          style={[
            styles.shimmer,
            { transform: [{ translateX }] },
          ]}
        />
      </View>

      {/* Content Skeleton */}
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <View style={styles.skeletonName}>
            <Animated.View
              style={[styles.shimmer, { transform: [{ translateX }] }]}
            />
          </View>
          <View style={styles.skeletonTime}>
            <Animated.View
              style={[styles.shimmer, { transform: [{ translateX }] }]}
            />
          </View>
        </View>
        <View style={styles.skeletonSubject}>
          <Animated.View
            style={[styles.shimmer, { transform: [{ translateX }] }]}
          />
        </View>
        <View style={styles.skeletonMessage}>
          <Animated.View
            style={[styles.shimmer, { transform: [{ translateX }] }]}
          />
        </View>
      </View>
    </View>
  );
};

const ShimmerLoader = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <View style={styles.chatList}>
      {[1, 2, 3, 4, 5].map((item) => (
        <ShimmerItem key={item} animatedValue={animatedValue} />
      ))}
    </View>
  );
};

export default function ChatScreen() {
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useSelector((state: any) => state.entities.authReducer?.user);

  const getMessages = async () => {
    try {
      const response = await getConversationApi();
      if (response) {
        setConversations(response);
      }
    } catch (error) {
      console.log(error, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMessages();
  }, []);

  // Get the other user based on current user's role
  const getOtherUser = (item: any) => {
    return currentUser?.role === "vendor" ? item.user : item.vendor;
  };
  // Format time to relative format
  const formatTime = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };


  const renderChatItem = ({ item }: { item: any }) => {
    const otherUser = getOtherUser(item);

    return (
      <TouchableOpacity
        style={styles.chatItem}
        activeOpacity={0.7}
        onPress={() => {
          router.push({
            pathname: "/stacks/chatDetail",
            params: {
              conversation_id: item.id,
              userName: otherUser?.name || "User",
              receiverId: otherUser?.id,
            }
          });
        }}
      >
        {/* User Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
            <ThemedText style={styles.avatarText}>{getInitials(otherUser?.name || "U")}</ThemedText>
          </View>
        </View>

        {/* Chat Content */}
        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <View style={styles.userInfo}>
              <ThemedText style={styles.userName}>{otherUser?.name || "Unknown User"}</ThemedText>
              {otherUser?.is_verify === 1 && (
                <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />
              )}
              <View style={[
                styles.roleBadge,
                { backgroundColor: otherUser?.role === "vendor" ? COLORS.primary + "20" : COLORS.success + "20" }
              ]}>
                <ThemedText style={[
                  styles.roleText,
                  { color: otherUser?.role === "vendor" ? COLORS.primary : COLORS.success }
                ]}>
                  {otherUser?.role === "vendor" ? "Seller" : "Buyer"}
                </ThemedText>
              </View>
            </View>
            {item.last_message_at && (
              <ThemedText style={styles.chatTime}>{formatTime(item.last_message_at)}</ThemedText>
            )}
          </View>

          {/* Subject */}
          <ThemedText style={styles.subject} numberOfLines={1}>{item.subject || "Product inquiry"}</ThemedText>

          {/* Last Message */}
          <View style={styles.messageRow}>
            <ThemedText
              style={[styles.lastMessage, item.unread_count > 0 && styles.lastMessageUnread]}
              numberOfLines={1}
            >
              {item.last_message || "No messages yet"}
            </ThemedText>
            {item.unread_count > 0 && (
              <View style={styles.unreadBadge}>
                <ThemedText style={styles.unreadCount}>{item.unread_count}</ThemedText>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="chatbubbles-outline" size={64} color={COLORS.gray} />
      </View>
      <ThemedText style={styles.emptyTitle}>No Messages Yet</ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        Start chatting with sellers or buyers to see your conversations here
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header]}>
        <ThemedText style={styles.headerTitle}>Messages</ThemedText>
      </View>

      {/* Chat List */}
      {loading ? (
        <ShimmerLoader />
      ) : conversations.length > 0 ? (
        <FlatList
          data={conversations}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.chatList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyState()
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  /* Header */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SIZES.padding,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.text,
  },
  /* Chat List */
  chatList: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 8,
    paddingBottom: 100,
  },
  chatItem: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    position: "relative",
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
  },
  chatContent: {
    flex: 1,
    gap: 6,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
  chatTime: {
    fontSize: 12,
    color: COLORS.gray,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  roleText: {
    fontSize: 10,
    fontWeight: "600",
  },
  subject: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.text,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  lastMessage: {
    flex: 1,
    fontSize: 13,
    color: COLORS.gray,
  },
  lastMessageUnread: {
    color: COLORS.text,
    fontWeight: "600",
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.white,
  },

  /* Empty State */
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SIZES.padding * 2,
    paddingBottom: 100,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  browseBtn: {
    marginTop: 24,
    paddingHorizontal: 28,
    paddingVertical: 14,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  browseBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.white,
  },

  /* Shimmer Skeleton */
  skeletonAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.border,
    overflow: "hidden",
  },
  skeletonName: {
    width: 120,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.border,
    overflow: "hidden",
  },
  skeletonTime: {
    width: 50,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.border,
    overflow: "hidden",
  },
  skeletonSubject: {
    width: "70%",
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.border,
    overflow: "hidden",
  },
  skeletonMessage: {
    width: "90%",
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.border,
    overflow: "hidden",
  },
  shimmer: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.5)",
  },
});

