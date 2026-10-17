import CropModal from "@/components/modals/CropModal";
import AdditionalDetailsSection from "@/components/post/AdditionalDetailsSection";
import AdTypeSelector from "@/components/post/AdTypeSelector";
import BannerLinksSection from "@/components/post/BannerLinksSection";
import CategoryPickerModal from "@/components/post/CategoryPickerModal";
import CategorySelectField from "@/components/post/CategorySelectField";
import ImageUploadSection from "@/components/post/ImageUploadSection";
import MatrimonyDetailsSection from "@/components/post/MatrimonyDetailsSection";
import PostSubmitButton from "@/components/post/PostSubmitButton";
import PostWarningNotice from "@/components/post/PostWarningNotice";
import ProductBasicFields from "@/components/post/ProductBasicFields";
import RenewalNotice from "@/components/post/RenewalNotice";
import { isBannerPlanType, isMatrimonyCategoryName, matchesRenewalPlan } from "@/components/post/postUtils";
import { usePostAd } from "@/components/post/usePostAd";
import ThemeHeader from "@/components/headers/ThemeHeader";
import { ThemedView } from "@/components/ThemedView";
import { COLORS } from "@/constants/Colors";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { useMemo } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

export default function PostScreen() {
  const {
    router,
    categories,
    subCategories,
    visiblePlans,
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
    setChildCategories,
    tempSelectedSubCategory,
    setTempSelectedSubCategory,
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
    setSelectedCategory,
    setSelectedSubCategory,
    setSelectedChildCategory,
    isMatrimony,
    matrimonyDetails,
    setMatrimonyDetails,
    matrimonyMasters,
    matrimonyMastersLoading,
  } = usePostAd();

  const categoryLabel = useMemo(() => {
    if (!selectedCategory) return "Select Category";
    const catName =
      categories.find((c: any) => c.id === selectedCategory)?.name ||
      renewalProduct?.category?.name ||
      "";
    const subCatName =
      subCategories.find((sc: any) => sc.id === selectedSubCategory)?.name ||
      renewalProduct?.sub_category?.name ||
      "";
    const childName =
      childCategories.find((cc: any) => cc.id === selectedChildCategory)?.name ||
      renewalProduct?.child_category?.name ||
      "";
    return [catName, subCatName, childName].filter(Boolean).join(" > ");
  }, [
    selectedCategory,
    selectedSubCategory,
    selectedChildCategory,
    categories,
    subCategories,
    childCategories,
    renewalProduct,
  ]);

  const handleCategoryModalBack = () => {
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
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ThemeHeader
          onBackPress={() => router.back()}
          title={isRenewal ? "Renew Ad" : "Post Your Ad"}
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {isRenewal && (
            <RenewalNotice
              productName={renewalProduct.name}
              productType={renewalProductType}
            />
          )}

          <View
            pointerEvents={isRenewal ? "none" : "auto"}
            style={isRenewal ? styles.lockedFields : undefined}
          >
            <CategorySelectField
              label={categoryLabel}
              onPress={() => setShowCategoryModal(true)}
            />

          </View>

          {(isRenewal || selectedCategory) && (
            <AdTypeSelector
              plans={visiblePlans.filter(
                (plan: any) => !isRenewal || matchesRenewalPlan(plan, renewalProduct)
              )}
              selectedPlan={adType}
              isLoading={plansLoading}
              isLocked={isRenewal}
              onSelect={(plan) => {
                setAdType(plan);
                if (isBannerPlanType(plan)) {
                  setImages((prev) => prev.slice(0, 1));
                }
              }}
            />
          )}

          <PostWarningNotice />

          <View
            pointerEvents={isRenewal ? "none" : "auto"}
            style={isRenewal ? styles.lockedFields : undefined}
          >
            <ImageUploadSection
              images={images}
              maxImages={maxImages}
              isBannerPlan={isBannerPlan}
              onTakePhoto={takePhoto}
              onPickImage={pickImage}
              onRemoveImage={removeImage}
            />

            {isMatrimony && (
              <MatrimonyDetailsSection
                masters={matrimonyMasters}
                isLoading={matrimonyMastersLoading}
                values={matrimonyDetails}
                onChange={(key, value) =>
                  setMatrimonyDetails((prev) => ({ ...prev, [key]: value }))
                }
              />
            )}

            <ProductBasicFields
              isMatrimony={isMatrimony}
              price={price}
              onPriceChange={setPrice}
              isNegotiable={isNegotiable}
              onToggleNegotiable={() => setIsNegotiable(!isNegotiable)}
              condition={condition}
              onConditionChange={setCondition}
              title={title}
              onTitleChange={setTitle}
              description={description}
              onDescriptionChange={setDescription}
            />

            <AdditionalDetailsSection
              expanded={showAdditionalDetails}
              onToggle={() => setShowAdditionalDetails(!showAdditionalDetails)}
              fields={customFields}
              onChangeFields={setCustomFields}
            />

            {isBannerPlan && !isMatrimony && (
              <BannerLinksSection
                websiteLink={websiteLink}
                videoLink={videoLink}
                websiteLinkError={websiteLinkError}
                videoLinkError={videoLinkError}
                onWebsiteChange={(value) => {
                  setWebsiteLink(value);
                  if (websiteLinkError) setWebsiteLinkError("");
                }}
                onVideoChange={(value) => {
                  setVideoLink(value);
                  if (videoLinkError) setVideoLinkError("");
                }}
                onWebsiteBlur={handleWebsiteLinkBlur}
                onVideoBlur={handleVideoLinkBlur}
              />
            )}
          </View>

          <PostSubmitButton
            isLoading={isLoading}
            isRenewal={isRenewal}
            adType={adType}
            shouldPostWithoutPayment={shouldPostWithoutPayment}
            label={isMatrimony ? "Submit Profile" : undefined}
            onPress={isRenewal ? handleRenewal : handleSubmit}
          />
        </ScrollView>

        <View style={{ height: 100 }} />
      </KeyboardAvoidingView>

      {cropImage && (
        <CropModal
          visible={!!cropImage}
          imageUri={cropImage.uri}
          imageWidth={cropImage.width}
          imageHeight={cropImage.height}
          onClose={() => setCropImage(null)}
          onCrop={(croppedUri) => {
            setImages((prev) => {
              if (prev.length >= maxImages) return prev;
              return [...prev, croppedUri].slice(0, maxImages);
            });
            setCropImage(null);
          }}
        />
      )}

      <CategoryPickerModal
        visible={showCategoryModal}
        categories={categories || []}
        subCategories={subCategories || []}
        childCategories={childCategories}
        tempSelectedCategory={tempSelectedCategory}
        tempSelectedSubCategory={tempSelectedSubCategory}
        categorySearchQuery={categorySearchQuery}
        loadingChildrenForId={loadingChildrenForId}
        onClose={() => {
          setShowCategoryModal(false);
          setTempSelectedCategory(null);
          setTempSelectedSubCategory(null);
          setChildCategories([]);
          setCategorySearchQuery("");
        }}
        onBack={handleCategoryModalBack}
        onSearchChange={setCategorySearchQuery}
        onSelectCategory={(cat) => {
          // Matrimony has no sub/child step: bride/groom is captured by the Gender field.
          if (isMatrimonyCategoryName(cat?.name)) {
            setSelectedCategory(cat.id);
            setSelectedSubCategory(null);
            setSelectedChildCategory(null);
            setChildCategories([]);
            setTempSelectedCategory(null);
            setTempSelectedSubCategory(null);
            setShowCategoryModal(false);
            setCategorySearchQuery("");
            return;
          }
          setTempSelectedCategory(cat);
          setCategorySearchQuery("");
        }}
        onSelectSubCategory={handleSubCategorySelect}
        onSelectChildCategory={(child) => {
          setSelectedCategory(tempSelectedCategory.id);
          setSelectedSubCategory(tempSelectedSubCategory.id);
          setSelectedChildCategory(child.id);
          setShowCategoryModal(false);
          setTempSelectedCategory(null);
          setTempSelectedSubCategory(null);
          setCategorySearchQuery("");
        }}
      />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 20,
  },
  lockedFields: {
    opacity: 0.6,
  },
});
