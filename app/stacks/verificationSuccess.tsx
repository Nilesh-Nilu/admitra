import { ThemedText } from "@/components/ThemedText";
import { COLORS } from "@/constants/Colors";
import { ImageUrl } from "@/constants/functions";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function VerificationSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    selfieverificationImage?: string;
    documentType?: string;
  }>();

  const idProofLabel = params.documentType === "aadhar" ? "Aadhaar Card" : params.documentType || "—";

  const details = [
    { icon: "person-outline", label: "Full Name", value: params.name || "—" },
    { icon: "call-outline", label: "Mobile Number", value: params.phone ? `+91  ${params.phone}` : "—" },
    { icon: "mail-outline", label: "Email", value: params.email || "—" },
    { icon: "location-outline", label: "Address", value: params.address || "—" },
    { icon: "card-outline", label: "ID Proof", value: idProofLabel },
    { icon: "camera-outline", label: "Selfie", value: "Verified" },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient colors={["#1565C0", "#1E88E5"]} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Verification Successful</ThemedText>
        <View style={styles.verifiedHeaderBadge}>
          <Ionicons name="shield-checkmark" size={14} color="#fff" />
          <ThemedText style={styles.verifiedHeaderText}>Verified</ThemedText>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Badge */}
        <View style={styles.iconWrap}>
          <View style={styles.iconOuter}>
            <View style={styles.iconInner}>
              <Ionicons name="checkmark" size={44} color="#fff" />
            </View>
          </View>
          {/* Decorative dots */}
          {[...Array(6)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  top: 10 + Math.sin((i * Math.PI) / 3) * 52,
                  left: 60 + Math.cos((i * Math.PI) / 3) * 52,
                  opacity: 0.35 + i * 0.1,
                },
              ]}
            />
          ))}
        </View>

        <ThemedText style={styles.congrats}>Congratulations!</ThemedText>
        <ThemedText style={styles.subTitle}>You are now a Verified User</ThemedText>

        {/* Info box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={18} color="#1565C0" />
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.infoTextHindi}>
              अब आपकी पहचान Verified हो गई है। आप सभी features और benefits का पूरा लाभ उठा सकते हैं।
            </ThemedText>
            <ThemedText style={styles.infoTextEn}>
              Your identity has been verified successfully.{"\n"}You can now enjoy all features and benefits.
            </ThemedText>
          </View>
        </View>

        {/* Verified Details */}
        <ThemedText style={styles.sectionTitle}>Your Verified Details</ThemedText>
        <View style={styles.detailsCard}>
          {details.map((item, index) => (
            <View
              key={item.label}
              style={[styles.detailRow, index < details.length - 1 && styles.detailRowBorder]}
            >
              <View style={styles.detailLeft}>
                <View style={styles.detailIconBox}>
                  <Ionicons name={item.icon as any} size={16} color="#1565C0" />
                </View>
                <ThemedText style={styles.detailLabel}>{item.label}</ThemedText>
              </View>
              <ThemedText style={styles.detailValue} numberOfLines={1}>{item.value}</ThemedText>
              <View style={styles.verifiedPill}>
                <Ionicons name="checkmark-circle" size={12} color="#2E7D32" />
                <ThemedText style={styles.verifiedPillText}>Verified</ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* 100% verified */}
        <View style={styles.fullVerifiedBox}>
          <Ionicons name="shield-checkmark" size={20} color="#1565C0" />
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.fullVerifiedTitle}>Your profile is 100% verified.</ThemedText>
            <ThemedText style={styles.fullVerifiedSub}>
              You will get more trust, visibility and better response on your ads.
            </ThemedText>
          </View>
        </View>

        {/* Verified Member */}
        <View style={styles.memberBox}>
          <Ionicons name="shield-checkmark" size={28} color="#2E7D32" />
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.memberTitle}>You are now a Verified Member</ThemedText>
            <ThemedText style={styles.memberSub}>
              Thank you for verifying your identity with us.{"\n"}Happy to have you with us!
            </ThemedText>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity style={styles.homeBtn} onPress={() => router.push("/(tabs)")}>
          <Ionicons name="home-outline" size={20} color="#fff" />
          <ThemedText style={styles.homeBtnText}>Go to Home</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FB" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: "700", color: "#fff" },
  verifiedHeaderBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  verifiedHeaderText: { fontSize: 12, fontWeight: "700", color: "#fff" },

  content: { padding: 20 },

  iconWrap: {
    alignSelf: "center",
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    marginTop: 8,
  },
  iconOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#BBDEFB",
    alignItems: "center",
    justifyContent: "center",
  },
  iconInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#1565C0",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1565C0",
  },

  congrats: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    color: "#1565C0",
    marginBottom: 4,
  },
  subTitle: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
  },

  infoBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
    padding: 14,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  infoTextHindi: { fontSize: 12, color: "#1E40AF", lineHeight: 18, marginBottom: 6 },
  infoTextEn: { fontSize: 12, color: "#1E40AF", lineHeight: 18 },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1565C0",
    marginBottom: 12,
  },

  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
    overflow: "hidden",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 8,
  },
  detailRowBorder: { borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  detailLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  detailIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  detailLabel: { fontSize: 13, color: "#6B7280", fontWeight: "500" },
  detailValue: { fontSize: 13, color: "#111827", fontWeight: "600", flex: 1 },
  verifiedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#DCFCE7",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  verifiedPillText: { fontSize: 11, fontWeight: "700", color: "#2E7D32" },

  fullVerifiedBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    marginBottom: 14,
  },
  fullVerifiedTitle: { fontSize: 13, fontWeight: "700", color: "#1565C0", marginBottom: 2 },
  fullVerifiedSub: { fontSize: 12, color: "#1E40AF", lineHeight: 17 },

  memberBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  memberTitle: { fontSize: 14, fontWeight: "700", color: "#2E7D32", marginBottom: 4 },
  memberSub: { fontSize: 12, color: "#166534", lineHeight: 18 },

  footer: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    padding: 16,
  },
  homeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1565C0",
    borderRadius: 12,
    paddingVertical: 15,
  },
  homeBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
});
