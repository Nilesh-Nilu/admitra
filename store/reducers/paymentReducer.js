import { createSlice } from "@reduxjs/toolkit";
import { apiCallBegan } from "../api";
const initialState = {
  loader: false,
  order: null,
  paymentData:null
};

const paymentReducer = createSlice({
  name: "paymentReducer",
  initialState, 
  reducers: {
    paymentReducerDataRequested: (paymentReducer, action) => {
      paymentReducer.loader = true;
    },
    paymentReducerDataRequestFailed: (paymentReducer, action) => {
      paymentReducer.loader = false;
    },
    setPaymentRecieved: (paymentReducer, action) => {
      paymentReducer.loader = false;
      paymentReducer.order = action.payload;
    },
    setPaymentData: (paymentReducer, action) => {
      paymentReducer.loader = false;
      paymentReducer.paymentData = action.payload;
    },
    setClearData: (paymentReducer, action) => {
      paymentReducer.loader = false;
      paymentReducer.paymentData = null;
      paymentReducer.order = null;
    },

  },
});

export const {
  setPaymentData,
  setClearData
} = paymentReducer.actions;

const {
  paymentReducerDataRequestFailed,
  paymentReducerDataRequested,
  setPaymentRecieved,
} = paymentReducer.actions;
export const createOrderApi = (url) =>
  apiCallBegan({
    method: "post",
    url,
    onStart: paymentReducerDataRequested.type,
    onSuccess: setPaymentRecieved.type,
    onError: paymentReducerDataRequestFailed.type,
  });
export default paymentReducer.reducer;
