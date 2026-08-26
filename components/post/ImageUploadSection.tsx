import { ThemedText } from "@/components/ThemedText";
import { COLORS } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  images: string[];
  maxImages: number;
  isBannerPlan: boolean;
  onTakePhoto: () => void;
  onPickImage: () => void;
  onRemoveImage: (index: number) => void;
};

export default function ImageUploadSection({
  images,
  maxImages,
  isBannerPlan,
  onTakePhoto,
  onPickImage,
  onRemoveImage,
}: Props) {
  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Upload Images</ThemedText>
      <ThemedText style={styles.sectionSubtitle}>
        {isBannerPlan
          ? "Add 1 photo. This will be used as the banner image."
          : "Add up to 4 photos. First image will be the cover."}
      </ThemedText>
      <View style={styles.imagesContainer}>
        {images.length < maxImages && (
          <View style={styles.imageActions}>
            <TouchableOpacity style={styles.addImageBtn} onPress={onTakePhoto}>
              <Ionicons name="camera" size={24} color={COLORS.primary} />
              <ThemedText style={styles.addImageText}>Camera</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addImageBtn} onPress={onPickImage}>
              <Ionicons name="images" size={24} color={COLORS.primary} />
              <ThemedText style={styles.addImageText}>Gallery</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {images.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imagePreviewScroll}
            contentContainerStyle={styles.imagePreviewContainer}
          >
            {images.map((uri, index) => (
              <View key={`${uri}-${index}`} style={styles.imagePreview}>
                <Image source={{ uri }} style={styles.previewImage} />
                {index === 0 && (
                  <View style={styles.coverBadge}>
                    <ThemedText style={styles.coverText}>
                      {isBannerPlan ? "Banner" : "Cover"}
                    </ThemedText>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => onRemoveImage(index)}
                >
                  <Ionicons name="close" size={16} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 8 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.gray,
    marginBottom: 12,
  },
  imagesContainer: { gap: 16 },
  imageActions: {
    flexDirection: "row",
    gap: 12,
  },
  addImageBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.primary + "10",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary + "30",
    borderStyle: "dashed",
  },
  addImageText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  imagePreviewScroll: { marginTop: 4 },
  imagePreviewContainer: { gap: 10 },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  coverBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  coverText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.white,
  },
  removeImageBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
});
