import { ThemedText } from "@/components/ThemedText";
import { COLORS } from "@/constants/Colors";
import { MAX_WEBSITE_LINK_LENGTH } from "@/components/post/postUtils";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TextInput, View } from "react-native";

type Props = {
  websiteLink: string;
  videoLink: string;
  websiteLinkError: string;
  videoLinkError: string;
  onWebsiteChange: (value: string) => void;
  onVideoChange: (value: string) => void;
  onWebsiteBlur: () => void;
  onVideoBlur: () => void;
};

export default function BannerLinksSection({
  websiteLink,
  videoLink,
  websiteLinkError,
  videoLinkError,
  onWebsiteChange,
  onVideoChange,
  onWebsiteBlur,
  onVideoBlur,
}: Props) {
  return (
    <>
      <View style={styles.section}>
        <View style={styles.linkLabelRow}>
          <Ionicons name="globe-outline" size={18} color={COLORS.primary} />
          <ThemedText style={styles.linkLabel}>Website Link (Required)</ThemedText>
        </View>
        <TextInput
          style={[styles.input, websiteLinkError && styles.inputError]}
          placeholder="https://yourwebsite.com"
          placeholderTextColor={COLORS.gray}
          value={websiteLink}
          onChangeText={onWebsiteChange}
          onBlur={onWebsiteBlur}
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <ThemedText style={websiteLinkError ? styles.linkError : styles.linkHint}>
          {websiteLinkError ||
            `Add your website link (max ${MAX_WEBSITE_LINK_LENGTH} chars). Prefer short product URLs.`}
        </ThemedText>
      </View>

      <View style={styles.section}>
        <View style={styles.linkLabelRow}>
          <Ionicons name="videocam" size={18} color="#4CAF50" />
          <ThemedText style={styles.linkLabel}>Video Link (Required)</ThemedText>
        </View>
        <View style={[styles.input, styles.videoInput, videoLinkError && styles.inputError]}>
          <TextInput
            style={styles.videoTextInput}
            placeholder="https://youtube.com/..."
            placeholderTextColor={COLORS.gray}
            value={videoLink}
            onChangeText={onVideoChange}
            onBlur={onVideoBlur}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        <ThemedText style={videoLinkError ? styles.linkError : styles.linkHint}>
          {videoLinkError || "Add a valid video link (will show as Watch Video button)"}
        </ThemedText>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 8 },
  linkLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  linkLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputError: { borderColor: "#D32F2F" },
  linkHint: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 6,
  },
  linkError: {
    fontSize: 12,
    color: "#D32F2F",
    marginTop: 6,
  },
  videoInput: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 0,
    paddingHorizontal: 12,
  },
  videoTextInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.text,
  },
});
