import { createSlice } from "@reduxjs/toolkit";
import { apiCallBegan } from "../api";
const initialState = {
  loader: false,
  user: null,
};

const authReducer = createSlice({
  name: "authReducer",
  initialState,
  reducers: {
    authReducerDataRequested: (authReducer, action) => {
      authReducer.loader = true;
    },
    authReducerDataReceived: (authReducer, action) => {
      authReducer.loader = false;
      authReducer.user = action.payload.data;
    },
    authReducerDataRequestFailed: (authReducer, action) => {
        authReducer.loader = false;
      if (action.payload.response.status === 401) {
        authReducer.loader = false;
      }
    },
    setUser: (reducer, action) => {
      reducer.user = action.payload;
    },
    logoutFromReducer: (reducer) => {
      reducer.user = null;
      reducer.loader = false;
    },
    updateProfileRequested: (authReducer, action) => {
      authReducer.loader = true;
    },
    updateProfileSuccess: (authReducer, action) => {
      authReducer.loader = false;
      // authReducer.user = { ...authReducer.user, ...action.payload.data };
    },
    updateProfileFailed: (authReducer, action) => {
      authReducer.loader = false;
      console.log(action.payload, "update profile failed");
    },
    setLoadingfalse: (authReducer) => {
      authReducer.loader = false;
    },
  },
});

export const { setUser, logoutFromReducer, setLoadingfalse } = authReducer.actions;

const {
  authReducerDataRequestFailed,
  authReducerDataRequested,
  authReducerDataReceived,
  updateProfileRequested,
  updateProfileSuccess,
  updateProfileFailed,
} = authReducer.actions;
export const getUserDetails = (url) =>
  apiCallBegan({
    method: "get",
    url,
    onStart: authReducerDataRequested.type,
    onSuccess: authReducerDataReceived.type,
    onError: authReducerDataRequestFailed.type,
  });

export const completeUserProfileV2Updated = (url, data) =>
  apiCallBegan({
    method: "post",
    url,
    data,
    onStart: updateProfileRequested.type,
    onSuccess: updateProfileSuccess.type,
    onError: updateProfileFailed.type,
  });

export default authReducer.reducer;
