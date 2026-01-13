import { COLORS } from "@/constants/Colors";
import React from "react";
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, ViewStyle } from "react-native";
import { ThemedText } from "../ThemedText";
import { SIZES } from "@/constants/Sizes";

const ThemedButton = ({
  buttonText,
  onPress,
  disabled,
  style,
  loading,
}: {
  buttonText: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  loading?: boolean;
}) => {
  return (
    <Pressable
      style={[
        styles.verifyButton,
        disabled ? styles.disabledButton : styles.activeButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      {loading ? (
        <ActivityIndicator size={SIZES.fontSize30} color={COLORS.white} />
      ) : (
        <ThemedText style={styles.buttonText}>{buttonText}</ThemedText>
      )}
    </Pressable>
  );
};

export default React.memo(ThemedButton);

const styles = StyleSheet.create({
  verifyButton: {
    height: SIZES.height * 0.065,
    borderRadius: SIZES.radius10,
    alignItems: "center",
    justifyContent: "center",
  },
  activeButton: {
    backgroundColor: COLORS.primary,
  },
  disabledButton: {
    backgroundColor: "#F0F0F0",
  },
  buttonText: {
    fontSize: SIZES.fontSize16,
    fontWeight: "600",
    color: COLORS.white,
  },
});
