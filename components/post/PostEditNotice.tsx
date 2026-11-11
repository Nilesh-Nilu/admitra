import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

/** Shown on Create Ad: after posting, only the price can be edited. */
export default function PostEditNotice() {
  return (
    <View style={styles.box}>
      <Ionicons name="alert-circle" size={22} color="#B45309" style={{ marginTop: 1 }} />
      <ThemedText style={styles.text}>
        {"⚠️ Ad Post करने के बाद केवल Price Edit की जा सकेगी। अन्य किसी भी जानकारी को Edit नहीं किया जा सकेगा। कृपया Ad Post करने से पहले सभी जानकारी ध्यानपूर्वक जाँच लें।"}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFBEB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FCD34D",
    padding: 12,
    marginBottom: 12,
    gap: 10,
  },
  text: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    color: "#92400E",
  },
});
