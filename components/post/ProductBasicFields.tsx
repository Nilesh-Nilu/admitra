import { ThemedText } from "@/components/ThemedText";
import { COLORS } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

type Props = {
  price: string;
  onPriceChange: (value: string) => void;
  isNegotiable: boolean;
  onToggleNegotiable: () => void;
  condition: string;
  onConditionChange: (value: string) => void;
  title: string;
  onTitleChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  isMatrimony?: boolean;
};

export default function ProductBasicFields({
  price,
  onPriceChange,
  isNegotiable,
  onToggleNegotiable,
  condition,
  onConditionChange,
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  isMatrimony = false,
}: Props) {
  return (
    <>
      {!isMatrimony && (
      <>
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Product Price</ThemedText>
        <View style={styles.priceRow}>
          <View style={[styles.priceInputWrapper, { flex: 1 }]}>
            <ThemedText style={styles.currency}>₹</ThemedText>
            <TextInput
              style={styles.priceInput}
              placeholder="Enter price"
              placeholderTextColor={COLORS.gray}
              value={price}
              onChangeText={onPriceChange}
              keyboardType="numeric"
            />
          </View>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={onToggleNegotiable}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isNegotiable ? "checkbox" : "square-outline"}
              size={24}
              color={isNegotiable ? COLORS.primary : COLORS.gray}
            />
            <ThemedText style={styles.checkboxLabel}>Price is negotiable</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Condition</ThemedText>
        <View style={styles.conditionRow}>
          {(["New", "Used"] as const).map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.radioOption}
              onPress={() => onConditionChange(option)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={condition === option ? "radio-button-on" : "radio-button-off"}
                size={22}
                color={condition === option ? COLORS.primary : COLORS.gray}
              />
              <ThemedText style={styles.radioLabel}>{option}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      </>
      )}

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>
          {isMatrimony ? "Profile Title *" : "Ad Title *"}
        </ThemedText>
        <TextInput
          style={styles.input}
          placeholder={isMatrimony ? "e.g. Software Engineer, 27, Ranchi" : "Enter ad title"}
          placeholderTextColor={COLORS.gray}
          value={title}
          onChangeText={onTitleChange}
          maxLength={70}
        />
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>
          {isMatrimony ? "About & Partner Preference *" : "Description *"}
        </ThemedText>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={
            isMatrimony
              ? "Write about the bride/groom, family and partner expectations..."
              : "Describe your item in detail..."
          }
          placeholderTextColor={COLORS.gray}
          value={description}
          onChangeText={onDescriptionChange}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={4000}
        />
      </View>
    </>
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
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  priceInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  currency: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    paddingVertical: 14,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
  },
  conditionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  radioLabel: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
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
  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },
});
