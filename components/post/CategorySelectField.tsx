import { ThemedText } from "@/components/ThemedText";
import { COLORS } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

type Props = {
  label: string;
  onPress: () => void;
};

export default function CategorySelectField({ label, onPress }: Props) {
  const hasSelection = label !== "Select Category";

  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Category & Sub Category *</ThemedText>
      <TouchableOpacity style={styles.selectorBtn} onPress={onPress} activeOpacity={0.8}>
        <ThemedText style={hasSelection ? styles.selectedText : styles.placeholderText}>
          {label}
        </ThemedText>
        <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 8 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  selectorBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 8,
  },
  placeholderText: {
    fontSize: 15,
    color: COLORS.gray,
  },
  selectedText: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: "500",
  },
});
