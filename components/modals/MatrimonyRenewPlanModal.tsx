import { ThemedText } from "@/components/ThemedText";
import AppToast from "@/components/toasts/AppToast";
import { COLORS } from "@/constants/Colors";
import {
  createMatrimonyOrderApi,
  getMatrimonyPlansApi,
  RAZORPAY_KEY,
  renewMatrimonyPlanApi,
} from "@/constants/functions";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import RazorpayCheckout from "react-native-razorpay";

// my-profiles rows are untyped in the API docs, so accept every expiry shape the backend
// uses elsewhere (plan_info on products, is_expired/expiry_date on payment history).
export const isMatrimonyProfileExpired = (profile: any, history?: any) => {
  if (history?.profile_id != null && Number(history.profile_id) === Number(profile?.id)) {
    return history.is_expired === true;
  }
  if (profile?.is_expired === true || profile?.plan_info?.is_expired === true) return true;
  if (String(profile?.status ?? profile?.approve ?? "").toLowerCase() === "expired") return true;
  const expiry = profile?.expiry_date ?? profile?.plan_expiry_date ?? profile?.plan_info?.expiry_date;
  const expiryTime = expiry ? new Date(expiry).getTime() : NaN;
  return !Number.isNaN(expiryTime) && expiryTime < Date.now();
};

// Razorpay surfaces raw gateway JSON (e.g. BAD_REQUEST_ERROR); never show that to users.
const getPaymentErrorMessage = (error: any): string => {
  const raw = String(error?.description ?? error?.message ?? "");
  const looksTechnical = /BAD_REQUEST|GATEWAY_ERROR|SERVER_ERROR|^\s*[{\[]|"error"|"code"/i.test(raw);
  if (!raw || looksTechnical) {
    return "We couldn't complete your payment. Please try again.";
  }
  return raw;
};

type Props = {
  profile: any;
  user: any;
  onClose: () => void;
  onRenewed: () => void;
};

export default function MatrimonyRenewPlanModal({ profile, user, onClose, onRenewed }: Props) {
  const [plans, setPlans] = useState<any[] | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    if (!profile || plans) return;
    getMatrimonyPlansApi()
      .then(({ plans: rows }: { plans: any[] }) => {
        setPlans(rows);
        setSelectedPlan(rows[0] ?? null);
      })
      .catch((error: any) => {
        setPlans([]);
      });
  }, [profile, plans]);

  const close = () => {
    if (!isPaying) onClose();
  };

  const verifyRenewal = async (paymentData: any) => {
    try {
      // profile_id isn't in the renew spec yet; sent so the backend can target the right
      // profile once it supports it (today it renews the user's single tracked profile).
      const response = await renewMatrimonyPlanApi({
        profile_id: profile?.id,
        plan_id: selectedPlan.id,
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
      });
      Alert.alert("Plan Renewed!", response?.message || "Your matrimony plan has been renewed successfully.");
      onRenewed();
      onClose();
    } catch (error: any) {
      Alert.alert(
        "Unable to renew plan",
        String(
          error?.response?.data?.message ||
            "Your payment was received but the plan could not be renewed. Please contact support."
        )
      );
    } finally {
      setIsPaying(false);
    }
  };

  const handleRenew = async () => {
    if (!selectedPlan?.id) {
      AppToast("Choose a renewal plan before continuing.");
      return;
    }

    setIsPaying(true);
    try {
      const order = await createMatrimonyOrderApi(selectedPlan.id);
      const totalAmount = Number(order?.total_amount ?? 0);
      const razorpayOrderId = order?.order_id || order?.id;

      if (!totalAmount || !razorpayOrderId) {
        AppToast("Invalid renewal order. Please try again.");
        setIsPaying(false);
        return;
      }

      RazorpayCheckout.open({
        key: order?.razorpay_key || RAZORPAY_KEY,
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        name: "Gaxa Marketplace",
        description: "Matrimony Plan Renewal",
        order_id: razorpayOrderId,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: {
          color: COLORS.primary,
        },
      } as any)
        .then((paymentResponse: any) =>
          verifyRenewal({
            ...paymentResponse,
            razorpay_order_id: paymentResponse?.razorpay_order_id || razorpayOrderId,
          })
        )
        .catch((error: any) => {
          if (error?.code === "payment_cancelled" || error?.description === "Payment Cancelled") {
            AppToast("Payment cancelled");
          } else {
            AppToast(getPaymentErrorMessage(error));
          }
          setIsPaying(false);
        });
    } catch (error: any) {
      AppToast(error?.response?.data?.message || "Unable to start payment. Please try again.");
      setIsPaying(false);
    }
  };

  return (
    <Modal visible={!!profile} animationType="slide" transparent onRequestClose={close}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>Renew Plan</ThemedText>
            <TouchableOpacity onPress={close} disabled={isPaying}>
              <Ionicons name="close" size={22} color={COLORS.gray} />
            </TouchableOpacity>
          </View>
          <ThemedText style={styles.subtitle} numberOfLines={1}>
            {profile?.full_name || "Matrimony profile"}
          </ThemedText>

          {plans === null ? (
            <ActivityIndicator style={{ marginVertical: 24 }} color="#C2185B" />
          ) : plans.length === 0 ? (
            <ThemedText style={styles.empty}>No matrimony plans are available right now.</ThemedText>
          ) : (
            <ScrollView style={{ maxHeight: 320 }} contentContainerStyle={{ gap: 10 }}>
              {plans.map((plan) => {
                const isSelected = selectedPlan?.id === plan.id;
                const days = plan.duration_days ?? plan.plan_duration_days ?? plan.duration;
                return (
                  <TouchableOpacity
                    key={plan.id}
                    style={[styles.planCard, isSelected && styles.planCardActive]}
                    onPress={() => setSelectedPlan(plan)}
                    disabled={isPaying}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={isSelected ? "radio-button-on" : "radio-button-off"}
                      size={20}
                      color={isSelected ? "#C2185B" : COLORS.gray}
                    />
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.planName}>{plan.name || plan.plan_name || "Plan"}</ThemedText>
                      {!!days && <ThemedText style={styles.planMeta}>{days} days</ThemedText>}
                    </View>
                    <ThemedText style={styles.planPrice}>₹{Number(plan.price ?? 0)}</ThemedText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          <TouchableOpacity
            style={[styles.payButton, (!selectedPlan || isPaying) && { opacity: 0.6 }]}
            onPress={handleRenew}
            disabled={!selectedPlan || isPaying}
            activeOpacity={0.8}
          >
            {isPaying ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="refresh-outline" size={16} color={COLORS.white} />
                <ThemedText style={styles.payButtonText}>Pay & Renew</ThemedText>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 2,
    marginBottom: 16,
  },
  empty: {
    fontSize: 13,
    color: COLORS.gray,
    textAlign: "center",
    marginVertical: 24,
  },
  planCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  planCardActive: {
    borderColor: "#F8BBD0",
    backgroundColor: "#FCE4EC",
  },
  planName: {
    fontSize: 14,
    fontWeight: "600",
  },
  planMeta: {
    fontSize: 12,
    color: COLORS.gray,
  },
  planPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#C2185B",
  },
  payButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#1565C0",
  },
  payButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.white,
  },
});
