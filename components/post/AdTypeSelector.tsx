import { ThemedText } from "@/components/ThemedText";
import { COLORS } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { isMatrimonyPlanType } from "@/components/post/postUtils";
import { StyleSheet, TouchableOpacity, View } from "react-native";

type Props = {
  plans: any[];
  selectedPlan: any;
  isLoading: boolean;
  isLocked?: boolean;
  onSelect: (plan: any) => void;
};

export default function AdTypeSelector({ plans, selectedPlan, isLoading, isLocked = false, onSelect }: Props) {
  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>{isLocked ? "Ad Type (Locked)" : "Ad Type"}</ThemedText>
      {isLoading ? (
        <View style={styles.container}>
          {[1, 2, 3].map((id) => (
            <View key={id} style={styles.skeletonCard}>
              <View style={styles.skeletonCircle} />
              <View style={styles.skeletonIcon} />
              <View style={{ flex: 1, gap: 6 }}>
                <View style={styles.skeletonLine} />
                <View style={[styles.skeletonLine, { width: "50%" }]} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.container}>
          {plans.map((plan) => {
            const isSelected = selectedPlan?.id === plan.id;
            const isFeatured = plan.id === 2 || plan.type === "featured";
            const isBanner = plan.id === 3 || plan.type === "banner";
            const iconName = isFeatured ? "star" : isBanner ? "rocket" : "document-text-outline";
            const iconColor = isFeatured ? "#FBC02D" : isBanner ? "#D32F2F" : "#1976D2";
            const iconBg = isFeatured ? "#FFF9C4" : isBanner ? "#FFEBEE" : "#E3F2FD";
            const subtitle = isFeatured ? "Top Placement" : isBanner ? "Homepage Banner" : "Basic Listing";
            const features = isFeatured
              ? ["Chat & call with buyers", "Top placement in category", "More visibility, more buyers"]
              : isBanner
                ? ["Chat & call with buyers", "Homepage banner placement", "Maximum reach & visibility"]
                : [
                    isMatrimonyPlanType(plan) ? "Chat with Interested Profile/Member" : "Chat with buyers",
                    "Standard listing visibility",
                    "28-day active period",
                  ];
            const badgeText = isFeatured ? "Recommended" : isBanner ? "" : "Free limited time offer";

            return (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.card,
                  isLocked && styles.cardLocked,
                  isSelected && styles.cardActive,
                  isFeatured && isSelected && { backgroundColor: "#FFFDE7", borderColor: "#FFF59D" },
                  isBanner && isSelected && { backgroundColor: "#FFEBEE", borderColor: "#FFCDD2" },
                ]}
                onPress={() => onSelect(plan)}
                disabled={isLocked}
                activeOpacity={isLocked ? 1 : 0.8}
              >
                <View style={styles.row}>
                  <Ionicons name={isSelected ? "radio-button-on" : "radio-button-off"} size={22} color={isSelected ? COLORS.primary : COLORS.gray} />
                  <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
                    <Ionicons name={iconName as any} size={24} color={iconColor} />
                  </View>
                  <View style={styles.mainColumn}>
                    <ThemedText style={styles.title}>
                      {plan.name} {parseFloat(plan.price) > 0 ? `₹${plan.price}` : "(Free)"}
                    </ThemedText>
                    <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
                  </View>
                  <View style={styles.rightColumn}>
                    <ThemedText style={styles.duration}>/ {plan.duration_days} days</ThemedText>
                    {!!badgeText && (
                      <View style={[styles.badge, { backgroundColor: isFeatured ? "#FBC02D" : "#E3F2FD" }]}>
                        <ThemedText style={[styles.badgeText, { color: isFeatured ? "#000" : "#1976D2" }]}>{badgeText}</ThemedText>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.featureList}>
                  {features.map((feature) => (
                    <View key={feature} style={styles.featureRow}>
                      <Ionicons name="checkmark-circle" size={15} color="#2E7D32" />
                      <ThemedText style={styles.featureText}>{feature}</ThemedText>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 12 },
  container: { gap: 12 },
  card: { backgroundColor: COLORS.white, borderRadius: 8, borderWidth: 1, borderColor: "#E0E0E0", padding: 12 },
  cardActive: { borderColor: COLORS.primary },
  cardLocked: { opacity: 0.8 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBox: { width: 44, height: 44, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  mainColumn: { flex: 1 },
  title: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  subtitle: { marginTop: 2, fontSize: 12, color: COLORS.gray },
  rightColumn: { alignItems: "flex-end", gap: 4 },
  duration: { fontSize: 11, color: COLORS.gray },
  badge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
  badgeText: { fontSize: 10, fontWeight: "700" },
  featureList: { marginTop: 12, gap: 5 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  featureText: { fontSize: 12, color: COLORS.gray },
  skeletonCard: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.white, borderRadius: 8, borderWidth: 1, borderColor: "#E0E0E0", padding: 12, gap: 12 },
  skeletonCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#E0E0E0" },
  skeletonIcon: { width: 44, height: 44, borderRadius: 8, backgroundColor: "#E0E0E0" },
  skeletonLine: { height: 12, borderRadius: 4, backgroundColor: "#E0E0E0", width: "80%" },
});
