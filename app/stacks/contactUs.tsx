import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ThemeHeader from "@/components/headers/ThemeHeader";
import { COLORS } from "@/constants/Colors";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { BackHandler, Linking, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CONTACT = {
  addressTitle: "Our Location",
  address: "Basar Toli, Near Bishop School, Bahu Bazar, Ranchi, Jharkhand 834001",
  emailTitle: "Email Us",
  email: "support@admitra.com",
  phoneTitle: "Call Us",
  phones: ["+91 7004308330", "0651 3189173"],
  hours: "Mon - Sat: 9:00 AM - 6:00 PM",
};

export default function ContactUsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    router.replace("/(tabs)/profile");
    return true;
  }
  useEffect(() => {
    const backAction = () => {
      router.replace("/(tabs)/profile");
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, []);
  const openMaps = () => {
    const query = encodeURIComponent(CONTACT.address);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url).catch(() => {});
  };

  const openEmail = () => {
    const url = `mailto:${CONTACT.email}`;
    Linking.openURL(url).catch(() => {});
  };

  const dial = (num: string) => {
    const url = `tel:${num.replace(/\s/g, "")}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <ThemedView style={styles.container}>
      <ThemeHeader onBackPress={handleBack} title="Contact Us" />

      {/* Hero Section */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroSection}
      >
        <View style={styles.heroIconContainer}>
          <Ionicons name="headset" size={40} color={COLORS.white} />
        </View>
        <ThemedText style={styles.heroTitle}>We&apos;re Here To Help</ThemedText>
        <ThemedText style={styles.heroSubtitle}>
          Get in touch with our support team
        </ThemedText>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
      >
        {/* Location Card */}
        <Pressable style={styles.card} onPress={openMaps}>
          <LinearGradient
            colors={[`${COLORS.primary}15`, `${COLORS.primary}05`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            <View style={styles.cardIconContainer}>
              <Ionicons name="location" size={24} color={COLORS.white} />
            </View>
            <View style={styles.cardContent}>
              <ThemedText style={styles.cardTitle}>{CONTACT.addressTitle}</ThemedText>
              <ThemedText style={styles.cardText}>{CONTACT.address}</ThemedText>
            </View>
            <View style={styles.cardArrow}>
              <Ionicons name="open-outline" size={20} color={COLORS.primary} />
            </View>
          </LinearGradient>
        </Pressable>

        {/* Email Card */}
        <Pressable style={styles.card} onPress={openEmail}>
          <LinearGradient
            colors={[`${COLORS.success}15`, `${COLORS.success}05`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            <View style={[styles.cardIconContainer, { backgroundColor: COLORS.success }]}>
              <Ionicons name="mail" size={24} color={COLORS.white} />
            </View>
            <View style={styles.cardContent}>
              <ThemedText style={styles.cardTitle}>{CONTACT.emailTitle}</ThemedText>
              <ThemedText style={styles.cardText}>{CONTACT.email}</ThemedText>
            </View>
            <View style={styles.cardArrow}>
              <Ionicons name="arrow-forward" size={20} color={COLORS.success} />
            </View>
          </LinearGradient>
        </Pressable>

        {/* Phone Card */}
        <View style={styles.card}>
          <LinearGradient
            colors={[`${COLORS.orange}15`, `${COLORS.orange}05`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            <View style={[styles.cardIconContainer, { backgroundColor: COLORS.orange }]}>
              <Ionicons name="call" size={24} color={COLORS.white} />
            </View>
            <View style={styles.cardContent}>
              <ThemedText style={styles.cardTitle}>{CONTACT.phoneTitle}</ThemedText>
              <View style={styles.phoneNumbers}>
                {CONTACT.phones.map((phone) => (
                  <Pressable 
                    key={phone} 
                    onPress={() => dial(phone)}
                    style={styles.phoneButton}
                  >
                    <Ionicons name="call-outline" size={16} color={COLORS.orange} />
                    <ThemedText style={styles.phoneText}>{phone}</ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Business Hours Card */}
        <View style={styles.hoursCard}>
          <View style={styles.hoursHeader}>
            <Ionicons name="time-outline" size={20} color={COLORS.primary} />
            <ThemedText style={styles.hoursTitle}>Business Hours</ThemedText>
          </View>
          <ThemedText style={styles.hoursText}>{CONTACT.hours}</ThemedText>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <ThemedText style={styles.quickActionsTitle}>Quick Actions</ThemedText>
          <View style={styles.quickActions}>
            <Pressable style={styles.quickActionButton} onPress={() => dial(CONTACT.phones[0])}>
              <LinearGradient
                colors={[COLORS.success, "#05C793"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.quickActionGradient}
              >
                <Ionicons name="call" size={22} color={COLORS.white} />
                <ThemedText style={styles.quickActionText}>Call Now</ThemedText>
              </LinearGradient>
            </Pressable>

            <Pressable style={styles.quickActionButton} onPress={openEmail}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.quickActionGradient}
              >
                <Ionicons name="mail" size={22} color={COLORS.white} />
                <ThemedText style={styles.quickActionText}>Email Us</ThemedText>
              </LinearGradient>
            </Pressable>
          </View>
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
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.padding,
    gap: SIZES.padding * 0.75,
  },
  card: {
    borderRadius: SIZES.radius12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: SIZES.padding,
    gap: SIZES.padding,
    backgroundColor: COLORS.white,
  },
  cardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: SIZES.fontSize16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  cardText: {
    fontSize: SIZES.fontSize14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  cardArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  phoneNumbers: {
    gap: 8,
    marginTop: 4,
  },
  phoneButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.white,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  phoneText: {
    fontSize: SIZES.fontSize14,
    color: COLORS.text,
    fontWeight: "500",
  },
  hoursCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius12,
    padding: SIZES.padding,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
  },
  hoursHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  hoursTitle: {
    fontSize: SIZES.fontSize14,
    fontWeight: "600",
    color: COLORS.text,
  },
  hoursText: {
    fontSize: SIZES.fontSize14,
    color: COLORS.textLight,
  },
  quickActionsContainer: {
    marginTop: SIZES.padding * 0.5,
  },
  quickActionsTitle: {
    fontSize: SIZES.fontSize16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SIZES.padding,
  },
  quickActions: {
    flexDirection: "row",
    gap: SIZES.padding,
  },
  quickActionButton: {
    flex: 1,
    borderRadius: SIZES.radius12,
    overflow: "hidden",
  },
  quickActionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  quickActionText: {
    fontSize: SIZES.fontSize14,
    fontWeight: "600",
    color: COLORS.white,
  },
});
