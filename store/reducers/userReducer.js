import { createSlice } from "@reduxjs/toolkit";
import { apiCallBegan } from "../api";
const initialState = {
  loader: false,
  selectedCity: "Select City",
  states: [],
  categories: [],
  subCategories: [],
  products: [],
  activeProductsRequestKey: null,
  featuredAds: [],
  approvedProducts: [],
  chatConversations: [],
  chatMessages: [],
  banners: [],
  plans: [],
  localities: [],
  favorites: [],
  myFeaturedAds: [],
  myBannerAds: [],
  myProducts: []
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
      if (
        action.meta?.productsRequestKey
        && action.meta.productsRequestKey !== userReducer.activeProductsRequestKey
      ) {
        return;
      }
      // API: { status, data: { data: [...items], last_page, ... } }
      const raw = action.payload.data;
      const paginator = raw?.data ?? raw;
      const list = Array.isArray(paginator) ? paginator : Array.isArray(paginator?.data) ? paginator.data : [];
      userReducer.products = list.filter((product) => product.approve === "approved");
    },
    appendProductsRecieved: (userReducer, action) => {
      userReducer.loader = false;
      if (
        action.payload.requestKey
        && action.payload.requestKey !== userReducer.activeProductsRequestKey
      ) {
        return;
      }
      const raw = action.payload.data;
      const list = Array.isArray(raw) ? raw : [];
      const newItems = list.filter((product) => product.approve === "approved");
      userReducer.products = [...userReducer.products, ...newItems];
    },
    clearProducts: (userReducer, action) => {
      userReducer.products = [];
      userReducer.activeProductsRequestKey = action.payload ?? null;
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
    addFavoriteItem: (userReducer, action) => {
      userReducer.favorites = [...userReducer.favorites, action.payload];
    },
    setMyFeaturedAdsRecieved: (userReducer, action) => {
      userReducer.loader = false;
      userReducer.myFeaturedAds = action.payload.data;
    },
    setMyBannerAdsRecieved: (userReducer, action) => {
      userReducer.loader = false;
      userReducer.myBannerAds = action.payload.data;
    },
    setMyProductsRecieved: (userReducer, action) => {
      userReducer.loader = false;
      userReducer.myProducts = action.payload.data;
    },
  }
});

export const {
  setSubCategoriesClear,
  removeFavoriteById,
  addFavoriteItem,
  appendProductsRecieved,
  clearProducts,
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
  setMyProductsRecieved,
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
export const getAllProducts = (url, productsRequestKey) =>
  apiCallBegan({
    method: "get",
    url,
    meta: { productsRequestKey },
    onStart: userReducerDataRequested.type,
    onSuccess: setProductsRecieved.type,
    onError: userReducerDataRequestFailed.type,
  });

export const appendProductsApi = (url) =>
  apiCallBegan({
    method: "get",
    url,
    onStart: userReducerDataRequested.type,
    onSuccess: appendProductsRecieved.type,
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

export const getMyProductsApi = (url) =>
  apiCallBegan({
    method: "get",
    url,
    onStart: userReducerDataRequested.type,
    onSuccess: setMyProductsRecieved.type,
    onError: userReducerDataRequestFailed.type,
  });

export default userReducer.reducer;
