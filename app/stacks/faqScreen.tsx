import ThemeHeader from "@/components/headers/ThemeHeader";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS } from "@/constants/Colors";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { BackHandler, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FAQScreen() {
  const insets = useSafeAreaInsets();
  const [expandedId, setExpandedId] = useState<string | null>("1");

  const handleBackPress = () => {
    router.replace("/(tabs)/profile");
  };
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
  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const faqs = [
    {
      id: "1",
      question: "What is Admitra?",
      answer: "Admitra is a buy & sell marketplace where you can easily buy or sell products like electronics, vehicles, furniture, and more. Connect directly with buyers and sellers in your area.",
      icon: "information-circle"
    },
    {
      id: "2",
      question: "How do I post an ad to sell something?",
      answer: "Simply tap the 'Sell' button, select a category, add photos and description of your item, set a price, and publish. Your ad will be live and visible to potential buyers instantly.",
      icon: "add-circle"
    },
    {
      id: "3",
      question: "Is there a fee to post an ad?",
      answer: "Yes, there is a small fee of ₹299 to post an ad. This helps maintain quality listings and ensures serious sellers on the platform.",
      icon: "cash"
    },
    {
      id: "4",
      question: "How do I contact a seller?",
      answer: "On any listing, tap the 'Chat' button to send a message directly to the seller. You can negotiate prices, ask questions, and arrange meetups through our secure chat.",
      icon: "chatbubbles"
    },
    {
      id: "5",
      question: "How do I buy a product?",
      answer: "Browse listings, find what you like, and contact the seller via chat. Discuss the price, arrange a meeting point, inspect the item, and complete the payment directly to the seller.",
      icon: "cart"
    },
    {
      id: "6",
      question: "Is my personal information safe?",
      answer: "Yes! Your phone number and email are hidden from other users. All communication happens through our secure in-app chat until you decide to share your details.",
      icon: "shield-checkmark"
    },
    {
      id: "7",
      question: "How do I report a suspicious listing?",
      answer: "If you find a suspicious or fraudulent listing, tap the 'Report' button on the ad or contact our support team. We review all reports and take action within 24 hours.",
      icon: "flag"
    },
    {
      id: "8",
      question: "Can I edit or delete my ad?",
      answer: "Yes, go to 'My Listings' in your profile. You can edit details, update photos, change the price, or delete the ad anytime.",
      icon: "create"
    },
    {
      id: "9",
      question: "What categories can I sell in?",
      answer: "You can sell in various categories including Electronics, Vehicles, Furniture, Fashion, Real Estate, Jobs, Services, and many more. Check the app for the full list of categories.",
      icon: "grid"
    },
    {
      id: "10",
      question: "How do I make my ad stand out?",
      answer: "Use clear, high-quality photos, write a detailed description, set a competitive price, and respond quickly to inquiries. Complete your profile to build trust with buyers.",
      icon: "star"
    }
  ];

  return (
    <ThemedView style={styles.container}>
      <ThemeHeader onBackPress={handleBackPress} title="FAQs" />
      
      {/* Hero Section */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroSection}
      >
        <View style={styles.heroIconContainer}>
          <Ionicons name="help-buoy" size={40} color={COLORS.white} />
        </View>
        <ThemedText style={styles.heroTitle}>How can we help?</ThemedText>
        <ThemedText style={styles.heroSubtitle}>
          Find answers to commonly asked questions
        </ThemedText>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.faqContainer}>
          {faqs.map((faq, index) => (
            <Pressable 
              key={faq.id} 
              style={[
                styles.faqItem,
                expandedId === faq.id && styles.faqItemExpanded
              ]}
              onPress={() => toggleExpand(faq.id)}
            >
              <View style={styles.faqHeader}>
                <View style={[
                  styles.faqIconContainer,
                  expandedId === faq.id && styles.faqIconContainerActive
                ]}>
                  <Ionicons 
                    name={faq.icon as any} 
                    size={20} 
                    color={expandedId === faq.id ? COLORS.white : COLORS.primary} 
                  />
                </View>
                <View style={styles.faqQuestionContainer}>
                  <ThemedText style={styles.faqNumber}>Q{index + 1}</ThemedText>
                  <ThemedText style={styles.question}>{faq.question}</ThemedText>
                </View>
                <View style={[
                  styles.chevronContainer,
                  expandedId === faq.id && styles.chevronContainerActive
                ]}>
                  <Ionicons 
                    name={expandedId === faq.id ? "chevron-up" : "chevron-down"} 
                    size={18} 
                    color={expandedId === faq.id ? COLORS.primary : COLORS.textLight} 
                  />
                </View>
              </View>
              
              {expandedId === faq.id && (
                <View style={styles.answerContainer}>
                  <View style={styles.answerDivider} />
                  <ThemedText style={styles.answer}>{faq.answer}</ThemedText>
                </View>
              )}
            </Pressable>
          ))}
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
  scrollContent: {
    padding: SIZES.padding,
  },
  faqContainer: {
    gap: SIZES.padding * 0.75,
  },
  faqItem: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius12,
    padding: SIZES.padding,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  faqItemExpanded: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.padding * 0.75,
  },
  faqIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: "center",
    alignItems: "center",
  },
  faqIconContainerActive: {
    backgroundColor: COLORS.primary,
  },
  faqQuestionContainer: {
    flex: 1,
  },
  faqNumber: {
    fontSize: SIZES.fontSize12,
    color: COLORS.primary,
    fontWeight: "600",
    marginBottom: 2,
  },
  question: {
    fontSize: SIZES.fontSize14,
    fontWeight: "600",
    color: COLORS.text,
    lineHeight: 20,
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  chevronContainerActive: {
    backgroundColor: `${COLORS.primary}15`,
  },
  answerContainer: {
    marginTop: SIZES.padding,
  },
  answerDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SIZES.padding,
  },
  answer: {
    fontSize: SIZES.fontSize14,
    color: COLORS.textLight,
    lineHeight: 22,
  },
  supportCard: {
    marginTop: SIZES.padding * 1.5,
    borderRadius: SIZES.radius12,
    overflow: "hidden",
  },
  supportCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: SIZES.padding,
    gap: SIZES.padding,
  },
  supportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },
  supportTextContainer: {
    flex: 1,
  },
  supportTitle: {
    fontSize: SIZES.fontSize16,
    fontWeight: "600",
    color: COLORS.text,
  },
  supportSubtitle: {
    fontSize: SIZES.fontSize12,
    color: COLORS.textLight,
    marginTop: 2,
  },
});
