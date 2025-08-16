import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useSessionStore = create(
persist(
(set) => ({
session_id: null,   // 현재 진행 중인 학습 세션 ID
setSessionId: (id) => set({ session_id: id }),
clearSession: () => set({ session_id: null }),
}),
{
name: "session-store", // localStorage key
storage: createJSONStorage(() => localStorage),
}
)
);