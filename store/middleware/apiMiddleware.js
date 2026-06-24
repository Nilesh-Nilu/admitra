import axios from "axios";
import { baseUrl, getAuthToken } from "../../constants/functions";
import { apiCallBegan, apiCallFailed, apiCallSuccess } from "../api";
import { logoutFromReducer } from "../reducers/authReducer";
const apiMiddleware =
  ({ dispatch, getState }) =>
  (next) =>
  async (action) => {
    if (action.type !== apiCallBegan.type) {
      return next(action);
    }

    const {
      url,
      method,
      data,
      onSuccess,
      onStart,
      onError,
      headers = {},
    } = action.payload;

    // Dispatch onStart action if provided
    if (onStart) {
      dispatch({ type: onStart });
    }

    next(action);

    try {
      // Fetch token from AsyncStorage
        const response = await axios.request({
        baseURL: baseUrl,
        url: url,
        method: method,
        data: data,
        ...(await getAuthToken())
      });
      // Dispatch general success action
      dispatch(apiCallSuccess(response.data));

      // Dispatch specific success action if provided
      if (onSuccess) {
        dispatch({ type: onSuccess, payload: response.data });
      }
      return response.data;
    } catch (error) {
      if(error.response?.status===401){
       dispatch(logoutFromReducer());
      }
      const errorMessage = error.response?.data || error.message;
      // Dispatch general error action
      dispatch(apiCallFailed(errorMessage));

      // Dispatch specific error action if provided
      if (onError) {
        dispatch({ type: onError, payload: errorMessage });
      }
      throw error;
    }
  };

export default apiMiddleware;
