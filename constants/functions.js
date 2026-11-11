import { setAllServicesbyCategoryIdRecieved, setCategoriesByLocationId } from "@/store/reducers/userReducer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { logoutFromReducer, setUser } from "../store/reducers/authReducer";
import { baseUrl as API_BASE_URL } from "./config";
import AppToast from "@/components/toasts/AppToast";
// Lazy-loaded at call sites: notifications.js imports this file (avoids a require cycle).
const getfcmToken = async () => (await import("../app/notification/notifications")).getfcmToken();

export const baseUrl = API_BASE_URL;
// Reusable API configuration with auth headers and credentials
export const getAuthToken = async () => {
  const authToken = await AsyncStorage.getItem("authToken");
  return {
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
  };
};

export const isValidImageUri = (uri) => {
  if (typeof uri !== "string") return false;
  const value = uri.trim();
  return value.length > 0 && value !== "null" && value !== "undefined";
};

export const remoteImageSource = (uri) =>
  isValidImageUri(uri) ? { uri: uri.trim() } : require("../assets/images/image.png");

// Razorpay Configuration
export const RAZORPAY_CONFIG = {
  key_id: "rzp_live_NSC6Lu227rXAId",
  key_secret: "QbcQWA2qsb420w8PjNpT48BX",
};
// auth
export const sendOtpUrl = "send-otp";
export const otpVerificationUrl = "verify-otp";
export const getUserDetailsUrl = "user";
export const signupUrl = "auth/register";
export const updateUserProfileUrl = "user/update";
export const getAuthManagementListUrl = "auth-management/list";


// categories
export const getCategoriesUrl = "product-categories";
export const getSubCategoriesUrl = "product-subcategories";

// states and cities
export const getStatesUrl = "states";
export const getCitiesUrl = "cities";
export const getLocalitiesUrl = "localities";

//products
export const getProductsUrl = "products"
export const getApprovedProductsUrl = "vendor/products"
export const getFeaturedAdsUrl = "ads/featured"
export const getBannerAdsUrl = "ads/banner"
export const reportProductUrl = "product/report"
export const getPlansListUrl = "admin/plans"
export const favoritesUrl = "favorites"
export const getMyFeaturedAdsUrl = "ads/my-featured"
export const getMyBannerAdsUrl = "ads/my-banners"
export const getMyProductsUrl = "ads/my-products?per_page=10"
//payment
export const createOrderUrl = "payment/create-order";
export const freeProductStatusUrl = "payment/free-product-status";
export const verifyAndStorePaymentUrl = "payment/verify-and-store";
export const createRenewalOrderUrl = "payment/create-renewal-order";
export const verifyRenewalUrl = "payment/verify-renewal";
//chat
export const createChatUrl = "chat/conversation"
export const getAllconversationsUrl = "chat/conversations"
export const getChatMessagesUrl = "chat/conversation/"
export const sendChatMessageUrl = "chat/message"

//profile
export const getPrivacyPolicyUrl = "pages?page_type=privacy_policy"
export const getTermsAndConditionsUrl = "pages?page_type=terms_and_conditions"
export const getRefundPolicyUrl = "pages?page_type=refund_policy"

export const ImageUrl = "https://admastermarketplace.in/storage"
export const RAZORPAY_KEY = "rzp_live_T2fhltsbtA4p7F"
export const RAZORPAY_SECRET = "2oBi1D8Wae98kGE7tr957Oek"

// verifing warning
export const getVerifyingWarningUrl = "getverifywarning"

// matrimony
export const matrimonyMasterDataUrl = "matrimony/master-data";
export const matrimonyProfilesUrl = "matrimony/profiles";
export const myMatrimonyProfilesUrl = "matrimony/my-profiles";
export const matrimonyPlansUrl = "matrimony/plans";
export const matrimonyCreateOrderUrl = "matrimony/payment/create-order";
export const matrimonyVerifyAndSaveUrl = "matrimony/payment/verify-and-save";
export const matrimonyRenewUrl = "matrimony/payment/renew";
export const matrimonyPaymentHistoryUrl = "matrimony/payment/history";
const MATRIMONY_MASTER_ENDPOINTS = {
  genders: "genders",
  heights: "heights",
  marital_statuses: "marital-statuses",
  religions: "religions",
  caste_communities: "caste-communities",
  nationalities: "nationalities",
  diets: "diets",
  smoking_habits: "smoking-habits",
  drinking_habits: "drinking-habits",
  hobbies: "hobbies",
};

