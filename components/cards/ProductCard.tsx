import { ThemedText } from "@/components/ThemedText";
import AppToast from "@/components/toasts/AppToast";
import { COLORS } from "@/constants/Colors";
import { WHATSAPP_NUMBER } from "@/constants/data";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Share from "react-native-share";
// Top Rated Product Item component
const ProductCard = ({ item, index }: { item: any; index: number }) => {
  const [isPressed, setIsPressed] = useState(false);

  const stockStatus = item.in_stock === 1;

  const handleProductPress = (item: any) => {
    router.push({
      pathname: "/stacks/productDetails",
      params: {
        productData: JSON.stringify(item),
      },
    });
  };

  const handleBuyNow = async () => {
    if (!stockStatus) return;

    try {
      const rawTitle = item.title || item.short_description || "Product";
      const cleanTitle = rawTitle.replace(/[*#]/g, "").trim() || "Product";

      const productImage =
        item?.images && item.images.length > 0 ? item.images[0] : null;
      const waNumber = (() => {
        const digitsOnly = (WHATSAPP_NUMBER || "").replace(/\D/g, "");
        return digitsOnly.startsWith("91") ? digitsOnly : `91${digitsOnly}`;
      })();

      const message = `Hi! I'm interested in purchasing this product:

*${cleanTitle}*
Price: ₹${item.price}

Please let me know about availability and delivery details.`;

      // ✅ Method 1: Download to local file and share (most reliable)
      if (productImage) {
        try {
          const fileName = `product_${Date.now()}.jpg`;
          const localPath = `${FileSystem.cacheDirectory}${fileName}`;
          const downloadRes = await FileSystem.downloadAsync(
            productImage,
            localPath
          );

          const shareOptions = {
            url: downloadRes.uri,
            type: "image/jpeg",
            social: Share.Social.WHATSAPP,
            whatsAppNumber: waNumber,
            message,
          } as any;

          await Share.shareSingle(shareOptions);
          AppToast(`Sharing ${cleanTitle} with image via WhatsApp`);
          return;
        } catch (err) {
        }
      }

      // ✅ Method 2: Fallback to WhatsApp text only
      const whatsappUrl = `whatsapp://send?phone=${waNumber}&text=${encodeURIComponent(
        message
      )}`;

      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
        AppToast(`Opening WhatsApp for ${cleanTitle}`);
      } else {
        const webWhatsappUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
          message
        )}`;
        await Linking.openURL(webWhatsappUrl);
        AppToast(`Opening WhatsApp Web for ${cleanTitle}`);
      }
    } catch (error) {
      AppToast("Unable to share product. Please try again.");
    }
  };

  const handleEnquiry = async () => {
    try {
      const rawTitle = item.title || item.short_description || "Product";
      const cleanTitle = rawTitle.replace(/[*#]/g, "").trim() || "Product";

      const waNumber = (() => {
        const digitsOnly = (WHATSAPP_NUMBER || "").replace(/\D/g, "");
        return digitsOnly.startsWith("91") ? digitsOnly : `91${digitsOnly}`;
      })();

      const message = `Hi! I'd like to enquire about this product:\n\n*${cleanTitle}*\nPrice: ₹${item.price}\nIs it currently available? Please let me know about restock and delivery details.`;

      const whatsappUrl = `whatsapp://send?phone=${waNumber}&text=${encodeURIComponent(
        message
      )}`;
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
        AppToast(`Opening WhatsApp to enquire about ${cleanTitle}`);
        return;
      }

      const webWhatsappUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
        message
      )}`;
      await Linking.openURL(webWhatsappUrl);
      AppToast(`Opening WhatsApp Web to enquire about ${cleanTitle}`);
    } catch (error) {
      AppToast("Unable to open WhatsApp. Please try again.");
    }
  };

  return (
    <Pressable
      style={[styles.productCard, isPressed && styles.productCardPressed]}
      onPress={() => handleProductPress(item)}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
    >
      {/* Product Image */}
      <View style={styles.productImageContainer}>
        {item?.images && item.images.length > 0 ? (
          <Image
            source={{ uri: item.images[0] }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.productImage, styles.productImagePlaceholder]}>
            <Ionicons name="image-outline" size={32} color="#999" />
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.productInfo}>
        <ThemedText style={styles.productCategory}>
          {(() => {
            const rawTitle = item.title || item.short_description || "Product";
            const cleanTitle =
              rawTitle.replace(/[*#]/g, "").trim() || "Product";
            return cleanTitle.length > 15
              ? cleanTitle.slice(0, 15) + "..."
              : cleanTitle;
          })()}
        </ThemedText>

        {/* Price */}
        <View style={styles.priceContainer}>
          {item.discount_price ? (
            <>
              <ThemedText
                style={[
                  styles.priceAmount,
                  { textDecorationLine: "line-through", color: "#888" },
                ]}
              >
                ₹{item.price}
              </ThemedText>
              <ThemedText style={styles.priceAmount}>
                ₹{item.discount_price}
              </ThemedText>
            </>
          ) : (
            <ThemedText style={styles.priceAmount}>₹{item.price}</ThemedText>
          )}
        </View>

        {/* Buy Now Button */}
        <TouchableOpacity
          style={[
            styles.buyNowButton,
            !stockStatus && styles.buyNowButtonDisabled,
          ]}
          onPress={() => (stockStatus ? handleBuyNow() : handleEnquiry())}
          activeOpacity={0.8}
        >
          <ThemedText
            style={[
              styles.buyNowText,
              !stockStatus && styles.buyNowTextDisabled,
            ]}
          >
            {stockStatus ? "Buy Now" : "Enquiry"}
          </ThemedText>
          {stockStatus && (
            <Ionicons name="logo-whatsapp" size={16} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </Pressable>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: "48%",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginBottom: SIZES.padding * 0.75,
  },
  productCardPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.05,
    elevation: 1,
  },
  productImageContainer: {
    width: "100%",
    height: 140,
    backgroundColor: "#F8F8F8",
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  productImagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
  },
  productInfo: {
    padding: SIZES.padding * 0.75,
  },
  productCategory: {
    fontSize: SIZES.fontSize.base,
    fontWeight: "600",
    color: "#333",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  priceSymbol: {
    fontSize: SIZES.fontSize.base,
    fontWeight: "600",
    color: "#333",
  },
  priceAmount: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: "bold",
    color: "#333",
  },
  buyNowButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 4,
  },
  buyNowButtonDisabled: {
    backgroundColor: "#E5E5E5",
  },
  buyNowText: {
    fontSize: SIZES.fontSize.base,
    fontWeight: "600",
    color: "#fff",
  },
  buyNowTextDisabled: {
    color: "#999",
  },
});
