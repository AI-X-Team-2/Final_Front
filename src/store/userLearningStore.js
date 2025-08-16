// store/learningStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useLearningStore = create(
  persist(
    (set) => ({
      currentWordIndex: 0,  // 지금 몇 번째 단어인지
      setCurrentWordIndex: (idx) => set({ currentWordIndex: idx }),
      resetLearning: () => set({ currentWordIndex: 0 }),
    }),
    {
      name: "learning-storage", // localStorage 키 이름
    }
  )
);
