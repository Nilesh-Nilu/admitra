import { COLORS } from "@/constants/Colors";
import { SIZES } from "@/constants/Sizes";
import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { ThemedText } from "../ThemedText";

const ThemeHeader = ({
  onBackPress,
  title,
  containerStyle,
}: {
  onBackPress: () => void;
  title: string;
  containerStyle?: StyleProp<ViewStyle>;
}) => {
  const handleBackPress = () => {
    onBackPress();
  };
  return (
    <View style={[styles.header, containerStyle]}>
      <View style={styles.headerContent}>
        <Pressable style={styles.backButton} onPress={handleBackPress}>
        <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>{title}</ThemedText>
      </View>
      <View style={styles.placeholder} />
    </View>
  );
};

export default ThemeHeader;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SIZES.padding12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    justifyContent: "space-between",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: SIZES.height * 0.01,
  },
  backButton: {
    marginRight: SIZES.padding * 0.3,
  },
  headerTitle: {
    fontSize: SIZES.fontSize18,
    fontWeight: "600",
    color: COLORS.black,
    paddingLeft: SIZES.height * 0.01,
  },
  placeholder: {
    width: 34,
  },
});
