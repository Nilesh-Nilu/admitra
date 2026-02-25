import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ThemeHeader from "@/components/headers/ThemeHeader";
import { COLORS } from "@/constants/Colors";
import { SIZES } from "@/constants/Sizes";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import { BackHandler, ScrollView, StyleSheet, View } from "react-native";

export default function PolicyScreen() {
  const router = useRouter();

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

  const privacyPolicyContent = [
    {
      title: "Data We Collect",
      content: [
        "Personal Information: Name, email, phone number, and payment details.",
        "Device Data: IP address, device type, and app usage data.",
        "Cookies and Analytics: Tracking user preferences and app performance.",
      ],
    },
    {
      title: "How We Use Data",
      content: [
        "Service Delivery: To provide access to courses and app features.",
        "Marketing: Sending promotional emails and offers (users can opt-out).",
        "Analytics: Improving app performance and user experience.",
      ],
    },
    {
      title: "Data Sharing",
      content: [
        "Data is shared with third-party service providers, such as Razorpay, for payment processing.",
        "No data is sold to unauthorized third parties.",
      ],
    },
    {
      title: "Storage and Security",
      content: [
        "User data is stored in encrypted formats on secure servers.",
        "Regular audits are conducted to ensure data protection.",
      ],
    },
    {
      title: "User Rights",
      content: [
        "Users can access, modify, or delete their data by contacting seekojielectric@gmail.com.",
        "Users may request a copy of their personal data as per applicable laws.",
      ],
    },
    {
      title: "Compliance",
      content: [
        "This policy complies with the Indian IT Act 2000 and its amendments.",
      ],
    },
    {
      title: "Third-Party Services",
      content: [
        "The app uses third-party tools like Google Analytics and Razorpay. These services may collect additional data as per their policies.",
      ],
    },
    {
      title: "Policy Updates",
      content: [
        "Privacy Policy changes will be updated on the app, with notifications sent to users.",
      ],
    },
  ];

  return (
    <ThemedView>
      <ThemeHeader onBackPress={handleBackPress} title="Privacy Policy" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Image
              source={require("../../assets/images/splashImage.png")}
              style={styles.logo}
            />
          </View>
        </View>
        {privacyPolicyContent.map((section, index) => (
          <View key={index} style={styles.section}>
            <ThemedText style={styles.subtitle}>{section.title}</ThemedText>
            <View style={styles.bulletList}>
              {section.content.map((item, itemIndex) => (
                <ThemedText key={itemIndex} style={styles.bulletItem}>
                  {"•"} {item}
                </ThemedText>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: SIZES.padding16,
    paddingBottom: SIZES.padding2 * 1.4,
  },
  section: {
    marginBottom: SIZES.padding * 0.9,
  },
  subtitle: {
    fontSize: SIZES.fontSize16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SIZES.padding * 0.3,
  },
  bulletList: {
    gap: SIZES.padding * 0.3,
  },
  bulletItem: {
    fontSize: SIZES.fontSize14,
    color: COLORS.text,
    lineHeight: SIZES.lineHeight14,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: SIZES.padding16,
  },
  logo: {
    width: 100,
    height: 100,
  },
});
