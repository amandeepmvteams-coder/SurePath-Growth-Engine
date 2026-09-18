import axios from "axios";

export const apiClient = axios.create({
    baseURL: process.env.NEXT_BACKEND_API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.NEXT_API_ACCESS_KEY,
    },
});