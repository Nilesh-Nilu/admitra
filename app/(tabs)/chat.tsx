import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS } from "@/constants/Colors";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Mock chat data
const CHATS = [
  {
    id: 1,
    user: {
      name: "Rahul Sharma",
      avatar: "https://i.pravatar.cc/150?img=1",
      verified: true,
    },
    product: {
      title: "iPhone 14 Pro Max",
      image: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=100",
      price: 85000,
    },
    lastMessage: "Is this still available?",
    time: "2 min ago",
    unread: 2,
    isOnline: true,
  },
  {
    id: 2,
    user: {
      name: "Priya Patel",
      avatar: "https://i.pravatar.cc/150?img=5",
      verified: false,
    },
    product: {
      title: "2BHK Apartment for Rent",
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=100",
      price: 25000,
    },
    lastMessage: "Can you share more photos?",
    time: "1 hour ago",
    unread: 0,
    isOnline: false,
  },
  {
    id: 3,
    user: {
      name: "Amit Kumar",
      avatar: "https://i.pravatar.cc/150?img=3",
      verified: true,
    },
    product: {
      title: "Honda City 2020",
      image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=100",
      price: 950000,
    },
    lastMessage: "Final price 9 lakhs. Deal?",
    time: "3 hours ago",
    unread: 1,
    isOnline: true,
  },
  {
    id: 4,
    user: {
      name: "Neha Singh",
      avatar: "https://i.pravatar.cc/150?img=10",
      verified: false,
    },
    product: {
      title: "MacBook Pro M2",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100",
      price: 125000,
    },
    lastMessage: "Thanks for the quick response!",
    time: "Yesterday",
    unread: 0,
    isOnline: false,
  },
  {
    id: 5,
    user: {
      name: "Vikram Mehta",
      avatar: "https://i.pravatar.cc/150?img=8",
      verified: true,
    },
    product: {
      title: "Sofa Set - 5 Seater",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100",
      price: 35000,
    },
    lastMessage: "Deal confirmed! See you tomorrow.",
    time: "2 days ago",
    unread: 0,
    isOnline: false,
    isDealConfirmed: true,
  },
];

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "buying" | "selling">("all");

  const formatPrice = (price: number) => {
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`;
    }
    return `₹${price.toLocaleString("en-IN")}`;
  };

  const filteredChats = CHATS.filter((chat) =>
    chat.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderChatItem = ({ item }: { item: typeof CHATS[0] }) => (
    <TouchableOpacity
      style={styles.chatItem}
      activeOpacity={0.7}
      onPress={() => router.push({
        pathname: "/stacks/chatDetail",
        params: { chatId: item.id, userName: item.user.name }
      })}
    >
      {/* User Avatar */}
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>

      {/* Chat Content */}
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <View style={styles.userInfo}>
            <ThemedText style={styles.userName}>{item.user.name}</ThemedText>
            {item.user.verified && (
              <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />
            )}
          </View>
          <ThemedText style={styles.chatTime}>{item.time}</ThemedText>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Image source={{ uri: item.product.image }} style={styles.productThumb} />
          <View style={styles.productDetails}>
            <ThemedText style={styles.productTitle} numberOfLines={1}>
              {item.product.title}
            </ThemedText>
            <ThemedText style={styles.productPrice}>
              {formatPrice(item.product.price)}
            </ThemedText>
          </View>
        </View>

        {/* Last Message */}
        <View style={styles.messageRow}>
          {item.isDealConfirmed && (
            <View style={styles.dealBadge}>
              <Ionicons name="checkmark-circle" size={12} color={COLORS.success} />
              <ThemedText style={styles.dealText}>Deal</ThemedText>
            </View>
          )}
          <ThemedText
            style={[
              styles.lastMessage,
              item.unread > 0 && styles.lastMessageUnread,
            ]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </ThemedText>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <ThemedText style={styles.unreadCount}>{item.unread}</ThemedText>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="chatbubbles-outline" size={64} color={COLORS.gray} />
      </View>
      <ThemedText style={styles.emptyTitle}>No Messages Yet</ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        Start chatting with sellers or buyers to see your conversations here
      </ThemedText>
      <TouchableOpacity
        style={styles.browseBtn}
        onPress={() => router.push("/(tabs)")}
      >
        <ThemedText style={styles.browseBtnText}>Browse Listings</ThemedText>
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <ThemedText style={styles.headerTitle}>Messages</ThemedText>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="ellipsis-vertical" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages..."
          placeholderTextColor={COLORS.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color={COLORS.gray} />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[
          { key: "all", label: "All" },
          { key: "buying", label: "Buying" },
          { key: "selling", label: "Selling" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <ThemedText
              style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}
            >
              {tab.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chat List */}
      {filteredChats.length > 0 ? (
        <FlatList
          data={filteredChats}
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
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  /* Search */
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    marginHorizontal: SIZES.padding,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },

  /* Tabs */
  tabs: {
    flexDirection: "row",
    paddingHorizontal: SIZES.padding,
    marginBottom: 8,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.background,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  tabTextActive: {
    color: COLORS.white,
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
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  chatContent: {
    flex: 1,
    gap: 8,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
  productInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 8,
    borderRadius: 10,
    gap: 10,
  },
  productThumb: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  productDetails: {
    flex: 1,
  },
  productTitle: {
    fontSize: 12,
    color: COLORS.text,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dealBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.success + "15",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  dealText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.success,
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
});

