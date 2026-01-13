
import { COLORS } from "@/constants/Colors";
import { SIZES } from "@/constants/Sizes";
import React from "react";
import { StyleProp, StyleSheet, TextInput, TextInputProps, TextStyle, View, ViewStyle } from "react-native";

interface ThemeInputProps extends TextInputProps {
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<TextStyle>;
}

const ThemeInput: React.FC<ThemeInputProps> = ({
  label,
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  ...props
}) => {
  return (
    <View style={[styles.inputContainer, containerStyle]}>
      {leftIcon && leftIcon}
      <TextInput
        style={[styles.input, style]}
        placeholder={label}
        placeholderTextColor="#999"
        {...props}
      />
      {rightIcon && rightIcon}
    </View>
  );
};

export default ThemeInput;

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: SIZES.height * 0.065,
    backgroundColor: "#F9F9F9",
    borderWidth: 1,
    borderColor: "#EEEEEE",
    paddingHorizontal: SIZES.padding16,
    borderRadius: SIZES.radius10,
  },
  inputIcon: {
    marginRight: SIZES.padding12,
  },
  input: {
    flex: 1,
    fontSize: SIZES.fontSize16,
    color: COLORS.black,
    height: "100%",
  },
});

