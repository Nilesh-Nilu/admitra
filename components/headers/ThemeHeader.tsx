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
  rightIcon,
  onRightPress,
  rightBadge,
}: {
  onBackPress: () => void;
  title: string;
  containerStyle?: StyleProp<ViewStyle>;
  /** Optional action button on the right, e.g. a filter icon. */
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  /** Small count bubble on the right button (hidden when 0). */
  rightBadge?: number;
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
      {rightIcon ? (
        <TouchableOpacity style={styles.rightBtn} onPress={onRightPress} hitSlop={6}>
          <Ionicons name={rightIcon} size={20} color="#fff" />
          {!!rightBadge && (
            <View style={styles.rightBadge}>
              <ThemedText style={styles.rightBadgeText}>{rightBadge}</ThemedText>
            </View>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
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
  rightBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    right: 10,
  },
  rightBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: "#F59E0B",
    alignItems: "center",
    justifyContent: "center",
  },
  rightBadgeText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "700",
    color: "#fff",
  },
});
