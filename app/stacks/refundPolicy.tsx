import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ThemeHeader from "@/components/headers/ThemeHeader";
import { COLORS } from "@/constants/Colors";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import { BackHandler, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const RefundPolicy = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBackPress = useCallback(() => {
    router.replace("/(tabs)/profile");
    return true;
  }, [router]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );
    return () => backHandler.remove();
  }, [handleBackPress]);

  const sections = [
    {
      icon: "checkmark-circle",
      title: "Refund Scenarios",
      description: "Refunds are issued only if:",
      bullets: [
        "The service is not provided within the scheduled time due to our fault.",
        "The technician fails to arrive after booking confirmation.",
        "Double payment or overcharging occurs."
      ]
    },
    {
      icon: "close-circle",
      title: "Non-Refundable Scenarios",
      description: "No refunds are issued for:",
      bullets: [
        "Cancellations made after technician assignment.",
        "User dissatisfaction due to personal preferences.",
        "Services already completed or partially completed."
      ]
    },
    {
      icon: "calendar",
      title: "Cancellation Terms",
      description: null,
      bullets: [
        "Users may cancel bookings before technician assignment for a full refund.",
        "Cancellation after assignment will forfeit the ₹99 booking fee.",
        "Contact support within 24 hours for cancellation requests."
      ]
    },
    {
      icon: "time",
      title: "Refund Timelines",
      description: "Approved refunds will be processed within 5-7 business days through the original payment method.",
      bullets: []
    },
    {
      icon: "alert-circle",
      title: "Chargebacks",
      description: null,
      bullets: [
        "Users must contact our support team before initiating chargebacks.",
        "Unauthorized chargebacks may result in account suspension."
      ]
    },
    {
      icon: "refresh",
      title: "Policy Updates",
      description: "Refund and Cancellation policies are subject to updates and will be communicated through the app.",
      bullets: []
    }
  ];

  return (
    <ThemedView style={styles.container}>
      <ThemeHeader
        title="Refund Policy"
        onBackPress={handleBackPress}
      />

      {/* Hero Section */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroSection}
      >
        <View style={styles.heroIconContainer}>
          <Ionicons name="receipt" size={40} color={COLORS.white} />
        </View>
        <ThemedText style={styles.heroTitle}>Refund & Cancellation</ThemedText>
        <ThemedText style={styles.heroSubtitle}>
          Our commitment to fair policies
        </ThemedText>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Ionicons name={section.icon as any} size={20} color={COLORS.primary} />
              </View>
              <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
            </View>

            <View style={styles.sectionContent}>
              {section.description && (
                <ThemedText style={styles.paragraph}>{section.description}</ThemedText>
              )}
              
              {section.bullets.length > 0 && (
                <View style={styles.bulletList}>
                  {section.bullets.map((bullet, bulletIndex) => (
                    <View key={bulletIndex} style={styles.bulletItem}>
                      <View style={styles.bulletDot} />
                      <ThemedText style={styles.bulletText}>{bullet}</ThemedText>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <LinearGradient
            colors={[`${COLORS.warning}15`, `${COLORS.warning}05`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.infoCardGradient}
          >
            <Ionicons name="information-circle" size={24} color={COLORS.warning} />
            <ThemedText style={styles.infoText}>
              For any refund queries, please contact our support team at support@admitra.com
            </ThemedText>
          </LinearGradient>
        </View>
      </ScrollView>
    </ThemedView>
  );
};

export default RefundPolicy;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  heroSection: {
    paddingVertical: SIZES.padding * 1.5,
    paddingHorizontal: SIZES.padding,
    alignItems: "center",
  },
  heroIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.padding,
  },
  heroTitle: {
    fontSize: SIZES.fontSize22,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: SIZES.fontSize14,
    color: "rgba(255,255,255,0.8)",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: SIZES.padding,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius12,
    marginBottom: SIZES.padding * 0.75,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.padding * 0.75,
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: `${COLORS.primary}05`,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: SIZES.fontSize16,
    fontWeight: "600",
    color: COLORS.text,
    flex: 1,
  },
  sectionContent: {
    padding: SIZES.padding,
  },
  paragraph: {
    fontSize: SIZES.fontSize14,
    color: COLORS.textLight,
    lineHeight: 22,
    marginBottom: SIZES.padding * 0.5,
  },
  bulletList: {
    gap: SIZES.padding * 0.5,
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SIZES.padding * 0.75,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: SIZES.fontSize14,
    color: COLORS.textLight,
    lineHeight: 22,
  },
  infoCard: {
    borderRadius: SIZES.radius12,
    overflow: "hidden",
    marginTop: SIZES.padding * 0.5,
  },
  infoCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: SIZES.padding,
    gap: SIZES.padding,
  },
  infoText: {
    flex: 1,
    fontSize: SIZES.fontSize14,
    color: COLORS.text,
    lineHeight: 20,
  },
});
