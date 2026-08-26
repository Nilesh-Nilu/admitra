import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

export default function PostWarningNotice() {
  return (
    <View style={styles.warningBox}>
      <Ionicons name="warning" size={32} color="#D32F2F" style={{ marginTop: 2 }} />
      <View style={styles.warningContent}>
        <ThemedText style={styles.warningTitle}>Important Notice</ThemedText>
        <ThemedText style={styles.warningText}>
          {
            "Illegal link या illegal video post करने पर users आपको report कर सकते हैं।\nअगर multiple reports मिलते हैं तो:"
          }
        </ThemedText>
        <View style={styles.warningBullet}>
          <ThemedText style={styles.warningDot}>•</ThemedText>
          <ThemedText style={styles.warningBulletText}>आपका ad remove हो सकता है।</ThemedText>
        </View>
        <View style={styles.warningBullet}>
          <ThemedText style={styles.warningDot}>•</ThemedText>
          <ThemedText style={styles.warningBulletText}>
            आपका account temporary या permanent ban/block हो सकता है।
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFEBEE",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FFCDD2",
    padding: 12,
    marginBottom: 12,
    gap: 10,
  },
  warningContent: { flex: 1 },
  warningTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#D32F2F",
  },
  warningText: {
    fontSize: 10,
    color: "#424242",
  },
  warningBullet: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  warningDot: {
    fontSize: 14,
    color: "#D32F2F",
  },
  warningBulletText: {
    flex: 1,
    fontSize: 10,
    color: "#424242",
  },
});
