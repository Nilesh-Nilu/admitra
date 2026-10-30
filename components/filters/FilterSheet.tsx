import { ThemedText } from "@/components/ThemedText";
import { COLORS } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type FilterValues = Record<string, any>;

export type FilterSection =
  | { key: string; title: string; type: "chips"; options: { value: any; label: string }[] }
  | { key: string; title: string; type: "range"; minKey: string; maxKey: string; minPlaceholder: string; maxPlaceholder: string };

type Props = {
  visible: boolean;
  sections: FilterSection[];
  value: FilterValues;
  defaultValue: FilterValues;
  onApply: (value: FilterValues) => void;
  onClose: () => void;
};

/** Bottom sheet of chip and min/max sections; edits a draft and hands it back on Apply. */
export default function FilterSheet({ visible, sections, value, defaultValue, onApply, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<FilterValues>(value);

  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  const set = (key: string, next: any) => setDraft((prev) => ({ ...prev, [key]: next }));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: 16 + insets.bottom }]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={26} color={COLORS.text} />
            </TouchableOpacity>
            <ThemedText style={styles.title}>Filters</ThemedText>
            <TouchableOpacity onPress={() => setDraft(defaultValue)} hitSlop={8}>
              <ThemedText style={styles.clearText}>Clear</ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
            {sections.map((section) => (
              <View key={section.key} style={styles.section}>
                <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
                {section.type === "chips" ? (
                  <View style={styles.chips}>
                    {section.options.map((option) => {
                      const active = draft[section.key] === option.value;
                      return (
                        <TouchableOpacity
                          key={String(option.value)}
                          style={[styles.chip, active && styles.chipActive]}
                          onPress={() => set(section.key, option.value)}
                        >
                          <ThemedText style={[styles.chipText, active && styles.chipTextActive]}>{option.label}</ThemedText>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : (
                  <View style={styles.rangeRow}>
                    <TextInput
                      style={styles.rangeInput}
                      placeholder={section.minPlaceholder}
                      placeholderTextColor={COLORS.gray}
                      keyboardType="number-pad"
                      value={draft[section.minKey] ?? ""}
                      onChangeText={(text) => set(section.minKey, text.replace(/[^0-9]/g, ""))}
                    />
                    <ThemedText style={styles.rangeTo}>to</ThemedText>
                    <TextInput
                      style={styles.rangeInput}
                      placeholder={section.maxPlaceholder}
                      placeholderTextColor={COLORS.gray}
                      keyboardType="number-pad"
                      value={draft[section.maxKey] ?? ""}
                      onChangeText={(text) => set(section.maxKey, text.replace(/[^0-9]/g, ""))}
                    />
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.applyBtn} onPress={() => onApply(draft)} activeOpacity={0.85}>
            <ThemedText style={styles.applyText}>Apply Filters</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: {
    maxHeight: "85%",
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  clearText: { fontSize: 15, fontWeight: "600", color: COLORS.primary },
  body: { marginTop: 4 },
  section: { paddingVertical: 14 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: COLORS.text, marginBottom: 10 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, color: COLORS.text },
  chipTextActive: { color: COLORS.white, fontWeight: "600" },
  rangeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  rangeInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.text,
  },
  rangeTo: { fontSize: 13, color: COLORS.gray },
  applyBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 15, alignItems: "center", marginTop: 8 },
  applyText: { fontSize: 16, fontWeight: "700", color: COLORS.white },
});
