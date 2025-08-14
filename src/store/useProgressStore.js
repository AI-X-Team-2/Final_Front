// stores/progressStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { fetchMyProgress } from '../api/progressService';
import { useAuthStore } from './useAuthSotre';
export const useProgressStore = create(
  persist(
    (set, get) => ({
      // ---- 상태 ----
      progress: {
        basic: {
          opened: [], // 열린 Basic 스텝들
          // 예: "1": { opened: [1, 2] } => Step1의 Stage1, Stage2 오픈
        },
        daily: {
          opened: [], // 열린 Daily 스텝들
        },
      },
      loading: false,
      error: null,
      _hydratedFromServer: false,

      // ---- 액션 ----
      setProgress: (p) => set({ progress: p }),

      // Basic: 특정 스텝의 특정 Stage 오픈
      openBasicStage: (step, stage) =>
        set((state) => {
          const basic = state.progress.basic;
          const prevStages = basic[step]?.opened || [];
          return {
            progress: {
              ...state.progress,
              basic: {
                ...basic,
                [step]: { opened: [...new Set([...prevStages, stage])] },
                opened: [...new Set([...basic.opened, Number(step)])],
              },
            },
          };
        }),

      // Daily: 스텝만 오픈
      openDailyStep: (step) =>
        set((state) => ({
          progress: {
            ...state.progress,
            daily: {
              ...state.progress.daily,
              opened: [...new Set([...state.progress.daily.opened, Number(step)])],
            },
          },
        })),

      // 메모리만 초기화 (persist는 유지)
      resetProgress: () =>
        set(() => ({
          progress: { basic: { opened: [] }, daily: { opened: [] } },
        })),

      // 완전 초기화 (로그아웃 시)
      hardReset: () => {
        const storageKey = 'progress-store-v2';
        set(() => ({
          progress: { basic: { opened: [] }, daily: { opened: [] } },
          loading: false,
          error: null,
          _hydratedFromServer: false,
        }));
        try {
          localStorage.removeItem(storageKey);
        } catch { }
      },

      // 서버 하이드레이션
      hydrate: async () => {
        const { _hydratedFromServer, loading } = get();
        if (_hydratedFromServer || loading) return;
        try {
          set({ loading: true, error: null });
          const token = useAuthStore.getState().token;
          const data = await fetchMyProgress(token);
          set({ progress: data, _hydratedFromServer: true, loading: false });
        } catch (err) {
          set({ error: err?.message || '진도 불러오기 실패', loading: false });
        }
      },
    }),
    {
      // persist 옵션
      name: 'progress-store-v2',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ progress: state.progress }),
      version: 2,
    }
  )
);
