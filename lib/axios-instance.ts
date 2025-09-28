import axios from "axios";
import Cookies from "js-cookie";

export const DEV_URL = "https://wedding-organizer-backend.vercel.app/api/v1";
export const PROD_URL = "";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || DEV_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("access_token");
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any)["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("access_token");
      Cookies.remove("user");
    }
    return Promise.reject(error);
  }
);
