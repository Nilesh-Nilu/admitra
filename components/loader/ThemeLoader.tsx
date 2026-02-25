import { ActivityIndicator, StyleSheet, View } from "react-native";
import { COLORS } from "@/constants/Colors";

const ThemeLoader = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
};

export default ThemeLoader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
