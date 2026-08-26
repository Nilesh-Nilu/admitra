import { ThemedText } from "@/components/ThemedText";
import { COLORS } from "@/constants/Colors";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  isLoading: boolean;
  isRenewal: boolean;
  adType: any;
  shouldPostWithoutPayment: boolean;
  onPress: () => void;
};

export default function PostSubmitButton({
  isLoading,
  isRenewal,
  adType,
  shouldPostWithoutPayment,
  onPress,
}: Props) {
  const price = parseFloat(adType?.price || "0");

  return (
    <View style={styles.footer}>
      <TouchableOpacity
        style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
        onPress={onPress}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <ActivityIndicator size="small" color={COLORS.white} />
            <ThemedText style={styles.submitBtnText}>Processing...</ThemedText>
          </>
        ) : (
          <>
            {adType && price > 0 && (
              <ThemedText style={styles.submitBtnPrice}>
                ₹{isRenewal ? adType.price : shouldPostWithoutPayment ? 0 : adType.price}
              </ThemedText>
            )}
            <ThemedText style={styles.submitBtnText}>
              {isRenewal
                ? price > 0
                  ? "Pay & Renew Ad"
                  : "Renew Ad"
                : shouldPostWithoutPayment
                  ? "Post Ad"
                  : "Pay & Post Ad"}
            </ThemedText>
            <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: SIZES.padding,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
  },
  submitBtnPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.white,
    marginRight: 4,
    opacity: 0.9,
  },
});
