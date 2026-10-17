import React from "react";
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { COLORS } from "@/constants/Colors";
import { isValidImageUri } from "@/constants/functions";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { isMatrimonyCategoryName } from "@/components/post/postUtils";

const ICON_SIZE_LARGE = 32;

type HomeCategoriesProps = {
  categories: any[];
  selectedCategory: number | null;
  onPressCategory: (categoryId: number | null) => void;
  onPressMore: () => void;
};

export const HomeCategories = ({
  categories,
  selectedCategory,
  onPressCategory,
  onPressMore,
}: HomeCategoriesProps) => {
  return (
    <View style={styles.categoriesSection}>
       <ThemedText style={styles.sectionTitle}>Product Category</ThemedText>
       
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        {/* "All" chip */}
        <TouchableOpacity
          style={styles.categoryItem}
          activeOpacity={0.7}
          onPress={onPressMore}
        >
          <View
            style={[
              styles.categoryIconBox,
              selectedCategory === null && styles.categoryIconBoxActive,
            ]}
          >
            <Ionicons
              name="grid"
              size={22}
              color={selectedCategory === null ? COLORS.white : "#1565C0"}
            />
          </View>
          <ThemedText
            style={[
              styles.categoryLabel,
              selectedCategory === null && styles.categoryLabelActive,
            ]}
          >
            All
          </ThemedText>
        </TouchableOpacity>

        {/* Matrimony has its own home section, so it is left out of this row. */}
        {categories.filter((cat: any) => !isMatrimonyCategoryName(cat?.name)).map((cat: any) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.categoryItem}
            activeOpacity={0.7}
            onPress={() => onPressCategory(cat.id)}
          >
            <View
              style={[
                styles.categoryIconBox,
                selectedCategory === cat.id && styles.categoryIconBoxActive,
              ]}
            >
              {isValidImageUri(cat.image) ? (
                <Image source={{ uri: cat.image }} style={styles.categoryImg} />
              ) : (
                <Ionicons name="pricetag" size={22} color="#1565C0" />
              )}
            </View>
            <ThemedText
              style={[
                styles.categoryLabel,
                selectedCategory === cat.id && styles.categoryLabelActive,
              ]}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {cat.name}
            </ThemedText>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.categoryItem}
          activeOpacity={0.7}
          onPress={onPressMore}
        >
          <View style={styles.categoryIconBox}>
            <Ionicons name="ellipsis-horizontal" size={22} color="#1565C0" />
          </View>
          <ThemedText style={styles.categoryLabel}>More</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: SIZES.fontSize14,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SIZES.padding12,
  },
  categoriesSection: { marginBottom: SIZES.padding16 },
  categoriesScroll: { gap: SIZES.padding4, paddingRight: SIZES.padding8 },
  // Wide enough for a full single-word name such as "MATRIMONY" on one line.
  categoryItem: { alignItems: "center", width: ICON_SIZE_LARGE + 44 },
  categoryIconBox: {
    width: ICON_SIZE_LARGE + 18,
    height: ICON_SIZE_LARGE + 18,
    borderRadius: SIZES.radius6,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    marginBottom: SIZES.padding4,
    overflow: "hidden",
  },
  categoryIconBoxActive: {
    backgroundColor: "#1565C0",
    borderColor: "#1565C0",
  },
  categoryImg: {
    width: ICON_SIZE_LARGE + 18,
    height: ICON_SIZE_LARGE + 18,
    borderRadius: SIZES.radius6,
  },
  categoryLabel: {
    fontSize: SIZES.fontSize10,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },
  categoryLabelActive: { color: "#1565C0", fontWeight: "700" },
});
