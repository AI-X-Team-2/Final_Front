// api/sessions.js
import axios from "axios";
import { useAuthStore } from "../store/useAuthSotre";

const API_BASE = "http://127.0.0.1:8000"; // 환경 변수로 빼는 걸 권장합니다

// 세션 학습 완료 (cancel → finished_words 전달)
export const completeSession = async (sessionId, finishedWords) => {
  try {
    // ✅ zustand에서 토큰 가져오기
    const token = useAuthStore.getState().token;
    if (!token) throw new Error("인증 토큰이 없습니다.");

    const res = await axios.patch(
      `${API_BASE}/sessions/${sessionId}/cancel`,
      {
        finished_words: finishedWords,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ 토큰 추가
          "Content-Type": "application/json",
        },
      }
    );

    return res.data;
  } catch (err) {
    console.error("세션 완료 요청 실패:", err);
    throw err;
  }
};
