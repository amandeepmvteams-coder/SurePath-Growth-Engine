import axios from "axios";

export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.NEXT_PUBLIC_API_KEY,
    },
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const requestUrl = error?.config?.url ?? "";
        const isLoginRequest = requestUrl.includes("/api/v1/auth/login");

        if (
            status === 401 &&
            !isLoginRequest &&
            typeof window !== "undefined" &&
            window.location.pathname !== "/login"
        ) {
            window.dispatchEvent(
                new CustomEvent("surepath-auth-expired")
            );
        }

        return Promise.reject(error);
    }
);