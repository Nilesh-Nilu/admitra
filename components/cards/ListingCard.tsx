import AdIdBadge from "@/components/badges/AdIdBadge";
import AppToast from "@/components/toasts/AppToast";
import ReportButton from "@/components/buttons/ReportButton";
import React from "react";
import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { ThemedText } from "@/components/ThemedText";
import { COLORS } from "@/constants/Colors";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { addToFavoritesApi, remoteImageSource, removeFromFavoritesApi } from "@/constants/functions";
import { addFavoriteItem, removeFavoriteById } from "@/store/reducers/userReducer";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
export const CARD_WIDTH = (SCREEN_WIDTH - SIZES.padding * 2 - 12) / 2;

type ListingCardProps = {
  item: any;
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

const getLocationLabel = (item: any) => {
  const city = item?.user?.city?.name || item?.city?.name || item?.city || "";
  const state = item?.user?.state?.name || item?.state?.name || item?.state || "";
  return [city, state].filter(Boolean).join(", ");
};

export const formatPrice = (price: number) => {
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
  return `₹${price.toLocaleString("en-IN")}`;
};

export const ListingCard = ({ item }: ListingCardProps) => {
  const dispatch = useDispatch();
  const favorites = useSelector((state: any) => state.entities.userReducer.favorites) || [];
  const favRecord = favorites.find((fav: any) => fav.product?.id === item.id);
  const isFavorited = !!favRecord;

  const handleToggleFavorite = async (e: any) => {
    e.stopPropagation();
    if (isFavorited) {
      dispatch(removeFavoriteById(favRecord.id));
      try { await removeFromFavoritesApi(favRecord.id); } catch { dispatch(addFavoriteItem(favRecord)); }
    } else {
      const tempRecord = { id: `temp_${item.id}`, product: item };
      dispatch(addFavoriteItem(tempRecord));
      try {
        const res = await addToFavoritesApi(item.id);
        dispatch(removeFavoriteById(`temp_${item.id}`));
        dispatch(addFavoriteItem({ ...(res?.data || {}), id: res?.data?.id ?? `temp_${item.id}`, product: res?.data?.product ?? item }));
      } catch (error: any) {
        dispatch(removeFavoriteById(`temp_${item.id}`));
        AppToast(error?.response?.data?.message || "Could not save to favorites. Please try again.");
      }
    }
  };

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
          source={remoteImageSource(item.images?.[0]?.image_path || item.images?.[0]?.image)}
          style={styles.listingImg}
        />
        <View style={styles.typeBadge}>
          <ThemedText style={styles.typeBadgeText}>Normal</ThemedText>
        </View>
        {item.user.is_verify === 1 && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={12} color={COLORS.white} />
            <ThemedText style={styles.verifiedText}>Verified</ThemedText>
          </View>
        )}
        <AdIdBadge kind={"normal"} id={item.id} />
        <ReportButton product={item} />
        <TouchableOpacity style={styles.heartBtn} onPress={handleToggleFavorite} activeOpacity={0.8}>
          <Ionicons name={isFavorited ? "heart" : "heart-outline"} size={18} color={isFavorited ? "#E91E63" : COLORS.white} />
        </TouchableOpacity>
      </View>
      <View style={styles.listingInfo}>
        <ThemedText style={styles.listingPrice}>
          {formatPrice(item.price)}
        </ThemedText>
        <ThemedText style={styles.listingTitle} numberOfLines={1}>
          {item.name}
        </ThemedText>
        <ThemedText style={styles.listingLocation} numberOfLines={1}>
          {getLocationLabel(item)}
        </ThemedText>
        {item.created_at ? (
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={11} color="#94A3B8" />
            <ThemedText style={styles.listingTime}>{timeAgo(item.created_at)}</ThemedText>
          </View>
        ) : null}
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
  heartBtn: {
    position: "absolute",
    bottom: SIZES.padding6,
    right: SIZES.padding6,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 20,
    padding: SIZES.padding4,
  },
  listingImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  typeBadge: {
    position: "absolute",
    top: SIZES.padding8,
    left: SIZES.padding8,
    zIndex: 2,
    backgroundColor: "#43A047",
    paddingHorizontal: SIZES.padding6,
    paddingVertical: SIZES.padding2,
    borderRadius: SIZES.radius2,
  },
  typeBadgeText: {
    fontSize: SIZES.fontSize10 - 1,
    fontWeight: "700",
    color: COLORS.white,
  },
  verifiedBadge: {
    position: "absolute",
    top: SIZES.padding8 + 22,
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
  },
  listingLocation: {
    fontSize: SIZES.fontSize10 + 1,
    color: "black",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  listingTime: {
    fontSize: 10,
    color: "#94A3B8",
  },
});
