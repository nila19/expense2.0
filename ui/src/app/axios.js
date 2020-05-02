import axios from 'axios';

import { BACKEND } from 'app/config';

let axiosInstance = null;

export default (enqueueSnackbar) => {
  if (axiosInstance) {
    return axiosInstance;
  }

  // Set config defaults when creating the instance
  axiosInstance = axios.create({
    baseURL: BACKEND.BASE_URL,
    timeout: BACKEND.TIME_OUT,
  });

  // Add a response interceptor
  axiosInstance.interceptors.response.use(
    function (response) {
      if (response.config.snackbar) {
        enqueueSnackbar(response.config.snackbar + ' successful', { variant: 'success' });
      }
      return response;
    },
    function (error) {
      enqueueSnackbar((error.config.snackbar || 'API call') + ' failed. ' + error.message, { variant: 'error' });
      return Promise.reject(error);
    }
  );
  return axiosInstance;
};
