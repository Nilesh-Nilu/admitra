import { COLORS } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, TextInputProps, View } from "react-native";

type Props = TextInputProps & {
  icon?: keyof typeof Ionicons.glyphMap;
  accent?: string;
  /** Masks the value and adds a show/hide toggle. */
  secure?: boolean;
};

export default function PasswordField({ icon = "lock-closed-outline", accent = COLORS.primary, secure = true, value, ...props }: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={[styles.fieldWrap, !!value && { borderColor: accent }]}>
      <Ionicons name={icon} size={20} color={COLORS.gray} />
      <TextInput
        style={styles.fieldInput}
        placeholderTextColor={COLORS.gray}
        autoCapitalize="none"
        secureTextEntry={secure && !visible}
        value={value}
        {...props}
      />
      {secure && (
        <Pressable onPress={() => setVisible(!visible)} hitSlop={8}>
          <Ionicons name={visible ? "eye-outline" : "eye-off-outline"} size={20} color={COLORS.gray} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldWrap: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 10,
  },
  fieldInput: { flex: 1, fontSize: 15, fontWeight: "500", color: "#1E293B", minHeight: 44 },
});
