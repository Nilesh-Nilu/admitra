import { ThemedText } from "@/components/ThemedText";
import { StyleSheet, View } from "react-native";

export type AdKind = "banner" | "featured" | "normal" | "matrimony";

const PREFIX: Record<AdKind, string> = { banner: "B", featured: "F", normal: "N", matrimony: "M" };

/** Small "B#12" / "F#12" / "N#12" / "M#12" tag shown on an ad image. */
export default function AdIdBadge({ kind, id, style }: { kind: AdKind; id?: number | string | null; style?: any }) {
  if (id == null || id === "") return null;
  return (
    <View style={[styles.badge, style]} pointerEvents="none">
      <ThemedText style={styles.text}>{`${PREFIX[kind]}#${id}`}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    bottom: 8,
    left: 44,
    paddingHorizontal: 7,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  text: { color: "#fff", fontSize: 11, fontWeight: "700" },
});
