import { ThemedText } from "@/components/ThemedText";
import { COLORS } from "@/constants/Colors";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";

/** Ads shown per page; every list reveals this many more on each "Load More" tap. */
export const PAGE_SIZE = 26;

type Props = { loading?: boolean; onPress: () => void };

export default function LoadMoreButton({ loading = false, onPress }: Props) {
  return (
    <View style={styles.wrap}>
      <TouchableOpacity style={styles.btn} onPress={onPress} disabled={loading} activeOpacity={0.8}>
        {loading ? <ActivityIndicator size="small" color="#fff" /> : <ThemedText style={styles.text}>Load More</ThemedText>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", paddingVertical: 16 },
  btn: {
    minWidth: 160,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  text: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
