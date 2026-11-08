import ReportModal from "@/components/modals/ReportModal";
import AppToast from "@/components/toasts/AppToast";
import { reportProductApi, reportUserApi } from "@/constants/functions";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, StyleSheet, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";

type Props = {
  /** The listing being shown (for banner ads pass `banner.product`). */
  product: any;
  /** Override the default bottom-left placement on the ad image. */
  style?: any;
};

const getOwnerId = (product: any) => product?.user?.user_id ?? product?.user?.id ?? product?.user_id;

/**
 * Flag button for an ad image. Tapping offers "Report Ad" / "Report User" and sends the
 * report with a reason. Hidden on the signed-in user's own ads.
 */
export default function ReportButton({ product, style }: Props) {
  const { user } = useSelector((state: any) => state.entities.authReducer) || {};
  const [target, setTarget] = useState<"ad" | "user" | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const ownerId = getOwnerId(product);
  const currentUserId = user?.id ?? user?.user_id;
  if (product?.id == null || (ownerId != null && currentUserId != null && Number(ownerId) === Number(currentUserId))) return null;

  const close = () => {
    if (!submitting) setTarget(null);
  };

  const submit = async () => {
    const text = reason.trim();
    if (!target) return;
    if (!text) {
      Alert.alert("Reason required", `Please enter a reason to report this ${target}.`);
      return;
    }
    try {
      setSubmitting(true);
      const response =
        target === "ad"
          ? await reportProductApi({ product_id: Number(product.id), reason: text })
          : await reportUserApi({ reported_user_id: Number(ownerId), reason: text });
      AppToast(response?.message || (target === "ad" ? "Ad reported successfully" : "User reported successfully"));
      setTarget(null);
      setReason("");
    } catch {
      AppToast(`Failed to report this ${target}. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  const open = () => {
    const choose = (next: "ad" | "user") => {
      setReason("");
      setTarget(next);
    };
    Alert.alert("Report", "What would you like to report?", [
      { text: "Report Ad", onPress: () => choose("ad") },
      ...(ownerId != null ? [{ text: "Report User", onPress: () => choose("user") }] : []),
      { text: "Cancel", style: "cancel" as const },
    ]);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.btn, style]}
        onPress={(e) => {
          e?.stopPropagation?.();
          open();
        }}
        activeOpacity={0.8}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="flag-outline" size={16} color="#fff" />
      </TouchableOpacity>
      <ReportModal
        visible={target !== null}
        reason={reason}
        onChangeReason={setReason}
        onClose={close}
        onSubmit={submit}
        isSubmitting={submitting}
        title={target === "user" ? "Report User" : "Report Ad"}
        subtitle={target === "user" ? "Tell us why you are reporting this user." : "Tell us why you are reporting this listing."}
      />
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: "absolute",
    bottom: 8,
    left: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
});
