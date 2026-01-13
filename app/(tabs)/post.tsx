import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS } from "@/constants/Colors";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const CATEGORIES = [
  { id: 1, name: "Vehicles", icon: "car-sport" },
  { id: 2, name: "Property", icon: "home" },
  { id: 3, name: "Electronics", icon: "phone-portrait" },
  { id: 4, name: "Furniture", icon: "bed" },
  { id: 5, name: "Fashion", icon: "shirt" },
  { id: 6, name: "Jobs", icon: "briefcase" },
  { id: 7, name: "Services", icon: "construct" },
  { id: 8, name: "Others", icon: "grid" },
];

const CONDITIONS = ["New", "Like New", "Used", "Refurbished"];

export default function PostScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [isNegotiable, setIsNegotiable] = useState(false);

  const pickImage = async () => {
    if (images.length >= 8) {
      Alert.alert("Maximum Images", "You can only upload up to 8 images");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 8 - images.length,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => asset.uri);
      setImages([...images, ...newImages].slice(0, 8));
    }
  };

  const takePhoto = async () => {
    if (images.length >= 8) {
      Alert.alert("Maximum Images", "You can only upload up to 8 images");
      return;
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert("Permission Required", "Camera access is required to take photos");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (images.length === 0) {
      Alert.alert("Images Required", "Please add at least one image");
      return;
    }
    if (!title.trim()) {
      Alert.alert("Title Required", "Please enter a title for your listing");
      return;
    }
    if (!selectedCategory) {
      Alert.alert("Category Required", "Please select a category");
      return;
    }
    if (!price.trim()) {
      Alert.alert("Price Required", "Please enter a price");
      return;
    }
    if (!location.trim()) {
      Alert.alert("Location Required", "Please enter your location");
      return;
    }

    // TODO: Submit to API
    Alert.alert(
      "Listing Submitted!",
      "Your ad has been submitted for review. It will be live shortly.",
      [{ text: "OK", onPress: () => router.push("/(tabs)") }]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="close" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Post Your Ad</ThemedText>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Image Upload Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Add Photos</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>
              Add up to 8 photos. First image will be the cover.
            </ThemedText>
            <View style={styles.imagesContainer}>
              {/* Add Image Buttons */}
              <View style={styles.imageActions}>
                <TouchableOpacity style={styles.addImageBtn} onPress={takePhoto}>
                  <Ionicons name="camera" size={24} color={COLORS.primary} />
                  <ThemedText style={styles.addImageText}>Camera</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
                  <Ionicons name="images" size={24} color={COLORS.primary} />
                  <ThemedText style={styles.addImageText}>Gallery</ThemedText>
                </TouchableOpacity>
              </View>

              {/* Image Preview */}
              {images.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.imagePreviewScroll}
                  contentContainerStyle={styles.imagePreviewContainer}
                >
                  {images.map((uri, index) => (
                    <View key={index} style={styles.imagePreview}>
                      <Image source={{ uri }} style={styles.previewImage} />
                      {index === 0 && (
                        <View style={styles.coverBadge}>
                          <ThemedText style={styles.coverText}>Cover</ThemedText>
                        </View>
                      )}
                      <TouchableOpacity
                        style={styles.removeImageBtn}
                        onPress={() => removeImage(index)}
                      >
                        <Ionicons name="close" size={16} color={COLORS.white} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>

          {/* Title */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Ad Title *</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="What are you selling?"
              placeholderTextColor={COLORS.gray}
              value={title}
              onChangeText={setTitle}
              maxLength={70}
            />
            <ThemedText style={styles.charCount}>{title.length}/70</ThemedText>
          </View>

          {/* Category */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Category *</ThemedText>
            <View style={styles.categoriesGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === cat.id && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={20}
                    color={selectedCategory === cat.id ? COLORS.white : COLORS.text}
                  />
                  <ThemedText
                    style={[
                      styles.categoryChipText,
                      selectedCategory === cat.id && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Condition */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Condition</ThemedText>
            <View style={styles.conditionsRow}>
              {CONDITIONS.map((cond) => (
                <TouchableOpacity
                  key={cond}
                  style={[
                    styles.conditionChip,
                    selectedCondition === cond && styles.conditionChipActive,
                  ]}
                  onPress={() => setSelectedCondition(cond)}
                >
                  <ThemedText
                    style={[
                      styles.conditionChipText,
                      selectedCondition === cond && styles.conditionChipTextActive,
                    ]}
                  >
                    {cond}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Description</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your item in detail..."
              placeholderTextColor={COLORS.gray}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={4000}
            />
            <ThemedText style={styles.charCount}>{description.length}/4000</ThemedText>
          </View>

          {/* Price */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Price *</ThemedText>
            <View style={styles.priceContainer}>
              <View style={styles.priceInputWrapper}>
                <ThemedText style={styles.currency}>₹</ThemedText>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Enter price"
                  placeholderTextColor={COLORS.gray}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                />
              </View>
              <TouchableOpacity
                style={[styles.negotiableBtn, isNegotiable && styles.negotiableBtnActive]}
                onPress={() => setIsNegotiable(!isNegotiable)}
              >
                <Ionicons
                  name={isNegotiable ? "checkbox" : "square-outline"}
                  size={20}
                  color={isNegotiable ? COLORS.primary : COLORS.gray}
                />
                <ThemedText style={styles.negotiableText}>Negotiable</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Location *</ThemedText>
            <TouchableOpacity style={styles.locationInput}>
              <Ionicons name="location-outline" size={20} color={COLORS.gray} />
              <TextInput
                style={styles.locationText}
                placeholder="Enter your city or area"
                placeholderTextColor={COLORS.gray}
                value={location}
                onChangeText={setLocation}
              />
              <Ionicons name="locate" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Listing Fee Notice */}
          <View style={styles.feeNotice}>
            <LinearGradient
              colors={[COLORS.warning + "20", COLORS.orange + "10"]}
              style={styles.feeNoticeGradient}
            >
              <Ionicons name="information-circle" size={24} color={COLORS.orange} />
              <View style={styles.feeNoticeText}>
                <ThemedText style={styles.feeTitle}>Listing Fee</ThemedText>
                <ThemedText style={styles.feeDescription}>
                  A small fee of ₹99 will be charged for posting this ad. This helps maintain quality listings.
                </ThemedText>
              </View>
            </LinearGradient>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Submit Button */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <ThemedText style={styles.submitBtnText}>Post Ad • ₹99</ThemedText>
            <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },

  /* Header */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SIZES.padding,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 20,
  },

  /* Sections */
  section: {
    marginBottom: 24,
  },
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

  /* Images */
  imagesContainer: {
    gap: 16,
  },
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
  imagePreviewScroll: {
    marginTop: 4,
  },
  imagePreviewContainer: {
    gap: 10,
  },
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

  /* Input */
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
  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: "right",
    marginTop: 6,
  },

  /* Categories */
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: "500",
  },
  categoryChipTextActive: {
    color: COLORS.white,
  },

  /* Conditions */
  conditionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  conditionChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  conditionChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  conditionChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.text,
  },
  conditionChipTextActive: {
    color: COLORS.white,
  },

  /* Price */
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  priceInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  currency: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    paddingVertical: 14,
  },
  negotiableBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  negotiableBtnActive: {
    backgroundColor: COLORS.primary + "10",
    borderColor: COLORS.primary,
  },
  negotiableText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.text,
  },

  /* Location */
  locationInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  locationText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },

  /* Fee Notice */
  feeNotice: {
    marginBottom: 24,
  },
  feeNoticeGradient: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    borderRadius: 14,
  },
  feeNoticeText: {
    flex: 1,
  },
  feeTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.orange,
    marginBottom: 4,
  },
  feeDescription: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
  },

  /* Footer */
  footer: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
  },
});

