import { ThemedText } from "@/components/ThemedText";
import { COLORS } from "@/constants/Colors";
import { getHowToPostAdApi, isValidImageUri } from "@/constants/functions";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Image, Linking, StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";

type Props = {
  /** Rows may carry a `placement` ("matrimony" | "profile"); rows without one show everywhere. */
  placement: "matrimony" | "profile";
  style?: StyleProp<ViewStyle>;
};

const openLink = (link: string) =>
  Linking.openURL(/^https?:\/\//.test(link) ? link : `https://${link}`).catch(() => {});

/** "How to Post Ad" help card; text and links are managed from the admin panel. */
export const HowToPostAdSection = ({ placement, style }: Props) => {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    getHowToPostAdApi().then((list: any[]) =>
      setRows(list.filter((row) => !row?.placement || String(row.placement).toLowerCase() === placement))
    );
  }, [placement]);

  if (rows.length === 0) return null;

  return (
    <View style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <View style={styles.headerIcon}>
          <Ionicons name="help-circle-outline" size={20} color="#1565C0" />
        </View>
        <ThemedText style={styles.heading}>How to Post Ad</ThemedText>
      </View>
      {rows.map((row, index) => {
        const link = row.link || row.url;
        return (
          <View key={row.id ?? index} style={[styles.row, index > 0 && styles.rowDivider]}>
            {isValidImageUri(row.icon) ? (
              <Image source={{ uri: row.icon }} style={styles.rowIcon} />
            ) : (
              <View style={styles.stepBubble}>
                <ThemedText style={styles.stepText}>{index + 1}</ThemedText>
              </View>
            )}
            <View style={styles.rowBody}>
              {!!row.title && <ThemedText style={styles.rowTitle}>{row.title}</ThemedText>}
              {!!row.description && <ThemedText style={styles.rowDescription}>{row.description}</ThemedText>}
              {!!link && (
                <TouchableOpacity style={styles.linkBtn} onPress={() => openLink(link)} activeOpacity={0.8}>
                  <Ionicons name={/youtu/i.test(link) ? "logo-youtube" : "open-outline"} size={14} color={COLORS.white} />
                  <ThemedText style={styles.linkText} numberOfLines={1}>
                    {row.link_text || (/youtu/i.test(link) ? "Watch Video" : "Open Link")}
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  heading: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  row: { flexDirection: "row", gap: 12, paddingVertical: 10 },
  rowDivider: { borderTopWidth: 1, borderTopColor: "#F1F5F9" },
  rowIcon: { width: 36, height: 36, borderRadius: 8 },
  stepBubble: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#1565C0",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  stepText: { fontSize: 12, fontWeight: "700", color: COLORS.white },
  rowBody: { flex: 1, gap: 4 },
  rowTitle: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  rowDescription: { fontSize: 13, lineHeight: 19, color: "#475569" },
  linkBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1565C0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 4,
  },
  linkText: { fontSize: 12, fontWeight: "700", color: COLORS.white },
});
