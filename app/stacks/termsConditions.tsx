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

export default function TermsConditionsScreen() {
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
      icon: "document-text",
      title: "Introduction",
      description: "Welcome to Admitra! These Terms and Conditions govern your access to and use of our app and services. By using our services, you agree to these terms.",
      bullets: []
    },
    {
      icon: "person-circle",
      title: "Eligibility",
      description: null,
      bullets: [
        "Users must be 18 years or older. By accessing our services, you confirm you meet this requirement.",
        "The app and services are available across India without geographic restrictions."
      ]
    },
    {
      icon: "construct",
      title: "Services Offered",
      description: null,
      bullets: [
        "We provide home services including plumbing, electrical work, appliance repair, beauty services, and more.",
        "Services are provided by verified and trained professionals."
      ]
    },
    {
      icon: "key",
      title: "Account Responsibilities",
      description: null,
      bullets: [
        "Users must create an account using valid personal information. Account sharing is strictly prohibited.",
        "You are responsible for maintaining the confidentiality of your account credentials."
      ]
    },
    {
      icon: "card",
      title: "Payment Terms",
      description: null,
      bullets: [
        "A booking fee of ₹99 is required to confirm service appointments.",
        "Additional service charges are paid directly to the technician after service completion.",
        "Payments are processed through secure payment gateways."
      ]
    },
    {
      icon: "shield-checkmark",
      title: "Intellectual Property",
      description: null,
      bullets: [
        "All content on the platform, including logos, images, and text, is the intellectual property of Admitra.",
        "Users are prohibited from reproducing or redistributing content without prior written consent."
      ]
    },
    {
      icon: "warning",
      title: "Usage Restrictions",
      description: "Users must not misuse the platform by attempting unauthorized access, distributing malware, or engaging in activities that disrupt services.",
      bullets: []
    },
    {
      icon: "alert-circle",
      title: "Limitation of Liability",
      description: "Admitra is not responsible for damages caused by technicians beyond the scope of requested services. We facilitate connections but are not liable for third-party actions.",
      bullets: []
    },
    {
      icon: "ban",
      title: "Termination",
      description: "Admitra reserves the right to suspend or terminate user accounts for violating these terms or engaging in fraudulent activities.",
      bullets: []
    },
    {
      icon: "scale",
      title: "Dispute Resolution",
      description: "Any disputes will be resolved through arbitration under Indian law. Users agree to attempt resolution through our support team first.",
      bullets: []
    },
    {
      icon: "refresh",
      title: "Policy Updates",
      description: "These Terms and Conditions are subject to change. Updates will be notified through the app.",
      bullets: []
    }
  ];

  return (
    <ThemedView style={styles.container}>
      <ThemeHeader onBackPress={handleBackPress} title="Terms & Conditions" />

      {/* Hero Section */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroSection}
      >
        <View style={styles.heroIconContainer}>
          <Ionicons name="document-text" size={40} color={COLORS.white} />
        </View>
        <ThemedText style={styles.heroTitle}>Terms & Conditions</ThemedText>
        <ThemedText style={styles.heroSubtitle}>
          Please read carefully before using our services
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

        {/* Last Updated Card */}
        <View style={styles.lastUpdatedCard}>
          <Ionicons name="calendar-outline" size={18} color={COLORS.textLight} />
          <ThemedText style={styles.lastUpdatedText}>
            Last updated: December 2025
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

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
    textAlign: "center",
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
  lastUpdatedCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: SIZES.padding,
    marginTop: SIZES.padding * 0.5,
  },
  lastUpdatedText: {
    fontSize: SIZES.fontSize.sm,
    color: COLORS.textLight,
  },
});
