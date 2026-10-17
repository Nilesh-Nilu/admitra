export const getRenewalProductType = (product: any) =>
  String(product?.product_type || product?.plan_info?.plan_type || "").toLowerCase();

export const matchesRenewalPlan = (plan: any, product: any) => {
  const renewalProductType = getRenewalProductType(product);
  const planType = String(plan?.type || plan?.plan_type || "").toLowerCase();
  const isNormalPlan =
    renewalProductType === "normal" && ["normal", "basic", "free"].includes(planType);

  return (
    planType === renewalProductType ||
    isNormalPlan ||
    String(plan?.id) === String(product?.plan_info?.plan_id)
  );
};

export const normalizeHttpUrl = (value: string) => {
  const trimmedValue = value.trim();
  if (!trimmedValue) return "";

  return /^https?:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;
};

export const isValidHttpUrl = (value: string) => {
  try {
    const url = new URL(normalizeHttpUrl(value));
    const isHttpUrl = url.protocol === "http:" || url.protocol === "https:";
    const hasPublicHost =
      url.hostname.includes(".") || /^\d{1,3}(\.\d{1,3}){3}$/.test(url.hostname);

    return isHttpUrl && hasPublicHost;
  } catch {
    return false;
  }
};

/** Matches typical MySQL VARCHAR(255) on product_plans.website_link */
export const MAX_WEBSITE_LINK_LENGTH = 255;

export const isBannerPlanType = (plan: any) =>
  plan?.id === 3 || String(plan?.type || "").toLowerCase() === "banner";

export const isFeaturedPlanType = (plan: any) =>
  plan?.id === 2 || String(plan?.type || "").toLowerCase() === "featured";

// Any plan that is not Featured or Banner is a normal listing plan, so the
// free-quota flow (submitProduct without Razorpay) applies to it.
export const isNormalPlanType = (plan: any) =>
  Boolean(plan) && !isBannerPlanType(plan) && !isFeaturedPlanType(plan);

// Matrimony ads use a dedicated profile form instead of price / condition.
export const isMatrimonyCategoryName = (name?: string) =>
  /matrimon/i.test(String(name || ""));

// Matrimony has its own plan; it is offered only for the Matrimony category.
export const isMatrimonyPlanType = (plan: any) =>
  /matrimon/i.test(`${plan?.name || ""} ${plan?.type || ""} ${plan?.title || ""}`);

// A banner's website link is shown to other users only after Admin has verified it.
// Fail closed: a banner without a verification flag is treated as unverified.
export const isBannerWebsiteLinkVerified = (banner: any) => {
  const source = banner?.plan_info?.website_link_verified != null ? banner.plan_info : banner;
  const flag = source?.website_link_verified;
  const status = String(source?.website_link_status || "").toLowerCase();
  return flag === true || Number(flag) === 1 || status === "approved" || status === "verified";
};

export const getVerifiedBannerWebsiteLink = (banner: any): string | undefined =>
  banner?.website_link && isBannerWebsiteLinkVerified(banner) ? banner.website_link : undefined;
