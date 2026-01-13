import { createSlice } from "@reduxjs/toolkit";
import { apiCallBegan } from "../api";
const initialState = {
  loader: false,
  basicCoursePurchased: false,
  selectedCity: "Select City",
  banners: [],
  serviceCategories: [],
  allServices: [],
  createBooking: null,
  allBookings: [],
  packages: [],
  razorPayOrderId: null,
  youtubeList: [],
};

const userReducer = createSlice({
  name: "userReducer",
  initialState,
  reducers: {
    userReducerDataRequested: (userReducer, action) => {
      userReducer.loader = true;
    },
    userReducerDataRequestFailed: (userReducer, action) => {
      userReducer.loader = false;
      console.log(action.payload,"failed")
    },
    setBannersRecieved: (userReducer, action) => {
      userReducer.loader = false;
      userReducer.banners = action.payload;
    },
    setServiceCategoriesRecieved: (userReducer, action) => {
      userReducer.loader = false;
      userReducer.serviceCategories = action.payload;
    },
    setSelectedCity: (userReducer, action) => {
      userReducer.selectedCity = action.payload;
    },
    setCategoriesByLocationId: (userReducer, action) => {
      userReducer.serviceCategories = action.payload;
    },
    setAllServicesRecieved: (userReducer, action) => {
      userReducer.loader = false;
      userReducer.allServices = action.payload.data;
    },
    setAllServicesbyCategoryIdRecieved: (userReducer, action) => {
      userReducer.loader = false;
      userReducer.allServices = action.payload.data;
    },
    setCreateBookingRecieved: (userReducer, action) => {
      userReducer.loader = false;
      userReducer.createBooking = action.payload;
    },
    setAllBookingsRecieved: (userReducer, action) => {
      userReducer.loader = false;
      userReducer.allBookings = action.payload.data;
    },
    setPackagesRecieved: (userReducer, action) => {
      userReducer.loader = false;
      userReducer.packages = action.payload.data;
    },
    setRazorPayOrderIdRecieved: (userReducer, action) => {
      userReducer.loader = false;
      userReducer.razorPayOrderId = action.payload;
    },
    setYoutubeListRecieved: (userReducer, action) => {
      userReducer.loader = false;
      userReducer.youtubeList = action.payload.data;
    },
  },
});

export const {
  setSelectedCity,
  setCategoriesByLocationId,
  setAllServicesbyCategoryIdRecieved,
  setAllBookingsRecieved,
  setPackagesRecieved,
  setRazorPayOrderIdRecieved,
  setYoutubeListRecieved,
} = userReducer.actions;

const {
  userReducerDataRequestFailed,
  userReducerDataRequested,
  setBannersRecieved,
  setServiceCategoriesRecieved,
  setAllServicesRecieved,
  setCreateBookingRecieved,
} = userReducer.actions;
export const getBannersApi = (url) =>
  apiCallBegan({
    method: "get",
    url,
    onStart: userReducerDataRequested.type,
    onSuccess: setBannersRecieved.type,
    onError: userReducerDataRequestFailed.type,
  });
export const getServiceCategoriesApi = (url) =>
  apiCallBegan({
    method: "get",
    url,
    onStart: userReducerDataRequested.type,
    onSuccess: setServiceCategoriesRecieved.type,
    onError: userReducerDataRequestFailed.type,
  });
export const getAllServicesApi = (url) =>
  apiCallBegan({
    method: "get",
    url,
    onStart: userReducerDataRequested.type,
    onSuccess: setAllServicesRecieved.type,
    onError: userReducerDataRequestFailed.type,
  });
export const createBookingApi = (url, data) =>
  apiCallBegan({
    method: "post",
    url,
    data,
    onStart: userReducerDataRequested.type,
    onSuccess: setCreateBookingRecieved.type,
    onError: userReducerDataRequestFailed.type,
  });
export const getAllBookingsApi = (url) =>
  apiCallBegan({
    method: "get",
    url,
    onStart: userReducerDataRequested.type,
    onSuccess: setAllBookingsRecieved.type,
    onError: userReducerDataRequestFailed.type,
  });
export const getPackagesApi = (url) =>
  apiCallBegan({
    method: "get",
    url,
    onStart: userReducerDataRequested.type,
    onSuccess: setPackagesRecieved.type,
    onError: userReducerDataRequestFailed.type,
  });
export const generateRazorPayOrderIdApi = (url, data) =>
  apiCallBegan({
    method: "post",
    url,
    data,
    onStart: userReducerDataRequested.type,
    onSuccess: setRazorPayOrderIdRecieved.type,
    onError: userReducerDataRequestFailed.type,
  });
export const getYoutubeListApi = (url) =>
  apiCallBegan({
    method: "get",
    url,
    onStart: userReducerDataRequested.type,
    onSuccess: setYoutubeListRecieved.type,
    onError: userReducerDataRequestFailed.type,
  });
export default userReducer.reducer;
