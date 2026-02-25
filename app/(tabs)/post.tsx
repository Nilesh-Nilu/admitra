import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import AppToast from "@/components/toasts/AppToast";
import { COLORS } from "@/constants/Colors";
import { createOrderApi, handleVerifyandAddProductApi, RAZORPAY_KEY } from "@/constants/functions";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { setClearData } from "@/store/reducers/paymentReducer";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import RazorpayCheckout from "react-native-razorpay";
import { useDispatch, useSelector } from "react-redux";


export default function PostScreen() {
  const router = useRouter();
  const user = useSelector((state: any) => state.entities.authReducer?.user);
  const { categories, subCategories } = useSelector((state: any) => state.entities.userReducer) || {};
  const [images, setImages] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const pickImage = async () => {
    if (images.length >= 8) {
      Alert.alert("Maximum Images", "You can only upload up to 8 images");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 8 - images.length,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      // Collect both uri and base64 like in loginFields.tsx (but here for multiple images)
      const newImages = result.assets
        .filter(asset => asset.base64 || asset.uri)
        .map(asset => {
          if (asset.base64) {
            const mimeType = asset.mimeType || "image/jpeg";
            return `data:${mimeType};base64,${asset.base64}`;
          }
        });
      setImages([...images, ...newImages]);
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
      base64: true,
    });

    if (!result.canceled) {  
      setImages([...images, `data:${result.assets[0].mimeType};base64,${result.assets[0].base64}`]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Validate form fields
  const validateForm = () => {
    if (images.length === 0) {
      Alert.alert("Images Required", "Please add at least one image");
      return false;
    }
    if (!title.trim()) {
      Alert.alert("Title Required", "Please enter a title for your listing");
      return false;
    }
    if (!selectedCategory) {
      Alert.alert("Category Required", "Please select a category");
      return false;
    }
    if (!price.trim()) {
      Alert.alert("Price Required", "Please enter a price");
      return false;
    }
    return true;
  };

  // Submit product after payment success
  const submitProduct = async (paymentData: any) => {
    try {
      const payload = {
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
        category_id: selectedCategory,
        sub_category_id: selectedSubCategory,
        name: title,
        description: description,
        price: price,
        images: [...images],
        video: null
      };
      
      const response = await handleVerifyandAddProductApi(payload);
      console.log(response, "response");
      
      Alert.alert(
        "Listing Submitted!",
        "Your ad has been submitted for review. It will be live shortly.",
        [{ text: "OK", onPress: () => router.push("/(tabs)") }]
      );
      
      // Clear form
      clearForm();
    } catch (error) {
      console.log(error, "error");
      AppToast("Failed to submit listing. Please try again.");
    }
  };

  // Clear form fields
  const clearForm = () => {
    dispatch(setClearData(null));
    setImages([]);
    setTitle("");
    setDescription("");
    setPrice("");
    setSelectedCategory(null);
    setSelectedSubCategory(null);
  };

  // Handle submit with payment
  const handleSubmit = async () => {
    // First validate the form
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Create order for payment
      const order = await createOrderApi();
      
      if (!order) {
        AppToast("Failed to create order. Please try again.");
        setIsLoading(false);
        return;
      }

      // Open Razorpay checkout
      const options = {
        key: RAZORPAY_KEY,
        amount: order.amount * 100,
        currency: "INR",
        name: "AdMaster Marketplace",
        description: "Post Ad Fee",
        order_id: order.order_id,
        handler: async (response: any) => {
          console.log("Razorpay checkout completed:", response);
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: {
          color: COLORS.primary,
        },
      };

      RazorpayCheckout.open(options)
        .then(async (paymentResponse: any) => {
          console.log("Payment successful:", paymentResponse);
          // Payment successful, now submit the product
          await submitProduct(paymentResponse);
        })
        .catch((error: any) => {
          console.log("Razorpay error:", error);
          if (error.code === "payment_cancelled") {
            AppToast("Payment cancelled");
          } else {
            AppToast(`Payment failed: ${error.description || "Unknown error"}`);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } catch (error: any) {
      console.log("Payment flow error:", error);
      AppToast("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={[styles.header]}>
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
              {categories.map((cat: any) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === cat.id && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
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

          {/* Sub Category */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Sub Category *</ThemedText>
            <View style={styles.categoriesGrid}>
              {subCategories.map((subCat: any) => (
                <TouchableOpacity
                  key={subCat.id}
                  style={[
                      styles.categoryChip,
                    selectedSubCategory === subCat.id && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedSubCategory(subCat.id)}
                >
                  <ThemedText
                    style={[
                      styles.categoryChipText,
                      selectedSubCategory === subCat.id && styles.categoryChipTextActive,
                    ]}
                  >
                    {subCat.name}
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
            </View>
          </View>

          {/* Location */}
          {/* <View style={styles.section}>
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
          </View> */}

        <View style={[styles.footer]}>
          <TouchableOpacity 
            style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]} 
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <ActivityIndicator size="small" color={COLORS.white} />
                <ThemedText style={styles.submitBtnText}>Processing...</ThemedText>
              </>
            ) : (
              <>
                <ThemedText style={styles.submitBtnText}>Pay & Post Ad</ThemedText>
                <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
              </>
            )}
          </TouchableOpacity>
        </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={{ height: 100 }} />
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
    // paddingTop: 16,
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
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
  },
});

