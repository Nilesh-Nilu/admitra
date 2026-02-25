import { createSlice } from "@reduxjs/toolkit";
import { apiCallBegan } from "../api";
const initialState = {
  loader: false,
  selectedCity: "Select City",
  states: [],
  categories: [],
  subCategories: [],
  products: [],
  approvedProducts: [],
  chatConversations: [],
  chatMessages: [],
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
      userReducer.products = action.payload.data.filter((product) =>product.approve === "approved");
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
    },
});

export const {
  setSubCategoriesClear
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
  setChatConversationsRecieved,
  setChatMessagesRecieved,
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
export const getProductsApi = (url) =>
  apiCallBegan({
    method: "get",
    url,
    onStart: userReducerDataRequested.type,
    onSuccess: setProductsRecieved.type,
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
export default userReducer.reducer;
