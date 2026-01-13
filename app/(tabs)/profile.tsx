import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS } from "@/constants/Colors";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Mock user data
const USER = {
  name: "Rajesh Kumar",
  email: "rajesh.kumar@email.com",
  phone: "+91 98765 43210",
  avatar: "https://i.pravatar.cc/150?img=11",
  isVerified: true,
  memberSince: "March 2023",
  location: "Mumbai, Maharashtra",
  role: "vendor", // "buyer" | "vendor"
  stats: {
    listings: 12,
    sold: 8,
    rating: 4.8,
    reviews: 24,
  },
};

const MENU_SECTIONS = [
  {
    title: "My Activity",
    items: [
      { id: "listings", icon: "pricetag", label: "My Listings", badge: "12" },
      { id: "favorites", icon: "heart", label: "Favorites", badge: "5" },
      { id: "orders", icon: "bag-check", label: "My Orders", badge: null },
      { id: "reviews", icon: "star", label: "Reviews & Ratings", badge: null },
    ],
  },
  {
    title: "Account Settings",
    items: [
      { id: "edit-profile", icon: "person", label: "Edit Profile", badge: null },
      { id: "addresses", icon: "location", label: "Saved Addresses", badge: null },
      { id: "notifications", icon: "notifications", label: "Notifications", badge: null },
      { id: "privacy", icon: "shield-checkmark", label: "Privacy Settings", badge: null },
    ],
  },
  {
    title: "Support",
    items: [
      { id: "help", icon: "help-circle", label: "Help Center", badge: null },
      { id: "contact", icon: "chatbox", label: "Contact Us", badge: null },
      { id: "feedback", icon: "chatbubble-ellipses", label: "Send Feedback", badge: null },
      { id: "terms", icon: "document-text", label: "Terms & Conditions", badge: null },
    ],
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleMenuPress = (itemId: string) => {
    switch (itemId) {
      case "listings":
        // Navigate to my listings
        break;
      case "favorites":
        // Navigate to favorites
        break;
      case "orders":
        // Navigate to orders
        break;
      case "reviews":
        // Navigate to reviews
        break;
      case "edit-profile":
        // Navigate to edit profile
        break;
      case "addresses":
        // Navigate to addresses
        break;
      case "notifications":
        // Toggle or navigate
        break;
      case "privacy":
        router.push("/stacks/policy");
        break;
      case "help":
        router.push("/stacks/faqScreen");
        break;
      case "contact":
        router.push("/stacks/contactUs");
        break;
      case "terms":
        router.push("/stacks/termsConditions");
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => router.replace("/(auth)"),
        },
      ]
    );
  };

  const renderProfileHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={[styles.profileHeader, { paddingTop: insets.top + 20 }]}
    >
      {/* Settings Button */}
      <TouchableOpacity style={styles.settingsBtn}>
        <Ionicons name="settings-outline" size={24} color={COLORS.white} />
      </TouchableOpacity>

      {/* Avatar & Info */}
      <View style={styles.profileInfo}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: USER.avatar }} style={styles.avatar} />
          {USER.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
            </View>
          )}
        </View>
        <ThemedText style={styles.userName}>{USER.name}</ThemedText>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={14} color="rgba(255,255,255,0.8)" />
          <ThemedText style={styles.userLocation}>{USER.location}</ThemedText>
        </View>
        <View style={styles.memberBadge}>
          <Ionicons name="ribbon" size={14} color={COLORS.warning} />
          <ThemedText style={styles.memberText}>
            {USER.role === "vendor" ? "Verified Seller" : "Buyer"} • Since {USER.memberSince}
          </ThemedText>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <ThemedText style={styles.statValue}>{USER.stats.listings}</ThemedText>
          <ThemedText style={styles.statLabel}>Listings</ThemedText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <ThemedText style={styles.statValue}>{USER.stats.sold}</ThemedText>
          <ThemedText style={styles.statLabel}>Sold</ThemedText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <View style={styles.ratingRow}>
            <ThemedText style={styles.statValue}>{USER.stats.rating}</ThemedText>
            <Ionicons name="star" size={14} color={COLORS.warning} />
          </View>
          <ThemedText style={styles.statLabel}>{USER.stats.reviews} Reviews</ThemedText>
        </View>
      </View>
    </LinearGradient>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <TouchableOpacity style={styles.actionBtn}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.actionBtnGradient}
        >
          <Ionicons name="pencil" size={20} color={COLORS.white} />
          <ThemedText style={styles.actionBtnText}>Edit Profile</ThemedText>
        </LinearGradient>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.actionBtn, styles.actionBtnOutline]}>
        <Ionicons name="share-social" size={20} color={COLORS.primary} />
        <ThemedText style={[styles.actionBtnText, { color: COLORS.primary }]}>
          Share Profile
        </ThemedText>
      </TouchableOpacity>
    </View>
  );

  const renderMenuSection = (section: typeof MENU_SECTIONS[0], index: number) => (
    <View key={index} style={styles.menuSection}>
      <ThemedText style={styles.menuSectionTitle}>{section.title}</ThemedText>
      <View style={styles.menuCard}>
        {section.items.map((item, itemIndex) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              itemIndex < section.items.length - 1 && styles.menuItemBorder,
            ]}
            onPress={() => handleMenuPress(item.id)}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconContainer}>
                <Ionicons name={item.icon as any} size={20} color={COLORS.primary} />
              </View>
              <ThemedText style={styles.menuItemLabel}>{item.label}</ThemedText>
            </View>
            <View style={styles.menuItemRight}>
              {item.badge && (
                <View style={styles.menuBadge}>
                  <ThemedText style={styles.menuBadgeText}>{item.badge}</ThemedText>
                </View>
              )}
              <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderProfileHeader()}
        {renderActionButtons()}

        {MENU_SECTIONS.map((section, index) => renderMenuSection(section, index))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
          <ThemedText style={styles.logoutText}>Logout</ThemedText>
        </TouchableOpacity>

        {/* App Version */}
        <ThemedText style={styles.versionText}>Version 1.0.0</ThemedText>

        <View style={{ height: 100 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  /* Profile Header */
  profileHeader: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  settingsBtn: {
    alignSelf: "flex-end",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    alignItems: "center",
    marginTop: 10,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.3)",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.white,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  userLocation: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  memberText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.white,
  },

  /* Stats */
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    marginTop: 24,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.white,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  /* Action Buttons */
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: SIZES.padding,
    marginTop: -15,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  actionBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  actionBtnOutline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.white,
  },

  /* Menu */
  menuSection: {
    marginTop: 24,
    paddingHorizontal: SIZES.padding,
  },
  menuSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.gray,
    marginBottom: 12,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary + "10",
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.text,
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  menuBadge: {
    backgroundColor: COLORS.primary,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  menuBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.white,
  },

  /* Logout */
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginHorizontal: SIZES.padding,
    marginTop: 24,
    paddingVertical: 16,
    backgroundColor: COLORS.error + "10",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.error + "30",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.error,
  },

  /* Version */
  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 20,
  },
});
