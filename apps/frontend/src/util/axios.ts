import axios, { AxiosError, type AxiosResponse } from "axios";

const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
});

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ message?: string }>) => {
    const message = error?.response?.data?.message || "Something went wrong";
    return Promise.reject(new Error(message));
  },
);

export default api;
