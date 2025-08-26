import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

export const api = axios.create({
  baseURL: "import.meta.env.VITE_API_URL",  // ✅ 직접 localhost 지정
  timeout: 15000,
});

// --- 학습 API ---
export const startLearning = async ({ mode , level, total_words }) => {
  const token = useAuthStore.getState()?.token; // ✅ 직접 가져오기
  console.log("토큰:", token);

  const { data } = await api.post(
    "/api/results/practice-sessions",
    { mode, level, total_words },
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    }
  );

  return data; // { session_id: "2c5a" }
};
