import { MatrimonyCard } from "@/components/cards/MatrimonyCard";
import ThemeHeader from "@/components/headers/ThemeHeader";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS } from "@/constants/Colors";
import { getMatrimonyProfilesApi } from "@/constants/functions";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, StyleSheet, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - SIZES.padding * 2 - 12) / 2;

export default function SeeAllMatrimonyScreen() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);

  const loadPage = useCallback(async (page: number) => {
    try {
      const paginator: any = await getMatrimonyProfilesApi(page, 20);
      const list = Array.isArray(paginator?.data) ? paginator.data : [];
      setProfiles((prev) => (page === 1 ? list : [...prev, ...list]));
      pageRef.current = page;
      hasMoreRef.current =
        list.length > 0 && (paginator?.last_page == null || page < paginator.last_page);
    } catch (error: any) {
      hasMoreRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadPage(1).finally(() => setLoading(false));
  }, [loadPage]);

  const loadMore = async () => {
    if (loadingMore || !hasMoreRef.current) return;
    setLoadingMore(true);
    await loadPage(pageRef.current + 1);
    setLoadingMore(false);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemeHeader onBackPress={() => router.back()} title="Matrimony" />
      {loading ? (
        <ActivityIndicator style={styles.loader} color={COLORS.primary} />
      ) : (
        <FlatList
          data={profiles}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <MatrimonyCard item={item} width={CARD_WIDTH} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={COLORS.primary} /> : null}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="heart-outline" size={48} color={COLORS.gray} />
              <ThemedText style={styles.emptyText}>No matrimony profiles yet</ThemedText>
            </View>
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loader: { marginTop: 40 },
  list: { padding: SIZES.padding, paddingBottom: 40, gap: 12 },
  row: { gap: 12 },
  empty: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyText: { fontSize: 14, color: COLORS.gray },
});
