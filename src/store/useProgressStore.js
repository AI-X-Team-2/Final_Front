import { create } from 'zustand';

const useProgressStore = create((set) => ({
  progress: {
    basic: {
      opened: [1, 2],
      1: { opened: [1, 2] }, 
      2: { opened: [1] },   
    },
    daily: {
      opened: [1, 2], 
    },
  },

  // Basic 단계 열기
  openBasicStep: (step) =>
    set((state) => ({
      progress: {
        ...state.progress,
        basic: {
          ...state.progress.basic,
          opened: [...new Set([...state.progress.basic.opened, step])],
        },
      },
    })),

  // Daily 단계 및 서브단계 열기
  openDailySubStep: (step, subStep) =>
    set((state) => {
      const daily = state.progress.daily;
      const prevSubOpened = daily[step]?.opened || [];

      return {
        progress: {
          ...state.progress,
          daily: {
            ...daily,
            [step]: {
              opened: [...new Set([...prevSubOpened, subStep])],
            },
            opened: [...new Set([...daily.opened, parseInt(step)])],
          },
        },
      };
    }),

  // 전체 초기화
  resetProgress: () =>
    set(() => ({
      progress: {
        daily: {
          opened: [],
        },
        basic: {
          opened: [],
        },
      },
    })),
}));

export default useProgressStore;
