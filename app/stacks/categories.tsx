import ThemeHeader from "@/components/headers/ThemeHeader";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { BackHandler, Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";

const SIDEBAR_WIDTH = 72;

export default function CategoriesScreen() {
  const router = useRouter();
  const { selectedCategory: selectedCategoryParam } = useLocalSearchParams<{ selectedCategory?: string }>();
  const { categories, subCategories } = useSelector((state: any) => state.entities.userReducer) || {};
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeSubCategories = Array.isArray(subCategories) ? subCategories : [];

  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    safeCategories.length > 0 ? safeCategories[0].id : null
  );

  useEffect(() => {
    if (!selectedCategoryParam) return;
    const parsedCategory = Number(selectedCategoryParam);
    if (!Number.isNaN(parsedCategory)) {
      setSelectedCategory(parsedCategory);
    }
  }, [selectedCategoryParam]);

  useEffect(() => {
    if (safeCategories.length === 0) return;
    const exists = safeCategories.some((c: any) => c.id === selectedCategory);
    if (!exists) {
      setSelectedCategory(safeCategories[0].id);
    }
  }, [safeCategories, selectedCategory]);

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)");
  }, [router]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      goBack();
      return true;
    });
    return () => backHandler.remove();
  }, [goBack]);

  const selectedCategoryData = safeCategories.find((c: any) => c.id === selectedCategory);
  const filteredSubCategories = safeSubCategories.filter(
    (sc: any) => Number(sc.category_id) === Number(selectedCategory)
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <ThemeHeader
        onBackPress={goBack}
        title="Categories"
      />
      <View style={styles.body}>
        {/* Left Sidebar */}
        <ScrollView
          style={styles.sidebar}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {safeCategories.map((category: any) => {
            const isActive = selectedCategory === category.id;
            return (
              <TouchableOpacity
                key={category.id}
                style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
                activeOpacity={0.7}
                onPress={() => setSelectedCategory(category.id)}
              >
                {isActive && <View style={styles.activeBar} />}
                <Image source={{ uri: category.image }} style={styles.sidebarImage} />
                <ThemedText
                  style={[styles.sidebarLabel, isActive && styles.sidebarLabelActive]}
                  numberOfLines={2}
                >
                  {category.name}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Right Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentInner}
        >
          {selectedCategoryData && (
            <>
              <View style={styles.titleRow}>
                <ThemedText style={styles.contentTitle}>{selectedCategoryData.name}</ThemedText>
                <View style={styles.titleDivider} />
              </View>

              {filteredSubCategories.length > 0 ? (
                <View style={styles.subGrid}>
                  {filteredSubCategories.map((subCat: any) => (
                    <TouchableOpacity
                      key={subCat.id}
                      style={styles.subCard}
                      activeOpacity={0.7}
                      onPress={() =>
                        router.push({
                          pathname: "/stacks/search",
                          params: {
                            categoryId: selectedCategory?.toString() || "",
                            subCategoryId: subCat.id?.toString() || "",
                          },
                        })
                      }
                    >
                      <View style={styles.subImgBox}>
                        <Image source={{ uri: subCat.image }} style={styles.subImg} />
                      </View>
                      <ThemedText style={styles.subLabel} numberOfLines={2}>
                        {subCat.name}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}

                  {/* View All */}
                  {/* <TouchableOpacity
                    style={styles.subCard}
                    activeOpacity={0.7}
                    onPress={() =>
                      router.push({
                        pathname: "/stacks/search",
                        params: { categoryId: selectedCategory?.toString() || "" },
                      })
                    }
                  >
                    <View style={styles.viewAllBox}>
                      <Ionicons name="arrow-forward" size={22} color={COLORS.primary} />
                    </View>
                    <ThemedText style={styles.subLabel}>View All</ThemedText>
                  </TouchableOpacity> */}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="grid-outline" size={36} color={COLORS.gray} />
                  <ThemedText style={styles.emptyText}>No subcategories</ThemedText>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
  },
  body: {
    flex: 1,
    flexDirection: "row",
    overflow: "hidden",
  },

  /* Sidebar */
  sidebar: {
    width: SIDEBAR_WIDTH,
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: "#F5F5F5",
    borderRightWidth: 1,
    borderRightColor: "#E0E0E0",
  },
  sidebarItem: {
    width: SIDEBAR_WIDTH,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    position: "relative",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  sidebarItemActive: {
    backgroundColor: COLORS.white,
  },
  activeBar: {
    position: "absolute",
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    backgroundColor: COLORS.primary,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  sidebarImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E0E0E0",
  },
  sidebarLabel: {
    fontSize: 10,
    color: "#888",
    textAlign: "center",
    marginTop: 5,
    fontWeight: "500",
    lineHeight: 13,
  },
  sidebarLabelActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },

  /* Content */
  content: {
    flex: 1,
    minWidth: 0,
    backgroundColor: COLORS.white,
  },
  contentInner: {
    padding: 16,
    paddingBottom: 80,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  contentTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
  titleDivider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },

  /* SubGrid */
  subGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    columnGap: "3.5%",
    rowGap: 16,
  },
  subCard: {
    width: "31%",
    alignItems: "center",
  },
  subImgBox: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#F5F5F5",
    marginBottom: 6,
  },
  subImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  subLabel: {
    fontSize: 11,
    color: COLORS.text,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 15,
  },
  viewAllBox: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  /* Empty */
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 10,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.gray,
  },
});
