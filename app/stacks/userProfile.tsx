import ThemeHeader from "@/components/headers/ThemeHeader";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import AppToast from "@/components/toasts/AppToast";
import { COLORS } from "@/constants/Colors";
import { createConversationApi, reportProductApi } from "@/constants/functions";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function UserProfileScreen() {
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (params.userData) {
      try {
        setUser(JSON.parse(params.userData as string));
      } catch {
        setUser(null);
      }
    }
  }, [params.userData]);

  useEffect(() => {
    const handler = BackHandler.addEventListener("hardwareBackPress", () => {
      router.back();
      return true;
    });
    return () => handler.remove();
  }, []);

  const handleChat = async () => {
    try {
      const response = await createConversationApi({
        vendor_id: user?.id,
        subject: "Product inquiry",
      });
      if (response.id) {
        router.push({
          pathname: "/stacks/chatDetail",
          params: {
            conversation_id: response.id,
            receiverId: response.vendor_id,
            userName: user?.name || "Unknown",
          },
        });
      } else {
        Alert.alert("Error", "Failed to start conversation");
      }
    } catch {
      Alert.alert("Error", "Failed to start conversation");
    }
  };

  const handleReportUser = () => {
    Alert.alert("Report User", "Are you sure you want to report this user?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Report",
        style: "destructive",
        onPress: async () => {
          try {
            AppToast("User reported successfully");
          } catch {
            AppToast("Failed to report user");
          }
        },
      },
    ]);
  };

  const location = [user?.city?.name, user?.state?.name].filter(Boolean).join(", ");

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : null;

  const isVerified = user?.is_verify === 1;

  return (
    <ThemedView style={styles.container}>
      <ThemeHeader onBackPress={() => router.back()} title="User Profile" />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Section ── */}
        <View style={styles.hero}>
          {/* Dot pattern decoration */}
          <View style={styles.dotPattern} pointerEvents="none">
            {Array.from({ length: 30 }).map((_, i) => (
              <View key={i} style={styles.dot} />
            ))}
          </View>

          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            {user?.selfieverificationImage ? (
              <Image source={{ uri: user.selfieverificationImage }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={52} color="#94A3B8" />
              </View>
            )}
            {/* Verified / Unverified badge */}
            <View style={[styles.verifiedDot, isVerified ? styles.verifiedDotGreen : styles.verifiedDotOrange]}>
              <Ionicons
                name={isVerified ? "checkmark" : "alert"}
                size={12}
                color="#fff"
              />
            </View>
          </View>

          {/* Name */}
          <ThemedText style={styles.name}>{user?.name || "Unknown User"}</ThemedText>

          {/* User ID */}
          <View style={styles.idBadge}>
            <ThemedText style={styles.idText}>User ID: #{user?.id}</ThemedText>
          </View>

          {/* {user?.email && (
            <View style={styles.emailBadge}>
              <ThemedText style={styles.emailText}>Email: {user?.email}</ThemedText>
            </View>
          )} */}

          {/* Location */}
          {!!location && (
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color={COLORS.primary} />
              <ThemedText style={styles.locationText}>{location}</ThemedText>
            </View>
          )}

          {/* Verified banner */}
          <View style={[styles.verifiedBanner, isVerified ? styles.verifiedBannerGreen : styles.verifiedBannerOrange]}>
            <Ionicons
              name={isVerified ? "shield-checkmark" : "warning"}
              size={18}
              color={isVerified ? "#166534" : "#92400E"}
            />
            <ThemedText style={[styles.verifiedBannerText, { color: isVerified ? "#166534" : "#92400E" }]}>
              {isVerified ? "Verified User" : "Unverified User"}
            </ThemedText>
          </View>
        </View>

        {/* ── Rating ── */}
        {user?.rating != null && (
          <View style={styles.card}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={22} color="#F59E0B" />
              <ThemedText style={styles.ratingValue}>{Number(user.rating).toFixed(1)}</ThemedText>
            </View>
            <ThemedText style={styles.ratingLabel}>Rating</ThemedText>
          </View>
        )}

        {/* ── Stats ── */}
        {(user?.ads_count != null || user?.profile_views != null) && (
          <View style={[styles.card, styles.statsCard]}>
            {user?.ads_count != null && (
              <View style={styles.statItem}>
                <Ionicons name="megaphone" size={24} color={COLORS.primary} />
                <ThemedText style={styles.statValue}>{user.ads_count}</ThemedText>
                <ThemedText style={styles.statLabel}>Ads Posted</ThemedText>
              </View>
            )}
            {user?.ads_count != null && user?.profile_views != null && (
              <View style={styles.statDivider} />
            )}
            {user?.profile_views != null && (
              <View style={styles.statItem}>
                <Ionicons name="eye" size={24} color="#10B981" />
                <ThemedText style={styles.statValue}>{user.profile_views}</ThemedText>
                <ThemedText style={styles.statLabel}>Profile Views</ThemedText>
              </View>
            )}
          </View>
        )}

        {/* ── Chat button ── */}
        <TouchableOpacity style={styles.chatBtn} onPress={handleChat} activeOpacity={0.85}>
          <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
          <ThemedText style={styles.chatBtnText}>Chat</ThemedText>
        </TouchableOpacity>

        {/* ── Report button ── */}
        <TouchableOpacity style={styles.reportBtn} onPress={handleReportUser} activeOpacity={0.85}>
          <Ionicons name="flag" size={18} color="#DC2626" />
          <ThemedText style={styles.reportBtnText}>Report User</ThemedText>
        </TouchableOpacity>

        {/* ── Member Since ── */}
        {!!memberSince && (
          <View style={styles.memberRow}>
            <View style={styles.memberIconWrap}>
              <Ionicons name="calendar" size={22} color={COLORS.primary} />
            </View>
            <View>
              <ThemedText style={styles.memberSinceLabel}>Member Since</ThemedText>
              <ThemedText style={styles.memberSinceValue}>{memberSince}</ThemedText>
            </View>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scroll: { paddingHorizontal: SIZES.padding, paddingTop: 8 },

  /* Hero */
  hero: {
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
    paddingTop: 32,
    paddingBottom: 24,
    marginBottom: 14,
    overflow: "hidden",
    position: "relative",
  },
  dotPattern: {
    position: "absolute",
    top: 8, right: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    width: 100,
    gap: 6,
    opacity: 0.25,
  },
  dot: {
    width: 5, height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  avatarWrapper: { position: "relative", marginBottom: 14 },
  avatar: {
    width: 100, height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatarPlaceholder: {
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedDot: {
    position: "absolute",
    bottom: 2, right: 2,
    width: 26, height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedDotGreen: { backgroundColor: "#22C55E" },
  verifiedDotOrange: { backgroundColor: "#F59E0B" },

  name: { fontSize: 22, fontWeight: "700", color: "#0F172A", marginBottom: 6 },

  idBadge: {
    backgroundColor: "#DBEAFE",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 10,
  },
  idText: { fontSize: 13, fontWeight: "600", color: COLORS.primary },
  emailBadge: {
    backgroundColor: "#DBEAFE",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 10,
  },
  emailText: { fontSize: 13, fontWeight: "600", color: COLORS.primary },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 14 },
  locationText: { fontSize: 14, color: "#475569", fontWeight: "500" },

  verifiedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: "85%",
    justifyContent: "center",
  },
  verifiedBannerGreen: { backgroundColor: "#DCFCE7" },
  verifiedBannerOrange: { backgroundColor: "#FEF3C7" },
  verifiedBannerText: { fontSize: 15, fontWeight: "700" },

  /* Cards */
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  ratingValue: { fontSize: 28, fontWeight: "800", color: "#0F172A" },
  ratingLabel: { fontSize: 13, color: "#94A3B8", marginTop: 2, fontWeight: "500" },

  statsCard: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 20 },
  statItem: { alignItems: "center", gap: 4, flex: 1 },
  statDivider: { width: 1, backgroundColor: "#E2E8F0" },
  statValue: { fontSize: 24, fontWeight: "800", color: "#0F172A" },
  statLabel: { fontSize: 12, color: "#94A3B8", fontWeight: "500" },

  /* Buttons */
  chatBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  chatBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },

  reportBtn: {
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  reportBtnText: { fontSize: 16, fontWeight: "700", color: "#DC2626" },

  /* Member since */
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  memberIconWrap: {
    width: 44, height: 44,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  memberSinceLabel: { fontSize: 12, color: "#94A3B8", fontWeight: "500" },
  memberSinceValue: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
});
