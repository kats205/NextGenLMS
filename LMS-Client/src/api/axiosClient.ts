import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { toast as toastify } from "react-toastify";

// Define the shape of your backend API response wrapper
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data: T;
    errors?: any;
}

const instance = axios.create({
    baseURL: import.meta.env.VITE_URL_API,
    headers: { "Content-Type": "application/json" },
    timeout: 30000,
    withCredentials: true,
});

instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.set('Authorization', `Bearer ${token}`);
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

let isRefreshing = false;
let subscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
    subscribers.push(cb);
}

function onRefreshed(token: string) {
    subscribers.forEach((cb) => cb(token));
    subscribers = [];
}

instance.interceptors.response.use(
    (response: AxiosResponse) => response.data,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized
        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/refresh-token') &&
            !originalRequest.url?.includes('/logout')
        ) {

            if (isRefreshing) {
                return new Promise((resolve) => {
                    subscribeTokenRefresh((token) => {
                        originalRequest.headers.set('Authorization', `Bearer ${token}`);
                        resolve(instance(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                console.log(" Attempting to refresh access token...");

                const res = await axios.post(
                    `${import.meta.env.VITE_URL_API}/login/refresh-token`,
                    {},
                    { withCredentials: true }
                );

                const newAccessToken = res.data.accessToken;
                localStorage.setItem("token", newAccessToken);
                instance.defaults.headers.Authorization = `Bearer ${newAccessToken}`;

                console.log("Access token refreshed successfully");

                onRefreshed(newAccessToken);
                isRefreshing = false;

                originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
                return instance(originalRequest);

            } catch (refreshErr) {
                console.error(" Refresh token failed:", refreshErr);
                isRefreshing = false;

                console.log("🚪 Clearing session and redirecting to login...");

                toastify.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                setTimeout(() => {
                    window.location.href = "/";
                }, 500);

                return Promise.reject(refreshErr);
            }
        }

        // Handle 403 Forbidden
        if (error.response?.status === 403) {
            toastify.error("Bạn không có quyền truy cập!");
        }

        return Promise.reject(error);
    }
);

export default instance;
