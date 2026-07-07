import CropModal from "@/components/modals/CropModal";
import ThemeHeader from "@/components/headers/ThemeHeader";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import AppToast from "@/components/toasts/AppToast";
import { COLORS } from "@/constants/Colors";
import { createOrderApi, getApprovedProductsUrl, getChildCategoriesApi, getPlansListUrl, handleVerifyandAddProductApi, RAZORPAY_KEY, favoritesUrl, getMyBannerAdsUrl, getMyFeaturedAdsUrl, getMyProductsUrl, getFreeTrialStatusApi, } from "@/constants/functions";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { setClearData } from "@/store/reducers/paymentReducer";
import { getApprovedProductsApi, getPlansListApi, getFavoritesApi, getMyBannerAdsApi, getMyFeaturedAdsApi, getMyProductsApi } from "@/store/reducers/userReducer";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
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
  const { categories, subCategories, plans } = useSelector((state: any) => state.entities.userReducer) || {};
  const [images, setImages] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(null);
  const [selectedChildCategory, setSelectedChildCategory] = useState<number | null>(null);
  const [childCategories, setChildCategories] = useState<any[]>([]);
  const [tempSelectedSubCategory, setTempSelectedSubCategory] = useState<any>(null);
  const [loadingChildrenForId, setLoadingChildrenForId] = useState<number | null>(null);
  const [adType, setAdType] = useState<any>(null);
  const [websiteLink, setWebsiteLink] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [tempSelectedCategory, setTempSelectedCategory] = useState<any>(null);
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [condition, setCondition] = useState("New");
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
  const [customFields, setCustomFields] = useState<{ name: string; value: string }[]>([{ name: "Warranty", value: "" }]);
  const [videoLink2, setVideoLink2] = useState("");
  const [cropImage, setCropImage] = useState<{ uri: string; width: number; height: number } | null>(null);
  const [isFreeTrial, setIsFreeTrial] = useState(false);

  const dispatch = useDispatch();
  // Filter sub-categories based on selected category

  const handleSubCategorySelect = async (subCat: any, currentTempCategory: any) => {
    setLoadingChildrenForId(subCat.id);
    const children = await getChildCategoriesApi(subCat.id);
    setLoadingChildrenForId(null);
    if (children && children.length > 0) {
      // Has children — advance to step 3
      setChildCategories(children);
      setTempSelectedSubCategory(subCat);
      setSelectedChildCategory(null);
    } else {
      // No children — finalize selection immediately
      setSelectedCategory(currentTempCategory.id);
      setSelectedSubCategory(subCat.id);
      setSelectedChildCategory(null);
      setChildCategories([]);
      setShowCategoryModal(false);
      setTempSelectedCategory(null);
      setTempSelectedSubCategory(null);
      setCategorySearchQuery("");
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
    setSelectedChildCategory(null);
    setChildCategories([]);
    setIsNegotiable(false);
    setCondition("New");
    setCustomFields([{ name: "", value: "" }]);
    setVideoLink2("");
    setWebsiteLink("")
  };

  const resolveImageSize = (uri: string, fallbackW?: number, fallbackH?: number): Promise<{ width: number; height: number }> => {
    if (fallbackW && fallbackH) return Promise.resolve({ width: fallbackW, height: fallbackH });
    return new Promise((resolve) => {
      Image.getSize(
        uri,
        (width, height) => resolve({ width, height }),
        () => resolve({ width: 1000, height: 1000 })
      );
    });
  };

  const pickImage = async () => {
    if (images.length >= 8) {
      Alert.alert("Maximum Images", "You can only upload up to 8 images");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
      selectionLimit: 1,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const { width, height } = await resolveImageSize(asset.uri, asset.width, asset.height);
      setCropImage({ uri: asset.uri, width, height });
    }
  };
  useEffect(() => {
    dispatch(getPlansListApi(getPlansListUrl))
    getFreeTrialStatusApi(user?.id).then((res: any) => {
      setIsFreeTrial(res);
    });
  }, [])

  useEffect(() => {
    if (plans?.length > 0 && !adType) {
      setAdType(plans[0]);
    }
  }, [plans]);
  useFocusEffect(
    React.useCallback(() => {
      // When this screen is unfocused (navigated away from), clear images
      return () => {
        setImages([]);
        clearForm()
      };
    }, [])
  );

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
      quality: 1,
      allowsEditing: false,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const { width, height } = await resolveImageSize(asset.uri, asset.width, asset.height);
      setCropImage({ uri: asset.uri, width, height });
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
    if (!selectedSubCategory) {
      Alert.alert("Sub Category Required", "Please select a sub category");
      return false;
    }
    if (!price.trim()) {
      Alert.alert("Price Required", "Please enter a price");
      return false;
    }
    if (adType?.id === 3 && !videoLink) {
      Alert.alert("Banner Video Required", "Please upload a banner video");
      return false;
    }
    if (adType?.id === 3 && !websiteLink) {
      Alert.alert("Banner Website Link Required", "Please enter a website link");
      return false;
    }

    return true;
  };

  // Submit product after payment success (or free plan)
  const submitProduct = async (paymentData: any) => {
    try {
      const filledCustomFields = customFields.filter(f => f.name.trim() && f.value.trim());
      const payload = {
        ...(paymentData && paymentData.razorpay_payment_id && {
          plan_id: adType?.id,
          razorpay_order_id: paymentData?.razorpay_order_id || null,
          razorpay_payment_id: paymentData?.razorpay_payment_id || null,
          razorpay_signature: paymentData?.razorpay_signature || null,
        }),
        category_id: selectedCategory,
        sub_category_id: selectedSubCategory,
        child_category_id: selectedChildCategory || 0,
        name: title,
        description,
        price: Number(price) || 0,
        condition: condition.toLowerCase(),
        price_negotiable: isNegotiable,
        custom_fields: filledCustomFields,
        images: [...images],
        ...(adType?.id === 3 && {
          banner_image: images[0] || null,
          banner_video_url: videoLink || null,
          website_link: websiteLink || null,
          video: videoLink2 || null,
        }),
      };
 
      console.log(payload, "payload");

      const response = await handleVerifyandAddProductApi(payload);
      console.log(response, "response");

      if (!response) {
        AppToast("Failed to submit listing. Please try again.");
        return;
      }

      dispatch(getFavoritesApi(`${favoritesUrl}`));
      dispatch(getMyFeaturedAdsApi(`${getMyFeaturedAdsUrl}`));
      dispatch(getMyBannerAdsApi(`${getMyBannerAdsUrl}`));
      dispatch(getApprovedProductsApi(getApprovedProductsUrl));
      dispatch(getMyProductsApi(`${getMyProductsUrl}`));
      Alert.alert(
        "Listing Submitted!",
        "Your ad has been submitted for review. It will be live shortly.",
        [{ text: "OK", onPress: () => router.push("/(tabs)") }]
      );
      clearForm();
    } catch (error: any) {
      console.log(error?.response?.data, "submitProduct");
      AppToast("Failed to submit listing. Please try again.");
    }
  };


  // Handle submit with payment
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Free trial: normal ads (not featured id=2, not banner id=3) skip payment entirely
      if (isFreeTrial && adType?.id !== 2 && adType?.id !== 3) {
        await submitProduct(null);
        setIsLoading(false);
        return;
      }

      const orderRes = await createOrderApi(adType?.id);
      if (!orderRes) {
        AppToast("Failed to create order. Please try again.");
        setIsLoading(false);
        return;
      }

      // Backend may return flat { order_id, total_amount } or nested { data: { ... } }
      const order = orderRes?.data ?? orderRes;
      const totalAmount = Number(order?.total_amount ?? 0);
      const razorpayOrderId = order?.order_id || order?.id;

      console.log("Order response:", orderRes, "Parsed:", { totalAmount, razorpayOrderId });

      // Free plan — skip Razorpay, submit directly
      if (!totalAmount || totalAmount === 0) {
        await submitProduct(null);
        setIsLoading(false);
        return;
      }

      if (!razorpayOrderId) {
        AppToast("Invalid order. Please try again.");
        setIsLoading(false);
        return;
      }

      const options = {
        key: RAZORPAY_KEY,
        amount: totalAmount * 100,
        currency: "INR",
        name: "Gaxa Marketplace",
        description: "Post Ad Fee",
        order_id: razorpayOrderId,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: {
          color: COLORS.primary,
        },
      };

      RazorpayCheckout.open(options as any)
        .then(async (paymentResponse: any) => {
          console.log("Payment successful:", paymentResponse);
          await submitProduct(paymentResponse);
        })
        .catch((error: any) => {
          console.log("Razorpay error:", error);
          if (error?.code === "payment_cancelled" || error?.description === "Payment Cancelled") {
            AppToast("Payment cancelled");
          } else {
            AppToast(`Payment failed: ${error?.description || "Unknown error"}`);
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
        <ThemeHeader onBackPress={() => router.back()} title="Post Your Ad" />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Ad Type */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Ad Type</ThemedText>
            <View style={styles.adTypeContainer}>
              {(plans || []).map((plan: any) => {
                let iconName = "document-text-outline";
                let iconColor = "#1976D2";
                let iconBg = "#E3F2FD";
                let subtitle = "Basic Listing";
                let features: string[] = [];
                let badgeText = "Free limited time offer";
                let badgeBg = "#E3F2FD";
                let badgeColor = "#1976D2";

                if (plan.id === 1 || plan.type === "basic" || plan.type === "free") {
                  features = ["Chat with buyers", "Standard listing visibility", "28-day active period"];
                } else if (plan.id === 2 || plan.type === "featured") {
                  iconName = "star";
                  iconColor = "#FBC02D";
                  iconBg = "#FFF9C4";
                  subtitle = "Top Placement";
                  features = ["Chat & call with buyers", "Top placement in category", "More visibility, more buyers"];
                  badgeText = "Recommended";
                  badgeBg = "#FBC02D";
                  badgeColor = "#000";
                } else if (plan.id === 3 || plan.type === "banner") {
                  iconName = "rocket";
                  iconColor = "#D32F2F";
                  iconBg = "#FFEBEE";
                  subtitle = "Homepage Banner";
                  features = ["Chat & call with buyers", "Homepage banner placement", "Maximum reach & visibility"];
                  badgeText = "";
                }

                return (
                  <TouchableOpacity
                    key={plan.id}
                    style={[
                      styles.adTypeCard,
                      adType?.id === plan.id && styles.adTypeCardActive,
                      (plan.id === 2 || plan.type === "featured") && adType?.id === plan.id && { backgroundColor: '#FFFDE7', borderColor: '#FFF59D' },
                      (plan.id === 3 || plan.type === "banner") && adType?.id === plan.id && { backgroundColor: '#FFEBEE', borderColor: '#FFCDD2' }
                    ]}
                    onPress={() => setAdType(plan)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.adTypeRow}>
                      <Ionicons
                        name={adType?.id === plan.id ? "radio-button-on" : "radio-button-off"}
                        size={22}
                        color={adType?.id === plan.id ? COLORS.primary : COLORS.gray}
                      />
                      <View style={[styles.adTypeIconBox, { backgroundColor: iconBg }]}>
                        <Ionicons name={iconName as any} size={24} color={iconColor} />
                      </View>

                      <View style={styles.adTypeMainCol}>
                        <View style={styles.adTypeTitleRowFixed}>
                          <ThemedText style={styles.adTypeTitleFixed}>
                            {plan.name} {parseFloat(plan.price) > 0 ? `₹${plan.price}` : "(Free)"}
                          </ThemedText>
                        </View>
                        <ThemedText style={styles.adTypeSubtitleFixed}>{subtitle}</ThemedText>
                      </View>

                      <View style={styles.adTypeRightCol}>
                        <ThemedText style={styles.durationText}>/ {plan.duration_days} days</ThemedText>
                        {!!badgeText && (
                          <View style={[styles.planBadge, { backgroundColor: badgeBg }]}>
                            <ThemedText style={[styles.planBadgeText, { color: badgeColor }]}>
                              {badgeText}
                            </ThemedText>
                          </View>
                        )}
                      </View>
                    </View>

                    {features.length > 0 && (
                      <View style={styles.featureList}>
                        {features.map((f, fi) => (
                          <View key={fi} style={styles.featureRow}>
                            <Ionicons name="checkmark-circle" size={15} color="#2E7D32" />
                            <ThemedText style={styles.featureText}>{f}</ThemedText>
                          </View>
                        ))}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>


          {/* Warning Notice */}
          <View style={styles.warningBox}>
            <Ionicons name="warning" size={32} color="#D32F2F" style={{ marginTop: 2 }} />
            <View style={styles.warningContent}>
              <ThemedText style={styles.warningTitle}>Important Notice</ThemedText>
              <ThemedText style={styles.warningText}>
                {'Illegal link या illegal video post करने पर users आपको report कर सकते हैं।\nअगर multiple reports मिलते हैं तो:'}
              </ThemedText>
              <View style={styles.warningBullet}>
                <ThemedText style={styles.warningDot}>•</ThemedText>
                <ThemedText style={styles.warningBulletText}>आपका ad remove हो सकता है।</ThemedText>
              </View>
              <View style={styles.warningBullet}>
                <ThemedText style={styles.warningDot}>•</ThemedText>
                <ThemedText style={styles.warningBulletText}>आपका account temporary या permanent ban/block हो सकता है।</ThemedText>
              </View>
            </View>
          </View>

          {/* Image Upload Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Upload Images</ThemedText>
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

          {/* Category */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Category & Sub Category *</ThemedText>
            <TouchableOpacity
              style={styles.categorySelectorBtn}
              onPress={() => setShowCategoryModal(true)}
              activeOpacity={0.8}
            >
              <ThemedText style={selectedCategory ? styles.categorySelectedText : styles.categoryPlaceholderText}>
                {selectedCategory
                  ? (() => {
                    const catName = categories.find((c: any) => c.id === selectedCategory)?.name || "";
                    const subCatName = subCategories.find((sc: any) => sc.id === selectedSubCategory)?.name || "";
                    const childName = childCategories.find((cc: any) => cc.id === selectedChildCategory)?.name || "";
                    return [catName, subCatName, childName].filter(Boolean).join(" > ");
                  })()
                  : "Select Category"}
              </ThemedText>
              <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
            </TouchableOpacity>
          </View>

          {/* Product Price */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Product Price</ThemedText>
            <View style={styles.priceRow}>
              <View style={[styles.priceInputWrapper, { flex: 1 }]}>
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
                style={styles.checkboxRow}
                onPress={() => setIsNegotiable(!isNegotiable)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isNegotiable ? "checkbox" : "square-outline"}
                  size={24}
                  color={isNegotiable ? COLORS.primary : COLORS.gray}
                />
                <ThemedText style={styles.checkboxLabel}>Price is negotiable</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Condition */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Condition</ThemedText>
            <View style={styles.conditionRow}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setCondition("New")}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={condition === "New" ? "radio-button-on" : "radio-button-off"}
                  size={22}
                  color={condition === "New" ? COLORS.primary : COLORS.gray}
                />
                <ThemedText style={styles.radioLabel}>New</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setCondition("Used")}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={condition === "Used" ? "radio-button-on" : "radio-button-off"}
                  size={22}
                  color={condition === "Used" ? COLORS.primary : COLORS.gray}
                />
                <ThemedText style={styles.radioLabel}>Used</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Title */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Ad Title *</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Enter ad title"
              placeholderTextColor={COLORS.gray}
              value={title}
              onChangeText={setTitle}
              maxLength={70}
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Description *</ThemedText>
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
          </View>

          {/* Video Link (all plans) */}
          <View style={styles.section}>
            <View style={styles.linkLabelRow}>
              <Ionicons name="play-circle-outline" size={18} color={COLORS.primary} />
              <ThemedText style={styles.linkLabel}>Product Video Link (Optional)</ThemedText>
            </View>
            <View style={[styles.input, styles.videoInput]}>
              <TextInput
                style={styles.videoTextInput}
                placeholder="https://youtube.com/..."
                placeholderTextColor={COLORS.gray}
                value={videoLink2}
                onChangeText={setVideoLink2}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
            <ThemedText style={styles.linkHint}>Add a video demo of your product</ThemedText>
          </View>

          {/* Additional Details / Custom Fields */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.additionalDetailsHeader}
              onPress={() => setShowAdditionalDetails(!showAdditionalDetails)}
              activeOpacity={0.8}
            >
              <View style={styles.additionalDetailsLeft}>
                <Ionicons name="document-text-outline" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
                <ThemedText style={styles.additionalDetailsTitle}>Additional Details</ThemedText>
              </View>
              <Ionicons
                name={showAdditionalDetails ? "chevron-up" : "chevron-down"}
                size={20}
                color={COLORS.gray}
              />
            </TouchableOpacity>
            {showAdditionalDetails && (
              <View style={styles.additionalDetailsContent}>
                <ThemedText style={[styles.linkHint, { marginBottom: 8, marginTop: 8 }]}>
                  Add specific details (e.g. Warranty: 12 months, Brand: Samsung)
                </ThemedText>
                {customFields.map((field, index) => (
                  <View key={index} style={styles.customFieldRow}>
                    <TextInput
                      style={[styles.input, styles.customFieldInput]}
                      placeholder="Field name"
                      placeholderTextColor={COLORS.gray}
                      value={field.name}
                      onChangeText={(text) => {
                        const updated = [...customFields];
                        updated[index] = { ...updated[index], name: text };
                        setCustomFields(updated);
                      }}
                    />
                    <TextInput
                      style={[styles.input, styles.customFieldInput]}
                      placeholder="Value"
                      placeholderTextColor={COLORS.gray}
                      value={field.value}
                      onChangeText={(text) => {
                        const updated = [...customFields];
                        updated[index] = { ...updated[index], value: text };
                        setCustomFields(updated);
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => setCustomFields(customFields.filter((_, i) => i !== index))}
                      style={styles.removeFieldBtn}
                    >
                      <Ionicons name="close-circle" size={22} color="#D32F2F" />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.addFieldBtn}
                  onPress={() => setCustomFields([...customFields, { name: "", value: "" }])}
                >
                  <Ionicons name="add-circle-outline" size={18} color={COLORS.primary} />
                  <ThemedText style={styles.addFieldText}>Add Field</ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Website Link - Required for Banner */}
          {adType?.id === 3 && (
            <View style={styles.section}>
              <View style={styles.linkLabelRow}>
                <Ionicons name="globe-outline" size={18} color={COLORS.primary} />
                <ThemedText style={styles.linkLabel}>Website Link (Required)</ThemedText>
              </View>
              <TextInput
                style={styles.input}
                placeholder="https://yourwebsite.com"
                placeholderTextColor={COLORS.gray}
                value={websiteLink}
                onChangeText={setWebsiteLink}
                keyboardType="url"
                autoCapitalize="none"
              />
              <ThemedText style={styles.linkHint}>
                Add your website link (will show as Visit Website button)
              </ThemedText>
            </View>
          )}

          {/* Video Link - Optional for Banner */}
          {adType?.id === 3 && (
            <View style={styles.section}>
              <View style={styles.linkLabelRow}>
                <Ionicons name="videocam" size={18} color="#4CAF50" />
                <ThemedText style={styles.linkLabel}>Video Link (Required)</ThemedText>
              </View>
              <View style={[styles.input, styles.videoInput]}>
                {/* <Ionicons name="logo-youtube" size={20} color="#FF0000" style={styles.youtubeIcon} /> */}
                <TextInput
                  style={styles.videoTextInput}
                  placeholder="https://youtube.com/..."
                  placeholderTextColor={COLORS.gray}
                  value={videoLink}
                  onChangeText={setVideoLink}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>
              <ThemedText style={styles.linkHint}>
                Add video link (will show as Watch Video button)
              </ThemedText>
            </View>
          )}

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
                  {adType && parseFloat(adType.price) > 0 && (
                    <ThemedText style={styles.submitBtnPrice}>₹{isFreeTrial ? 0 : adType.price}</ThemedText>
                  )}
                  <ThemedText style={styles.submitBtnText}>{isFreeTrial ? "Post Ad" : "Pay & Post Ad"}</ThemedText>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={{ height: 100 }} />
      </KeyboardAvoidingView>

      {/* Crop Modal */}
      {cropImage && (
        <CropModal
          visible={!!cropImage}
          imageUri={cropImage.uri}
          imageWidth={cropImage.width}
          imageHeight={cropImage.height}
          onClose={() => setCropImage(null)}
          onCrop={(croppedUri) => {
            setImages(prev => [...prev, croppedUri]);
            setCropImage(null);
          }}
        />
      )}

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        onRequestClose={() => {
          if (tempSelectedSubCategory && childCategories.length > 0) {
            setTempSelectedSubCategory(null);
            setChildCategories([]);
            setCategorySearchQuery("");
          } else if (tempSelectedCategory) {
            setTempSelectedCategory(null);
            setTempSelectedSubCategory(null);
            setCategorySearchQuery("");
          } else {
            setShowCategoryModal(false);
            setCategorySearchQuery("");
          }
        }}
      >
        <View style={styles.categoryModalContainer}>
          {/* Header */}
          <View style={styles.categoryModalHeader}>
            {(tempSelectedCategory) ? (
              <TouchableOpacity
                onPress={() => {
                  if (tempSelectedSubCategory && childCategories.length > 0) {
                    setTempSelectedSubCategory(null);
                    setChildCategories([]);
                  } else {
                    setTempSelectedCategory(null);
                    setTempSelectedSubCategory(null);
                  }
                  setCategorySearchQuery("");
                }}
                style={styles.categoryModalBackBtn}
              >
                <Ionicons name="chevron-back" size={28} color={COLORS.text} />
              </TouchableOpacity>
            ) : null}
            <ThemedText style={styles.categoryModalTitle}>
              {tempSelectedSubCategory && childCategories.length > 0
                ? "Select Child Category"
                : tempSelectedCategory
                  ? "Select Sub Category"
                  : "Select Category"}
            </ThemedText>
            <TouchableOpacity
              onPress={() => {
                setShowCategoryModal(false);
                setTempSelectedCategory(null);
                setTempSelectedSubCategory(null);
                setChildCategories([]);
                setCategorySearchQuery("");
              }}
              style={styles.categoryModalCloseBtn}
            >
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {/* Breadcrumbs */}
          {tempSelectedCategory && (
            <View style={styles.breadcrumbContainer}>
              <ThemedText style={styles.breadcrumbText}>
                {tempSelectedCategory.name}
                {tempSelectedSubCategory ? (
                  <ThemedText style={{ color: COLORS.gray }}> {">"} <ThemedText style={{ fontWeight: "600", color: COLORS.text }}>{tempSelectedSubCategory.name}</ThemedText></ThemedText>
                ) : null}
              </ThemedText>
            </View>
          )}

          {/* Search Bar */}
          <View style={styles.categoryModalSearchWrapper}>
            <View style={styles.categoryModalSearchBox}>
              <Ionicons name="search" size={20} color={COLORS.gray} />
              <TextInput
                style={styles.categoryModalSearchInput}
                placeholder={
                  tempSelectedSubCategory && childCategories.length > 0
                    ? "Search child category"
                    : tempSelectedCategory
                      ? "Search sub category"
                      : "Search category"
                }
                value={categorySearchQuery}
                onChangeText={setCategorySearchQuery}
                placeholderTextColor={COLORS.gray}
              />
            </View>
          </View>

          {/* List */}
          <ScrollView
            style={styles.categoryModalList}
            contentContainerStyle={styles.categoryModalListContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Step 1: Categories */}
            {!tempSelectedCategory &&
              categories
                .filter((cat: any) =>
                  cat?.name?.toLowerCase().includes(categorySearchQuery.toLowerCase())
                )
                .map((cat: any) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={styles.categoryModalItem}
                    onPress={() => {
                      setTempSelectedCategory(cat);
                      setCategorySearchQuery("");
                    }}
                  >
                    <View style={styles.categoryModalItemLeft}>
                      <Ionicons name="list-outline" size={20} color={COLORS.primary} style={{ marginRight: 16 }} />
                      <ThemedText style={styles.categoryModalItemText}>{cat.name}</ThemedText>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
                  </TouchableOpacity>
                ))}

            {/* Step 2: Sub Categories */}
            {tempSelectedCategory && !tempSelectedSubCategory &&
              subCategories
                .filter(
                  (subCat: any) =>
                    subCat.category_id === tempSelectedCategory.id &&
                    subCat?.name?.toLowerCase().includes(categorySearchQuery.toLowerCase())
                )
                .map((subCat: any) => (
                  <TouchableOpacity
                    key={subCat.id}
                    style={styles.categoryModalItem}
                    onPress={() => handleSubCategorySelect(subCat, tempSelectedCategory)}
                    disabled={loadingChildrenForId !== null}
                  >
                    <View style={styles.categoryModalItemLeft}>
                      <Ionicons name="pricetag-outline" size={20} color={COLORS.primary} style={{ marginRight: 16 }} />
                      <ThemedText style={styles.categoryModalItemText}>{subCat.name}</ThemedText>
                    </View>
                    {loadingChildrenForId === subCat.id ? (
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                      <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
                    )}
                  </TouchableOpacity>
                ))}

            {/* Step 3: Child Categories */}
            {tempSelectedSubCategory && childCategories.length > 0 && (
              <>
                {childCategories
                  .filter((child: any) =>
                    child?.name?.toLowerCase().includes(categorySearchQuery.toLowerCase())
                  )
                  .map((child: any) => (
                    <TouchableOpacity
                      key={child.id}
                      style={styles.categoryModalItem}
                      onPress={() => {
                        setSelectedCategory(tempSelectedCategory.id);
                        setSelectedSubCategory(tempSelectedSubCategory.id);
                        setSelectedChildCategory(child.id);
                        setShowCategoryModal(false);
                        setTempSelectedCategory(null);
                        setTempSelectedSubCategory(null);
                        setCategorySearchQuery("");
                      }}
                    >
                      <View style={styles.categoryModalItemLeft}>
                        <Ionicons name="git-branch-outline" size={20} color={COLORS.primary} style={{ marginRight: 16 }} />
                        <ThemedText style={styles.categoryModalItemText}>{child.name}</ThemedText>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
                    </TouchableOpacity>
                  ))}
              </>
            )}

          </ScrollView>
        </View>
      </Modal>
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
    marginBottom: 8,
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

  /* New Field Styles */
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
  },
  conditionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  radioLabel: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
  },
  additionalDetailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  additionalDetailsLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  additionalDetailsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  additionalDetailsContent: {
    marginTop: 8,
  },
  customFieldRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  customFieldInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
  },
  removeFieldBtn: {
    padding: 4,
  },
  addFieldBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary + "50",
    borderStyle: "dashed",
    backgroundColor: COLORS.primary + "08",
    alignSelf: "flex-start",
    marginTop: 4,
  },
  addFieldText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },

  /* Category Selector & Modal */
  categorySelectorBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 8,
  },
  categoryPlaceholderText: {
    fontSize: 15,
    color: COLORS.gray,
  },
  categorySelectedText: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: "500",
  },
  categoryModalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  categoryModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  categoryModalBackBtn: {
    marginRight: 16,
  },
  categoryModalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  categoryModalCloseBtn: {
    padding: 4,
  },
  breadcrumbContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  breadcrumbText: {
    fontSize: 14,
    color: COLORS.text,
  },
  categoryModalSearchWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  categoryModalSearchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  categoryModalSearchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: COLORS.text,
  },
  categoryModalList: {
    flex: 1,
  },
  categoryModalListContent: {
    paddingBottom: 20,
  },
  categoryModalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  categoryModalItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryModalItemText: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.text,
  },

  /* Important Notice */
  importantNoticeContainer: {
    flexDirection: "row",
    backgroundColor: "#FFEBEE",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFCDD2",
    marginBottom: 20,
    marginTop: 8,
  },
  noticeIcon: {
    marginRight: 12,
    marginTop: 4,
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#D32F2F",
    marginBottom: 6,
  },
  noticeText: {
    fontSize: 12,
    color: "#424242",
    lineHeight: 18,
    marginBottom: 8,
    fontWeight: "500",
  },
  bulletPoint: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D32F2F",
    marginTop: 6,
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 12,
    color: "#424242",
    lineHeight: 18,
    fontWeight: "500",
  },

  /* Ad Type */
  adTypeContainer: {
    gap: 12,
  },
  adTypeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: 12,
  },
  adTypeCardActive: {
    borderColor: COLORS.primary,
  },
  adTypeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  adTypeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 12,
  },
  adTypeMainCol: {
    flex: 1,
    paddingRight: 8,
  },
  adTypeTitleRowFixed: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  adTypeTitleFixed: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  adTypeSubtitleFixed: {
    fontSize: 12,
    color: COLORS.gray,
  },
  adTypeMiddleCol: {
    flex: 1.2,
    borderLeftWidth: 1,
    borderLeftColor: "#E0E0E0",
    paddingLeft: 12,
  },
  chatInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  chatLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 2,
  },
  chatSub: {
    fontSize: 11,
    color: COLORS.gray,
  },

  adTypeRightCol: {
    alignItems: "flex-end",
    justifyContent: "center",
    paddingLeft: 8,
  },
  durationText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  planBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    top: 16
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  featureList: {
    marginTop: 10,
    marginLeft: 30,
    gap: 5,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  featureText: {
    fontSize: 12,
    color: "#2E7D32",
    fontWeight: "500",
  },

  /* Link Inputs */
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
  linkHint: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 6,
  },
  videoInput: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 0,
    paddingHorizontal: 12,
  },
  youtubeIcon: {
    marginRight: 8,
  },
  videoTextInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.text,
  },

  /* Duration */
  durationSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
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
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFEBEE",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FFCDD2",
    padding: 12,
    marginBottom: 12,
    gap: 10,
  },
  warningContent: { flex: 1 },
  warningTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#D32F2F",
    // marginBottom: 4,
  },
  warningText: {
    fontSize: 10,
    color: "#424242",
    // lineHeight: 18,
    // marginBottom: 6,
  },
  warningBullet: {
    flexDirection: "row",
    alignItems: "flex-start",
    // marginBottom: 2,
    gap: 6,
  },
  warningDot: {
    fontSize: 14,
    color: "#D32F2F",
    // lineHeight: 18,
  },
  warningBulletText: {
    flex: 1,
    fontSize: 10,
    color: "#424242",
    // lineHeight: 18,
  },
  submitBtnPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.white,
    marginRight: 4,
    opacity: 0.9,
  },
});

