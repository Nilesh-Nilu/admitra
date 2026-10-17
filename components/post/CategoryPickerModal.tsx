import { ThemedText } from "@/components/ThemedText";
import { COLORS } from "@/constants/Colors";
import { isMatrimonyCategoryName } from "@/components/post/postUtils";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  categories: any[];
  subCategories: any[];
  childCategories: any[];
  tempSelectedCategory: any;
  tempSelectedSubCategory: any;
  categorySearchQuery: string;
  loadingChildrenForId: number | null;
  onClose: () => void;
  onBack: () => void;
  onSearchChange: (query: string) => void;
  onSelectCategory: (cat: any) => void;
  onSelectSubCategory: (subCat: any, parentCat: any) => void;
  onSelectChildCategory: (child: any) => void;
};

export default function CategoryPickerModal({
  visible,
  categories,
  subCategories,
  childCategories,
  tempSelectedCategory,
  tempSelectedSubCategory,
  categorySearchQuery,
  loadingChildrenForId,
  onClose,
  onBack,
  onSearchChange,
  onSelectCategory,
  onSelectSubCategory,
  onSelectChildCategory,
}: Props) {
  const showingChildren = Boolean(tempSelectedSubCategory && childCategories.length > 0);
  const title = showingChildren
    ? "Select Child Category"
    : tempSelectedCategory
      ? "Select Sub Category"
      : "Select Category";

  const searchPlaceholder = showingChildren
    ? "Search child category"
    : tempSelectedCategory
      ? "Search sub category"
      : "Search category";

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onBack}>
      <View style={styles.container}>
        <View style={styles.header}>
          {tempSelectedCategory ? (
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={28} color={COLORS.text} />
            </TouchableOpacity>
          ) : null}
          <ThemedText style={styles.title}>{title}</ThemedText>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {tempSelectedCategory && (
          <View style={styles.breadcrumbContainer}>
            <ThemedText style={styles.breadcrumbText}>
              {tempSelectedCategory.name}
              {tempSelectedSubCategory ? (
                <ThemedText style={{ color: COLORS.gray }}>
                  {" > "}
                  <ThemedText style={{ fontWeight: "600", color: COLORS.text }}>
                    {tempSelectedSubCategory.name}
                  </ThemedText>
                </ThemedText>
              ) : null}
            </ThemedText>
          </View>
        )}

        <View style={styles.searchWrapper}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color={COLORS.gray} />
            <TextInput
              style={styles.searchInput}
              placeholder={searchPlaceholder}
              value={categorySearchQuery}
              onChangeText={onSearchChange}
              placeholderTextColor={COLORS.gray}
            />
          </View>
        </View>

        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        >
          {!tempSelectedCategory &&
            categories
              .filter((cat: any) =>
                cat?.name?.toLowerCase().includes(categorySearchQuery.toLowerCase())
              )
              .map((cat: any) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.item}
                  onPress={() => onSelectCategory(cat)}
                >
                  <View style={styles.itemLeft}>
                    <Ionicons
                      name="list-outline"
                      size={20}
                      color={COLORS.primary}
                      style={{ marginRight: 16 }}
                    />
                    <ThemedText style={styles.itemText}>{cat.name}</ThemedText>
                  </View>
                  {!isMatrimonyCategoryName(cat.name) && (
                    <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
                  )}
                </TouchableOpacity>
              ))}

          {tempSelectedCategory &&
            !tempSelectedSubCategory &&
            subCategories
              .filter(
                (subCat: any) =>
                  subCat.category_id === tempSelectedCategory.id &&
                  subCat?.name?.toLowerCase().includes(categorySearchQuery.toLowerCase())
              )
              .map((subCat: any) => (
                <TouchableOpacity
                  key={subCat.id}
                  style={styles.item}
                  onPress={() => onSelectSubCategory(subCat, tempSelectedCategory)}
                  disabled={loadingChildrenForId !== null}
                >
                  <View style={styles.itemLeft}>
                    <Ionicons
                      name="pricetag-outline"
                      size={20}
                      color={COLORS.primary}
                      style={{ marginRight: 16 }}
                    />
                    <ThemedText style={styles.itemText}>{subCat.name}</ThemedText>
                  </View>
                  {loadingChildrenForId === subCat.id ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
                  )}
                </TouchableOpacity>
              ))}

          {showingChildren &&
            childCategories
              .filter((child: any) =>
                child?.name?.toLowerCase().includes(categorySearchQuery.toLowerCase())
              )
              .map((child: any) => (
                <TouchableOpacity
                  key={child.id}
                  style={styles.item}
                  onPress={() => onSelectChildCategory(child)}
                >
                  <View style={styles.itemLeft}>
                    <Ionicons
                      name="git-branch-outline"
                      size={20}
                      color={COLORS.primary}
                      style={{ marginRight: 16 }}
                    />
                    <ThemedText style={styles.itemText}>{child.name}</ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
                </TouchableOpacity>
              ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: { marginRight: 16 },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  closeBtn: { padding: 4 },
  breadcrumbContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  breadcrumbText: {
    fontSize: 14,
    color: COLORS.text,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: COLORS.text,
  },
  list: { flex: 1 },
  listContent: { paddingBottom: 20 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemText: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.text,
  },
});
