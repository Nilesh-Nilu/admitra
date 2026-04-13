import ThemedButton from "@/components/buttons/ThemedButton";
import ThemeSelect from "@/components/inputs/ThemeSelect";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS } from "@/constants/Colors";
import { ImageUrl, logoutUser, updateUserProfileUrl } from "@/constants/functions";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { updateUserProfile } from "@/store/reducers/authReducer";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

const MENU_ITEMS = [
  { id: "listings", icon: "📦", label: "My Ads" },
  { id: "chat", icon: "💬", label: "Chats" },
  { id: "help", icon: "❓", label: "Help Center" },
  { id: "contact", icon: "📞", label: "Contact Us" },
  { id: "terms", icon: "📄", label: "Terms & Conditions" },
];

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.entities.authReducer);
  const { states, cities } = useSelector((state: any) => state.entities.userReducer);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedState, setSelectedState] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    street: user?.street || "",
    pincode: user?.pincode || "",
  });

  const filteredCities = selectedState
    ? cities?.filter((city: any) => city.state_id === selectedState.id)
    : [];

  const isVerified = user?.is_verify === 1;

  const maskPhone = (phone: string) => {
    if (!phone || phone.length < 4) return phone || "";
    return `+91 ${phone.slice(0, 2)}XXXX${phone.slice(-2)}`;
  };

  const handleMenuPress = (itemId: string) => {
    switch (itemId) {
      case "listings":
        router.push("/stacks/myListing" as any);
        break;
      case "chat":
        router.push("/(tabs)/chat");
        break;
      case "help":
        router.push("/stacks/faqScreen");
        break;
      case "contact":
        router.push("/stacks/contactUs");
        break;
      case "terms":
        router.push("/stacks/termsConditions");
        break;
    }
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
    setEditForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      street: user?.street || "",
      pincode: user?.pincode || "",
    });
    const userState = states?.find((s: any) => s.id === user?.state_id);
    const userCity = cities?.find((c: any) => c.id === user?.city_id);
    setSelectedState(userState || null);
    setSelectedCity(userCity || null);
    setShowEditModal(true);
  };

  const handleSaveProfile = () => {
    const updatedProfile = {
      ...editForm,
      state_id: selectedState?.id || null,
      city_id: selectedCity?.id || null,
    };
    dispatch(updateUserProfile(updateUserProfileUrl, updatedProfile));
    setShowEditModal(false);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient colors={["#1565C0", "#1E88E5"]} style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={handleEditProfile}>
              <Ionicons name="menu" size={26} color={COLORS.white} />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>My Profile</ThemedText>
            <TouchableOpacity onPress={handleEditProfile}>
              <Ionicons name="person-circle-outline" size={28} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {/* Profile Info */}
          <View style={styles.profileRow}>
            <View style={styles.avatarWrap}>
              <Image
                source={
                  user?.AadharImage
                    ? `${ImageUrl}/${user?.AadharImage}`
                    : "https://i.pravatar.cc/150?img=11"
                }
                style={styles.avatar}
              />
              {isVerified && (
                <View style={styles.verifiedDot}>
                  <Ionicons name="checkmark-circle" size={22} color={COLORS.success} />
                </View>
              )}
            </View>
            <View style={styles.profileText}>
              <ThemedText style={styles.greeting}>
                Hello {user?.name || "User"} 👋
              </ThemedText>
              <ThemedText style={styles.phone}>{maskPhone(user?.phone)}</ThemedText>
              <View
                style={[
                  styles.verifyBadge,
                  { backgroundColor: isVerified ? "#E8F5E9" : "#FFF3E0" },
                ]}
              >
                <ThemedText
                  style={[
                    styles.verifyBadgeText,
                    { color: isVerified ? COLORS.success : "#E65100" },
                  ]}
                >
                  {isVerified ? "Verified" : "Not Verified"}
                </ThemedText>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Get Verified / Edit Profile */}
        <View style={styles.actionSection}>
          {!isVerified && (
            <TouchableOpacity style={styles.getVerifiedBtn}>
              <LinearGradient
                colors={["#1E8E3E", "#2ECC71"]}
                style={styles.getVerifiedGradient}
              >
                <ThemedText style={styles.getVerifiedText}>Get Verified</ThemedText>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
              </LinearGradient>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.editProfileBtn} onPress={handleEditProfile}>
            <Ionicons name="pencil" size={18} color="#1565C0" />
            <ThemedText style={styles.editProfileText}>Edit Profile</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                idx < MENU_ITEMS.length - 1 && styles.menuItemBorder,
              ]}
              onPress={() => handleMenuPress(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <ThemedText style={styles.menuEmoji}>{item.icon}</ThemedText>
                <ThemedText style={styles.menuLabel}>{item.label}</ThemedText>
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
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>Edit Profile</ThemedText>
                <TouchableOpacity
                  onPress={() => setShowEditModal(false)}
                  style={styles.modalCloseBtn}
                >
                  <Ionicons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalForm}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>Name</ThemedText>
                  <TextInput
                    style={styles.input}
                    value={editForm.name}
                    onChangeText={(t) => setEditForm({ ...editForm, name: t })}
                    placeholder="Enter your name"
                    placeholderTextColor={COLORS.gray}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>Email</ThemedText>
                  <TextInput
                    style={[styles.input, { color: COLORS.gray }]}
                    value={editForm.email}
                    editable={false}
                    placeholder="Email"
                    placeholderTextColor={COLORS.gray}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>Phone</ThemedText>
                  <TextInput
                    style={[styles.input, { color: COLORS.gray }]}
                    value={editForm.phone}
                    editable={false}
                    placeholder="Phone"
                    placeholderTextColor={COLORS.gray}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>Address</ThemedText>
                  <TextInput
                    style={styles.input}
                    value={editForm.address}
                    onChangeText={(t) => setEditForm({ ...editForm, address: t })}
                    placeholder="Enter your address"
                    placeholderTextColor={COLORS.gray}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <ThemeSelect
                    label="State"
                    placeholder="Select State"
                    value={selectedState}
                    items={states || []}
                    onSelect={(s: any) => {
                      setSelectedState(s);
                      setSelectedCity(null);
                    }}
                    icon="map-outline"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <ThemeSelect
                    label="City"
                    placeholder={selectedState ? "Select City" : "Select State First"}
                    value={selectedCity}
                    items={filteredCities}
                    onSelect={setSelectedCity}
                    disabled={!selectedState}
                    icon="business-outline"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>Pincode</ThemedText>
                  <TextInput
                    style={styles.input}
                    value={editForm.pincode?.toString()}
                    onChangeText={(t) => setEditForm({ ...editForm, pincode: t })}
                    placeholder="Enter pincode"
                    placeholderTextColor={COLORS.gray}
                    keyboardType="numeric"
                  />
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <ThemedButton
                  buttonText="Cancel"
                  onPress={() => setShowEditModal(false)}
                  style={styles.modalCancelBtn}
                  textStyle={styles.modalCancelBtnText}
                />
                <ThemedButton
                  buttonText="Save Changes"
                  onPress={handleSaveProfile}
                  style={styles.modalSaveBtn}
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    paddingHorizontal: SIZES.padding,
    paddingBottom: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
  },

  /* Profile */
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.4)",
  },
  verifiedDot: {
    position: "absolute",
    bottom: -2,
    left: -2,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 1,
  },
  profileText: {
    flex: 1,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
  },
  phone: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
  verifyBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  verifyBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },

  /* Actions */
  actionSection: {
    paddingHorizontal: SIZES.padding,
    marginTop: 16,
    gap: 10,
  },
  getVerifiedBtn: {
    borderRadius: 12,
    overflow: "hidden",
  },
  getVerifiedGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  getVerifiedText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
  },
  editProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#1565C0",
    backgroundColor: COLORS.white,
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1565C0",
  },

  /* Menu */
  menuSection: {
    marginTop: 20,
    marginHorizontal: SIZES.padding,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  menuEmoji: {
    fontSize: 20,
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
    backgroundColor: COLORS.error + "10",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.error + "30",
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
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  modalForm: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: SIZES.padding,
    paddingTop: 20,
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalCancelBtnText: {
    color: COLORS.text,
  },
  modalSaveBtn: {
    flex: 1,
  },
});
