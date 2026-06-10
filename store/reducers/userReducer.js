import { createSlice } from "@reduxjs/toolkit";
import { apiCallBegan } from "../api";
const initialState = {
  loader: false,
  selectedCity: "Select City",
  states: [],
  categories: [],
  subCategories: [],
  products: [],
  featuredAds: [],
  approvedProducts: [],
  chatConversations: [],
  chatMessages: [],
  banners: [],
  plans: [],
  localities: [],
  favorites: [],
  myFeaturedAds: [],
  myBannerAds: []
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
      console.log(action.payload, "userReducerDataRequestFailed");
    },
    setStatesRecieved: (userReducer, action) => {
      userReducer.loader = false;
      userReducer.states = action.payload.data;
    },
    setCitiesRecieved: (userReducer, action) => {
      userReducer.loader = false;
      userReducer.cities = action.payload.data;
    },
    setCategoriesRecieved: (userReducer, action) => {
      userReducer.loader = false;
      userReducer.categories = action.payload.data;
    },
    setSubCategoriesRecieved: (userReducer, action) => {
      userReducer.loader = false;
      userReducer.subCategories = action.payload.data;
    },
    setProductsRecieved: (userReducer, action) => {
      userReducer.loader = false;
      console.log(action.payload.data.data.length,"action.payload.data");
      const raw = action.payload.data;
      const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
      userReducer.products = list.filter((product) => product.approve === "approved");
    },
    setSubCategoriesClear: (userReducer, action) => {
      userReducer.loader = false;
      userReducer.subCategories = []
    },
    setApprovedProductsRecieved: (userReducer, action) => {
      userReducer.loader = false;
      userReducer.approvedProducts = action.payload.data;
    },
    setChatConversationsRecieved: (userReducer, action) => {
      userReducer.loader = false;
      userReducer.chatConversations = action.payload.data;
    },
    setChatMessagesRecieved: (userReducer, action) => {
      userReducer.loader = false;
      userReducer.chatMessages = action.payload.data;
    },
    setBannersRecieved: (userReducer, action) => {
      userReducer.loader = false;
      userReducer.banners = action.payload.data;
    },
    setPlansRecieved: (userReducer, action) => {
      userReducer.loader = false;
      userReducer.plans = action.payload.data;
    },
    setFeaturedAdsRecieved: (userReducer, action) => {
      userReducer.loader = false;
      userReducer.featuredAds = action.payload.data;
    },
    setLocalitiesRecieved: (userReducer, action) => {
      userReducer.loader = false;
      userReducer.localities = action.payload.data;
    },
    setFavoritesRecieved: (userReducer, action) => {
      userReducer.loader = false;
      userReducer.favorites = action.payload.data;
    },
    removeFavoriteById: (userReducer, action) => {
      userReducer.favorites = userReducer.favorites.filter(
        (fav) => fav.id !== action.payload
      );
    },
    setMyFeaturedAdsRecieved: (userReducer, action) => {
      userReducer.loader = false;
      userReducer.myFeaturedAds = action.payload.data;
    },
    setMyBannerAdsRecieved: (userReducer, action) => {
      userReducer.loader = false;
      userReducer.myBannerAds = action.payload.data;
    },
  }
});

export const {
  setSubCategoriesClear,
  removeFavoriteById,
} = userReducer.actions;

const {
  userReducerDataRequestFailed,
  userReducerDataRequested,
  setStatesRecieved,
  setCitiesRecieved,
  setCategoriesRecieved,
  setSubCategoriesRecieved,
  setProductsRecieved,
  setApprovedProductsRecieved,
  setPlansRecieved,
  setBannersRecieved,
  setFeaturedAdsRecieved,
  setLocalitiesRecieved,
  setFavoritesRecieved,
  setMyFeaturedAdsRecieved,
  setMyBannerAdsRecieved,
} = userReducer.actions;
export const getStatesApi = (url) =>
  apiCallBegan({
    method: "get",
    url,
    onStart: userReducerDataRequested.type,
    onSuccess: setStatesRecieved.type,
    onError: userReducerDataRequestFailed.type,
  });
export const getCitiesApi = (url) =>
  apiCallBegan({
    method: "get",
    url,
    onStart: userReducerDataRequested.type,
    onSuccess: setCitiesRecieved.type,
    onError: userReducerDataRequestFailed.type,
  });
export const getCategoriesApi = (url) =>
  apiCallBegan({
    method: "get",
    url,
    onStart: userReducerDataRequested.type,
    onSuccess: setCategoriesRecieved.type,
    onError: userReducerDataRequestFailed.type,
  });
export const getSubCategoriesApi = (url) =>
  apiCallBegan({
    method: "get",
    url,
    onStart: userReducerDataRequested.type,
    onSuccess: setSubCategoriesRecieved.type,
    onError: userReducerDataRequestFailed.type,
  });
export const getProductsApiwithcityId = (url) =>
  apiCallBegan({
    method: "get",
    url,
    onStart: userReducerDataRequested.type,
    onSuccess: setProductsRecieved.type,
    onError: userReducerDataRequestFailed.type,
  });
export const getLocalitiesApi = (url) =>
  apiCallBegan({
    method: "get",
    url,
    onStart: userReducerDataRequested.type,
    onSuccess: setLocalitiesRecieved.type,
    onError: userReducerDataRequestFailed.type,
  });
export const getApprovedProductsApi = (url) =>
  apiCallBegan({
    method: "get",
    url,
    onStart: userReducerDataRequested.type,
    onSuccess: setApprovedProductsRecieved.type,
    onError: userReducerDataRequestFailed.type,
  });
export const getBannersApi = (url) =>
  apiCallBegan({
    method: "get",
    url,
    onStart: userReducerDataRequested.type,
    onSuccess: setBannersRecieved.type,
    onError: userReducerDataRequestFailed.type,
  });
export const getPlansListApi = (url) =>
  apiCallBegan({
    method: "get",
    url,
    onStart: userReducerDataRequested.type,
    onSuccess: setPlansRecieved.type,
    onError: userReducerDataRequestFailed.type,
  });
export const getFeaturedAdsApi = (url) =>
  apiCallBegan({
    method: "get",
    url,
    onStart: userReducerDataRequested.type,
    onSuccess: setFeaturedAdsRecieved.type,
    onError: userReducerDataRequestFailed.type,
  });
export const getFavoritesApi = (url) =>
  apiCallBegan({
    method: "get",
    url,
    onStart: userReducerDataRequested.type,
    onSuccess: setFavoritesRecieved.type,
    onError: userReducerDataRequestFailed.type,
  });
export const getMyFeaturedAdsApi = (url) =>
  apiCallBegan({
    method: "get",
    url,
    onStart: userReducerDataRequested.type,
    onSuccess: setMyFeaturedAdsRecieved.type,
    onError: userReducerDataRequestFailed.type,
  });
export const getMyBannerAdsApi = (url) =>
  apiCallBegan({
    method: "get",
    url,
    onStart: userReducerDataRequested.type,
    onSuccess: setMyBannerAdsRecieved.type,
    onError: userReducerDataRequestFailed.type,
  });

export default userReducer.reducer;
