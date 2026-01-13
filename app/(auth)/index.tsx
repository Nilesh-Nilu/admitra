import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

const ONBOARDING_DATA = [
  {
    id: 1,
    title: "Buy & Sell Anything",
    subtitle: "Find great deals on cars, phones, property, and more in your city",
    icon: "pricetags",
    gradient: ["#667eea", "#764ba2"],
  },
  {
    id: 2,
    title: "Chat with Sellers",
    subtitle: "Connect directly with sellers to negotiate and finalize deals",
    icon: "chatbubbles",
    gradient: ["#11998e", "#38ef7d"],
  },
  {
    id: 3,
    title: "Safe & Verified",
    subtitle: "Verified listings and secure transactions for peace of mind",
    icon: "shield-checkmark",
    gradient: ["#eb3349", "#f45c43"],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const handleGetStarted = () => {
    router.push("/(auth)/login");
  };

  const handleBackPress = () => {
    BackHandler.exitApp();
    return true;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );
    return () => backHandler.remove();
  }, []);

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleGetStarted();
    }
  };

  const renderItem = ({ item, index }: { item: typeof ONBOARDING_DATA[0]; index: number }) => (
    <View style={styles.slide}>
      <LinearGradient
        colors={item.gradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconCircle}
      >
        <Ionicons name={item.icon as any} size={64} color={COLORS.white} />
      </LinearGradient>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Background */}
      <View style={styles.backgroundTop}>
        <LinearGradient
          colors={ONBOARDING_DATA[currentIndex].gradient as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBg}
        >
          <View style={styles.bgCircle1} />
          <View style={styles.bgCircle2} />
          <View style={styles.bgCircle3} />
        </LinearGradient>
      </View>

      {/* Skip Button */}
      <Pressable
        style={[styles.skipButton, { top: insets.top + 16 }]}
        onPress={handleGetStarted}
      >
        <ThemedText style={styles.skipText}>Skip</ThemedText>
        <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
      </Pressable>

      {/* Icon Carousel */}
      <View style={styles.carouselSection}>
        <FlatList
          ref={flatListRef}
          data={ONBOARDING_DATA}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
        />
      </View>

      {/* Content Card */}
      <View style={styles.contentCard}>
        {/* Indicators */}
        <View style={styles.indicators}>
          {ONBOARDING_DATA.map((_, index) => (
            <Pressable
              key={index}
              onPress={() => {
                if (index !== currentIndex) {
                  scaleAnim.setValue(0.8);
                  opacityAnim.setValue(0);
                  flatListRef.current?.scrollToIndex({ index });
                  setCurrentIndex(index);
                }
              }}
            >
              <Animated.View
                style={[
                  styles.indicator,
                  index === currentIndex && [
                    styles.activeIndicator,
                    { backgroundColor: ONBOARDING_DATA[currentIndex].gradient[0] },
                  ],
                ]}
              />
            </Pressable>
          ))}
        </View>

        <Animated.View
          style={[
            styles.textContent,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <ThemedText style={styles.title}>
            {ONBOARDING_DATA[currentIndex].title}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {ONBOARDING_DATA[currentIndex].subtitle}
          </ThemedText>
        </Animated.View>

        {/* Features Row */}
        <View style={styles.featuresRow}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: "#667eea15" }]}>
              <Ionicons name="flash" size={18} color="#667eea" />
            </View>
            <ThemedText style={styles.featureLabel}>Quick</ThemedText>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: "#11998e15" }]}>
              <Ionicons name="location" size={18} color="#11998e" />
            </View>
            <ThemedText style={styles.featureLabel}>Local</ThemedText>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: "#eb334915" }]}>
              <Ionicons name="shield-checkmark" size={18} color="#eb3349" />
            </View>
            <ThemedText style={styles.featureLabel}>Secure</ThemedText>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: "#f5af1915" }]}>
              <Ionicons name="star" size={18} color="#f5af19" />
            </View>
            <ThemedText style={styles.featureLabel}>Trusted</ThemedText>
          </View>
        </View>

        {/* Buttons */}
        <View style={[styles.buttonSection, { paddingBottom: insets.bottom + 20 }]}>
          <Pressable style={styles.nextButton} onPress={handleNext}>
            <LinearGradient
              colors={ONBOARDING_DATA[currentIndex].gradient as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextButtonGradient}
            >
              <ThemedText style={styles.nextButtonText}>
                {currentIndex === ONBOARDING_DATA.length - 1 ? "Get Started" : "Continue"}
              </ThemedText>
              <View style={styles.nextButtonArrow}>
                <Ionicons name="arrow-forward" size={18} color={ONBOARDING_DATA[currentIndex].gradient[0]} />
              </View>
            </LinearGradient>
          </Pressable>

          <View style={styles.loginRow}>
            <ThemedText style={styles.loginText}>Already have an account? </ThemedText>
            <Pressable onPress={handleGetStarted}>
              <ThemedText style={[styles.loginLink, { color: ONBOARDING_DATA[currentIndex].gradient[0] }]}>
                Sign In
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backgroundTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.5,
  },
  gradientBg: {
    flex: 1,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    overflow: "hidden",
  },
  bgCircle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(255,255,255,0.1)",
    top: -100,
    right: -80,
  },
  bgCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.08)",
    top: 150,
    left: -60,
  },
  bgCircle3: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.1)",
    bottom: 40,
    right: 40,
  },
  skipButton: {
    position: "absolute",
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 25,
    zIndex: 10,
  },
  skipText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
  },
  carouselSection: {
    height: height * 0.38,
    justifyContent: "center",
  },
  slide: {
    width,
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 15,
  },
  contentCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -30,
    paddingTop: 30,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  indicators: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 28,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.border,
  },
  activeIndicator: {
    width: 32,
  },
  textContent: {
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.gray,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  featuresRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  featureItem: {
    alignItems: "center",
    gap: 8,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  featureLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
  },
  buttonSection: {
    marginTop: "auto",
  },
  nextButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
  },
  nextButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 12,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.white,
  },
  nextButtonArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  loginText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "700",
  },
});
