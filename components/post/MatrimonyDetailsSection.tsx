import DatePickerModal from "@/components/inputs/DatePickerModal";
import ThemeSelect from "@/components/inputs/ThemeSelect";
import { ThemedText } from "@/components/ThemedText";
import { COLORS } from "@/constants/Colors";
import {
  getActiveMasterItems,
  getMasterLabel,
  MATRIMONY_SELECT_FIELDS,
  MatrimonyMasters,
  parseDateOfBirth,
} from "@/constants/matrimony";
import { Ionicons } from "@expo/vector-icons";
import { useState, type ComponentProps } from "react";
import { ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

type Props = {
  masters: MatrimonyMasters | null;
  isLoading: boolean;
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
};

const pad = (n: number) => String(n).padStart(2, "0");
// API format for date_of_birth.
const toIsoDate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const toDisplayDate = (date: Date) =>
  date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const today = new Date();
// Youngest allowed profile is 18; the gender-specific minimum is checked on submit.
const MAX_DOB = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
const MIN_DOB = new Date(today.getFullYear() - 100, 0, 1);
const DEFAULT_DOB_VIEW = new Date(today.getFullYear() - 25, 0, 1);

export default function MatrimonyDetailsSection({ masters, isLoading, values, onChange }: Props) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const dateOfBirth = parseDateOfBirth(values.date_of_birth);
  const hobbies = getActiveMasterItems(masters, "hobbies");
  const selectedHobbies: number[] = values.hobbies_interest || [];

  const toggleHobby = (id: number) =>
    onChange(
      "hobbies_interest",
      selectedHobbies.includes(id)
        ? selectedHobbies.filter((hobbyId) => hobbyId !== id)
        : [...selectedHobbies, id]
    );

  const renderTextField = (
    key: string,
    label: string,
    props: ComponentProps<typeof TextInput> = {}
  ) => (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <ThemedText style={styles.label}>{label}</ThemedText>
        <ThemedText style={styles.required}>*</ThemedText>
      </View>
      <TextInput
        style={styles.input}
        placeholderTextColor={COLORS.gray}
        value={values[key] || ""}
        onChangeText={(text) => onChange(key, text)}
        maxLength={80}
        {...props}
      />
    </View>
  );

  return (
    <View style={styles.section}>
      <View style={styles.titleRow}>
        <ThemedText style={styles.sectionTitle}>Matrimony Details</ThemedText>
        {isLoading && <ActivityIndicator size="small" color={COLORS.primary} />}
      </View>

      {renderTextField("full_name", "Full Name", { placeholder: "Enter full name" })}
      <View style={styles.field}>
        <View style={styles.labelRow}>
          <ThemedText style={styles.label}>Date of Birth</ThemedText>
          <ThemedText style={styles.required}>*</ThemedText>
        </View>
        <TouchableOpacity
          style={[styles.input, styles.dateInput]}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.8}
        >
          <ThemedText style={dateOfBirth ? styles.dateText : styles.datePlaceholder}>
            {dateOfBirth ? toDisplayDate(dateOfBirth) : "Select date of birth"}
          </ThemedText>
          <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      <DatePickerModal
        visible={showDatePicker}
        title="Date of Birth"
        value={dateOfBirth}
        initialDate={DEFAULT_DOB_VIEW}
        minDate={MIN_DOB}
        maxDate={MAX_DOB}
        onClose={() => setShowDatePicker(false)}
        onSelect={(date) => onChange("date_of_birth", toIsoDate(date))}
      />

      {MATRIMONY_SELECT_FIELDS.map((field) => {
        const items = getActiveMasterItems(masters, field.master).map((item) => ({
          id: item.id,
          name: getMasterLabel(item),
        }));
        return (
          <ThemeSelect
            key={field.key}
            label={field.label}
            placeholder={isLoading ? "Loading..." : `Select ${field.label}`}
            required
            disabled={isLoading}
            value={items.find((item) => item.id === values[field.key]) || null}
            items={items}
            onSelect={(item) => onChange(field.key, item.id)}
            containerStyle={styles.field}
          />
        );
      })}

      {renderTextField("mother_tongue", "Mother Tongue", { placeholder: "e.g. Hindi, Santali" })}

      {hobbies.length > 0 && (
        <View style={styles.field}>
          <ThemedText style={[styles.label, styles.labelRow]}>Hobbies & Interests</ThemedText>
          <View style={styles.chips}>
            {hobbies.map((hobby) => {
              const active = selectedHobbies.includes(hobby.id);
              return (
                <TouchableOpacity
                  key={hobby.id}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => toggleHobby(hobby.id)}
                  activeOpacity={0.8}
                >
                  <ThemedText style={[styles.chipText, active && styles.chipTextActive]}>
                    {getMasterLabel(hobby)}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.declarationRow}
        onPress={() => onChange("declaration", !values.declaration)}
        activeOpacity={0.8}
      >
        <Ionicons
          name={values.declaration ? "checkbox" : "square-outline"}
          size={22}
          color={values.declaration ? COLORS.primary : COLORS.gray}
        />
        <ThemedText style={styles.declarationText}>
          I declare that the information provided is true and I have consent to publish this profile.
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 8 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  field: { marginBottom: 12 },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  required: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: "700",
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
  dateInput: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dateText: { fontSize: 15, color: COLORS.text },
  datePlaceholder: { fontSize: 15, color: COLORS.gray },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, color: COLORS.text },
  chipTextActive: { color: COLORS.white, fontWeight: "600" },
  declarationRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginTop: 4 },
  declarationText: { flex: 1, fontSize: 13, color: COLORS.text, lineHeight: 18 },
});
