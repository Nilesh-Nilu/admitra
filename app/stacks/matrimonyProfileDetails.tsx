import ThemeHeader from "@/components/headers/ThemeHeader";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS } from "@/constants/Colors";
import { createConversationApi, getMatrimonyProfileByIdApi, ImageUrl } from "@/constants/functions";
import { getProfileAge, getProfileMasterName, getProfilePhoto } from "@/constants/matrimony";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const DETAIL_ROWS: { label: string; relation: string }[] = [
  { label: "Gender", relation: "gender" },
  { label: "Height", relation: "height" },
  { label: "Marital Status", relation: "marital_status" },
  { label: "Religion", relation: "religion" },
  { label: "Caste / Community", relation: "caste_community" },
  { label: "Mother Tongue", relation: "mother_tongue" },
  { label: "Nationality", relation: "nationality" },
  { label: "Diet", relation: "diet" },
  { label: "Smoking", relation: "smoking_habit" },
  { label: "Drinking", relation: "drinking_habit" },
];

const parseProfile = (raw?: string) => {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// Hobbies may come back as master objects, names or bare ids.
const getHobbyNames = (profile: any): string[] => {
  const hobbies = profile?.hobbies ?? profile?.hobbies_interest;
  if (!Array.isArray(hobbies)) return [];
  return hobbies
    .map((hobby: any) => (typeof hobby === "object" ? hobby?.name : typeof hobby === "string" ? hobby : ""))
    .filter(Boolean);
};

export default function MatrimonyProfileDetailsScreen() {
  const router = useRouter();
  const { profileData } = useLocalSearchParams<{ profileData?: string }>();
  const insets = useSafeAreaInsets();
  const { user: currentUser } = useSelector((state: any) => state.entities.authReducer) || {};
  const [profile, setProfile] = useState<any>(() => parseProfile(profileData));
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    const listProfile = parseProfile(profileData);
    setProfile(listProfile);
    if (!listProfile?.id) return;
    getMatrimonyProfileByIdApi(listProfile.id)
      .then((detail: any) => detail && setProfile({ ...listProfile, ...detail }))
      .catch(() => {});
  }, [profileData]);

  const photo = getProfilePhoto(profile, ImageUrl);
  const age = getProfileAge(profile);
  const hobbies = getHobbyNames(profile);
  const details = DETAIL_ROWS.map((row) => ({
    label: row.label,
    value: getProfileMasterName(profile, row.relation),
  })).filter((row) => row.value);
  const additional = (Array.isArray(profile?.additional_details) ? profile.additional_details : []).filter(
    (row: any) => row?.field && row?.value
  );

  const memberId = profile?.user?.user_id ?? profile?.user?.id ?? profile?.user_id;
  const currentUserId = currentUser?.id ?? currentUser?.user_id;
  const isOwnProfile = memberId != null && currentUserId != null && Number(memberId) === Number(currentUserId);
  const canChat = memberId != null && !isOwnProfile;

  const handleChat = async () => {
    if (chatLoading) return;
    setChatLoading(true);
    try {
      const response = await createConversationApi({
        vendor_id: memberId,
        subject: "Matrimony inquiry",
      });
      if (response?.id) {
        router.push({
          pathname: "/stacks/chatDetail",
          params: {
            conversation_id: response.id,
            receiverId: response.vendor_id,
            userName: profile?.full_name || profile?.user?.name,
          },
        });
      } else {
        Alert.alert("Error", "Failed to create conversation");
      }
    } catch (error) {
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemeHeader onBackPress={() => router.back()} title="Matrimony Profile" />
      {!profile ? (
        <View style={styles.empty}>
          <ThemedText style={styles.muted}>Profile not available</ThemedText>
        </View>
      ) : (
        <ScrollView contentContainerStyle={[styles.content, canChat && { paddingBottom: 100 + insets.bottom }]}>
          <View style={styles.card}>
            <View style={styles.photoBox}>
              {photo ? (
                <Image source={{ uri: photo }} style={styles.photo} />
              ) : (
                <Ionicons name="person" size={96} color="#CBD5E1" />
              )}
            </View>
            <ThemedText style={styles.name}>{profile.full_name}</ThemedText>
            <ThemedText style={styles.muted}>
              {[age ? `${age} yrs` : "", getProfileMasterName(profile, "height"), getProfileMasterName(profile, "religion")]
                .filter(Boolean)
                .join(" • ")}
            </ThemedText>
          </View>

          {(!!profile.profile_title || !!profile.profile_description) && (
            <View style={styles.card}>
              {!!profile.profile_title && <ThemedText style={styles.title}>{profile.profile_title}</ThemedText>}
              {!!profile.profile_description && (
                <ThemedText style={styles.body}>{profile.profile_description}</ThemedText>
              )}
            </View>
          )}

          <View style={styles.card}>
            <ThemedText style={styles.title}>Basic Details</ThemedText>
            {details.map((row) => (
              <View key={row.label} style={styles.row}>
                <ThemedText style={styles.rowLabel}>{row.label}</ThemedText>
                <ThemedText style={styles.rowValue}>{row.value}</ThemedText>
              </View>
            ))}
            {additional.map((row: any, index: number) => (
              <View key={`${row.field}-${index}`} style={styles.row}>
                <ThemedText style={styles.rowLabel}>{row.field}</ThemedText>
                <ThemedText style={styles.rowValue}>{row.value}</ThemedText>
              </View>
            ))}
          </View>

          {hobbies.length > 0 && (
            <View style={styles.card}>
              <ThemedText style={styles.title}>Hobbies & Interests</ThemedText>
              <View style={styles.chips}>
                {hobbies.map((hobby) => (
                  <View key={hobby} style={styles.chip}>
                    <ThemedText style={styles.chipText}>{hobby}</ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {!!profile && canChat && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity style={styles.chatButton} onPress={handleChat} activeOpacity={0.8} disabled={chatLoading}>
            {chatLoading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Ionicons name="chatbubble-ellipses" size={18} color={COLORS.white} />
            )}
            <ThemedText style={styles.chatBtnText}>Chat with Member</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 60, gap: 12 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, gap: 8 },
  photoBox: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  photo: { width: "100%", height: "100%", resizeMode: "cover" },
  name: { fontSize: 20, fontWeight: "700", color: COLORS.text },
  title: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  body: { fontSize: 14, color: COLORS.text, lineHeight: 20 },
  muted: { fontSize: 14, color: COLORS.gray },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowLabel: { fontSize: 14, color: COLORS.gray },
  rowValue: { flex: 1, fontSize: 14, fontWeight: "600", color: COLORS.text, textAlign: "right" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { backgroundColor: "#FCE4EC", borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { fontSize: 13, color: "#C2185B", fontWeight: "600" },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#1565C0",
  },
  chatBtnText: { fontSize: 15, fontWeight: "700", color: COLORS.white },
});
