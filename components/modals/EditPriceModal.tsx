import { ThemedText } from "@/components/ThemedText";
import { COLORS } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  title?: string;
  currentPrice?: number | string | null;
  saving?: boolean;
  onClose: () => void;
  onSave: (price: number) => void;
};

export default function EditPriceModal({ visible, title, currentPrice, saving = false, onClose, onSave }: Props) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (visible) setValue(currentPrice != null && currentPrice !== "" ? String(Math.round(Number(currentPrice))) : "");
  }, [visible, currentPrice]);

  const price = Number(value);
  const isValid = value.trim() !== "" && Number.isFinite(price) && price > 0;
  const isUnchanged = isValid && Number(currentPrice) === price;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>Edit Price</ThemedText>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          {!!title && (
            <ThemedText style={styles.subtitle} numberOfLines={1}>
              {title}
            </ThemedText>
          )}
          <View style={styles.inputRow}>
            <ThemedText style={styles.rupee}>₹</ThemedText>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={(text) => setValue(text.replace(/[^0-9]/g, ""))}
              keyboardType="number-pad"
              placeholder="Enter new price"
              placeholderTextColor={COLORS.gray}
              autoFocus
              maxLength={10}
            />
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={onClose} disabled={saving}>
              <ThemedText style={styles.btnGhostText}>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary, (!isValid || isUnchanged || saving) && styles.btnDisabled]}
              onPress={() => onSave(price)}
              disabled={!isValid || isUnchanged || saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <ThemedText style={styles.btnPrimaryText}>Save Price</ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 24 },
  card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  subtitle: { fontSize: 13, color: COLORS.gray, marginTop: 4 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginTop: 16,
  },
  rupee: { fontSize: 18, fontWeight: "700", color: COLORS.text, marginRight: 6 },
  input: { flex: 1, fontSize: 18, fontWeight: "600", color: COLORS.text, paddingVertical: 12 },
  actions: { flexDirection: "row", gap: 10, marginTop: 20 },
  btn: { flex: 1, height: 46, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  btnGhost: { backgroundColor: "#F1F5F9" },
  btnGhostText: { fontSize: 15, fontWeight: "600", color: COLORS.text },
  btnPrimary: { backgroundColor: COLORS.primary },
  btnPrimaryText: { fontSize: 15, fontWeight: "700", color: COLORS.white },
  btnDisabled: { opacity: 0.5 },
});
