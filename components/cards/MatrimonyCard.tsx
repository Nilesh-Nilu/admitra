import { ThemedText } from "@/components/ThemedText";
import { COLORS } from "@/constants/Colors";
import { ImageUrl } from "@/constants/functions";
import { getProfileAge, getProfileMasterName, getProfilePhoto } from "@/constants/matrimony";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.38;

type Props = {
  item: any;
  /** Card width override (e.g. for a 2-column grid). */
  width?: number;
};

export const MatrimonyCard = ({ item, width = CARD_WIDTH }: Props) => {
  const router = useRouter();
  const photo = getProfilePhoto(item, ImageUrl);
  const age = getProfileAge(item);
  const religion = getProfileMasterName(item, "religion");
  const subtitle = [age ? `${age} yrs` : "", getProfileMasterName(item, "height")]
    .filter(Boolean)
    .join(" • ");

  return (
    <TouchableOpacity
      style={[styles.card, { width }]}
      activeOpacity={0.9}
      onPress={() =>
        router.push({
          pathname: "/stacks/matrimonyProfileDetails",
          params: { profileData: JSON.stringify(item) },
        })
      }
    >
      <View style={[styles.imageBox, { height: width * 1.05 }]}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.image} />
        ) : (
          <Ionicons name="person" size={width * 0.4} color="#CBD5E1" />
        )}
        <View style={styles.badge}>
          <Ionicons name="heart" size={10} color={COLORS.white} />
          <ThemedText style={styles.badgeText}>Matrimony</ThemedText>
        </View>
      </View>
      <View style={styles.info}>
        <ThemedText style={styles.name} numberOfLines={1}>
          {item?.full_name || "Profile"}
        </ThemedText>
        {!!subtitle && (
          <ThemedText style={styles.meta} numberOfLines={1}>
            {subtitle}
          </ThemedText>
        )}
        {!!religion && (
          <ThemedText style={styles.meta} numberOfLines={1}>
            {religion}
          </ThemedText>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageBox: {
    width: "100%",
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  image: { width: "100%", height: "100%", resizeMode: "cover" },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#C2185B",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 10, fontWeight: "700", color: COLORS.white },
  info: { padding: SIZES.padding8, gap: SIZES.padding2 },
  name: { fontSize: SIZES.fontSize14, fontWeight: "700", color: COLORS.text },
  meta: { fontSize: SIZES.fontSize12, color: COLORS.gray },
});
