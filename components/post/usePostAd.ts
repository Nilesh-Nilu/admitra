import {
  getRenewalProductType,
  isBannerPlanType,
  isNormalPlanType,
  isValidHttpUrl,
  matchesRenewalPlan,
  MAX_WEBSITE_LINK_LENGTH,
  normalizeHttpUrl,
} from "@/components/post/postUtils";
import AppToast from "@/components/toasts/AppToast";
import { COLORS } from "@/constants/Colors";
import {
  createOrderApi,
  createRenewalOrderApi,
  getApprovedProductsUrl,
  getChildCategoriesApi,
  getPlansListUrl,
  handleVerifyandAddProductApi,
  RAZORPAY_KEY,
  favoritesUrl,
  getMyBannerAdsUrl,
  getMyFeaturedAdsUrl,
  getMyProductsUrl,
  getFreeTrialStatusApi,
  getFreeProductStatusApi,
  verifyRenewalApi,
} from "@/constants/functions";
import { setClearData } from "@/store/reducers/paymentReducer";
import {
  getApprovedProductsApi,
  getPlansListApi,
  getFavoritesApi,
  getMyBannerAdsApi,
  getMyFeaturedAdsApi,
  getMyProductsApi,
} from "@/store/reducers/userReducer";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Image } from "react-native";
import RazorpayCheckout from "react-native-razorpay";
import { useDispatch, useSelector } from "react-redux";

