import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

export const api = axios.create({
  baseURL: "",  
  timeout: 15000,
});

// --- 학습 API ---
export const startLearning = async ({ mode , level, total_words }) => {
  const token = useAuthStore.getState()?.token;
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
