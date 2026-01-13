import ThemedButton from "@/components/buttons/ThemedButton";
import ThemeHeader from "@/components/headers/ThemeHeader";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import AppToast from "@/components/toasts/AppToast";
import { COLORS } from "@/constants/Colors";
import { baseUrl, generateRazorPayOrderIdUrl, getPackagesUrl, verifyOrder } from "@/constants/functions";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { generateRazorPayOrderIdApi, getPackagesApi } from "@/store/reducers/userReducer";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import RazorpayCheckout from "react-native-razorpay";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

interface Package {
  id: number;
  name: string;
  description: string;
  price: string;
  limit: number;
  created_at: string;
  updated_at: string;
}

// Gradient colors for different packages
const PACKAGE_GRADIENTS: readonly [string, string][] = [
  ["#4361EE", "#3F37C9"],
  ["#06D6A0", "#1B9AAA"],
  ["#F72585", "#B5179E"],
  ["#FF9F1C", "#F77F00"],
  ["#4CC9F0", "#4895EF"],
];

export default function PackagesScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { screenName } = useLocalSearchParams<{
    screenName: string;
  }>();
  const { packages, razorPayOrderId } = useSelector(
    (state: any) => state.entities.userReducer
  );
  const { user } = useSelector((state: any) => state.entities.authReducer);
  const packagesList: Package[] = packages || [];
  const [checkoutInProgress, setCheckoutInProgress] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  useEffect(() => {
    dispatch(getPackagesApi(getPackagesUrl));
  }, [dispatch]);

  // Verify payment after successful Razorpay checkout
  const verifyPayment = async (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    if (!selectedPackage || !user?.id) return;
    setVerifyingPayment(true);
    try {
      const authToken = await AsyncStorage.getItem("authToken");
      const response = await axios.post(`${baseUrl}/${verifyOrder}`, {
        user_id: user.id,
        package_id: selectedPackage.id,
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.data.status) {
        Alert.alert(
          "Payment Successful",
          `Your subscription for ${selectedPackage.name} has been activated!`,
          [
            {
              text: "OK",
              onPress: () =>screenName === "productDetails" ? router.back() : router.replace("/(tabs)"),
            },
          ]
        );
      } else {
        AppToast(response.data.message || "Payment verification failed");
      }
    } catch (error: any) {
      console.log("Payment verification error:", error.response.data);
      AppToast(error.response?.data?.message || "Payment verification failed. Please contact support.");
    } finally {
      setVerifyingPayment(false);
    }
  }; 
  
  const handleBackPress = useCallback(() => {
    router.back();
    return true;
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );
    return () => backHandler.remove();
  }, [handleBackPress]);

  // Handle package selection
  const handleSelectPackage = (pkg: Package) => {
    setSelectedPackage(pkg);
    console.log("Selected package:", pkg);
  };

  // Initiate Razorpay payment
  const initiatePayment = () => {
    if (!selectedPackage) {
      AppToast("Please select a package first");
      return;
    }

    console.log("Initiating payment for package:", selectedPackage);
    setCheckoutInProgress(true);

    const paymentData = {
      package_id: selectedPackage.id,
      user_id: user?.id,
    };

    dispatch(generateRazorPayOrderIdApi(generateRazorPayOrderIdUrl, paymentData));
  };

  // Open Razorpay checkout when order is created
  useEffect(() => {
    if (checkoutInProgress && razorPayOrderId && selectedPackage) {
      // API response structure: { status: true, order: {...}, razorpay_key: "..." }
      const orderData = razorPayOrderId.order || razorPayOrderId;
      const razorpayKey = razorPayOrderId.razorpay_key;

      if (!orderData?.id || !razorpayKey) {
        console.log("Invalid order data:", razorPayOrderId);
        setCheckoutInProgress(false);
        AppToast("Failed to create payment order");
        return;
      }

      const options: any = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Dialkaro",
        description: `Package: ${selectedPackage.name}`,
        order_id: orderData.id,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        notes: orderData.notes || {
          package_id: selectedPackage.id,
          package_name: selectedPackage.name,
        },
        theme: {
          color: COLORS.primary,
        },
      };

      console.log("Opening Razorpay with options:", options);

      RazorpayCheckout.open(options)
        .then((data: any) => {
          console.log("Payment successful:", data);
          // data contains: razorpay_payment_id, razorpay_order_id, razorpay_signature
          // Verify payment with backend
          verifyPayment({
            razorpay_order_id: data.razorpay_order_id,
            razorpay_payment_id: data.razorpay_payment_id,
            razorpay_signature: data.razorpay_signature,
          });
        })
        .catch((error: any) => {
          console.log("Payment error:", JSON.stringify(error, null, 2));
          if (error.code !== "PAYMENT_CANCELLED") {
            AppToast("Payment failed. Please try again.");
          }
        })
        .finally(() => {
          setCheckoutInProgress(false);
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutInProgress, razorPayOrderId, selectedPackage, user]);

  const renderPackageCard = ({
    item,
    index,
  }: {
    item: Package;
    index: number;
  }) => {
    const gradientColors = PACKAGE_GRADIENTS[index % PACKAGE_GRADIENTS.length];
    const isPopular = index === 0;
    const isSelected = selectedPackage?.id === item.id;

    return (
      <View style={styles.packageCardWrapper}>
        {isPopular && (
          <View style={styles.popularBadge}>
            <Ionicons name="star" size={12} color={COLORS.white} />
            <ThemedText style={styles.popularText}>Popular</ThemedText>
          </View>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.packageCard,
            isSelected && styles.packageCardSelected,
            pressed && styles.packageCardPressed,
          ]}
          onPress={() => handleSelectPackage(item)}
        >
          {/* Selected indicator */}
          {isSelected && (
            <View style={styles.selectedIndicator}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
            </View>
          )}

          {/* Header with gradient */}
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardHeader}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="cube" size={28} color="rgba(255,255,255,0.9)" />
            </View>
            <ThemedText style={styles.packageName}>{item.name}</ThemedText>
            <View style={styles.priceContainer}>
              <ThemedText style={styles.currencySymbol}>₹</ThemedText>
              <ThemedText style={styles.priceAmount}>{item.price}</ThemedText>
            </View>
          </LinearGradient>

          {/* Card Body */}
          <View style={styles.cardBody}>
            {/* Description */}
            <ThemedText style={styles.description} numberOfLines={2}>
              {item.description}
            </ThemedText>

            {/* Features */}
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: gradientColors[0] + "15" },
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={gradientColors[0]}
                  />
                </View>
                <ThemedText style={styles.featureText}>
                  {item.limit} Services Included
                </ThemedText>
              </View>
            </View>

            {/* Select Button */}
            <Pressable
              style={({ pressed }) => [
                styles.selectButton,
                { backgroundColor: isSelected ? COLORS.success : gradientColors[0] },
                pressed && styles.selectButtonPressed,
              ]}
              onPress={() => handleSelectPackage(item)}
            >
              <ThemedText style={styles.selectButtonText}>
                {isSelected ? "Selected" : "Select Package"}
              </ThemedText>
              <Ionicons
                name={isSelected ? "checkmark" : "arrow-forward"}
                size={18}
                color={COLORS.white}
              />
            </Pressable>
          </View>
        </Pressable>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="cube-outline" size={48} color={COLORS.primary} />
      </View>
      <ThemedText style={styles.emptyTitle}>No Packages Available</ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        Check back later for exciting service packages
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemeHeader title="Service Packages" onBackPress={() => router.back()} />

      {/* Hero Section */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroSection}
      >
        <View style={styles.heroContent}>
          <View style={styles.heroIconContainer}>
            <Ionicons name="gift" size={32} color={COLORS.white} />
          </View>
          <ThemedText style={styles.heroTitle}>Choose Your Package</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Save more with our bundled service packages
          </ThemedText>
        </View>

        {/* Decorative circles */}
        <View style={[styles.decorCircle, styles.decorCircle1]} />
        <View style={[styles.decorCircle, styles.decorCircle2]} />
      </LinearGradient>

      {/* Packages List */}
      <FlatList
        data={packagesList}
        renderItem={renderPackageCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />

      {/* Continue Button */}
      <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 16 }]}>
        <ThemedButton
          buttonText={
            verifyingPayment
              ? "Verifying Payment..."
              : checkoutInProgress
              ? "Processing..."
              : "Continue to Payment"
          }
          onPress={initiatePayment}
          disabled={!selectedPackage || checkoutInProgress || verifyingPayment}
        />
      </View>
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
    position: "relative",
    overflow: "hidden",
  },
  heroContent: {
    alignItems: "center",
    zIndex: 1,
  },
  heroIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: SIZES.fontSize24,
    fontWeight: "700",
    color: COLORS.white,
    textAlign: "center",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: SIZES.fontSize14,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  decorCircle: {
    position: "absolute",
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  decorCircle1: {
    width: 120,
    height: 120,
    top: -30,
    right: -30,
  },
  decorCircle2: {
    width: 80,
    height: 80,
    bottom: -20,
    left: -20,
  },
  listContent: {
    padding: SIZES.padding,
    gap: 20,
  },
  packageCardWrapper: {
    position: "relative",
  },
  popularBadge: {
    position: "absolute",
    top: -8,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.accentOrange,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
    shadowColor: COLORS.accentOrange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  popularText: {
    fontSize: SIZES.fontSize12,
    fontWeight: "700",
    color: COLORS.white,
  },
  packageCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  packageCardSelected: {
    borderWidth: 2,
    borderColor: COLORS.success,
  },
  packageCardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.95,
  },
  selectedIndicator: {
    position: "absolute",
    top: 12,
    left: 12,
    zIndex: 10,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  cardHeader: {
    padding: SIZES.padding * 1.5,
    alignItems: "center",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  packageName: {
    fontSize: SIZES.fontSize20,
    fontWeight: "700",
    color: COLORS.white,
    textAlign: "center",
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  currencySymbol: {
    fontSize: SIZES.fontSize18,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  priceAmount: {
    fontSize: SIZES.fontSize36,
    fontWeight: "800",
    color: COLORS.white,
  },
  cardBody: {
    padding: SIZES.padding * 1.5,
    gap: 16,
  },
  description: {
    fontSize: SIZES.fontSize14,
    color: COLORS.textLight,
    lineHeight: 22,
    textAlign: "center",
  },
  featuresContainer: {
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  featureText: {
    fontSize: SIZES.fontSize14,
    color: COLORS.text,
    fontWeight: "500",
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  selectButtonPressed: {
    opacity: 0.9,
  },
  selectButtonText: {
    fontSize: SIZES.fontSize16,
    fontWeight: "700",
    color: COLORS.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SIZES.padding * 4,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: SIZES.fontSize20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: SIZES.fontSize14,
    color: COLORS.textLight,
    textAlign: "center",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.padding,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});
