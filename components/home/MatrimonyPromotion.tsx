import { ThemedText } from "@/components/ThemedText";
import { getMatrimonyPromotionApi, isValidImageUri } from "@/constants/functions";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Image, Linking, StyleSheet, TouchableOpacity, View } from "react-native";

/** Admin-managed promotion strip for Matrimony; same look as the Banner/Featured ad strips. */
export const MatrimonyPromotion = () => {
  const [promotions, setPromotions] = useState<any[]>([]);

  useEffect(() => {
    getMatrimonyPromotionApi().then(setPromotions);
  }, []);

  if (promotions.length === 0) return null;

  return (
    <>
      {promotions.map((promo) => {
        const link = promo.link || promo.url;
        return (
          <TouchableOpacity
            key={promo.id}
            style={styles.strip}
            activeOpacity={link ? 0.85 : 1}
            onPress={() => link && Linking.openURL(/^https?:\/\//.test(link) ? link : `https://${link}`).catch(() => {})}
          >
            <View style={styles.iconWrap}>
              {isValidImageUri(promo.icon) ? (
                <Image source={{ uri: promo.icon }} style={styles.icon} />
              ) : (
                <Ionicons name="heart-circle-outline" size={22} color="#C2185B" />
              )}
            </View>
            <View style={styles.body}>
              <ThemedText style={styles.title} numberOfLines={2} ellipsizeMode="tail">
                {promo.business_text || promo.title}
              </ThemedText>
            </View>
            {!!(promo.offer_text || promo.button_text) && (
              <View style={styles.btn}>
                <ThemedText style={styles.btnText} numberOfLines={1} ellipsizeMode="tail">
                  {promo.offer_text || promo.button_text}
                </ThemedText>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </>
  );
};

const styles = StyleSheet.create({
  strip: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FDF2F8",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#FBCFE8",
    overflow: "hidden",
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#FCE7F3",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },
  icon: { width: 35, height: 35, borderRadius: 8 },
  body: { flex: 1, minWidth: 0 },
  title: { fontSize: 13, lineHeight: 18, fontWeight: "700", color: "#831843", includeFontPadding: false },
  btn: {
    maxWidth: "36%",
    backgroundColor: "#C2185B",
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
    flexShrink: 0,
  },
  btnText: { fontSize: 12, fontWeight: "700", color: "#FFFFFF" },
});
