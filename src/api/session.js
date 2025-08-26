// api/sessions.js
import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";
import { useProgressStore } from "../store/useProgressStore";
const API_BASE = ""; 


export const completeSession = async (sessionId) => {
  try {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error("인증 토큰이 없습니다.");
console.log("완료 호출 sessionId:", sessionId);
    const res = await axios.patch(
      `${API_BASE}/api/sessions/${sessionId}/complete`,
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
      console.log(data.isPassed ? "\n\n\n세션 완료\n\n\n" : "\n\n\n세션 실패\n\n\n");
      const hydrate = useProgressStore.getState().hydrate;
      await hydrate(true);   // 서버에서 최신 progress 가져오기
    }

    return data;
  } catch (err) {
    console.error("세션 완료 요청 실패:", err);
    throw err;
  }
};