/** Convert local/remote/server-path images into a data URI the update API accepts. */
export const toUploadableImage = async (value) => {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("data:")) return trimmed;

  try {
    const FileSystem = await import("expo-file-system");
    let localUri = trimmed;

    if (
      !trimmed.startsWith("file:") &&
      !trimmed.startsWith("content:")
    ) {
      const remoteUrl =
        trimmed.startsWith("http://") || trimmed.startsWith("https://")
          ? trimmed
          : `${ImageUrl}/${trimmed.replace(/^\//, "")}`;
      const dest = `${FileSystem.cacheDirectory}upload_${Date.now()}.jpg`;
      const downloaded = await FileSystem.downloadAsync(remoteUrl, dest);
      localUri = downloaded.uri;
    }

    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    return "";
  }
};


export const logoutUser = async (dispatch, router, role) => {
  try {
    await AsyncStorage.clear();
    dispatch(logoutFromReducer());
    router.replace({
      pathname: "/(auth)/login",
      params: {
        role
      }
    });
  } catch (error) {
  }
};


export const getAuthManagementListApi = async () => {
  try {
    const response = await axios.get(
      `${baseUrl}/${getAuthManagementListUrl}`,
      {
        timeout: 8000,
        headers: {
          Accept: "application/json",
        },
      }
    );
    // API shape: { success, message, data: [...] }
    const list = response?.data?.data;
    return Array.isArray(list) ? list : [];
  } catch (error) {
    throw error;
  }
};

// ── Send OTP ──────────────────────────────────────────────────────────────
export const handleSendmailOtp = async (email, setLoading, setStep) => {
  setLoading(true);
  try {
    const response = await axios.post(
      "https://admastermarketplace.in/api/send-mailotp",
      { email: email },
      {
        headers: {
        },
      }
    );
    // API returns { success: true, message: "OTP sent" } or similar
    if (response.data?.success === false) {
      AppToast(response.data?.message || "Failed to send OTP.");
      return;
    }

    // AppToast(`OTP sent to your Gmail! ${response.data.otp}`);
    setStep("otp");
  } catch (error) {
  } finally {
    setLoading(false);
  }
};

// ── Verify OTP ────────────────────────────────────────────────────────────
export const handleVerifymailOtp = async (email, otp, setLoading, router, dispatch) => {
  const code = otp.join("");
  if (code.length < 6) {
    AppToast("Enter the 6-digit OTP");
    return;
  }
  setLoading(true);
  try {
    const response = await axios.post(
      "https://admastermarketplace.in/api/verify-mailotp", // 🔁 replace with your actual verify endpoint
      { email: email, otp: code },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
          "X-CSRF-TOKEN": "",
        },
      }
    );

    if (response.data?.success === false) {
      AppToast(response.data?.message || "Invalid OTP.");
      return;
    }
    dispatch(setUser(response.data.user));
    await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
    await AsyncStorage.setItem("authToken", response.data.access_token);
    getfcmToken().catch(() => {});
    if (response.data.user.name === null) {
      router.replace({
        pathname: "/(auth)/loginFields",
        params: {
          user: JSON.stringify(response.data.user)
        }
      });
    } else {
      router.replace("/(tabs)");
    }
    AppToast("Login successful!");
  } catch (error) {
    const msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Invalid OTP. Please try again.";
    AppToast(msg);
  } finally {
    setLoading(false);
  }
};

// ── Send OTP (Phone) ─────────────────────────────────────────────────────────
export const handleSendPhoneOtp = async (phone, setLoading, setStep) => {
  setLoading(true);
  try {
    const response = await axios.post(
      "https://admastermarketplace.in/api/send-otp",
      { phone },
      {
        headers: {},
      }
    );
    if (response.data?.success) {
      // AppToast(`OTP sent successfully! ${response.data.otp}`);
      setStep("otp");
      // Optionally, handle navigation or further state logic here
    }
  } catch (error) {
  } finally {
    setLoading(false);
  }
};
// ── Verify OTP (Phone) ────────────────────────────────────────────────────────
export const handleVerifyPhoneOtp = async (phone, otp, setLoading, router, dispatch) => {
  // Ensure 'otp' is sent as a string, not an array
  const otpString = Array.isArray(otp) ? otp.join("") : String(otp);
  setLoading(true);
  try {
    const response = await axios.post(
      "https://admastermarketplace.in/api/verify-otp",
      { phone, otp: otpString },
      {
        headers: {},
      }
    );
    if (response.data?.success) {
      AppToast("Login successful!");
      dispatch(setUser(response.data.user));
      await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
      await AsyncStorage.setItem("authToken", response.data.access_token);
      getfcmToken().catch(() => {});
      if (response.data.user.name === null) {
        router.replace({
          pathname: "/(auth)/loginFields",
          params: {
            user: JSON.stringify(response.data.user)
          }
        });
      } else {
        router.replace("/(tabs)");
      }
    } else {
      const msg =
        response.data?.message ||
        response.data?.error ||
        "Invalid OTP. Please try again.";
      AppToast(msg);
    }
  } catch (error) {
    const msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Invalid OTP. Please try again.";
    AppToast(msg);
  } finally {
    setLoading(false);
  }
};

