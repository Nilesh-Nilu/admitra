import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STEPS = [
  {
    icon: "document-text-outline",
    title: "Verification Submitted",
    sub: "We have received your details and documents.",
  },
  {
    icon: "person-circle-outline",
    title: "Manual Verification",
    sub: "Our team is verifying your information manually.",
  },
  {
    icon: "notifications-outline",
    title: "You Will Be Notified",
    sub: "You will get a notification once verification is complete.",
  },
];

export default function VerificationPendingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Close button */}
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
        <Ionicons name="close" size={24} color="#555" />
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Illustration */}
        <View style={styles.illustrationWrap}>
          <LinearGradient
            colors={["#EFF6FF", "#DBEAFE"]}
            style={styles.illustrationBg}
          >
            <View style={styles.clipboardOuter}>
              <Ionicons name="clipboard-outline" size={52} color="#1565C0" />
              <View style={styles.clockBadge}>
                <Ionicons name="time-outline" size={18} color="#1565C0" />
              </View>
            </View>
          </LinearGradient>
          {/* Decorative diamonds */}
          {[
            { top: 8, left: 30 }, { top: 8, right: 30 },
            { bottom: 14, left: 14 }, { bottom: 14, right: 14 },
            { top: 40, right: 10 }, { top: 40, left: 10 },
          ].map((pos, i) => (
            <View key={i} style={[styles.diamond, pos as any]} />
          ))}
        </View>

        <ThemedText style={styles.title}>Verification Under Review</ThemedText>
        <ThemedText style={styles.subtitle}>
          Your verification is being checked manually{"\n"}by our team. Please wait...
        </ThemedText>

        {/* Steps */}
        <View style={styles.stepsCard}>
          {STEPS.map((step, index) => (
            <View
              key={step.title}
              style={[styles.stepRow, index < STEPS.length - 1 && styles.stepRowBorder]}
            >
              <View style={styles.stepIconBox}>
                <Ionicons name={step.icon as any} size={22} color="#1565C0" />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.stepTitle}>{step.title}</ThemedText>
                <ThemedText style={styles.stepSub}>{step.sub}</ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Info box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={18} color="#1565C0" />
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.infoHindi}>
              आपको verification approval होने पर सूचित किया जाएगा।
            </ThemedText>
            <ThemedText style={styles.infoEn}>
              You will be notified once your verification is approved.
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Footer button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.okBtn}
          onPress={() => router.push("/(tabs)")}
        >
          <ThemedText style={styles.okBtnText}>OK, Got It</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  closeBtn: {
    alignSelf: "flex-end",
    padding: 16,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
  },

  illustrationWrap: {
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    position: "relative",
  },
  illustrationBg: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  clipboardOuter: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  clockBadge: {
    position: "absolute",
    bottom: -4,
    right: -12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#BFDBFE",
    alignItems: "center",
    justifyContent: "center",
  },
  diamond: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: "#93C5FD",
    transform: [{ rotate: "45deg" }],
    opacity: 0.7,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1565C0",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },

  stepsCard: {
    width: "100%",
    backgroundColor: "#F8FAFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    marginBottom: 16,
    overflow: "hidden",
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    padding: 14,
  },
  stepRowBorder: { borderBottomWidth: 1, borderBottomColor: "#DBEAFE" },
  stepIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  stepTitle: { fontSize: 14, fontWeight: "700", color: "#1565C0", marginBottom: 2 },
  stepSub: { fontSize: 12, color: "#555", lineHeight: 17 },

  infoBox: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  infoHindi: { fontSize: 12, color: "#1E40AF", lineHeight: 18, marginBottom: 4 },
  infoEn: { fontSize: 12, color: "#1E40AF", lineHeight: 18 },

  footer: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    padding: 16,
  },
  okBtn: {
    backgroundColor: "#1565C0",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  okBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
});
