import axios from "axios";

export const BACKEND_URL = "http://localhost:5050";
export const API_BASE_URL = `${BACKEND_URL}/api`;

const API = axios.create({
  baseURL: API_BASE_URL,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
