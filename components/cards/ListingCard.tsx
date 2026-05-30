import React from "react";
import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { COLORS } from "@/constants/Colors";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
export const CARD_WIDTH = (SCREEN_WIDTH - SIZES.padding * 2 - 12) / 2;

type ListingCardProps = {
  item: any;
};

export const formatPrice = (price: number) => {
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
  return `₹${price.toLocaleString("en-IN")}`;
};

export const ListingCard = ({ item }: ListingCardProps) => {
  return (
    <TouchableOpacity
      style={styles.listingCard}
      activeOpacity={0.9}
      onPress={() =>
        router.push({
          pathname: "/stacks/productDetails",
          params: { productData: JSON.stringify(item) },
        })
      }
    >
      <View style={styles.listingImgWrap}>
        <Image
          source={{ uri: item.images?.[0]?.image_path || item.images?.[0]?.image }}
          style={styles.listingImg}
        />
        {item.approve === "approved" && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={12} color={COLORS.white} />
            <ThemedText style={styles.verifiedText}>Verified</ThemedText>
          </View>
        )}
      </View>
      <View style={styles.listingInfo}>
        <ThemedText style={styles.listingPrice}>
          {formatPrice(item.price)}
        </ThemedText>
        <ThemedText style={styles.listingTitle} numberOfLines={1}>
          {item.name}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
};

export default ListingCard;

const styles = StyleSheet.create({
  listingCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius6,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  listingImgWrap: {
    width: "100%",
    height: CARD_WIDTH * 0.85,
    position: "relative",
  },
  listingImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  verifiedBadge: {
    position: "absolute",
    top: SIZES.padding8,
    left: SIZES.padding8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E8E3E",
    paddingHorizontal: SIZES.padding6,
    paddingVertical: SIZES.padding4,
    borderRadius: SIZES.padding4,
    gap: SIZES.padding2,
  },
  verifiedText: {
    fontSize: SIZES.fontSize10 - 1,
    fontWeight: "700",
    color: COLORS.white,
  },
  listingInfo: {
    padding: SIZES.padding10,
    gap: SIZES.padding4,
  },
  listingPrice: {
    fontSize: SIZES.fontSize14,
    fontWeight: "800",
    color: COLORS.text,
  },
  listingTitle: {
    fontSize: SIZES.fontSize12,
    color: COLORS.gray,
    lineHeight: SIZES.padding16,
  },
});
