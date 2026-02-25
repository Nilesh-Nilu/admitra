import { StyleSheet } from "react-native";
import { COLORS } from "./Colors";
import { SIZES } from "./Sizes";

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.red,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: SIZES.radius20,
    paddingHorizontal: SIZES.padding16,
    paddingVertical: SIZES.padding12/2,
    backgroundColor: COLORS.white,
  },
});