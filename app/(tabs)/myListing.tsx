import ThemeHeader from "@/components/headers/ThemeHeader";
import EditPriceModal from "@/components/modals/EditPriceModal";
import MatrimonyRenewPlanModal, { isMatrimonyProfileExpired } from "@/components/modals/MatrimonyRenewPlanModal";
import { isBannerWebsiteLinkVerified } from "@/components/post/postUtils";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import AppToast from "@/components/toasts/AppToast";
import { COLORS } from "@/constants/Colors";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { createConversationApi, deleteMyAdApi, favoritesUrl, getApiErrorMessage, getMyBannerAdsUrl, getMyFeaturedAdsUrl, getMatrimonyPaymentHistoryApi, getMyMatrimonyProfilesApi, getMyProductsUrl, ImageUrl, removeFromFavoritesApi, updateMyAdPriceApi } from "@/constants/functions";
import { getProfileAge, getProfileMasterName, getProfilePhoto } from "@/constants/matrimony";
import { addFavoriteItem, getFavoritesApi, getMyBannerAdsApi, getMyFeaturedAdsApi, getMyProductsApi, removeFavoriteById } from "@/store/reducers/userReducer";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

const { width } = Dimensions.get("window");
const FILTER_CARD_GAP = 8;
const FILTER_CARD_COLUMNS = 4;
const filterCardWidth =
  (width - SIZES.padding * 2 - FILTER_CARD_GAP * (FILTER_CARD_COLUMNS - 1)) /
  FILTER_CARD_COLUMNS;

const filterOptions = [
  { id: 'normal', label: 'Normal Ads', icon: 'card-outline', color: '#2E7D32', bgColor: '#E8F5E9', borderColor: '#C8E6C9' },
  { id: 'featured', label: 'Featured Ads', icon: 'star-outline', color: '#E65100', bgColor: '#FFF3E0', borderColor: '#FFE0B2' },
  { id: 'banner', label: 'Banner Ads', icon: 'images-outline', color: '#7B1FA2', bgColor: '#F3E5F5', borderColor: '#E1BEE7' },
  { id: 'pending', label: 'Pending Ads', icon: 'time-outline', color: '#F57F17', bgColor: '#FFF8E1', borderColor: '#FFECB3' },
  { id: 'favorites', label: 'Favorite Ads', icon: 'heart-outline', color: '#f5af19', bgColor: '#f5af1915', borderColor: '#f5af1915' },
  { id: 'renewed', label: 'Renewed Ads', icon: 'refresh-outline', color: '#1565C0', bgColor: '#1565C015', borderColor: '#1565C015' },
  { id: 'matrimony', label: 'Matrimony', icon: 'heart-circle-outline', color: '#C2185B', bgColor: '#FCE4EC', borderColor: '#F8BBD0' },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case "approved":
      return {
        color: COLORS.success,
        bgColor: COLORS.success + "15",
        icon: "checkmark-circle",
        label: "Approved",
      };
    case "pending":
      return {
        color: "#f5af19",
        bgColor: "#f5af1915",
        icon: "time",
        label: "Pending",
      };
    case "rejected":
      return {
        color: COLORS.error,
        bgColor: COLORS.error + "15",
        icon: "close-circle",
        label: "Rejected",
      };
    case "expired":
      return {
        color: COLORS.error,
        bgColor: COLORS.error + "15",
        icon: "time",
        label: "Expired",
      };
    default:
      return {
        color: COLORS.gray,
        bgColor: COLORS.gray + "15",
        icon: "help-circle",
        label: "Unknown",
      };
  }
};

