import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "../ThemedText";
export default function PrimaryBtn({
    label, loading, disabled, color, onPress, arrow = false,
  }: { label: string; loading: boolean; disabled?: boolean; color: string; onPress: () => void; arrow?: boolean }) {
    return (
      <Pressable
        style={[shared.primaryBtn, disabled && shared.primaryBtnDisabled]}
        onPress={onPress}
        disabled={disabled || loading}
      >
        <LinearGradient
          colors={!disabled ? [color, color] : ["#CBD5E1", "#B0BEC5"]}
          style={shared.primaryBtnGrad}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <ThemedText style={shared.primaryBtnText}>{label}</ThemedText>
              {arrow && (
                <View style={shared.arrowCircle}>
                  <Ionicons name="arrow-forward" size={16} color={color} />
                </View>
              )}
            </View>
          )}
        </LinearGradient>
      </Pressable>
    );
  }


  const shared = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F5F4FF" },
    topBlob: { position: "absolute", width: 320, height: 320, borderRadius: 160, top: -120, left: -80 },
    headerRow: {
      flexDirection: "row", justifyContent: "space-between", alignItems: "center",
      paddingHorizontal: 20, paddingTop: 36, paddingBottom: 10,
    },
    backBtn: {
      width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFFFFF",
      justifyContent: "center", alignItems: "center",
      shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
    },
    langPill: {
      flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7,
      backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1, borderColor: "#E2E8F0",
      shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
    },
    langText: { fontSize: 13, fontWeight: "600" },
    scroll: { paddingBottom: 40 },
    innerPad: { paddingHorizontal: 24, paddingTop: 16, alignItems: "center" },
  
    // illustration
    illuWrap: { width: 130, height: 130, justifyContent: "center", alignItems: "center", marginBottom: 24, position: "relative" },
    illuBox: { width: 96, height: 96, borderRadius: 18, justifyContent: "center", alignItems: "center" },
    illuBubble: { position: "absolute", top: 4, right: -8, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
    illuDots: { color: "#FFFFFF", fontSize: 12, fontWeight: "700", letterSpacing: 1 },
    illuLock: { position: "absolute", bottom: 2, right: -4, width: 26, height: 26, borderRadius: 13, justifyContent: "center", alignItems: "center" },
  
    heading: { fontSize: 24, fontWeight: "800", color: "#1E293B", textAlign: "center", marginBottom: 8 },
    subHeading: { fontSize: 14, color: "#64748B", textAlign: "center", marginBottom: 6 },
  
    editRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 26 },
    accentText: { fontSize: 16, fontWeight: "700" },
    editBtnText: { fontSize: 13, fontWeight: "600" },
  
    // phone
    phoneRow: { flexDirection: "row", width: "100%", marginBottom: 26, gap: 10 },
    cc: { paddingHorizontal: 14, paddingVertical: 16, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.5, borderColor: "#E2E8F0" },
    ccText: { fontSize: 15, fontWeight: "600", color: "#1E293B" },
    phoneInput: {
      flex: 1, paddingHorizontal: 16, paddingVertical: 16, backgroundColor: "#FFFFFF",
      borderRadius: 14, borderWidth: 1.5, borderColor: "#E2E8F0", fontSize: 16, fontWeight: "600", color: "#1E293B",
    },
  
    // generic field (email / password)
    fieldWrap: {
      flexDirection: "row", alignItems: "center", width: "100%", marginBottom: 26,
      backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.5, borderColor: "#E2E8F0",
      paddingHorizontal: 16, paddingVertical: 14, gap: 10,
    },
    fieldInput: { flex: 1, fontSize: 15, fontWeight: "500", color: "#1E293B" },
  
    // OTP boxes
    otpRow: { flexDirection: "row", gap: 10, marginBottom: 18, justifyContent: "center", width: "100%" },
    otpBox: {
      width: 48, height: 56, borderRadius: 14, borderWidth: 2, borderColor: "#E2E8F0",
      backgroundColor: "#FFFFFF", textAlign: "center", fontSize: 22, fontWeight: "700", color: "#1E293B",
    },
  
    // resend
    resendRow: { flexDirection: "row", alignItems: "center", marginBottom: 26 },
    resendLabel: { fontSize: 13, color: "#64748B" },
    resendBtn: { fontSize: 13, fontWeight: "700" },
    timerText: { fontSize: 13, fontWeight: "700" },
  
    // button
    primaryBtn: { width: "100%", borderRadius: 16, overflow: "hidden", marginBottom: 22 },
    primaryBtnDisabled: { opacity: 0.55 },
    primaryBtnGrad: { paddingVertical: 18, alignItems: "center", justifyContent: "center" },
    primaryBtnText: { fontSize: 17, fontWeight: "700", color: "#FFFFFF" },
    arrowCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center" },
  
    // security note
    secNote: {
      flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#FFFFFF",
      borderRadius: 16, padding: 16, width: "100%",
      shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
    },
    secTitle: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
    secSub: { fontSize: 12, color: "#64748B", marginTop: 2 },
  });
  