export const getUserDetailsApi = async (id, dispatch, func) => {
  try {
    const response = await axios.get(
      `${baseUrl}/${getUserDetailsUrl}/${id}`,
      await getAuthToken()
    );
    const user = response.data.data;
    if (user) {
      await AsyncStorage.setItem("user", JSON.stringify(user));
      dispatch(setUser(user));
    }
  } catch (error) {
  } finally {
    if (func) {
      func();
    }
  }
};

export const getSubscriptionApi = async (id) => {
  try {
    const response = await axios.get(
      `${baseUrl}/${getSubscriptionUrl}/${id}`,
      await getAuthToken()
    );
    const subscription = response.data;
    return subscription;
  } catch (error) {
  }
}

export const getServicesByCategoryIdApi = async (categoryId, dispatch, func) => {
  try {
    const response = await axios.get(
      `${baseUrl}/${getServicesByCategoryIdUrl}${categoryId}`,
      await getAuthToken()
    );
    const services = response.data;
    dispatch(setAllServicesbyCategoryIdRecieved(services));
    return services;
  } catch (error) {
  } finally {
    if (func) {
      func();
    }
  }
}

export const getServicesByLocationIdApi = async (locationId, dispatch) => {
  try {
    const response = await axios.get(
      `${baseUrl}/${getServicesByLocationIdUrl}${locationId}`,
      await getAuthToken()
    );
    const services = response.data;
    dispatch(setCategoriesByLocationId(services))
    return services;
  }
  catch (error) {
  }
}

export const getLocationListApi = async (setLocations) => {
  try {
    const response = await axios.get(
      `${baseUrl}/${getLocationListUrl}`,
      await getAuthToken()
    );
    const locations = response.data;
    setLocations(locations);
    return locations;
  } catch (error) {
  }
};

export const getFreeProductStatusApi = async () => {
  try {
    const response = await axios.get(
      `${baseUrl}/${freeProductStatusUrl}`,
      await getAuthToken()
    );
    return response.data?.data ?? response.data;
  } catch (error) {
    throw error;
  }
};

export const createOrderApi = async (plan_id) => {
  try {
    const authConfig = await getAuthToken();

    const config = {
      ...authConfig,
      headers: {
        ...(authConfig.headers || {}),
        'accept': '*/*',
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': '',
      },
    };
    const response = await axios.post(
      `${baseUrl}/${createOrderUrl}`,
      { plan_id: plan_id }, // explicit property for clarity
      config
    );
    return response.data;
  } catch (error) {
  }
};

