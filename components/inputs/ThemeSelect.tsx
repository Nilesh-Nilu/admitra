import { ThemedText } from "@/components/ThemedText";
import { COLORS } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface SelectItem {
  id: number | string;
  name: string;
  [key: string]: any;
}

interface ThemeSelectProps {
  label: string;
  placeholder: string;
  value: SelectItem | null;
  items: SelectItem[];
  onSelect: (item: SelectItem) => void;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  required?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}

export default function ThemeSelect({
  label,
  placeholder,
  value,
  items,
  onSelect,
  disabled = false,
  containerStyle,
  required = false,
  icon,
}: ThemeSelectProps) {
  const [showModal, setShowModal] = useState(false);

  const handleSelect = (item: SelectItem) => {
    onSelect(item);
    setShowModal(false);
  };

  return (
    <View style={containerStyle}>
      {/* Label */}
      {label && (
        <View style={styles.inputLabelRow}>
          {icon && <Ionicons name={icon} size={16} color={COLORS.primary} />}
          <ThemedText style={styles.inputLabel}>{label}</ThemedText>
          {required && <ThemedText style={styles.required}>*</ThemedText>}
        </View>
      )}

      {/* Dropdown Button */}
      <TouchableOpacity
        style={[
          styles.dropdownButton,
          disabled && styles.dropdownButtonDisabled,
        ]}
        onPress={() => setShowModal(true)}
        disabled={disabled}
      >
        <ThemedText
          style={[styles.dropdownText, !value && styles.placeholderText]}
        >
          {value ? value.name : placeholder}
        </ThemedText>
        <Ionicons name="chevron-down" size={20} color={COLORS.gray} />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>{label}</ThemedText>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={items}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    value?.id === item.id && styles.modalItemSelected,
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <ThemedText
                    style={[
                      styles.modalItemText,
                      value?.id === item.id && styles.modalItemTextSelected,
                    ]}
                  >
                    {item.name}
                  </ThemedText>
                  {value?.id === item.id && (
                    <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <ThemedText style={styles.emptyListText}>
                    No items available
                  </ThemedText>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  inputLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  required: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: "700",
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.background,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dropdownButtonDisabled: {
    opacity: 0.5,
  },
  dropdownText: {
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
  },
  placeholderText: {
    color: COLORS.gray,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "70%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalItemSelected: {
    backgroundColor: `${COLORS.primary}10`,
  },
  modalItemText: {
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
  },
  modalItemTextSelected: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  emptyList: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyListText: {
    fontSize: 14,
    color: COLORS.gray,
  },
});
