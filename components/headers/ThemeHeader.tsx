import { COLORS } from "@/constants/Colors";
import { SIZES } from "@/constants/Sizes";
import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
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
      <TouchableOpacity style={styles.backBtn} onPress={handleBackPress}>
        <Ionicons name="chevron-back" size={24} color="#fff" />
      </TouchableOpacity>
      <ThemedText style={styles.headerTitle}>{title}</ThemedText>
      <View style={styles.placeholder} />
    </View>
  );
};

export default ThemeHeader;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.padding * 2,
    paddingVertical: 15,
    backgroundColor: COLORS.blue,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    left:10
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  placeholder: {
    width: 34,
  },
});
