import EditProfileModal from "@/components/modals/EditProfileModal";
import GetVerifiedProfileModal from "@/components/modals/GetVerifiedProfileModal";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS } from "@/constants/Colors";
import { getPolicyApi, getUserDetailsApi, ImageUrl, logoutUser, updateUserProfileUrl } from "@/constants/functions";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { setUser, updateUserProfile } from "@/store/reducers/authReducer";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

interface User {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  street?: string;
  pincode?: string;
  state_id?: number;
  city_id?: number;
  AadharImage?: string;
  is_verify?: number;
  created_at?: string;
  selfieverificationImage?: string;
  documentType?: string;
  id?: number;
}

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user }: { user: User } = useSelector((state: any) => state.entities.authReducer);
  const { states, cities, localities } = useSelector((state: any) => state.entities.userReducer);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [policyPages, setPolicyPages] = useState<any[]>([]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await getUserDetailsApi(user?.id, dispatch);
    setRefreshing(false);
  };

  useEffect(() => {
    getPolicyApi()
      .then((res: any) => setPolicyPages(res?.data || []))
      .catch(() => {});
  }, []);

  const hasFile = (value?: string | boolean | null) => Boolean(value) && value !== "0";
  const details = [
    { icon: "person-outline", label: "Full Name", value: user?.name || "—", verified: !!user?.name },
    { icon: "call-outline", label: "Mobile No.", value: user?.phone ? `+91  ${user?.phone}` : "—", verified: !!user?.phone },
    { icon: "mail-outline", label: "Email", value: user?.email || "—", verified: !!user?.email },
    { icon: "location-outline", label: "Address", value: user?.address || "—", verified: !!user?.address },
    { icon: "card-outline", label: "ID Proof", value: hasFile(user?.AadharImage) ? "Aadhaar Card" : "Not Uploaded", verified: hasFile(user?.AadharImage) },
    { icon: "camera-outline", label: "Selfie", value: hasFile(user?.selfieverificationImage) ? "Verified" : "Not Uploaded", verified: hasFile(user?.selfieverificationImage) },
  ];

  const visibleMenuItems = policyPages
    .filter((page: any) => page?.is_active === true)
    .map((page: any) => ({
      icon: "document-text-outline",
      title: page.title.length > 35 ? page.title.slice(0, 32) + "..." : page.title || "Policy",
      pageType: page.page_type,
    }));

  const hasVerificationDocuments = hasFile(user?.AadharImage) && hasFile(user?.selfieverificationImage);
  const isVerified = user?.is_verify === 1 && hasVerificationDocuments;
  const isPending = user?.is_verify === 2 && hasVerificationDocuments;

  const getMemberSince = () => {
    if (!user?.created_at) return "May 2024";
    const date = new Date(user.created_at);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const handleMenuPress = async (title: string, pageType: string) => {
    let responseData = undefined;
    try {
      responseData = await getPolicyApi();
    } catch (error) {
      console.log(error, "Failed to fetch policy data");
    }
    router.push({
      pathname: "/stacks/policy" as any,
      params: {
        title: title,
        pageType: pageType,
        ...(responseData ? { data: JSON.stringify(responseData) } : {}),
      },
    });
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => logoutUser(dispatch, router, "user"),
      },
    ]);
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleSaveProfile = async (data: {
    name: string;
    email: string;
    phone: string;
    address: string;
    street: string;
    pincode: string;
    state_id: number | null;
    city_id: number | null;
    locality_id: number | null;
  }) => {
    try {
      await dispatch(updateUserProfile(updateUserProfileUrl, data));
      setShowEditModal(false);
      await AsyncStorage.setItem("user", JSON.stringify({ ...user, ...data }));
    } catch (error: any) {
      console.log(error, "error");
      Alert.alert(
        "Update Failed",
        error?.response?.data?.message || "Failed to update profile. Please try again."
      );
    }
  };

  const handlePostAd = () => {
    router.push("/(tabs)/post");
  };

  const handleOpenVerificationModal = () => {
    setShowVerificationModal(true);
  };

  const handleCloseVerificationModal = () => {
    setShowVerificationModal(false);
  };

  const handleVerificationSubmit = async (data: any) => {
    try {
      const result: any = await dispatch(updateUserProfile(updateUserProfileUrl, {
        name: data.fullName,
        email: data.email,
        phone: data.mobileNumber,
        address: data.address || "",
        state_id: data.state?.id || null,
        city_id: data.city?.id || null,
        locality_id: data.locality?.id || null,
        AadharImage: data.AadharImage || "",
        selfieverificationImage: data.selfieverificationImage || "",
        documentType: data.documentType || "",
        Isagreeprivacy: true,
      }));
      const updatedUser = result?.data;
      if (updatedUser) {
        const mergedUser = { ...updatedUser, is_verify: 2, documentType: data.documentType || updatedUser.documentType };
        dispatch(setUser(mergedUser));
        await AsyncStorage.setItem("user", JSON.stringify(mergedUser));
      }
      if (result?.access_token) {
        await AsyncStorage.setItem("authToken", result.access_token);
      }
      setShowVerificationModal(false);
      router.push("/stacks/verificationPending" as any);
    } catch (error: any) {
      console.log(error, "error");
      Alert.alert(
        "Verification Failed",
        error?.response?.data?.message || "Failed to submit verification. Please try again."
      );
    }
  };
  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />
        }
      >
        {/* Blue Header */}
        <LinearGradient colors={["#1565C0", "#1E88E5"]} style={styles.header}>
          <View style={styles.headerTop}>
            <ThemedText style={styles.headerTitle}>My Profile</ThemedText>
          </View>
          {/* Profile Card in Header */}
          <View style={styles.profileCard}>
            <View style={styles.profileLeft}>
              <View style={styles.avatarWrap}>
                {user?.selfieverificationImage ? (
                  <Image
                    source={{ uri: `${ImageUrl}/${user?.selfieverificationImage}` }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person-outline" size={24} color={COLORS.text} />
                  </View>
                )}
                {isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  </View>
                )}
              </View>
              <View style={styles.profileInfo}>
                <ThemedText style={styles.userName}>{user?.name || "User"}</ThemedText>
                <View style={styles.idBadge}>
                  <ThemedText style={styles.idText}>User ID: #{user?.id}</ThemedText>
                </View>
                {isVerified && (
                  <View style={styles.verifiedSellerBadge}>
                    <Ionicons name="checkmark-circle" size={12} color="#4CAF50" />
                    <ThemedText style={styles.verifiedSellerText}>Verified Seller</ThemedText>
                  </View>
                )}
                <ThemedText style={styles.memberSince}>Member since {getMemberSince()}</ThemedText>
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.8)" />
                  <ThemedText style={styles.locationText} numberOfLines={1}>
                    {user?.address}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Verification Banner */}
        {isVerified ? (
          <TouchableOpacity
            style={styles.verificationBanner}
            onPress={() =>
              router.push({
                pathname: "/stacks/verificationSuccess" as any,
                params: {
                  name: user?.name,
                  phone: user?.phone,
                  email: user?.email,
                  address: user?.address,
                  selfieverificationImage: user?.selfieverificationImage,
                  documentType: user?.documentType || "",
                },
              })
            }
            activeOpacity={0.8}
          >
            <View style={styles.verificationIcon}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            </View>
            <View style={styles.verificationText}>
              <ThemedText style={styles.verificationTitle}>Your profile is verified!</ThemedText>
              <ThemedText style={styles.verificationSubtitle}>
                Tap to view your verified details.
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#4CAF50" />
          </TouchableOpacity>
        ) : isPending ? (
          <TouchableOpacity
            style={styles.verificationBannerPending}
            onPress={() => router.push("/stacks/verificationPending" as any)}
            activeOpacity={0.8}
          >
            <View style={styles.verificationIconPending}>
              <Ionicons name="time-outline" size={24} color="#F59E0B" />
            </View>
            <View style={styles.verificationText}>
              <ThemedText style={styles.verificationTitlePending}>Verification Under Review</ThemedText>
              <ThemedText style={styles.verificationSubtitlePending}>
                Our team is reviewing your documents.
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#F59E0B" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.verificationBannerPending} onPress={handleOpenVerificationModal}>
            <View style={styles.verificationIconPending}>
              <Ionicons name="shield-checkmark" size={24} color="#1565C0" />
            </View>
            <View style={styles.verificationText}>
              <ThemedText style={styles.verificationTitlePending}>Get Verified!</ThemedText>
              <ThemedText style={styles.verificationSubtitlePending}>
                Verify your profile to build trust.
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#1565C0" />
          </TouchableOpacity>
        )}
        {isVerified && (
        <View style={styles.infoCard}>
          {details.map((item, index) => (
            <View
              key={item.label}
              style={[styles.detailRow, index < details.length - 1 && styles.detailRowBorder]}
            >
              <View style={styles.detailLeft}>
                <View style={styles.detailIconBox}>
                  <Ionicons name={item.icon as any} size={16} color="#1565C0" />
                </View>
                <ThemedText style={styles.detailLabel}>{item.label}</ThemedText>
              </View>
              <ThemedText style={styles.detailValue} numberOfLines={1}>{item.value}</ThemedText>
              {item.verified ? (
                <View style={styles.verifiedPill}>
                  <Ionicons name="checkmark-circle" size={12} color="#2E7D32" />
                  <ThemedText style={styles.verifiedPillText}>Verified</ThemedText>
                </View>
              ) : (
                <View style={styles.pendingPill}>
                  <Ionicons name="alert-circle" size={12} color="#B45309" />
                  <ThemedText style={styles.pendingPillText}>Pending</ThemedText>
                </View>
              )}
            </View>
          ))}
        </View>
        )}
        {/* My Information Section */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <ThemedText style={styles.sectionTitle}>My Information</ThemedText>
            <TouchableOpacity onPress={handleEditProfile}>
              <ThemedText style={styles.editLink}>Edit</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoItemLeft}>
              <Ionicons name="person-outline" size={18} color={COLORS.gray} />
              <ThemedText style={styles.infoLabel}>Full Name</ThemedText>
            </View>
            <View style={styles.infoItemRight}>
              <ThemedText style={styles.infoValue}>{user?.name}</ThemedText>
              <Ionicons name="chevron-forward" size={18} color={COLORS.lightGray} />
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoItemLeft}>
              <Ionicons name="call-outline" size={18} color={COLORS.gray} />
              <ThemedText style={styles.infoLabel}>Mobile Number</ThemedText>
            </View>
            <View style={styles.infoItemRight}>
              <ThemedText style={styles.infoValue}>{(user?.phone || "")}</ThemedText>
              <Ionicons name="chevron-forward" size={18} color={COLORS.lightGray} />
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoItemLeft}>
              <Ionicons name="mail-outline" size={18} color={COLORS.gray} />
              <ThemedText style={styles.infoLabel}>Email</ThemedText>
            </View>
            <View style={styles.infoItemRight}>
              <ThemedText style={styles.infoValue}>{user?.email}</ThemedText>
              <Ionicons name="chevron-forward" size={18} color={COLORS.lightGray} />
            </View>
          </View>

          <View style={[styles.infoItem, styles.infoItemLast, { alignItems: "flex-start" }]}>
            <View style={[styles.infoItemLeft, { paddingTop: 2 }]}>
              <Ionicons name="location-outline" size={18} color={COLORS.gray} />
              <ThemedText style={styles.infoLabel}>Location</ThemedText>
            </View>
            <View style={[styles.infoItemRight, styles.infoItemRightFlex]}>
              <ThemedText style={[styles.infoValue, { flex: 1, textAlign: "right" }]}>
                {user?.address}
              </ThemedText>
              <Ionicons name="chevron-forward" size={18} color={COLORS.lightGray} />
            </View>
          </View>
        </View>

        {/* Verification Details Section */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <ThemedText style={styles.sectionTitle}>Verification Details</ThemedText>
            {isVerified && (
              <View style={styles.verifiedTag}>
                <ThemedText style={styles.verifiedTagText}>Verified</ThemedText>
              </View>
            )}
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoItemLeft}>
              <Ionicons name="id-card-outline" size={18} color={COLORS.gray} />
              <View>
                <ThemedText style={styles.infoLabel}>ID Proof</ThemedText>
                <ThemedText style={styles.infoSubLabel}>Aadhaar Card</ThemedText>
              </View>
            </View>
            {hasFile(user?.AadharImage) ? (
              <Ionicons name="checkmark-circle" size={22} color="#4CAF50" />
            ) : (
              <Ionicons name="ellipse-outline" size={22} color={COLORS.lightGray} />
            )}
          </View>

          <View style={[styles.infoItem, styles.infoItemLast]}>
            <View style={styles.infoItemLeft}>
              <Ionicons name="person-outline" size={18} color={COLORS.gray} />
              <View>
                <ThemedText style={styles.infoLabel}>Selfie</ThemedText>
                <ThemedText style={styles.infoSubLabel}>{hasFile(user?.selfieverificationImage) ? "Verified" : "Not Verified"}</ThemedText>
              </View>
            </View>
            {hasFile(user?.selfieverificationImage) ? (
              <Ionicons name="checkmark-circle" size={22} color="#4CAF50" />
            ) : (
              <Ionicons name="ellipse-outline" size={22} color={COLORS.lightGray} />
            )}
          </View>
        </View>

        {/* Verified Seller Banner */}
        {isVerified && (
          <View style={styles.sellerBanner}>
            <View style={styles.sellerBannerLeft}>
              <View style={styles.shieldIcon}>
                <Ionicons name="shield-checkmark" size={24} color="#1565C0" />
              </View>
              <View style={styles.sellerBannerText}>
                <ThemedText style={styles.sellerBannerTitle}>You are a Verified Seller</ThemedText>
                <ThemedText style={styles.sellerBannerSubtitle}>
                  Your ads get more trust and visibility.
                </ThemedText>
              </View>
            </View>
            <TouchableOpacity style={styles.postAdBtn} onPress={handlePostAd}>
              <ThemedText style={styles.postAdBtnText}>Post Ad</ThemedText>
            </TouchableOpacity>
          </View>
        )}
        {/* Menu Items */}
        <View style={styles.menuCard}>
          {visibleMenuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, index === visibleMenuItems.length - 1 && styles.menuItemLast]}
              onPress={() => handleMenuPress(item.title, item.pageType)}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: COLORS.primary }]}>
                  <Ionicons name={item.icon as any} size={20} color={COLORS.white} />
                </View>
                <ThemedText style={styles.menuLabel}>{item.title}</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
          <ThemedText style={styles.logoutText}>Logout</ThemedText>
        </TouchableOpacity>

        {/* Version */}
        <ThemedText style={styles.versionText}>
          Version {Constants.expoConfig?.version || "1.0.0"}
        </ThemedText>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isVisible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveProfile}
        userData={user}
        states={states || []}
        cities={cities || []}
        localities={Array.isArray(localities) ? localities : []}
      />

      {/* Get Verified Profile Modal */}
      <GetVerifiedProfileModal
        isVisible={showVerificationModal}
        onClose={handleCloseVerificationModal}
        onSubmit={handleVerificationSubmit}
        userData={user}
        states={states || []}
        cities={cities || []}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  /* Header */
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingHorizontal: SIZES.padding,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.white,
  },

  /* Profile Card in Header */
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.4)",
  },
  profileLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.4)",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 2,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
  },
  idBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginTop: 3,
  },
  idText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
  },
  verifiedSellerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  verifiedSellerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#81C784",
  },
  memberSince: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    flex: 1,
  },

  /* Verification Banner - Success State (Green) */
  verificationBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    marginHorizontal: SIZES.padding,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  verificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#C8E6C9",
    justifyContent: "center",
    alignItems: "center",
  },
  verificationText: {
    flex: 1,
  },
  verificationTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1B5E20",
  },
  verificationSubtitle: {
    fontSize: 13,
    color: "#2E7D32",
    marginTop: 2,
  },

  /* Verification Banner - Pending State (Blue) */
  verificationBannerPending: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    marginHorizontal: SIZES.padding,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  verificationIconPending: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#BBDEFB",
    justifyContent: "center",
    alignItems: "center",
  },
  verificationTitlePending: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0D47A1",
  },
  verificationSubtitlePending: {
    fontSize: 13,
    color: "#1565C0",
    marginTop: 2,
  },

  /* Stats Card */
  statsCard: {
    marginHorizontal: SIZES.padding,
    marginTop: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },

  /* Info Card */
  infoCard: {
    marginHorizontal: SIZES.padding,
    marginTop: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  editLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1565C0",
  },
  verifiedTag: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedTagText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2E7D32",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  infoItemLast: {
    borderBottomWidth: 0,
  },
  infoItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoItemRightFlex: {
    flex: 1,
    justifyContent: "flex-end",
    maxWidth: "60%",
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: "700",
  },
  infoSubLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
  },

  /* Seller Banner */
  sellerBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.padding,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sellerBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  sellerBannerText: {
    flex: 1,
    minWidth: 0,
  },
  shieldIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  sellerBannerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    flexShrink: 1,
  },
  sellerBannerSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
    flexShrink: 1,
  },
  postAdBtn: {
    backgroundColor: "#1565C0",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 12,
    flexShrink: 0,
  },
  postAdBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
  },

  /* Menu Card */
  menuCard: {
    marginHorizontal: SIZES.padding,
    marginTop: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.text,
  },

  /* Logout */
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginHorizontal: SIZES.padding,
    marginTop: 20,
    paddingVertical: 14,
    backgroundColor: "#FFEBEE",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.error,
  },

  /* Version */
  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 16,
  },


  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
    overflow: "hidden",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    paddingVertical: 10,
    // gap: 5,
  },
  detailRowBorder: { borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  detailLeft: { flexDirection: "row", alignItems: "center", gap: 7, flex: 1 },
  detailIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  detailLabel: { fontSize: 12, color: "#6B7280", fontWeight: "500" },
  detailValue: { fontSize: 12, color: "#111827", fontWeight: "600", flex: 1 },
  verifiedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#DCFCE7",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  verifiedPillText: { fontSize: 11, fontWeight: "700", color: "#2E7D32" },
  pendingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#FEF3C7",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pendingPillText: { fontSize: 11, fontWeight: "700", color: "#B45309" },

  fullVerifiedBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    marginBottom: 14,
  },
  fullVerifiedTitle: { fontSize: 13, fontWeight: "700", color: "#1565C0", marginBottom: 2 },
  fullVerifiedSub: { fontSize: 12, color: "#1E40AF", lineHeight: 17 },

});
