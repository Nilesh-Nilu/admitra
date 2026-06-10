import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "../ThemedText";
export default function SecurityNote({ accent }: { accent: string }) {
    return (
      <View style={shared.secNote}>
        <Ionicons name="shield-checkmark" size={18} color={accent} />
        <View>
          <ThemedText style={shared.secTitle}>Keep your account safe</ThemedText>
          <ThemedText style={shared.secSub}>Never share your OTP with anyone.</ThemedText>
        </View>
      </View>
    );
  }


  const shared = StyleSheet.create({
    secNote: {
      flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#FFFFFF",
      borderRadius: 16, padding: 16, width: "100%",
      shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
    },
    secTitle: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
    secSub: { fontSize: 12, color: "#64748B", marginTop: 2 },
  });