export default function MyListingsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { favorites, myFeaturedAds, myBannerAds, myProducts, featuredAds, banners } = useSelector((state: any) => state.entities.userReducer) || {};
  const { user: currentUser } = useSelector((state: any) => state.entities.authReducer) || {};
  const currentUserId = currentUser?.id ?? currentUser?.user_id;
  const [myMatrimonyProfiles, setMyMatrimonyProfiles] = useState<any[]>([]);
  const [matrimonyLoading, setMatrimonyLoading] = useState(false);
  const [matrimonyPaymentHistory, setMatrimonyPaymentHistory] = useState<any>(null);
  const [renewingMatrimonyProfile, setRenewingMatrimonyProfile] = useState<any>(null);
  const safeProducts = Array.isArray(myProducts) ? myProducts : (myProducts?.data || []);
  const safeFavorites = Array.isArray(favorites) ? favorites : [];
  const safeFeaturedList = Array.isArray(featuredAds) ? featuredAds : [];
  const safeBannerList = Array.isArray(banners) ? banners : [];
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('normal');
  const isFavoritesTab = selectedFilter === 'favorites'; 
  const isProductExpired = (product: any) => product?.plan_info?.is_expired === true;
  const getProductStatusConfig = (product: any) =>
    getStatusConfig(isProductExpired(product) ? "expired" : product?.approve);

  const getProductType = (p: any) =>
    String(p?.product_type || p?.plan_info?.plan_type || "normal").toLowerCase();

  const filteredProducts = isFavoritesTab
    ? safeFavorites
      .filter((fav: any) => fav?.product != null)
      .map((fav: any) => {
        const product = fav.product;
        const hasPlan = product?.product_type || product?.plan_info?.plan_type;
        // Favourite payloads carry no plan info, so resolve the ad type from the loaded Featured / Banner lists.
        const bannerRow = hasPlan ? null : safeBannerList.find((b: any) => Number(b?.product?.id) === Number(product?.id));
        const type = hasPlan
          ? undefined
          : bannerRow
          ? "banner"
          : safeFeaturedList.some((a: any) => Number(a?.id) === Number(product?.id))
          ? "featured"
          : undefined;
        return {
          ...product,
          ...(type && { product_type: type }),
          ...(bannerRow && { _bannerRow: bannerRow }),
          _favoritedAt: fav.favorited_at,
          _favoriteRecord: fav,
        };
      })
    : safeProducts.filter((p: any) => {
      const type = getProductType(p);
      if (selectedFilter === 'pending') return p.approve === 'pending';
      if (selectedFilter === 'normal') return p.approve === 'approved' && type === 'normal';
      if (selectedFilter === 'featured') return type === 'featured';
      if (selectedFilter === 'banner') return type === 'banner';
      if (selectedFilter === 'renewed') return isProductExpired(p);
      return true;
    });
  const openDetailModal = (item: any) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleRenew = (product: any) => {
    router.push({
      pathname: "/(tabs)/post",
      params: {
        renewalProduct: JSON.stringify(product),
      },
    });
  };

  const closeDetailModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  // ── Edit price / delete ──
  type AdKind = "normal" | "featured" | "banner" | "matrimony";
  const [editingAd, setEditingAd] = useState<{ kind: AdKind; id: number; price: any; title: string } | null>(null);
  const [savingPrice, setSavingPrice] = useState(false);
  const [chatLoadingId, setChatLoadingId] = useState<number | null>(null);

  const getAdKind = (product: any): AdKind => {
    const type = getProductType(product);
    return type === "featured" || type === "banner" ? (type as AdKind) : "normal";
  };

  const refreshMyAds = () => {
    dispatch(getMyFeaturedAdsApi(`${getMyFeaturedAdsUrl}`));
    dispatch(getMyBannerAdsApi(`${getMyBannerAdsUrl}`));
    dispatch(getMyProductsApi(`${getMyProductsUrl}`));
  };

  const handleSavePrice = async (price: number) => {
    if (!editingAd) return;
    setSavingPrice(true);
    try {
      const res = await updateMyAdPriceApi(editingAd.kind, editingAd.id, price);
      if (res?.success === false || res?.status === false) {
        AppToast(res?.message || "Could not update price.");
        return;
      }
      AppToast(res?.message || "Price updated");
      setEditingAd(null);
      refreshMyAds();
    } catch (error) {
      AppToast(getApiErrorMessage(error, "Could not update price. Please try again."));
    } finally {
      setSavingPrice(false);
    }
  };

  const confirmDelete = (kind: AdKind, id: number, name?: string) => {
    Alert.alert(
      kind === "matrimony" ? "Delete Profile" : "Delete Ad",
      `Delete "${name || (kind === "matrimony" ? "this profile" : "this ad")}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await deleteMyAdApi(kind, id);
              if (res?.success === false || res?.status === false) {
                AppToast(res?.message || "Could not delete.");
                return;
              }
              AppToast(res?.message || "Deleted successfully");
              if (kind === "matrimony") loadMyMatrimonyProfiles();
              else refreshMyAds();
            } catch (error) {
              AppToast(getApiErrorMessage(error, "Could not delete. Please try again."));
            }
          },
        },
      ]
    );
  };

  const confirmRemoveFavorite = (item: any) => {
    const record = item?._favoriteRecord;
    if (!record?.id) return;
    Alert.alert("Remove Favorite", `Remove "${item.name || "this ad"}" from your favorites?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          dispatch(removeFavoriteById(record.id));
          try {
            await removeFromFavoritesApi(record.id);
          } catch {
            dispatch(addFavoriteItem(record));
            AppToast("Could not remove favorite. Please try again.");
          }
        },
      },
    ]);
  };

  const getSellerId = (product: any) => product?.user?.user_id ?? product?.user?.id ?? product?.user_id;

  const handleChatWithSeller = async (product: any) => {
    const vendorId = getSellerId(product);
    if (vendorId == null || chatLoadingId != null) return;
    setChatLoadingId(product.id);
    try {
      const response = await createConversationApi({ vendor_id: vendorId, subject: "Product inquiry" });
      if (response?.id) {
        router.push({
          pathname: "/stacks/chatDetail",
          params: {
            conversation_id: response.id,
            receiverId: response.vendor_id,
            userName: product?.user?.name || "Seller",
          },
        });
      }
    } catch {
    } finally {
      setChatLoadingId(null);
    }
  };

  const renderAdActions = (actions: { icon: string; label: string; color: string; onPress: () => void; loading?: boolean }[]) => (
    <View style={styles.adActionsRow}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.label}
          style={[styles.adActionBtn, { borderColor: action.color + "55", backgroundColor: action.color + "12" }]}
          onPress={(event) => {
            event.stopPropagation();
            action.onPress();
          }}
          disabled={action.loading}
          activeOpacity={0.8}
        >
          <Ionicons name={action.icon as any} size={14} color={action.color} />
          <ThemedText style={[styles.adActionText, { color: action.color }]}>
            {action.loading ? "Please wait..." : action.label}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </View>
  );

  const editPriceAction = (kind: AdKind, id: number, price: any, title: string) => ({
    icon: "pricetag-outline",
    label: "Edit Price",
    color: "#1565C0",
    onPress: () => setEditingAd({ kind, id, price, title }),
  });

  const deleteAction = (kind: AdKind, id: number, name?: string) => ({
    icon: "trash-outline",
    label: "Delete",
    color: COLORS.error,
    onPress: () => confirmDelete(kind, id, name),
  });

  const formatPrice = (price: number) => {
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`;
    }
    return `₹${price.toLocaleString("en-IN")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  useEffect(() => {
    dispatch(getFavoritesApi(`${favoritesUrl}`));
    dispatch(getMyFeaturedAdsApi(`${getMyFeaturedAdsUrl}`));
    dispatch(getMyBannerAdsApi(`${getMyBannerAdsUrl}`));
    dispatch(getMyProductsApi(`${getMyProductsUrl}`));
  }, []);

  const loadMyMatrimonyProfiles = () => {
    if (currentUserId == null) return;
    setMatrimonyLoading(true);
    getMyMatrimonyProfilesApi(currentUserId)
      .then((rows: any[]) => setMyMatrimonyProfiles(rows))
      .catch(() => {})
      .finally(() => setMatrimonyLoading(false));
    getMatrimonyPaymentHistoryApi()
      .then(setMatrimonyPaymentHistory)
      .catch(() => {});
  };

  useEffect(() => {
    if (selectedFilter === 'matrimony') loadMyMatrimonyProfiles();
  }, [selectedFilter, currentUserId]);


  const buildImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    const clean = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
    return `${ImageUrl}/${clean}`;
  };

  const renderListingCard = ({ item }: { item: any }) => {
    const statusConfig = getProductStatusConfig(item);
    const images = Array.isArray(item?.images) ? item.images : [];
    const rawImage = images.length > 0 ? (images[0]?.image_path || images[0]?.path || images[0].image) : null;
    const firstImage = buildImageUrl(typeof rawImage === "string" ? rawImage : rawImage?.image_path);

    return (
      <TouchableOpacity
        style={styles.listingCard}
        activeOpacity={0.8}
        onPress={() =>
          isFavoritesTab
            ? item._bannerRow
              ? router.push({ pathname: "/stacks/bannerDetails", params: { bannerId: String(item._bannerRow.id), bannerData: JSON.stringify(item._bannerRow) } })
              : router.push({ pathname: "/stacks/productDetails", params: { productData: JSON.stringify(item) } })
            : openDetailModal(item)
        }
      >
        {/* Product Image */}
        {firstImage ? (
          <Image
            source={{ uri: firstImage }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <LinearGradient
              colors={["#11998e", "#38ef7d"]}
              style={styles.imagePlaceholderGradient}
            >
              <Ionicons name="cube" size={32} color={COLORS.white} />
            </LinearGradient>
          </View>
        )}

        {/* Product Info */}
        <View style={styles.listingInfo}>
          <View style={styles.listingHeader}>
            <ThemedText style={styles.listingTitle} numberOfLines={1}>
              {item.name}
            </ThemedText>
            {isFavoritesTab ? (
              <View style={[styles.statusBadge, { backgroundColor: "#FCE4EC" }]}>
                <Ionicons name="heart" size={12} color="#E91E63" />
                <ThemedText style={[styles.statusText, { color: "#E91E63" }]}>Saved</ThemedText>
              </View>
            ) : (
              <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                <Ionicons name={statusConfig.icon as any} size={12} color={statusConfig.color} />
                <ThemedText style={[styles.statusText, { color: statusConfig.color }]}>
                  {statusConfig.label}
                </ThemedText>
              </View>
            )}
          </View>

          <ThemedText style={styles.listingDescription} numberOfLines={2}>
            {item.description || "No description"}
          </ThemedText>

          {isFavoritesTab && (
            <View style={styles.favoriteMeta}>
              {(item.category?.name || item.sub_category?.name) && (
                <View style={styles.favoriteMetaRow}>
                  <Ionicons name="folder-outline" size={12} color={COLORS.gray} />
                  <ThemedText style={styles.favoriteMetaText} numberOfLines={1}>
                    {[item.category?.name, item.sub_category?.name].filter(Boolean).join(" › ")}
                  </ThemedText>
                </View>
              )}
              {(item.user?.city?.name || item.user?.state?.name) && (
                <View style={styles.favoriteMetaRow}>
                  <Ionicons name="location-outline" size={12} color={COLORS.gray} />
                  <ThemedText style={styles.favoriteMetaText} numberOfLines={1}>
                    {[item.user?.city?.name, item.user?.state?.name].filter(Boolean).join(", ")}
                  </ThemedText>
                </View>
              )}
              {!!item.user?.name && (
                <View style={styles.favoriteMetaRow}>
                  <Ionicons name="person-outline" size={12} color={COLORS.gray} />
                  <ThemedText style={styles.favoriteMetaText} numberOfLines={1}>{item.user.name}</ThemedText>
                </View>
              )}
            </View>
          )}

          <View style={styles.listingFooter}>
            <ThemedText style={styles.listingPrice}>{formatPrice(item.price)}</ThemedText>
            <View style={styles.listingDate}>
              <Ionicons
                name={isFavoritesTab ? "heart-outline" : "calendar-outline"}
                size={12}
                color={COLORS.gray}
              />
              <ThemedText style={styles.listingDateText}>
                {isFavoritesTab
                  ? formatDate(item._favoritedAt)
                  : formatDate(item.created_at)}
              </ThemedText>
            </View>
          </View>

          {selectedFilter === "renewed" && (
            <TouchableOpacity
              style={styles.renewButton}
              onPress={(event) => {
                event.stopPropagation();
                handleRenew(item);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh-outline" size={14} color={COLORS.white} />
              <ThemedText style={styles.renewButtonText}>Renew Ad</ThemedText>
            </TouchableOpacity>
          )}

          {isFavoritesTab
            ? renderAdActions([
                // Banner and Featured favourites get Call + Chat; Normal gets Chat only.
                ...(getAdKind(item) !== "normal" && item?.user?.phone && Number(getSellerId(item)) !== Number(currentUserId)
                  ? [{
                      icon: "call-outline",
                      label: "Call",
                      color: "#16A34A",
                      onPress: () => Linking.openURL(`tel:${item.user.phone}`).catch(() => AppToast("Could not open the dialer")),
                    }]
                  : []),
                ...(getSellerId(item) != null && Number(getSellerId(item)) !== Number(currentUserId)
                  ? [{
                      icon: "chatbubble-ellipses-outline",
                      label: "Chat",
                      color: "#7C3AED",
                      loading: chatLoadingId === item.id,
                      onPress: () => handleChatWithSeller(item),
                    }]
                  : []),
                { icon: "heart-dislike-outline", label: "Remove", color: COLORS.error, onPress: () => confirmRemoveFavorite(item) },
              ])
            : renderAdActions([
                editPriceAction(getAdKind(item), item.id, item.price, item.name),
                deleteAction(getAdKind(item), item.id, item.name),
              ])}
        </View>
      </TouchableOpacity>
    );
  };

  const isBannerTab = selectedFilter === 'banner';
  const isFeaturedTab = selectedFilter === 'featured';
  const isMatrimonyTab = selectedFilter === 'matrimony';

  const renderMatrimonyCard = ({ item }: { item: any }) => {
    const photo = getProfilePhoto(item, ImageUrl);
    const age = getProfileAge(item);
    const subtitle = [age ? `${age} yrs` : "", getProfileMasterName(item, "height"), getProfileMasterName(item, "religion")]
      .filter(Boolean)
      .join(" • ");
    const isExpired = isMatrimonyProfileExpired(item, matrimonyPaymentHistory);
    const status = isExpired ? "expired" : item?.approve ?? item?.status;
    const statusConfig = typeof status === "string" ? getStatusConfig(status.toLowerCase()) : null;

    return (
      <TouchableOpacity
        style={styles.listingCard}
        activeOpacity={0.8}
        onPress={() =>
          router.push({
            pathname: "/stacks/matrimonyProfileDetails",
            params: { profileData: JSON.stringify(item) },
          })
        }
      >
        {photo ? (
          <Image source={{ uri: photo }} style={styles.productImage} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <LinearGradient colors={['#C2185B', '#F48FB1']} style={styles.imagePlaceholderGradient}>
              <Ionicons name="person" size={32} color={COLORS.white} />
            </LinearGradient>
          </View>
        )}

        <View style={styles.listingInfo}>
          <View style={styles.listingHeader}>
            <ThemedText style={styles.listingTitle} numberOfLines={1}>{item?.full_name || "Profile"}</ThemedText>
            {statusConfig && statusConfig.label !== "Unknown" ? (
              <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                <Ionicons name={statusConfig.icon as any} size={12} color={statusConfig.color} />
                <ThemedText style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</ThemedText>
              </View>
            ) : (
              <View style={[styles.statusBadge, { backgroundColor: '#FCE4EC' }]}>
                <Ionicons name="heart" size={12} color="#C2185B" />
                <ThemedText style={[styles.statusText, { color: '#C2185B' }]}>Matrimony</ThemedText>
              </View>
            )}
          </View>

          <ThemedText style={styles.listingDescription} numberOfLines={2}>
            {item?.profile_title || subtitle || "No description"}
          </ThemedText>

          <View style={styles.listingFooter}>
            <ThemedText style={[styles.listingDescription, { flex: 1 }]} numberOfLines={1}>
              {item?.profile_title ? subtitle : ""}
            </ThemedText>
            {!!item?.created_at && (
              <View style={styles.listingDate}>
                <Ionicons name="calendar-outline" size={12} color={COLORS.gray} />
                <ThemedText style={styles.listingDateText}>{formatDate(item.created_at)}</ThemedText>
              </View>
            )}
          </View>

          {isExpired && (
            <TouchableOpacity
              style={styles.renewButton}
              onPress={(event) => {
                event.stopPropagation();
                setRenewingMatrimonyProfile(item);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh-outline" size={14} color={COLORS.white} />
              <ThemedText style={styles.renewButtonText}>Renew Plan</ThemedText>
            </TouchableOpacity>
          )}

          {/* Matrimony profiles have no price, so only Delete applies. */}
          {renderAdActions([deleteAction("matrimony", item.id, item?.full_name)])}
        </View>
      </TouchableOpacity>
    );
  };

  const renderFeaturedAdCard = ({ item }: { item: any }) => {
    const statusConfig = getStatusConfig(item.approve);
    const featuredImages = Array.isArray(item?.images) ? item.images : [];
    const featuredRaw = featuredImages.length > 0 ? (featuredImages[0]?.image_path || featuredImages[0]?.path || featuredImages[0]) : null;
    const firstImage = buildImageUrl(typeof featuredRaw === "string" ? featuredRaw : featuredRaw?.image_path);

    return (
      <TouchableOpacity style={styles.listingCard} activeOpacity={0.8} onPress={() => openDetailModal(item)}>
        {firstImage ? (
          <Image source={{ uri: firstImage }} style={styles.productImage} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <LinearGradient colors={['#E65100', '#FFB74D']} style={styles.imagePlaceholderGradient}>
              <Ionicons name="star" size={32} color={COLORS.white} />
            </LinearGradient>
          </View>
        )}

        <View style={styles.listingInfo}>
          <View style={styles.listingHeader}>
            <ThemedText style={styles.listingTitle} numberOfLines={1}>{item.name}</ThemedText>
            <View style={[styles.statusBadge, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="star" size={12} color="#E65100" />
              <ThemedText style={[styles.statusText, { color: '#E65100' }]}>Featured</ThemedText>
            </View>
          </View>

          {(item.category || item.sub_category) && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 }}>
              <Ionicons name="folder-outline" size={12} color={COLORS.gray} />
              <ThemedText style={styles.listingDescription} numberOfLines={1}>
                {[item.category?.name, item.sub_category?.name].filter(Boolean).join(' › ')}
              </ThemedText>
            </View>
          )}

          <ThemedText style={styles.listingDescription} numberOfLines={1}>
            {item.description || 'No description'}
          </ThemedText>

          <View style={styles.listingFooter}>
            <ThemedText style={styles.listingPrice}>{formatPrice(item.price)}</ThemedText>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
              <Ionicons name={statusConfig.icon as any} size={12} color={statusConfig.color} />
              <ThemedText style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</ThemedText>
            </View>
          </View>

          {renderAdActions([
            editPriceAction("featured", item.id, item.price, item.name),
            deleteAction("featured", item.id, item.name),
          ])}
        </View>
      </TouchableOpacity>
    );
  };

  const renderBannerAdCard = ({ item }: { item: any }) => {
    const product = item.product;
    const expiryDate = item.expiry_date ? formatDate(item.expiry_date) : null;
    const isExpired = item.expiry_date && new Date(item.expiry_date) < new Date();

    return (
      <View style={styles.bannerCard}>
        {/* Banner Image */}
        {item.banner_image ? (
          <Image
            source={{ uri: item.banner_image }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.bannerImagePlaceholder}>
            <LinearGradient colors={['#7B1FA2', '#E1BEE7']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="images-outline" size={40} color={COLORS.white} />
            </LinearGradient>
          </View>
        )}

        {/* Expiry Badge */}
        {expiryDate && (
          <View style={[styles.expiryBadge, { backgroundColor: isExpired ? COLORS.error + 'DD' : '#1565C0DD' }]}>
            <Ionicons name="time-outline" size={12} color={COLORS.white} />
            <ThemedText style={styles.expiryBadgeText}>
              {isExpired ? 'Expired' : `Expires ${expiryDate}`}
            </ThemedText>
          </View>
        )}

        <View style={styles.bannerBody}>
          {/* Product info */}
          {product && (
            <View style={styles.bannerProductRow}>
              <Ionicons name="cube-outline" size={16} color={COLORS.gray} />
              <ThemedText style={styles.bannerProductName} numberOfLines={1}>
                {product.name}
              </ThemedText>
              <ThemedText style={styles.bannerProductPrice}>
                ₹{product.price?.toLocaleString('en-IN')}
              </ThemedText>
            </View>
          )}

          {/* Links */}
          <View style={styles.bannerLinksRow}>
            {item.banner_video_url ? (
              <View style={styles.bannerLinkChip}>
                <Ionicons name="play-circle-outline" size={14} color='#7B1FA2' />
                <ThemedText style={[styles.bannerLinkText, { color: '#7B1FA2' }]} numberOfLines={1}>
                  Video linked
                </ThemedText>
              </View>
            ) : null}
            {item.website_link ? (
              <View style={styles.bannerLinkChip}>
                <Ionicons name="link-outline" size={14} color='#1565C0' />
                <ThemedText style={[styles.bannerLinkText, { color: '#1565C0' }]} numberOfLines={1}>
                  {isBannerWebsiteLinkVerified(item) ? "Website linked" : "Website link pending verification"}
                </ThemedText>
              </View>
            ) : null}
          </View>

          {renderAdActions([
            ...(product ? [editPriceAction("normal", product.id ?? item.product_id, product.price, product.name)] : []),
            deleteAction("banner", item.id, product?.name),
          ])}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons
          name={isFavoritesTab ? "heart-outline" : isMatrimonyTab ? "heart-circle-outline" : "cube-outline"}
          size={64}
          color={COLORS.gray}
        />
      </View>
      <ThemedText style={styles.emptyTitle}>
        {isFavoritesTab
          ? "No Favorites Yet"
          : isMatrimonyTab
          ? matrimonyLoading ? "Loading profiles..." : "No Matrimony Profiles Yet"
          : "No Listings Yet"}
      </ThemedText>
    </View>
  );
  const renderDetailModal = () => {
    if (!selectedItem) return null;
    const statusConfig = getProductStatusConfig(selectedItem);

    return (
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeDetailModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Product Details</ThemedText>
              <TouchableOpacity onPress={closeDetailModal} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {/* Product Images */}
              {(() => {
                const modalImages = selectedItem?.images?.length > 0
                  ? selectedItem.images
                  : selectedItem?.product?.images?.length > 0
                  ? selectedItem.product.images
                  : [];
                return modalImages.length > 0 ? (
                  <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    style={styles.modalImageScroll}
                  >
                    {modalImages.map((img: any, index: number) => {
                      const uri = buildImageUrl(img.image_path || img.path || img.image);
                      return uri ? (
                        <Image
                          key={index}
                          source={{ uri }}
                          style={styles.modalImage}
                          resizeMode="cover"
                        />
                      ) : null;
                    })}
                  </ScrollView>
                ) : (
                  <View style={styles.modalImagePlaceholder}>
                    <LinearGradient
                      colors={["#11998e", "#38ef7d"]}
                      style={styles.modalImagePlaceholderGradient}
                    >
                      <Ionicons name="cube" size={48} color={COLORS.white} />
                    </LinearGradient>
                  </View>
                );
              })()}


              {/* Product Info */}
              <View style={styles.modalBody}>
                {/* Status Badge */}
                <View style={[styles.modalStatusBadge, { backgroundColor: statusConfig.bgColor }]}>
                  <Ionicons name={statusConfig.icon as any} size={16} color={statusConfig.color} />
                  <ThemedText style={[styles.modalStatusText, { color: statusConfig.color }]}>
                    {statusConfig.label}
                  </ThemedText>
                </View>

                {/* Title & Price */}
                <ThemedText style={styles.modalProductTitle}>{selectedItem.name}</ThemedText>
                <ThemedText style={styles.modalProductPrice}>{formatPrice(selectedItem.price)}</ThemedText>

                {/* Category */}
                {selectedItem.category && (
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="folder-outline" size={18} color={COLORS.gray} />
                    <ThemedText style={styles.modalInfoLabel}>Category:</ThemedText>
                    <ThemedText style={styles.modalInfoValue}>{selectedItem.category.name}</ThemedText>
                  </View>
                )}

                {/* Sub Category */}
                {selectedItem.sub_category && (
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="pricetag-outline" size={18} color={COLORS.gray} />
                    <ThemedText style={styles.modalInfoLabel}>Sub Category:</ThemedText>
                    <ThemedText style={styles.modalInfoValue}>{selectedItem.sub_category.name}</ThemedText>
                  </View>
                )}

                {/* Date */}
                <View style={styles.modalInfoRow}>
                  <Ionicons name="calendar-outline" size={18} color={COLORS.gray} />
                  <ThemedText style={styles.modalInfoLabel}>Posted:</ThemedText>
                  <ThemedText style={styles.modalInfoValue}>{formatDate(selectedItem.created_at)}</ThemedText>
                </View>

                {/* Description */}
                <View style={styles.modalDescriptionSection}>
                  <ThemedText style={styles.modalDescriptionLabel}>Description</ThemedText>
                  <ThemedText style={styles.modalDescription}>
                    {selectedItem.description || "No description provided"}
                  </ThemedText>
                </View>
              </View>
            </ScrollView>

            {/* Close Button */}
            <TouchableOpacity style={styles.modalCloseButton} onPress={closeDetailModal}>
              <ThemedText style={styles.modalCloseButtonText}>Close</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const renderFilters = () => {
    return (
      <View style={styles.filterSection}>
        <View style={styles.filterHeader}>
          <ThemedText style={styles.filterTitle}>My Ads</ThemedText>
        </View>
        <FlatList
          data={filterOptions}
          numColumns={4}
          keyExtractor={(item) => item.id.toString()}
          columnWrapperStyle={{
            justifyContent: "flex-start",
            gap: FILTER_CARD_GAP,
            alignItems: 'center'
          }}
          contentContainerStyle={styles.filterScroll}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: filter }) => {
            const isSelected = selectedFilter === filter.id;

            return (
              <TouchableOpacity
                style={[
                  styles.filterCard,
                  isSelected && {
                    backgroundColor: filter.bgColor,
                    borderColor: filter.color,
                  },
                ]}
                onPress={() => setSelectedFilter(filter.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={filter.icon as any}
                  size={28}
                  color={filter.color}
                  style={{ marginBottom: 6 }}
                />

                <ThemedText
                  style={[
                    styles.filterLabel,
                    isSelected && { color: filter.color },
                  ]}
                >
                  {filter.label}
                </ThemedText>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    );
  };
  return (
    <ThemedView style={styles.container}>
      <ThemeHeader onBackPress={() => router.back()} title="My Listings" />
      {renderFilters()}
      <FlatList
        data={isMatrimonyTab ? myMatrimonyProfiles : isBannerTab ? (myBannerAds || []) : isFeaturedTab ? (myFeaturedAds || []) : filteredProducts}
        renderItem={isMatrimonyTab ? renderMatrimonyCard : isBannerTab ? renderBannerAdCard : isFeaturedTab ? renderFeaturedAdCard : renderListingCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isMatrimonyTab && matrimonyLoading}
            onRefresh={() => { if (isMatrimonyTab) loadMyMatrimonyProfiles(); }}
            tintColor={COLORS.primary}
          />
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

      {/* Product Detail Modal */}
      {renderDetailModal()}
      <EditPriceModal
        visible={!!editingAd}
        title={editingAd?.title}
        currentPrice={editingAd?.price}
        saving={savingPrice}
        onClose={() => setEditingAd(null)}
        onSave={handleSavePrice}
      />
      <MatrimonyRenewPlanModal
        profile={renewingMatrimonyProfile}
        user={currentUser}
        onClose={() => setRenewingMatrimonyProfile(null)}
        onRenewed={loadMyMatrimonyProfiles}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  adActionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  adActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  adActionText: {
    fontSize: 12,
    fontWeight: "700",
  },
  favoriteMeta: {
    gap: 3,
    marginBottom: 4,
  },
  favoriteMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  favoriteMetaText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.gray,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.padding,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  listContent: {
    padding: SIZES.padding,
    paddingBottom: 100,
  },

  /* Filters */
  filterSection: {
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  filterScroll: {
    paddingHorizontal: SIZES.padding,
    gap: 10,
  },
  filterCard: {
    width: filterCardWidth,
    height: 80,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.gray,
    textAlign: 'center',
  },

  /* Stats */
  statsContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 12,
  },

  /* Listing Card */
  listingCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: "hidden",
  },
  imagePlaceholderGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listingInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  listingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  listingTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  listingDescription: {
    fontSize: 12,
    color: COLORS.gray,
    lineHeight: 16,
    marginVertical: 4,
  },
  listingFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listingPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#11998e",
  },
  listingDate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  listingDateText: {
    fontSize: 11,
    color: COLORS.gray,
  },
  renewButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#1565C0",
  },
  renewButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.white,
  },
  listingActions: {
    justifyContent: "space-between",
    marginLeft: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primary + "10",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: COLORS.error + "10",
  },

  /* Empty State */
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.gray + "15",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: "center",
    marginBottom: 24,
  },
  emptyButton: {
    borderRadius: 14,
    overflow: "hidden",
  },
  emptyButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.white,
  },

  /* Banner Ad Card */
  bannerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  bannerImage: {
    width: '100%',
    height: 180,
  },
  bannerImagePlaceholder: {
    width: '100%',
    height: 180,
    overflow: 'hidden',
  },
  expiryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  expiryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
  },
  bannerBody: {
    padding: 14,
    gap: 10,
  },
  bannerProductRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bannerProductName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  bannerProductPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#11998e',
  },
  bannerLinksRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  bannerLinkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bannerLinkText: {
    fontSize: 12,
    fontWeight: '500',
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.padding,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  modalImageScroll: {
    height: 220,
  },
  modalImage: {
    width: width,
    height: 220,
  },
  modalImagePlaceholder: {
    height: 180,
    margin: SIZES.padding,
    borderRadius: 16,
    overflow: "hidden",
  },
  modalImagePlaceholderGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageCountBadge: {
    position: "absolute",
    top: 190,
    right: SIZES.padding,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  imageCountText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: "500",
  },
  modalBody: {
    padding: SIZES.padding,
  },
  modalStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 12,
  },
  modalStatusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  modalProductTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  modalProductPrice: {
    fontSize: 24,
    fontWeight: "800",
    color: "#11998e",
    marginBottom: 16,
  },
  modalInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalInfoLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  modalInfoValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "right",
  },
  modalDescriptionSection: {
    marginTop: 16,
  },
  modalDescriptionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 22,
  },
  modalCloseButton: {
    marginHorizontal: SIZES.padding,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
  },
});