export function usePostAd() {
  const router = useRouter();
  const { renewalProduct: renewalProductParam } = useLocalSearchParams<{ renewalProduct?: string }>();
  const user = useSelector((state: any) => state.entities.authReducer?.user);
  const { categories, subCategories, plans } = useSelector((state: any) => state.entities.userReducer) || {};
  console.log(plans,"plans")
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
  const [websiteLinkError, setWebsiteLinkError] = useState("");
  const [videoLinkError, setVideoLinkError] = useState("");
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
  const [freeProductStatus, setFreeProductStatus] = useState<any>(null);
  const [plansLoading, setPlansLoading] = useState(true);
  const [renewalProduct, setRenewalProduct] = useState<any>(null);
  const isRenewal = Boolean(renewalProduct?.id);
  const renewalProductType = getRenewalProductType(renewalProduct);
  const isNormalPlan = isNormalPlanType(adType);
  const isBannerPlan = isBannerPlanType(adType);
  const maxImages = isBannerPlan ? 1 : 4;
  // Trial access is evaluated before the selected product plan.
  // Free verify-and-store modes (no Razorpay):
  // 1) Free plan (price 0)     → send plan_id
  // 2) Free trial user         → omit plan_id
  // 3) Admin assigned is_free  → omit plan_id
  const hasFreeTrialAccess = isFreeTrial || user?.free_trial_enabled === true;
  const hasAssignedFreeAccess = Number(user?.is_free) === 1;
  const isZeroPriceNormalPlan = isNormalPlan && Number(adType?.price ?? 0) === 0;
  const requiresPaymentForNormalProduct = Boolean(
    freeProductStatus?.requires_payment_for_normal_product
  );
  const canCreateFreeNormalProduct = Boolean(
    freeProductStatus?.can_create_free_normal_product
  );
  const shouldPostWithoutPayment =
    !isRenewal &&
    isNormalPlan &&
    !requiresPaymentForNormalProduct &&
    (canCreateFreeNormalProduct || hasFreeTrialAccess || hasAssignedFreeAccess || isZeroPriceNormalPlan);

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
    setVideoLink("");
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
    if (images.length >= maxImages) {
      Alert.alert(
        "Maximum Images",
        isBannerPlan
          ? "Banner ads allow only 1 photo"
          : "You can only upload up to 4 images"
      );
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
  const refreshFreeProductStatus = useCallback(async () => {
    try {
      const data = await getFreeProductStatusApi();
      setFreeProductStatus(data);
      return data;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    setPlansLoading(true);
    Promise.resolve(dispatch(getPlansListApi(getPlansListUrl)))
      .catch(() => {})
      .finally(() => setPlansLoading(false));
    getFreeTrialStatusApi(user?.id).then((res: any) => {
      setIsFreeTrial(res);
    });
    refreshFreeProductStatus();
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshFreeProductStatus();
    }, [refreshFreeProductStatus])
  );

  useEffect(() => {
    if (!renewalProductParam) {
      setRenewalProduct(null);
      return;
    }

    try {
      const product = JSON.parse(renewalProductParam);
      if (!product?.id) throw new Error("Missing product id");

      setRenewalProduct(product);
      setImages(
        (Array.isArray(product.images) ? product.images : [])
          .map((image: any) => image?.image_path || image?.path || image?.image || image)
          .filter(Boolean)
      );
      setTitle(product.name || "");
      setDescription(product.description || "");
      setPrice(product.price != null ? String(product.price) : "");
      setSelectedCategory(product.category_id || null);
      setSelectedSubCategory(product.sub_category_id || null);
      setSelectedChildCategory(product.child_category_id || null);
      setChildCategories(product.child_category ? [product.child_category] : []);
      setCondition(String(product.condition || "new").toLowerCase() === "used" ? "Used" : "New");
      setIsNegotiable(Boolean(product.price_negotiable));
      setCustomFields(
        Array.isArray(product.custom_fields)
          ? product.custom_fields.map((field: any) => ({ name: field?.name || "", value: field?.value || "" }))
          : []
      );
      setShowAdditionalDetails(Array.isArray(product.custom_fields) && product.custom_fields.length > 0);
      setWebsiteLink(product.plan_info?.website_link || "");
      setVideoLink(product.plan_info?.banner_video_url || "");
    } catch {
      setRenewalProduct(null);
      AppToast("Unable to prepare this ad for renewal.");
    }
  }, [renewalProductParam]);

  useEffect(() => {
    if (plans?.length > 0 && !adType) {
      setAdType(plans[0]);
    }
  }, [plans]);

  useEffect(() => {
    if (!renewalProduct || !plans?.length) return;

    const renewalPlan = plans.find((plan: any) => matchesRenewalPlan(plan, renewalProduct));
    if (renewalPlan) setAdType(renewalPlan);
  }, [plans, renewalProduct]);
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
    if (images.length >= maxImages) {
      Alert.alert(
        "Maximum Images",
        isBannerPlan
          ? "Banner ads allow only 1 photo"
          : "You can only upload up to 4 images"
      );
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

  const handleWebsiteLinkBlur = () => {
    const normalizedLink = normalizeHttpUrl(websiteLink);
    setWebsiteLink(normalizedLink);
    if (normalizedLink && !isValidHttpUrl(normalizedLink)) {
      setWebsiteLinkError("Enter a valid link, e.g. https://example.com");
    } else if (normalizedLink.length > MAX_WEBSITE_LINK_LENGTH) {
      setWebsiteLinkError(
        `Link is too long (${normalizedLink.length}/${MAX_WEBSITE_LINK_LENGTH}). Use a shorter URL without tracking params.`
      );
    } else {
      setWebsiteLinkError("");
    }
  };

  const handleVideoLinkBlur = () => {
    const normalizedLink = normalizeHttpUrl(videoLink);
    setVideoLink(normalizedLink);
    setVideoLinkError(
      normalizedLink && !isValidHttpUrl(normalizedLink)
        ? "Enter a valid link, e.g. https://youtube.com/..."
        : ""
    );
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
    if (!description.trim()) {
      Alert.alert("Description Required", "Please enter a description for your listing");
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
    if (adType?.id === 3) {
      const normalizedVideoLink = normalizeHttpUrl(videoLink);
      const normalizedWebsiteLink = normalizeHttpUrl(websiteLink);

      setVideoLink(normalizedVideoLink);
      setWebsiteLink(normalizedWebsiteLink);

      if (!normalizedVideoLink) {
        setVideoLinkError("A video link is required.");
        Alert.alert("Banner Video Required", "Please enter a video link.");
        return false;
      }
      if (!isValidHttpUrl(normalizedVideoLink)) {
        setVideoLinkError("Enter a valid link, e.g. https://youtube.com/...");
        Alert.alert("Invalid Video Link", "Please enter a complete video URL.");
        return false;
      }
      if (!normalizedWebsiteLink) {
        setWebsiteLinkError("A website link is required.");
        Alert.alert("Banner Website Link Required", "Please enter a website link.");
        return false;
      }
      if (!isValidHttpUrl(normalizedWebsiteLink)) {
        setWebsiteLinkError("Enter a valid link, e.g. https://example.com");
        Alert.alert("Invalid Website Link", "Please enter a complete website URL.");
        return false;
      }
      if (normalizedWebsiteLink.length > MAX_WEBSITE_LINK_LENGTH) {
        setWebsiteLinkError(
          `Link is too long (${normalizedWebsiteLink.length}/${MAX_WEBSITE_LINK_LENGTH}). Use a shorter URL.`
        );
        Alert.alert(
          "Website Link Too Long",
          `Max ${MAX_WEBSITE_LINK_LENGTH} characters. Remove tracking params from the Amazon/product link and try again.`
        );
        return false;
      }
    }

    return true;
  };

  // Submit product after payment success or through a free-post flow.
  // Paid: plan_id + razorpay_* | Free plan: plan_id only | Trial / is_free: no plan_id
  const submitProduct = async (paymentData: any, includeFreePlanId = false) => {
    try {
      const filledCustomFields = customFields.filter(f => f.name.trim() && f.value.trim());
      const normalizedVideoLink = normalizeHttpUrl(videoLink);
      const normalizedWebsiteLink = normalizeHttpUrl(websiteLink);
      const isPaid = Boolean(paymentData?.razorpay_payment_id);
      const payload = {
        ...(isPaid && {
          plan_id: adType?.id,
          razorpay_order_id: paymentData?.razorpay_order_id || null,
          razorpay_payment_id: paymentData?.razorpay_payment_id || null,
          razorpay_signature: paymentData?.razorpay_signature || null,
        }),
        ...(!isPaid && includeFreePlanId && {
          plan_id: adType?.id,
        }),
        category_id: selectedCategory,
        sub_category_id: selectedSubCategory,
        child_category_id: selectedChildCategory || null,
        name: title,
        description,
        price: Number(price) || 0,
        condition: condition.toLowerCase(),
        price_negotiable: isNegotiable,
        custom_fields: filledCustomFields,
        images: [...images],
        ...(adType?.id === 3 && {
          banner_image: images[0] || null,
          banner_video_url: normalizedVideoLink || null,
          website_link: normalizedWebsiteLink || null,
          video: videoLink2 || null,
        }),
      };

      console.log("verify-and-store payload modes:", {
        isPaid,
        includeFreePlanId,
        hasFreeTrialAccess,
        hasAssignedFreeAccess,
        plan_id: payload.plan_id ?? null,
      });
 
      const response = await handleVerifyandAddProductApi(payload);

      if (!response) {
        AppToast("Failed to submit listing. Please try again.");
        return;
      }

      dispatch(getFavoritesApi(`${favoritesUrl}`));
      dispatch(getMyFeaturedAdsApi(`${getMyFeaturedAdsUrl}`));
      dispatch(getMyBannerAdsApi(`${getMyBannerAdsUrl}`));
      dispatch(getApprovedProductsApi(getApprovedProductsUrl));
      dispatch(getMyProductsApi(`${getMyProductsUrl}`));
      const isBannerAd = adType?.id === 3 || adType?.type === "banner";
      const isFeaturedAd = adType?.id === 2 || adType?.type === "featured";
      const successMessage = isBannerAd
        ? "Your banner ad has been posted and is now live."
        : isFeaturedAd
        ? "Your featured ad has been posted and is now live."
        : "Your ad has been posted and is now live.";
      Alert.alert(
        "Ad Posted!",
        successMessage,
        [{ text: "OK", onPress: () => router.push("/(tabs)") }]
      );
      clearForm();
    } catch (error: any) {
      console.log(error?.response?.data, "submitProduct");
      const serverError = String(error?.response?.data?.error || error?.response?.data?.message || "").trim();
      if (serverError.includes("website_link") && serverError.includes("too long")) {
        Alert.alert("Unable to post ad", "Website link is too long. Use a shorter URL and try again.");
      } else {
        Alert.alert(
          "Unable to post ad",
          serverError || "Failed to submit listing. Please try again."
        );
      }
    }
  };

  const refreshMyListings = () => {
    dispatch(getFavoritesApi(`${favoritesUrl}`));
    dispatch(getMyFeaturedAdsApi(`${getMyFeaturedAdsUrl}`));
    dispatch(getMyBannerAdsApi(`${getMyBannerAdsUrl}`));
    dispatch(getApprovedProductsApi(getApprovedProductsUrl));
    dispatch(getMyProductsApi(`${getMyProductsUrl}`));
  };

  const verifyRenewal = async (paymentData: any, fallbackOrderId?: string) => {
    const isBannerPlan = adType?.id === 3 || adType?.type === "banner";
    const bannerImage =
      images[0] ||
      renewalProduct?.plan_info?.banner_image ||
      renewalProduct?.images?.[0]?.image_path ||
      null;
    const bannerVideoUrl = normalizeHttpUrl(videoLink || renewalProduct?.plan_info?.banner_video_url || "") || null;
    const bannerWebsiteLink = normalizeHttpUrl(websiteLink || renewalProduct?.plan_info?.website_link || "") || null;

    if (isBannerPlan && (!bannerImage || !bannerVideoUrl || !bannerWebsiteLink)) {
      AppToast("Banner image, video link, and website link are required to renew a banner ad.");
      return false;
    }
    const response = await verifyRenewalApi({
      ...(paymentData?.razorpay_payment_id && {
        razorpay_order_id: paymentData.razorpay_order_id || fallbackOrderId,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
      }),
      product_id: renewalProduct.id,
      plan_id: adType.id,
      banner_image: isBannerPlan ? bannerImage : null,
      banner_video_url: isBannerPlan ? bannerVideoUrl : null,
      website_link: isBannerPlan ? bannerWebsiteLink : null,
    });

    if (response?.success === false) {
      throw new Error(response.message || "Unable to renew this ad.");
    }

    refreshMyListings();
    Alert.alert(
      "Ad Renewed!",
      response?.message || "Your ad has been renewed successfully.",
      [{ text: "OK", onPress: () => router.replace("/(tabs)/myListing") }]
    );
    return true;
  };

  const handleRenewal = async () => {
    if (!renewalProduct?.id || !adType?.id) {
      AppToast("Choose a renewal plan before continuing.");
      return;
    }

    const isBannerPlan = adType?.id === 3 || adType?.type === "banner";
    const renewalVideoLink = normalizeHttpUrl(videoLink || renewalProduct?.plan_info?.banner_video_url || "");
    const renewalWebsiteLink = normalizeHttpUrl(websiteLink || renewalProduct?.plan_info?.website_link || "");
    if (isBannerPlan && (!renewalVideoLink || !renewalWebsiteLink)) {
      AppToast("A video link and website link are required to renew a banner ad.");
      return;
    }
    if (isBannerPlan && !isValidHttpUrl(renewalVideoLink)) {
      setVideoLinkError("Enter a valid link, e.g. https://youtube.com/...");
      AppToast("Please enter a valid video link before renewing.");
      return;
    }
    if (isBannerPlan && !isValidHttpUrl(renewalWebsiteLink)) {
      setWebsiteLinkError("Enter a valid link, e.g. https://example.com");
      AppToast("Please enter a valid website link before renewing.");
      return;
    }
    if (isBannerPlan && renewalWebsiteLink.length > MAX_WEBSITE_LINK_LENGTH) {
      setWebsiteLinkError(
        `Link is too long (${renewalWebsiteLink.length}/${MAX_WEBSITE_LINK_LENGTH}). Use a shorter URL.`
      );
      AppToast(`Website link must be ${MAX_WEBSITE_LINK_LENGTH} characters or less.`);
      return;
    }

    setIsLoading(true);
    try {
      const renewalPrice = Number(adType.price ?? 0);

      // Razorpay does not accept orders below ₹1. Free renewal plans are
      // verified directly, just like a free new-ad plan.
      if (renewalPrice < 1) {
        await verifyRenewal(null);
        setIsLoading(false);
        return;
      }

      const orderRes = await createRenewalOrderApi(renewalProduct.id, adType.id);
      const order = orderRes?.data ?? orderRes;
      const totalAmount = Number(order?.total_amount ?? 0);
      const razorpayOrderId = order?.order_id || order?.id;

      if (!totalAmount || totalAmount === 0) {
        await verifyRenewal(null, razorpayOrderId);
        setIsLoading(false);
        return;
      }

      if (!razorpayOrderId) {
        AppToast("Invalid renewal order. Please try again.");
        setIsLoading(false);
        return;
      }

      RazorpayCheckout.open({
        key: RAZORPAY_KEY,
        amount: totalAmount * 100,
        currency: "INR",
        name: "Gaxa Marketplace",
        description: "Ad Renewal Fee",
        order_id: razorpayOrderId,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: {
          color: COLORS.primary,
        },
      } as any)
        .then((paymentResponse: any) => verifyRenewal(paymentResponse, razorpayOrderId))
        .catch((error: any) => {
          if (error?.code === "payment_cancelled" || error?.description === "Payment Cancelled") {
            AppToast("Payment cancelled");
          } else {
            AppToast(error?.message || error?.description || "Unable to renew this ad. Please try again.");
          }
        })
        .finally(() => setIsLoading(false));
    } catch (error: any) {
      console.log(error?.response?.data || error, "renewal payment flow error");
      AppToast(error?.message || "Unable to renew this ad. Please try again.");
      setIsLoading(false);
    }
  };


  // Handle submit with payment
  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      let skipPayment = shouldPostWithoutPayment;
      let requiresNormalPayment = requiresPaymentForNormalProduct;

      if (isNormalPlan && !isRenewal) {
        const status = await refreshFreeProductStatus();
        requiresNormalPayment = Boolean(status?.requires_payment_for_normal_product);
        if (requiresNormalPayment) {
          skipPayment = false;
        } else if (status?.can_create_free_normal_product) {
          skipPayment = true;
        }
      }

      if (skipPayment) {
        await submitProduct(null, Boolean(adType?.id));
        setIsLoading(false);
        return;
      }

      // Free quota is used up: a price-0 plan cannot create a Razorpay order (min ₹1)
      if (requiresNormalPayment && isNormalPlan && Number(adType?.price ?? 0) <= 0) {
        AppToast("Free limit reached. Please choose a paid plan to post this ad.");
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

      // Free plan via create-order (amount 0) — include plan_id like Free Product curl
      if ((!totalAmount || totalAmount === 0) && !requiresNormalPayment) {
        await submitProduct(null, Boolean(adType?.id));
        setIsLoading(false);
        return;
      }

      if (!razorpayOrderId || !totalAmount) {
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


  return {
    router,
    categories,
    subCategories,
    plans,
    images,
    setImages,
    title,
    setTitle,
    description,
    setDescription,
    price,
    setPrice,
    selectedCategory,
    selectedSubCategory,
    selectedChildCategory,
    childCategories,
    tempSelectedSubCategory,
    loadingChildrenForId,
    adType,
    setAdType,
    websiteLink,
    setWebsiteLink,
    videoLink,
    setVideoLink,
    websiteLinkError,
    setWebsiteLinkError,
    videoLinkError,
    setVideoLinkError,
    isLoading,
    showCategoryModal,
    setShowCategoryModal,
    categorySearchQuery,
    setCategorySearchQuery,
    tempSelectedCategory,
    setTempSelectedCategory,
    isNegotiable,
    setIsNegotiable,
    condition,
    setCondition,
    showAdditionalDetails,
    setShowAdditionalDetails,
    customFields,
    setCustomFields,
    cropImage,
    setCropImage,
    plansLoading,
    renewalProduct,
    isRenewal,
    renewalProductType,
    isBannerPlan,
    maxImages,
    shouldPostWithoutPayment,
    handleSubCategorySelect,
    pickImage,
    takePhoto,
    removeImage,
    handleWebsiteLinkBlur,
    handleVideoLinkBlur,
    handleRenewal,
    handleSubmit,
    setChildCategories,
    setTempSelectedSubCategory,
    setSelectedCategory,
    setSelectedSubCategory,
    setSelectedChildCategory,
  };
}
