import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/",
  timeout: 15000,
});

// 토큰 자동 첨부
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState()?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- 학습 API ---


// --- 학습 API ---
export const startLearning = async ({ mode = "daily", level, total_words }) => {
  const { data } = await api.post("/start-learning", {
    mode,
    level,
    total_words,   // ✅ 총 단어 개수 추가
  });
  return data; // { session_id: "2c5a" }
};
