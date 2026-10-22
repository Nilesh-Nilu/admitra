import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { COLORS } from "@/constants/Colors";

interface SafetyTipsModalProps {
  visible: boolean;
  onClose: () => void;
}

const safetyTips = [
  {
    icon: "close-circle" as const,
    color: "#E53935",
    text: "Advance payment करने से बचें",
  },
  {
    icon: "people" as const,
    color: "#1565C0",
    text: "हमेशा safe public place पर मिलकर deal करें",
  },
  {
    icon: "call" as const,
    color: "#43A047",
    text: "\"GAXA कभी भी seller call करे to direct payment करने को नहीं कहता\"",
  },
  {
    icon: "hand-left" as const,
    color: "#7B1FA2",
    text: "Seller से मिलकर अपना जिम्मेदारी से deal करें",
  },
  {
    icon: "information-circle" as const,
    color: "#039BE5",
    text: "GAXA किसी भी लेन-देन के लिए जिम्मेदार नहीं है",
  },
  {
    icon: "warning" as const,
    color: "#F57C00",
    text: "अपनी जिम्मेदारी पर deal करें",
  },
  {
    icon: "flag" as const,
    color: "#D32F2F",
    text: "Fake ad दिखे तो तुरंत report करें",
  },
];

export default function SafetyTipsModal({ visible, onClose }: SafetyTipsModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.shieldIcon}>
                <Ionicons name="shield" size={28} color="#F57C00" />
                <View style={styles.exclamationBadge}>
                  <Ionicons name="alert" size={12} color={COLORS.white} />
                </View>
              </View>
              <ThemedText style={styles.title}>Safety Tips (GAXA)</ThemedText>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {/* Tips List */}
          <View style={styles.tipsList}>
            {safetyTips.map((tip, index) => (
              <View key={index} style={styles.tipRow}>
                <Ionicons name={tip.icon} size={20} color={tip.color} />
                <ThemedText style={styles.tipText}>{tip.text}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    backgroundColor: "#FFF8E7",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  shieldIcon: {
    position: "relative",
  },
  exclamationBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#F57C00",
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  closeBtn: {
    padding: 4,
  },
  tipsList: {
    gap: 12,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  tipText: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
    lineHeight: 20,
  },
});
