// api/sessions.js
import axios from "axios";
import { useAuthStore } from "../store/useAuthSotre";
import { useProgressStore } from "../store/useProgressStore";
const API_BASE = "http://127.0.0.1:8000"; 


export const completeSession = async (sessionId) => {
  try {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error("인증 토큰이 없습니다.");

    const res = await axios.patch(
      `${API_BASE}/sessions/${sessionId}/complete`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = res.data; 


    // 다음 단계로 넘어갈 수 있다면 진행도 최신화
    if (data?.isPassed) {
      const hydrate = useProgressStore.getState().hydrate;
      await hydrate();   // 서버에서 최신 progress 가져오기
    }

    return data;
  } catch (err) {
    console.error("세션 완료 요청 실패:", err);
    throw err;
  }
};

