import { setAllServicesbyCategoryIdRecieved, setCategoriesByLocationId } from "@/store/reducers/userReducer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { logoutFromReducer, setUser } from "../store/reducers/authReducer";
import { baseUrl as API_BASE_URL } from "./config";

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
export const updateUrl = "user/update";

// banners
export const getBannersUrl = "/banner/list";

//service categories
export const getServiceCategoriesUrl = "service-categories";
export const getServicesByCategoryIdUrl = "service/category/";
export const getServicesByLocationIdUrl = "service-categories/location/";
export const getAllServicesUrl = "service/list";

//Location
export const getLocationListUrl = "location/list";

//booking
export const createBookingUrl = "booking/add";
export const getAllBookingsUrl = "booking/list";

//packages
export const getPackagesUrl = "packages";
export const generateRazorPayOrderIdUrl = "subscription/create-order";
export const verifyOrder ="subscription/verify";
//subscription
export const getSubscriptionUrl = "subscription/user";
//youtube
export const getYoutubeUrl = "youtube/list";

export const logoutUser = async (dispatch) => {
  try {
    await AsyncStorage.clear();
    dispatch(logoutFromReducer());
  } catch (error) {
    console.log(error);
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

export const getServicesByCategoryIdApi = async (categoryId,dispatch,func) => {
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

export const getServicesByLocationIdApi = async (locationId,dispatch) => {
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
