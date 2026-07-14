import { ThemedText } from "@/components/ThemedText";
import { COLORS } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

type Props = {
  productName?: string;
  productType?: string;
};

export default function RenewalNotice({ productName, productType }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name="refresh-outline" size={22} color="#1565C0" />
      <View style={styles.content}>
        <ThemedText style={styles.title} numberOfLines={1}>Renewing {productName}</ThemedText>
        <ThemedText style={styles.text}>
          Your ad details and {productType || "current"} type are prefilled and locked.
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16, padding: 12, borderRadius: 12, backgroundColor: "#1565C015", borderWidth: 1, borderColor: "#1565C030" },
  content: { flex: 1 },
  title: { fontSize: 14, fontWeight: "700", color: "#1565C0" },
  text: { marginTop: 2, fontSize: 12, color: COLORS.gray },
});