export const createRenewalOrderApi = async (product_id, plan_id) => {
  try {
    const authConfig = await getAuthToken();
    const response = await axios.post(
      `${baseUrl}/${createRenewalOrderUrl}`,
      { product_id, plan_id },
      {
        ...authConfig,
        headers: {
          ...(authConfig.headers || {}),
          accept: "application/json",
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": "",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyRenewalApi = async (data) => {
  try {
    const authConfig = await getAuthToken();
    const response = await axios.post(
      `${baseUrl}/${verifyRenewalUrl}`,
      data,
      {
        ...authConfig,
        headers: {
          ...(authConfig.headers || {}),
          accept: "application/json",
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": "",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const handleVerifyandAddProductApi = async (data) => {
  try {
    const authConfig = await getAuthToken();
    const config = {
      ...authConfig,
      headers: {
        ...(authConfig.headers || {}),
        'accept': 'application/json',
        'X-CSRF-TOKEN': '',
      },
    };
    const response = await axios.post(
      `${baseUrl}/${verifyAndStorePaymentUrl}`,
      data,
      config
    );
    return response.data;
  }
  catch (error) {
    throw error;
  }
}
//chat
export const createConversationApi = async (data) => {
  try {
    const response = await axios.post(
      `${baseUrl}/chat/conversation`,
      data,
      await getAuthToken()
    );
    return response.data.data;
  } catch (error) {
    AppToast(error?.response?.data?.message || "Failed to create conversation");
    throw error;
  }
};

export const sendChatMessageApi = async (data) => {
  try {
    const response = await axios.post(
      `${baseUrl}/chat/message`,
      data,
      await getAuthToken()
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getConversationMessagesApi = async (conversationId, perPage = 20) => {
  try {
    const authConfig = await getAuthToken();
    // Add accept header as in the curl, merge with authConfig
    const config = {
      ...authConfig,
      headers: {
        ...authConfig.headers,
        Accept: "*/*",
        // X-CSRF-TOKEN could be set here if needed
      },
      params: {
        per_page: perPage
      }
    };
    const response = await axios.get(
      `${baseUrl}/chat/conversation/${conversationId}/messages`,
      config
    );
    return response.data.data.messages;
  } catch (error) {
    throw error;
  }
}

export const getConversationApi = async () => {
  try {
    const response = await axios.get(
      `${baseUrl}/chat/conversations`,
      await getAuthToken()
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
}

export const markConversationAsReadApi = async (conversationId) => {
  try {
    const authConfig = await getAuthToken();
    const config = {
      ...authConfig,
      headers: {
        ...authConfig.headers,
        Accept: "*/*",
        // Provided curl leaves 'X-CSRF-TOKEN' empty, so you can add it if needed.
        "X-CSRF-TOKEN": ""
      }
    };
    const response = await axios.put(
      `${baseUrl}/chat/conversation/${conversationId}/read`,
      {}, // No payload in curl
      config
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPolicyApi = async () => {
  try {
    const response = await axios.get(
      `${baseUrl}/pages`,
      await getAuthToken()
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
}

/** POST matrimony/profile/report — { matrimony_profile_id, reason } */
export const reportMatrimonyProfileApi = async (data) => {
  const response = await axios.post(`${baseUrl}/matrimony/profile/report`, data, await getAuthToken());
  return response.data;
};

export const reportUserApi = async (data) => {
  try {
    const response = await axios.post(
      `${baseUrl}/user/report`,
      data,
      await getAuthToken()
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const reportProductApi = async (data) => {
  try {
    const response = await axios.post(
      `${baseUrl}/${reportProductUrl}`,
      data,
      await getAuthToken()
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const getPromotionBannerApi = async () => {
  try {
    const response = await axios.get(
      `${baseUrl}/business-promotion/get-all`,
      await getAuthToken()
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
}

export const getBannerWarningApi = async () => {
  try {
    const response = await axios.get(
      `${baseUrl}/banner-warning/get-all`,
      await getAuthToken()
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
}
export const getCallManagementApi = async () => {
  try {
    const response = await axios.get(
      `${baseUrl}/call-management`,
      await getAuthToken()
    );
    return response.data.data[0];
  } catch (error) {
    throw error;
  }
}

export const getChildCategoriesApi = async (subCategoryId) => {
  try {
    const response = await axios.get(
      `${baseUrl}/subcategories/${subCategoryId}/children`,
      await getAuthToken()
    );
    return response.data.data || [];
  } catch (error) {
    return [];
  }
};

export const addToFavoritesApi = async (product_id) => {
  try {
    const authConfig = await getAuthToken();
    const config = {
      ...authConfig,
      headers: {
        ...(authConfig.headers || {}),
        'accept': 'application/json',
        'X-CSRF-TOKEN': '',
      },
    };
    const response = await axios.post(
      `${baseUrl}/favorites`,
      { product_id },
      config
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getFavoritesListApi = async () => {
  try {
    const authConfig = await getAuthToken();
    const config = {
      ...authConfig,
      headers: {
        ...(authConfig.headers || {}),
        'accept': 'application/json',
        'X-CSRF-TOKEN': '',
      },
    };
    const response = await axios.get(`${baseUrl}/favorites`, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const removeFromFavoritesApi = async (id) => {
  try {
    const authConfig = await getAuthToken();
    const config = {
      ...authConfig,
      headers: {
        ...(authConfig.headers || {}),
        'accept': 'application/json',
        'X-CSRF-TOKEN': '',
      },
    };
    const response = await axios.delete(`${baseUrl}/favorites/${id}`, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getVerifyingWarningApi = async () => {
  try {
    const response = await axios.get(
      `${baseUrl}/${getVerifyingWarningUrl}`,
      await getAuthToken()
    );
    return response.data.data || [];
  } catch (error) {
    return [];
  }
};


export const getNotifications = async (
  userId,
  page = 1,
  perPage = 15
) => {
  const response = await axios.get(
    `${API_BASE_URL}/notifications/${userId}`,
    {
      params: {
        is_read: false,
        per_page: perPage,
        page,
      },
      headers: {
        accept: "application/json",
        ...(await getAuthToken()).headers
      },
    }
  );

  return response.data;
};
export const getNormalAdsInfoApi = async (
) => {
  try {
    const response = await axios.get(
      `${baseUrl}/normal-ads-info`,
      await getAuthToken()
    );
    return response.data.data[0];
  } catch (error) {
    if (error?.response?.status === 401) {
      // Return a sentinel value or throw so the caller knows it's unauthenticated
      throw new Error("Unauthenticated");
    }
    throw error;
  }
};
export const getFeaturedAdsInfoApi = async (
) => {
  try {
    const response = await axios.get(
      `${baseUrl}/feature-information`,
      await getAuthToken()
    );
    return response.data.data[0];
  } catch (error) {
    if (error?.response?.status === 401) {
      throw new Error("Unauthenticated");
    }
    throw error;
  }
};

export const getFreeTrialStatusApi = async (
  userId
) => {
  try {
    const response = await axios.get(
      `${baseUrl}/users/${userId}/free-status`,
      await getAuthToken()
    );
  
    const responseTrial = await axios.get(
      `${baseUrl}/users/${userId}/free-trial-status`,
      await getAuthToken()
    );
  
    const isFree = Boolean(response.data?.data?.is_free);
    const isTrialActive = Boolean(responseTrial.data?.data?.is_active);
    return isFree || isTrialActive;
  } catch (error) {
    throw error;
  }
};

export const markNotificationRead = async (
  userId,
  notificationId
) => {
  const response = await axios.put(
    `${API_BASE_URL}/notifications/${userId}/${notificationId}/read`,
    {
      is_read: true,
    },
    {
      headers: {
        accept: "application/json",
        ...(await getAuthToken()).headers
      },
    }
  );

  return response.data;
};

export const getProductByIdApi = async (productId) => {
  try {
    const authConfig = await getAuthToken();
    const config = {
      ...authConfig,
      headers: {
        ...(authConfig.headers || {}),
        'accept': '*/*',
        'X-CSRF-TOKEN': '',
      },
    };
    const response = await axios.get(
      `https://admastermarketplace.in/api/products/${productId}`,
      config
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};


/** All active matrimony masters (Admin-managed). Falls back to the per-master endpoints. */
export const getMatrimonyMasterDataApi = async () => {
  const authConfig = await getAuthToken();
  try {
    const response = await axios.get(`${baseUrl}/${matrimonyMasterDataUrl}`, authConfig);
    if (response.data?.data && typeof response.data.data === "object") return response.data.data;
  } catch (error) {
  }

  const entries = await Promise.all(
    Object.entries(MATRIMONY_MASTER_ENDPOINTS).map(async ([key, path]) => {
      try {
        const response = await axios.get(`${baseUrl}/matrimony/master/${path}`, authConfig);
        return [key, Array.isArray(response.data?.data) ? response.data.data : []];
      } catch {
        return [key, []];
      }
    })
  );
  return Object.fromEntries(entries);
};

/** Active caste communities of one religion (GET matrimony/master/caste-communities?religion_id=). */
export const getCasteCommunitiesByReligionApi = async (religionId) => {
  const response = await axios.get(
    `${baseUrl}/matrimony/master/caste-communities?religion_id=${religionId}`,
    await getAuthToken()
  );
  return Array.isArray(response.data?.data) ? response.data.data : [];
};

export const createMatrimonyProfileApi = async (data) => {
  const authConfig = await getAuthToken();
  const response = await axios.post(`${baseUrl}/${matrimonyProfilesUrl}`, data, {
    ...authConfig,
    headers: { ...(authConfig.headers || {}), accept: "application/json" },
  });
  return response.data;
};

/**
 * Paginated matrimony profiles of the opposite gender (GET matrimony/profiles/opposite-gender).
 * `filters` may carry religion_id, marital_status_id, caste_community_id, product_category_id,
 * mother_tongue, city_id, name, city, search, sort_by, sort_direction.
 * Falls back to the public list when the user has no matrimony profile yet.
 * Resolves to the paginator ({ data, current_page, last_page, ... }).
 */
export const getMatrimonyProfilesApi = async (page = 1, perPage = 20, filters = {}) => {
  const authConfig = await getAuthToken();
  const params = { sort_by: "created_at", sort_direction: "desc", ...filters, page, per_page: perPage };
  try {
    const response = await axios.get(`${baseUrl}/${matrimonyOppositeGenderUrl}`, { ...authConfig, params });
    const body = response.data?.data;
    if (body && (Array.isArray(body) || Array.isArray(body.data))) return Array.isArray(body) ? { data: body } : body;
  } catch (error) {
  }
  const response = await axios.get(`${baseUrl}/${matrimonyProfilesUrl}`, { ...authConfig, params });
  return response.data?.data || { data: [] };
};

/** The signed-in user's matrimony profiles (GET matrimony/my-profiles). Falls back to paging the public list. */
export const getMyMatrimonyProfilesApi = async (userId, perPage = 50, maxPages = 10) => {
  try {
    const response = await axios.get(`${baseUrl}/${myMatrimonyProfilesUrl}`, await getAuthToken());
    const rows = response.data?.data;
    if (Array.isArray(rows)) return rows;
    if (Array.isArray(rows?.data)) return rows.data;
  } catch (error) {
  }
  if (userId == null) return [];
  const mine = [];
  for (let page = 1; page <= maxPages; page++) {
    const paginator = await getMatrimonyProfilesApi(page, perPage);
    const rows = Array.isArray(paginator?.data) ? paginator.data : [];
    rows.forEach((row) => {
      const ownerId = row?.user?.user_id ?? row?.user?.id ?? row?.user_id;
      if (ownerId != null && Number(ownerId) === Number(userId)) mine.push(row);
    });
    if (!paginator?.last_page || page >= paginator.last_page) break;
  }
  return mine;
};

export const getMatrimonyProfileByIdApi = async (id) => {
  const response = await axios.get(`${baseUrl}/${matrimonyProfilesUrl}/${id}`, await getAuthToken());
  return response.data?.data || null;
};

const matrimonyJsonConfig = async () => {
  const authConfig = await getAuthToken();
  return {
    ...authConfig,
    headers: {
      ...(authConfig.headers || {}),
      accept: "application/json",
      "Content-Type": "application/json",
    },
  };
};

/** Active matrimony plans: { plans, registrationFee }. */
export const getMatrimonyPlansApi = async () => {
  const response = await axios.get(`${baseUrl}/${matrimonyPlansUrl}`, await getAuthToken());
  return {
    plans: Array.isArray(response.data?.data) ? response.data.data : [],
    registrationFee: Number(response.data?.registration_fee ?? 0) || 0,
  };
};

/** Razorpay order for a matrimony plan: { order_id, total_amount, razorpay_key, ... }. */
export const createMatrimonyOrderApi = async (plan_id) => {
  const response = await axios.post(
    `${baseUrl}/${matrimonyCreateOrderUrl}`,
    { plan_id },
    await matrimonyJsonConfig()
  );
  return response.data?.data ?? response.data;
};

/** Verifies the Razorpay payment and creates the matrimony profile. */
export const verifyMatrimonyPaymentAndSaveApi = async (data) => {
  const response = await axios.post(
    `${baseUrl}/${matrimonyVerifyAndSaveUrl}`,
    data,
    await matrimonyJsonConfig()
  );
  return response.data;
};

/** Renews the user's matrimony plan after a Razorpay payment. */
export const renewMatrimonyPlanApi = async (data) => {
  const response = await axios.post(`${baseUrl}/${matrimonyRenewUrl}`, data, await matrimonyJsonConfig());
  return response.data;
};

export const getMatrimonyPaymentHistoryApi = async () => {
  const response = await axios.get(`${baseUrl}/${matrimonyPaymentHistoryUrl}`, await getAuthToken());
  return response.data?.data ?? null;
};

// ── New features (23-10-2026 requirements) ─────────────────────────────────
// Endpoint paths below are agreed placeholders until the backend publishes them;
// change the path here and every screen follows.
// Forgot password, per the Swagger "Forgot Password" section:
//   POST forgot-password/send-otp   { email }                       → sends OTP
//   POST forgot-password/verify-otp { email, otp }                  → { reset_token }
//   POST forgot-password/reset      { email, reset_token, password, password_confirmation }
export const forgotPasswordUrl = "forgot-password/send-otp";
export const verifyForgotOtpUrl = "forgot-password/verify-otp";
export const resetPasswordUrl = "forgot-password/reset";
export const changePasswordUrl = "change-password"; // POST { current_password, password, password_confirmation }

// Per-module edit-price / delete for the user's own ads (banner id for banner ads, product id otherwise).
const MY_AD_ENDPOINTS = {
  normal: "ads/normal",
  featured: "ads/featured",
  banner: "ads/banner",
};
export const matrimonyProfileDeleteUrl = "matrimony/profiles"; // DELETE matrimony/profiles/{id}

// Filters for the See All screens: GET <url>?category_id=&min_price=&max_price=&sort_by=&sort_direction=
export const adFilterUrls = {
  normal: "products", // GET ?per_page&page&category_id&sub_category_id&child_category_id&min_price&max_price&sort_by(latest|price_asc|price_desc|oldest)
  featured: "ads/featured",
  banner: "ads/banner",
  matrimony: "matrimony/profiles/opposite-gender",
};
export const matrimonyOppositeGenderUrl = "matrimony/profiles/opposite-gender";
export const matrimonySearchUrl = "matrimony/profiles/search"; // GET ?search=
export const matrimonyPromotionUrl = "matrimony-promotion/get-all"; // same shape as business-promotion
export const howToPostAdUrl = "how-to-post-ads"; // [{ id, title, description, link, link_text, icon, is_active }]

const jsonAuthConfig = async () => {
  const authConfig = await getAuthToken();
  return {
    ...authConfig,
    headers: { ...(authConfig.headers || {}), accept: "application/json", "Content-Type": "application/json" },
  };
};

/** Server message from an axios error, or the fallback. */
export const getApiErrorMessage = (error, fallback) => {
  const data = error?.response?.data;
  const firstFieldError = data?.errors && Object.values(data.errors).flat()[0];
  return firstFieldError || data?.message || fallback;
};

const postJson = async (url, data) => {
  const response = await axios.post(`${baseUrl}/${url}`, data, {
    headers: { Accept: "application/json", "Content-Type": "application/json" },
  });
  return response.data;
};

/** Step 1: emails the OTP to the account. */
export const forgotPasswordApi = (email) => postJson(forgotPasswordUrl, { email });

/** Step 2: checks the OTP; resolves to the reset token (also at res.reset_token or res.data.reset_token). */
export const verifyForgotOtpApi = (email, otp) => postJson(verifyForgotOtpUrl, { email, otp });

/** Step 3: sets the new password with the reset token from step 2. */
export const resetPasswordApi = ({ email, resetToken, password, passwordConfirmation }) =>
  postJson(resetPasswordUrl, {
    email,
    reset_token: resetToken,
    password,
    password_confirmation: passwordConfirmation,
  });

export const changePasswordApi = async (data) => {
  const response = await axios.post(`${baseUrl}/${changePasswordUrl}`, data, await jsonAuthConfig());
  return response.data;
};

/** PUT products/{id} — JSON body (images as base64 strings when present). */
export const updateProductApi = async (id, data) => {
  try {
    const response = await axios.put(`${baseUrl}/products/${id}`, data, await jsonAuthConfig());
    return response.data;
  } catch (error) {
    // Temporary: log the exact request and backend error body to debug the SQL error.
    console.log("[updateProductApi] PUT /products/" + id + " request:", JSON.stringify(data));
    console.log("[updateProductApi] status:", error?.response?.status);
    console.log("[updateProductApi] response:", JSON.stringify(error?.response?.data));
    throw error;
  }
};

/** POST ads/featured/{id} — { name, description, price, condition, price_negotiable }. */
export const updateFeaturedAdApi = async (id, data) => {
  const response = await axios.post(`${baseUrl}/ads/featured/${id}`, data, await jsonAuthConfig());
  return response.data;
};

/**
 * POST ads/banner/{id} — id is the ProductPlan (banner) id.
 * data: { banner_image?: { uri, name?, type? }, banner_video_url?, website_link? }
 * Sent as multipart with _method=PUT (required by the backend for image upload).
 */
export const updateBannerAdApi = async (id, data = {}) => {
  const form = new FormData();
  form.append("_method", "PUT");
  if (data.banner_video_url != null) form.append("banner_video_url", data.banner_video_url);
  if (data.website_link != null) form.append("website_link", data.website_link);
  if (data.banner_image?.uri) {
    form.append("banner_image", {
      uri: data.banner_image.uri,
      name: data.banner_image.name || "banner.jpg",
      type: data.banner_image.type || "image/jpeg",
    });
  }
  const authConfig = await getAuthToken();
  const response = await axios.post(`${baseUrl}/ads/banner/${id}`, form, {
    ...authConfig,
    headers: { ...(authConfig.headers || {}), Accept: "application/json", "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * type: "normal" | "featured" | "banner". The update endpoints require name, price and status
 * (and the other product fields), so the ad is loaded first and sent back with only the price changed.
 * Banner ads have no price of their own; their product price is edited.
 */
export const updateMyAdPriceApi = async (type, id, price) => {
  const res = await getProductByIdApi(id);
  const current = res?.data?.data ?? res?.data ?? res ?? {};
  // Send exactly the types the spec validates (422 otherwise): integers for ids, boolean status,
  // number price, and optional fields omitted rather than sent as null/undefined.
  const toId = (value) => {
    const n = Number(value);
    return value != null && value !== "" && Number.isInteger(n) ? n : undefined;
  };
  const isTrue = (value) => value === true || value === 1 || value === "1" || value === "true";
  const full = {
    category_id: toId(current.category_id),
    sub_category_id: toId(current.sub_category_id),
    child_category_id: toId(current.child_category_id),
    name: current.name,
    description: current.description ?? "",
    condition: ["new", "used"].includes(current.condition) ? current.condition : undefined,
    price_negotiable: isTrue(current.price_negotiable),
    custom_fields: (Array.isArray(current.custom_fields) ? current.custom_fields : [])
      .map((field) => ({ name: String(field?.name ?? ""), value: String(field?.value ?? "") }))
      .filter((field) => field.name && field.value)
      .slice(0, 4),
    status: current.status == null ? true : isTrue(current.status) || ["active", "approved"].includes(current.status),
    price: Number(price),
  };
  Object.keys(full).forEach((key) => full[key] === undefined && delete full[key]);
  if (type === "featured") {
    const { category_id, sub_category_id, child_category_id, status, custom_fields, ...featured } = full;
    return updateFeaturedAdApi(id, featured);
  }
  return updateProductApi(id, full);
};

// Matrimony Promotion CRUD (get-all is used by getMatrimonyPromotionApi above).
export const addMatrimonyPromotionApi = async (data) => {
  const response = await axios.post(`${baseUrl}/matrimony-promotion/add`, data, await jsonAuthConfig());
  return response.data;
};
export const getMatrimonyPromotionByIdApi = async (id) => {
  const response = await axios.get(`${baseUrl}/matrimony-promotion/get/${id}`, await jsonAuthConfig());
  return response.data;
};
export const updateMatrimonyPromotionApi = async (id, data) => {
  const response = await axios.post(`${baseUrl}/matrimony-promotion/update/${id}`, data, await jsonAuthConfig());
  return response.data;
};
export const deleteMatrimonyPromotionApi = async (id) => {
  const response = await axios.delete(`${baseUrl}/matrimony-promotion/delete/${id}`, await jsonAuthConfig());
  return response.data;
};

/** type: "normal" | "featured" | "banner" | "matrimony" */
export const deleteMyAdApi = async (type, id) => {
  const base = type === "matrimony" ? matrimonyProfileDeleteUrl : MY_AD_ENDPOINTS[type] || MY_AD_ENDPOINTS.normal;
  const response = await axios.delete(`${baseUrl}/${base}/${id}`, await jsonAuthConfig());
  return response.data;
};

/** Rows from a filter endpoint, or null when the endpoint is unavailable (callers then filter locally). */
export const getFilteredAdsApi = async (module, params) => {
  try {
    const response = await axios.get(`${baseUrl}/${adFilterUrls[module]}`, { ...(await getAuthToken()), params: { per_page: 100, ...params } });
    const rows = response.data?.data;
    if (Array.isArray(rows)) return rows;
    if (Array.isArray(rows?.data)) return rows.data;
    return null;
  } catch {
    return null;
  }
};

/** Matrimony search rows, or null when the endpoint is unavailable. */
export const searchMatrimonyProfilesApi = async (search) => {
  try {
    const response = await axios.get(`${baseUrl}/${matrimonyOppositeGenderUrl}`, { ...(await getAuthToken()), params: { search, per_page: 50 } });
    const rows = response.data?.data;
    if (Array.isArray(rows)) return rows;
    if (Array.isArray(rows?.data)) return rows.data;
    return null;
  } catch {
    return null;
  }
};

const getActiveList = async (url) => {
  try {
    const response = await axios.get(`${baseUrl}/${url}`, await getAuthToken());
    const rows = Array.isArray(response.data?.data) ? response.data.data : [];
    return rows.filter((row) => row?.is_active !== false && row?.is_active !== 0 && row?.status !== 0);
  } catch {
    return [];
  }
};

export const getMatrimonyPromotionApi = () => getActiveList(matrimonyPromotionUrl);
export const getHowToPostAdApi = () => getActiveList(howToPostAdUrl);

// How-to-post-ad content management: POST/PUT/DELETE how-to-post-ads[/{id}]
export const getHowToPostAdByIdApi = async (id) => {
  const response = await axios.get(`${baseUrl}/${howToPostAdUrl}/${id}`, await jsonAuthConfig());
  return response.data;
};
export const createHowToPostAdApi = async (data) => {
  const response = await axios.post(`${baseUrl}/${howToPostAdUrl}`, data, await jsonAuthConfig());
  return response.data;
};
export const updateHowToPostAdApi = async (id, data) => {
  const response = await axios.put(`${baseUrl}/${howToPostAdUrl}/${id}`, data, await jsonAuthConfig());
  return response.data;
};
export const deleteHowToPostAdApi = async (id) => {
  const response = await axios.delete(`${baseUrl}/${howToPostAdUrl}/${id}`, await jsonAuthConfig());
  return response.data;
};
