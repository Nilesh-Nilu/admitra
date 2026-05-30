import { setAllServicesbyCategoryIdRecieved, setCategoriesByLocationId } from "@/store/reducers/userReducer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { logoutFromReducer, setUser } from "../store/reducers/authReducer";
import { baseUrl as API_BASE_URL } from "./config";
import AppToast from "@/components/toasts/AppToast";

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

//products
export const getProductsUrl = "products/all"
export const getApprovedProductsUrl ="vendor/products"
export const getFeaturedAdsUrl = "ads/featured"
export const getBannerAdsUrl = "ads/banner"
export const getProductsByLocationUrl = "products/filter/location"
export const reportProductUrl = "product/report"
export const getPlansListUrl = "admin/plans"
//payment
export const createOrderUrl = "payment/create-order";
export const verifyAndStorePaymentUrl = "payment/verify-and-store";
//chat
export const createChatUrl ="chat/conversation"
export const getAllconversationsUrl ="chat/conversations"
export const getChatMessagesUrl ="chat/conversation/"
export const sendChatMessageUrl ="chat/message"

//profile
export const getPrivacyPolicyUrl = "pages?page_type=privacy_policy"
export const getTermsAndConditionsUrl = "pages?page_type=terms_and_conditions"
export const getRefundPolicyUrl = "pages?page_type=refund_policy"

export const ImageUrl = "https://admastermarketplace.in/storage"
export const RAZORPAY_KEY = "rzp_test_RmeHXdBQXDWzp9"
export const RAZORPAY_SECRET = "ktPiQoi6ak9Lwv7KkhOrcSns"


export const logoutUser = async (dispatch, router,role) => {
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
    console.log(error);
  }
};


export const getAuthManagementListApi = async () => {
  try {
    const response = await axios.get(
      `${baseUrl}/${getAuthManagementListUrl}`,
      {
        headers: {
          Accept: "*/*",
          // 'X-CSRF-TOKEN': '' // If a CSRF token is needed, provide it here
        }
      }
    );
    return response.data;
  } catch (error) {
    console.log("Error fetching auth management list:", error.response?.data || error.message || error);
    throw error;
  }
};

  // ── Send OTP ──────────────────────────────────────────────────────────────
export const handleSendmailOtp = async (email, setLoading, setStep) => {
  console.log(email, "email");
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
      console.log(response.data, "response");
      // API returns { success: true, message: "OTP sent" } or similar
      if (response.data?.success === false) {
        AppToast(response.data?.message || "Failed to send OTP.");
        return;
      }

      AppToast(`OTP sent to your Gmail! ${response.data.otp}`);
      setStep("otp");
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP ────────────────────────────────────────────────────────────
 export const handleVerifymailOtp = async (email, otp, setLoading, router) => {
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
      await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
      await AsyncStorage.setItem("authToken", response.data.access_token);
      router.replace("/(tabs)");
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
export const handleSendPhoneOtp = async (phone, setLoading,setStep) => {
  setLoading(true);
  try {
    const response = await axios.post(
      "https://admastermarketplace.in/api/send-otp",
      { phone },
      {
        headers: {},
      }
    );
    console.log(response.data, "response");
    if (response.data?.success) {
      AppToast(`OTP sent successfully! ${response.data.otp}`);
      setStep("otp");
      // Optionally, handle navigation or further state logic here
    }
  } catch (error) {
   console.log(error)
  } finally {
    setLoading(false);
  }
};
// ── Verify OTP (Phone) ────────────────────────────────────────────────────────
export const handleVerifyPhoneOtp = async (phone, otp, setLoading, router) => {
  // Ensure 'otp' is sent as a string, not an array
  const otpString = Array.isArray(otp) ? otp.join("") : String(otp);
  setLoading(true);
  try {
    const response = await axios.post(
      "https://admastermarketplace.in/api/verify-otp",
      { phone, otp: otpString },
      {
        headers: {
          // Accept: "application/json",
          // "Content-Type": "application/json",
          // "X-CSRF-TOKEN": "",
        },
      }
    );
    if (response.data?.success) {
      AppToast("Login successful!");
      await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
      await AsyncStorage.setItem("authToken", response.data.access_token);
      router.replace("/(tabs)");
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
    console.log(error);
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
    console.log(error.response.data, "error");
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
    console.log(error.response.data, "error");
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
    console.log(error.response.data, "error");
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
    console.log(error);
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
    console.log(error?.response?.data || error, "error");
  }
};

export const handleVerifyandAddProductApi= async (data) => {
  try {
    const response = await axios.post(
      `${baseUrl}/${verifyAndStorePaymentUrl}`,
      data,
      await getAuthToken()
    );
    return response.data;
  }
  catch (error) {
    console.log(error.response.data, "error");
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
    console.log(error?.response?.data || error, "error");
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
    console.log(error?.response?.data || error, "error");
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
    console.log(error?.response?.data || error, "error");
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
    console.log(error?.response?.data || error, "error");
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
    console.log(error?.response?.data || error, "error");
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
    console.log(error?.response?.data || error, "error");
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
    console.log(error?.response?.data || error, "error");
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
    console.log(error?.response?.data || error, "error");
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
    console.log(error?.response?.data || error, "error");
    throw error;
  }
}