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
        console.log(action.payload, "action authReducerDataRequestFailed.");
        // Handle 401 unauthorized
        if (action.payload?.response?.status === 401) {
            authReducer.user = null;
        }
        // Handle 500 server errors
        if (action.payload?.response?.status >= 500) {
            console.error("Server error:", action.payload?.response?.data?.message || "Unknown server error");
        }
    },
    setUser: (reducer, action) => {
      reducer.user = action.payload;
    },
    logoutFromReducer: (reducer) => {
      reducer.user = null;
      reducer.loader = false;
    },
    updateProfileSuccess: (authReducer, action) => {
      authReducer.loader = false;
      console.log(action.payload.data, "action.payload.data");
      authReducer.user = action.payload.data;
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
  updateProfileSuccess,
} = authReducer.actions;
export const getUserDetails = (url) =>
  apiCallBegan({
    method: "get",
    url,
    onStart: authReducerDataRequested.type,
    onSuccess: authReducerDataReceived.type,
    onError: authReducerDataRequestFailed.type,
  });

export const updateUserProfile = (url, data) =>
  apiCallBegan({
    method: "put",
    url,
    data,
    onStart: authReducerDataRequested.type,
    onSuccess: updateProfileSuccess.type,
    onError: authReducerDataRequestFailed.type,
  });

export default authReducer.reducer;
