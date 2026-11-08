import LoadMoreButton, { PAGE_SIZE } from "@/components/buttons/LoadMoreButton";
import { MatrimonyCard } from "@/components/cards/MatrimonyCard";
import FilterSheet from "@/components/filters/FilterSheet";
import { useListFilters } from "@/components/filters/useListFilters";
import ThemeHeader from "@/components/headers/ThemeHeader";
import { HowToPostAdSection } from "@/components/home/HowToPostAdSection";
import { MatrimonyPromotion } from "@/components/home/MatrimonyPromotion";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS } from "@/constants/Colors";
import { getMatrimonyMasterDataApi, getMatrimonyProfilesApi, searchMatrimonyProfilesApi } from "@/constants/functions";
import { getActiveMasterItems, getProfileMasterName } from "@/constants/matrimony";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, BackHandler, Dimensions, FlatList, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - SIZES.padding * 2 - 12) / 2;

/** Local fallback when the search endpoint is unavailable. */
const matchesSearch = (profile: any, query: string) =>
  [
    profile?.full_name,
    profile?.profile_title,
    getProfileMasterName(profile, "religion"),
    getProfileMasterName(profile, "caste_community"),
    profile?.city?.name ?? profile?.city,
    profile?.user?.city?.name,
  ].some((value) => String(value ?? "").toLowerCase().includes(query));

export default function SeeAllMatrimonyScreen() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchRows, setSearchRows] = useState<any[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [masters, setMasters] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);

  const query = searchQuery.trim().toLowerCase();

  const loadPage = useCallback(async (page: number) => {
    try {
      const paginator: any = await getMatrimonyProfilesApi(page, PAGE_SIZE);
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
    getMatrimonyMasterDataApi()
      .then((data: any) =>
        setMasters({
          religions: getActiveMasterItems(data, "religions"),
          maritalStatuses: getActiveMasterItems(data, "marital_statuses"),
          casteCommunities: getActiveMasterItems(data, "caste_communities"),
        })
      )
      .catch(() => {});
  }, [loadPage]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      router.back();
      return true;
    });
    return () => backHandler.remove();
  }, [router]);

  // Debounced server search; null result means "use the local match".
  useEffect(() => {
    if (!query) {
      setSearchRows(null);
      setSearching(false);
      return;
    }
    setSearching(true);
    let cancelled = false;
    const timer = setTimeout(() => {
      searchMatrimonyProfilesApi(query).then((rows: any[] | null) => {
        if (cancelled) return;
        setSearchRows(rows);
        setSearching(false);
      });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const searchedProfiles = useMemo(() => {
    if (!query) return profiles;
    return searchRows ?? profiles.filter((profile) => matchesSearch(profile, query));
  }, [profiles, query, searchRows]);

  const { rows, sections, filters, setFilters, defaults, activeCount } = useListFilters("matrimony", searchedProfiles, { masters });
  // With a search or filter active the list is a result set, not the paged feed.
  const canPage = !query && activeCount === 0;

  const loadMore = async () => {
    if (!canPage || loadingMore || !hasMoreRef.current) return;
    setLoadingMore(true);
    await loadPage(pageRef.current + 1);
    setLoadingMore(false);
  };

  const listHeader = (
    <View style={styles.headerBlock}>
      <MatrimonyPromotion />
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={COLORS.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, religion, city..."
          placeholderTextColor={COLORS.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          autoCorrect={false}
        />
        {searching ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : searchQuery.length > 0 ? (
          <TouchableOpacity onPress={() => setSearchQuery("")} hitSlop={8}>
            <Ionicons name="close-circle" size={20} color={COLORS.gray} />
          </TouchableOpacity>
        ) : null}
      </View>
      {(query || activeCount > 0) && (
        <ThemedText style={styles.resultCount}>
          {rows.length} profile{rows.length === 1 ? "" : "s"} found
        </ThemedText>
      )}
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemeHeader
        onBackPress={() => router.back()}
        title="Matrimony"
        rightIcon="options-outline"
        onRightPress={() => setShowFilters(true)}
        rightBadge={activeCount}
      />
      {loading ? (
        <ActivityIndicator style={styles.loader} color={COLORS.primary} />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={listHeader}
          renderItem={({ item }) => <MatrimonyCard item={item} width={CARD_WIDTH} />}
          ListFooterComponent={
            <>
              {canPage && hasMoreRef.current ? <LoadMoreButton loading={loadingMore} onPress={loadMore} /> : null}
              <HowToPostAdSection placement="matrimony" style={styles.howTo} />
            </>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name={query || activeCount > 0 ? "search-outline" : "heart-outline"} size={48} color={COLORS.gray} />
              <ThemedText style={styles.emptyText}>
                {query || activeCount > 0 ? "No profiles match your search" : "No matrimony profiles yet"}
              </ThemedText>
            </View>
          }
        />
      )}
      <FilterSheet
        visible={showFilters}
        sections={sections}
        value={filters}
        defaultValue={defaults}
        onClose={() => setShowFilters(false)}
        onApply={(next) => {
          setFilters(next);
          setShowFilters(false);
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loader: { marginTop: 40 },
  list: { padding: SIZES.padding, paddingBottom: 40, gap: 12 },
  row: { gap: 12 },
  headerBlock: { gap: 0 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.text, paddingVertical: 11 },
  resultCount: { fontSize: 12, color: COLORS.gray, marginTop: 6 },
  howTo: { marginTop: 16 },
  empty: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyText: { fontSize: 14, color: COLORS.gray },
});
