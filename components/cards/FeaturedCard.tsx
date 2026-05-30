import React from "react";
import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { COLORS } from "@/constants/Colors";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const FEATURED_CARD_WIDTH = SCREEN_WIDTH * 0.38;

type FeaturedCardProps = {
  item: any;
  isInline?: boolean;
};

const formatPrice = (price: number) => {
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
  return `₹${price.toLocaleString("en-IN")}`;
};

const timeAgo = (dateStr: string) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return "Just now";
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

export const FeaturedCard = ({ item, isInline = false }: FeaturedCardProps) => {
  if (isInline) {
    return (
      <TouchableOpacity
        style={styles.inlineFeaturedCard}
        activeOpacity={0.9}
        onPress={() =>
          router.push({
            pathname: "/stacks/productDetails",
            params: {
              productData: JSON.stringify(item),
            },
          })
        }
      >
        <View style={styles.featuredBadge}>
          <ThemedText style={styles.featuredBadgeText}>Featured</ThemedText>
        </View>
        <Image
          source={{
            uri: item.images?.[0]?.image_path || item.images?.[0]?.image,
          }}
          style={styles.inlineFeaturedImage}
        />
        <View style={{ padding: 10 }}>
          <ThemedText style={styles.featuredPrice}>
            {formatPrice(item.price)}
          </ThemedText>
          <ThemedText numberOfLines={1} style={styles.featuredLocation}>
            {item.name}
          </ThemedText>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.featuredCard}
      activeOpacity={0.85}
      onPress={() =>
        router.push({
          pathname: "/stacks/productDetails",
          params: { productData: JSON.stringify(item) },
        })
      }
    >
      <View style={styles.featuredBadge}>
        <ThemedText style={styles.featuredBadgeText}>Featured</ThemedText>
      </View>
      <Image
        source={{ uri: item.images?.[0]?.image_path || item.images?.[0]?.image }}
        style={styles.featuredImg}
      />
      <View style={styles.featuredInfo}>
        <ThemedText style={styles.featuredPrice}>
          {formatPrice(item.price)}
        </ThemedText>
        <ThemedText style={styles.featuredLocation} numberOfLines={1}>
          {item.user?.city?.name || item.city || "India"}
        </ThemedText>
        <ThemedText style={styles.featuredTime}>
          {timeAgo(item.created_at)}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
};

export default FeaturedCard;

const styles = StyleSheet.create({
  /* Horizontal card style */
  featuredCard: {
    width: FEATURED_CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    position: "relative",
  },
  featuredBadge: {
    position: "absolute",
    top: SIZES.padding8,
    left: SIZES.padding8,
    zIndex: 2,
    backgroundColor: "#FF6B35",
    paddingHorizontal: SIZES.padding8,
    paddingVertical: SIZES.padding2,
    borderRadius: SIZES.radius2,
  },
  featuredBadgeText: {
    fontSize: SIZES.fontSize10 - 1,
    fontWeight: "700",
    color: COLORS.white,
  },
  featuredImg: {
    width: "100%",
    height: FEATURED_CARD_WIDTH * 0.75,
    resizeMode: "cover",
  },
  featuredInfo: {
    padding: SIZES.padding8,
    gap: SIZES.padding2,
  },
  featuredPrice: {
    fontSize: SIZES.fontSize14,
    fontWeight: "800",
    color: COLORS.text,
  },
  featuredLocation: {
    fontSize: SIZES.fontSize10 + 1,
    color: COLORS.gray,
  },
  featuredTime: {
    fontSize: SIZES.fontSize10,
    color: COLORS.gray,
  },

  /* Inline styled card */
  inlineFeaturedCard: {
    width: "48%",
    backgroundColor: "#FFF8E1",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#FFD54F",
    position: "relative",
  },
  inlineFeaturedImage: {
    width: "100%",
    height: 130,
    resizeMode: "cover",
  },
});
