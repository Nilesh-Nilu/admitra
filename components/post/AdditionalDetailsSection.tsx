import { ThemedText } from "@/components/ThemedText";
import { COLORS } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

export type CustomField = { name: string; value: string };

type Props = {
  expanded: boolean;
  onToggle: () => void;
  fields: CustomField[];
  onChangeFields: (fields: CustomField[]) => void;
};

export default function AdditionalDetailsSection({
  expanded,
  onToggle,
  fields,
  onChangeFields,
}: Props) {
  const updateField = (index: number, key: keyof CustomField, value: string) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], [key]: value };
    onChangeFields(updated);
  };

  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.header}
        onPress={onToggle}
        activeOpacity={0.8}
      >
        <View style={styles.headerLeft}>
          <Ionicons
            name="document-text-outline"
            size={20}
            color={COLORS.primary}
            style={{ marginRight: 8 }}
          />
          <ThemedText style={styles.title}>Additional Details</ThemedText>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={COLORS.gray}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          <ThemedText style={[styles.hint, { marginBottom: 8, marginTop: 8 }]}>
            {
              "यदि आप अपने उत्पाद की अतिरिक्त जानकारी (जैसे ब्रांड, वारंटी, मॉडल, रंग, साइज आदि) जोड़ना चाहते हैं, तो 'Additional Details' का उपयोग कर सकते हैं।"
            }
          </ThemedText>
          {fields.map((field, index) => (
            <View key={index} style={styles.fieldRow}>
              <TextInput
                style={[styles.input, styles.fieldInput]}
                placeholder="Field name"
                placeholderTextColor={COLORS.gray}
                value={field.name}
                onChangeText={(text) => updateField(index, "name", text)}
              />
              <TextInput
                style={[styles.input, styles.fieldInput]}
                placeholder="Value"
                placeholderTextColor={COLORS.gray}
                value={field.value}
                onChangeText={(text) => updateField(index, "value", text)}
              />
              <TouchableOpacity
                onPress={() => onChangeFields(fields.filter((_, i) => i !== index))}
                style={styles.removeBtn}
              >
                <Ionicons name="close-circle" size={22} color="#D32F2F" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => onChangeFields([...fields, { name: "", value: "" }])}
          >
            <Ionicons name="add-circle-outline" size={18} color={COLORS.primary} />
            <ThemedText style={styles.addText}>Add Field</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 8 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  content: { marginTop: 8 },
  hint: {
    fontSize: 12,
    color: COLORS.gray,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fieldInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
  },
  removeBtn: { padding: 4 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary + "50",
    borderStyle: "dashed",
    backgroundColor: COLORS.primary + "08",
    alignSelf: "flex-start",
    marginTop: 4,
  },
  addText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
});
