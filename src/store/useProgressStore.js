// stores/progressStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { fetchMyProgress } from '../api/progressService';
import { useAuthStore } from './useAuthSotre';

const toNumberArray = (v) =>
  Array.isArray(v) ? v.map((x) => Number(x)).filter((n) => Number.isFinite(n)) : [];

const uniq = (arr) => Array.from(new Set(arr));

const normalizeLevels = (v) => uniq(toNumberArray(v)).sort((a, b) => a - b);

export const useProgressStore = create(
  persist(
    (set, get) => ({
      // ---- 상태 ----
      max_level: [],              // ← 숫자 배열
      loading: false,
      error: null,
      _hydratedFromServer: false,

      // ---- 액션 ----
      setMaxLevel: (levels) =>
        set(() => ({
          max_level: normalizeLevels(levels),
        })),

      resetProgress: () =>
        set(() => ({
          max_level: [],
        })),

      hardReset: () => {
        const storageKey = "progress-store-v5";
        set(() => ({
          max_level: [],
          loading: false,
          error: null,
          _hydratedFromServer: false,
        }));
        try {
          localStorage.removeItem(storageKey);
        } catch { }
      },

      // 서버 하이드레이션
      hydrate: async (force = false) => {
        const { _hydratedFromServer, loading } = get();
        if ((_hydratedFromServer && !force) || loading) return;

        try {
          set({ loading: true, error: null });

          // 전역 AuthStore에서 token 가져오기
          const token = useAuthStore.getState().token;

          // 서버에서 진도 데이터 요청
          const data = await fetchMyProgress(token);

          // max_level 값 정규화
          const levels = normalizeLevels(data?.max_level);

          set({
            max_level: levels,
            _hydratedFromServer: true,
            loading: false,
          });
        } catch (err) {
          set({
            error: err?.message || "진도 불러오기 실패",
            loading: false,
          });
        }
      },
    }),
    {
      name: "progress-store-v5",                         // 로컬스토리지 키 (버전 갱신)
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ max_level: state.max_level }), // max_level만 저장
      version: 5,
    }
  )
);