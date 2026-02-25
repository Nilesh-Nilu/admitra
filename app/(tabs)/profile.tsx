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
import {  useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

// Role-based configuration
const ROLE_CONFIG = {
  vendor: {
    gradient: ["#11998e", "#38ef7d"] as [string, string],
    icon: "storefront" as const,
    badge: "Verified Seller",
    stats: [
      { key: "listings", label: "Listings", icon: "pricetag" },
      { key: "sold", label: "Sold", icon: "checkmark-done" },
      { key: "rating", label: "Rating", icon: "star", showStar: true },
    ],
  },
  user: {
    gradient: ["#667eea", "#764ba2"] as [string, string],
    icon: "person" as const,
    badge: "Member",
    stats: [
      { key: "orders", label: "Orders", icon: "bag-check" },
      { key: "wishlist", label: "Wishlist", icon: "heart" },
      { key: "reviews", label: "Reviews", icon: "star" },
    ],
  },
};

// Vendor-specific menu sections
const VENDOR_MENU_SECTIONS = [
  // {
  //   title: "Seller Dashboard",
  //   items: [
  //     { id: "listings", icon: "pricetag", label: "My Listings", badge: null },
  //     // { id: "orders-received", icon: "cube", label: "Orders Received", badge: null },
  //   ],
  // },
  {
    title: "Support",
    items: [
      { id: "help", icon: "help-circle", label: "Help Center", badge: null },
      { id: "contact", icon: "chatbox", label: "Contact Us", badge: null },
      { id: "terms", icon: "document-text", label: "Terms & Conditions", badge: null },
    ],
  },
];

// User-specific menu sections
const USER_MENU_SECTIONS = [
  // {
  //   title: "My Activity",
  //   items: [
  //     { id: "orders", icon: "bag-check", label: "My Orders", badge: null },
  //   ],
  // },
  {
    title: "Support",
    items: [
      { id: "help", icon: "help-circle", label: "Help Center", badge: null },
      { id: "contact", icon: "chatbox", label: "Contact Us", badge: null },
      { id: "terms", icon: "document-text", label: "Terms & Conditions", badge: null },
    ],
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch()
  const { user } = useSelector((state: any) => state.entities.authReducer);
  const {states,cities} = useSelector((state: any) => state.entities.userReducer);
  
  const roleConfig = ROLE_CONFIG.user;
  const menuSections = USER_MENU_SECTIONS;

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

  // Filter cities based on selected state
  const filteredCities = selectedState
    ? cities?.filter((city: any) => city.state_id === selectedState.id)
    : [];

  const handleMenuPress = (itemId: string) => {
    switch (itemId) {
      case "listings":
        // Navigate to my listings
        router.push("/stacks/myListing");
        break;
      case "favorites":
        // Navigate to favorites
        break;
      case "orders":
        // Navigate to orders
        break;
      case "reviews":
        // Navigate to reviews
        break;
      case "edit-profile":
        setShowEditModal(true);
        break;
      case "addresses":
        // Navigate to addresses
        break;
      case "notifications":
        // Toggle or navigate
        break;
      case "privacy":
        router.push("/stacks/policy");
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
      default:
        break;
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => logoutUser(dispatch,router,"user"),
        },
      ]
    );
  }

  const handleEditProfile = () => {
    setEditForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      street: user?.street || "",
      pincode: user?.pincode || "",
    });
    
    // Set selected state and city from user data
    const userState = states?.find((s: any) => s.id === user?.state_id);
    const userCity = cities?.find((c: any) => c.id === user?.city_id);
    setSelectedState(userState || null);
    setSelectedCity(userCity || null);
    
    setShowEditModal(true);
  };

  const handleStateSelect = (state: any) => {
    setSelectedState(state);
    setSelectedCity(null); // Reset city when state changes
  };

  const handleCitySelect = (city: any) => {
    setSelectedCity(city);
  };

  const handleSaveProfile = () => {
    // TODO: Implement API call to update profile
    const updatedProfile = {
      ...editForm,
      state_id: selectedState?.id || null,
      city_id: selectedCity?.id || null,
    };
    dispatch(updateUserProfile(updateUserProfileUrl, updatedProfile));
    setShowEditModal(false);
  };

  const renderProfileHeader = () => (
    <LinearGradient
      colors={roleConfig.gradient}
      style={[styles.profileHeader]}
    >
      {/* Role Badge */}
      <View style={styles.roleBadgeHeader}>
        <Ionicons name={roleConfig.icon} size={14} color={COLORS.white} />
        <ThemedText style={styles.roleBadgeHeaderText}>User</ThemedText>
      </View>

      {/* Avatar & Info */}
      <View style={styles.profileInfo}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: roleConfig.gradient[1] + "40" }]}>
            <Image source={user?.AadharImage ? `${ImageUrl}/${user?.AadharImage}` : "https://i.pravatar.cc/150?img=11"} style={styles.avatar} />
          </View>
          {user?.is_verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
            </View>
          )}
        </View>
        <ThemedText style={styles.userName}>{user?.name}</ThemedText>
        <View style={styles.locationRow}>
          <Ionicons name="mail" size={14} color="rgba(255,255,255,0.8)" />
          <ThemedText style={styles.userLocation}>{user?.email}</ThemedText>
        </View>
        {user?.address && (
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color="rgba(255,255,255,0.8)" />
            <ThemedText style={styles.userLocation}>{user?.address}</ThemedText>
          </View>
        )}
      </View>
    </LinearGradient>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <Pressable style={styles.actionBtn} onPress={handleEditProfile}>
        <LinearGradient
          colors={roleConfig.gradient}
          style={styles.actionBtnGradient}
        >
          <Ionicons name="pencil" size={20} color={COLORS.white} />
          <ThemedText style={styles.actionBtnText}>Edit Profile</ThemedText>
        </LinearGradient>
      </Pressable>
    </View>
  );

  const renderMenuSection = (section: typeof USER_MENU_SECTIONS[0], index: number) => (
    <View key={index} style={styles.menuSection}>
      <ThemedText style={[styles.menuSectionTitle, { color: roleConfig.gradient[0] }]}>
        {section.title}
      </ThemedText>
      <View style={styles.menuCard}>
        {section.items.map((item, itemIndex) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              itemIndex < section.items.length - 1 && styles.menuItemBorder,
            ]}
            onPress={() => handleMenuPress(item.id)}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: roleConfig.gradient[0] + "15" }]}>
                <Ionicons name={item.icon as any} size={20} color={roleConfig.gradient[0]} />
              </View>
              <ThemedText style={styles.menuItemLabel}>{item.label}</ThemedText>
            </View>
            <View style={styles.menuItemRight}>
              {item.badge && (
                <View style={[styles.menuBadge, { backgroundColor: roleConfig.gradient[0] }]}>
                  <ThemedText style={styles.menuBadgeText}>{item.badge}</ThemedText>
                </View>
              )}
              <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderEditProfileModal = () => (
    <Modal
      visible={showEditModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowEditModal(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Edit Profile</ThemedText>
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <ScrollView
              style={styles.modalForm}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Name</ThemedText>
                <TextInput
                  style={styles.input}
                  value={editForm.name}
                  onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                  placeholder="Enter your name"
                  placeholderTextColor={COLORS.gray}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Email</ThemedText>
                <TextInput
                  style={styles.input}
                  value={editForm.email}
                  onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                  placeholder="Enter your email"
                  placeholderTextColor={COLORS.gray}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Phone</ThemedText>
                <TextInput
                  style={styles.input}
                  value={editForm.phone}
                  onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
                  placeholder="Enter your phone number"
                  placeholderTextColor={COLORS.gray}
                  keyboardType="phone-pad"
                  editable={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Address</ThemedText>
                <TextInput
                  style={styles.input}
                  value={editForm.address}
                  onChangeText={(text) => setEditForm({ ...editForm, address: text })}
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
                  onSelect={handleStateSelect}
                  icon="map-outline"
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemeSelect
                  label="City"
                  placeholder={selectedState ? "Select City" : "Select State First"}
                  value={selectedCity}
                  items={filteredCities}
                  onSelect={handleCitySelect}
                  disabled={!selectedState}
                  icon="business-outline"
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Pincode</ThemedText>
                <TextInput
                  style={styles.input}
                  value={editForm.pincode?.toString()}
                  onChangeText={(text) => setEditForm({ ...editForm, pincode: text })}
                  placeholder="Enter pincode"
                  placeholderTextColor={COLORS.gray}
                  keyboardType="numeric"
                />
              </View>
            </ScrollView>

            {/* Footer Buttons */}
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
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderProfileHeader()}
        {renderActionButtons()}

        {menuSections.map((section, index) => renderMenuSection(section, index))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
          <ThemedText style={styles.logoutText}>Logout</ThemedText>
        </TouchableOpacity>

        {/* App Version */}
        <ThemedText style={styles.versionText}>
          Version {Constants.expoConfig?.version || "1.0.0"}
        </ThemedText>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      {renderEditProfileModal()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  /* Profile Header */
  profileHeader: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  roleBadgeHeader: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    top: 10,
  },
  roleBadgeHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.white,
  },
  settingsBtn: {
    alignSelf: "flex-end",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    alignItems: "center",
    marginTop: 10,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.white,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  userLocation: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  memberText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.white,
  },

  /* Stats */
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    marginTop: 24,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.white,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  /* Action Buttons */
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: SIZES.padding,
    marginTop: -15,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  actionBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  actionBtnOutline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.white,
  },

  /* Menu */
  menuSection: {
    marginTop: 24,
    paddingHorizontal: SIZES.padding,
  },
  menuSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.gray,
    marginBottom: 12,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
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
    borderBottomColor: COLORS.border,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary + "10",
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.text,
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  menuBadge: {
    backgroundColor: COLORS.primary,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  menuBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.white,
  },

  /* Logout */
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginHorizontal: SIZES.padding,
    marginTop: 24,
    paddingVertical: 16,
    backgroundColor: COLORS.error + "10",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.error + "30",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.error,
  },

  /* Version */
  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 20,
  },

  /* Modal */
  modalContainer: {
    flex: 1,
  },
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
    backgroundColor: COLORS.background,
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
    backgroundColor: COLORS.background,
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
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  modalCancelBtnText: {
    color: COLORS.text,
  },
  modalSaveBtn: {
    flex: 1,
  },
});
