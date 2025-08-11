// src/pages/Ranking.jsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MainButton from "../component/MainButton";

// 임시 데이터 (백엔드 연동 전 테스트용)
const MOCK_SCORES = [
  { id: "seoyoung 7562", points: 180 },
  { id: "tester 1021", points: 160 },
  { id: "user 33", points: 160 },
  { id: "hana", points: 130 },
  { id: "neo", points: 95 },
];

export default function Ranking() {
  const navigate = useNavigate();

  // 동점자 동일순위 처리 + 내림차순
  const rows = useMemo(() => {
    const sorted = [...MOCK_SCORES].sort((a, b) => b.points - a.points);
    let lastPoints = null; // <-- 타입 표기 제거 (JS에서는 이렇게만)
    let lastRank = 0;
    return sorted.map((p, i) => {
      const rank = p.points === lastPoints ? lastRank : i + 1;
      lastPoints = p.points;
      lastRank = rank;
      return { ...p, rank };
    });
  }, []);

  const goGame = () => navigate("/game");

  return (
    <div className="min-h-screen bg-[#27313F] text-white flex flex-col items-center">
      {/* 본문: 폭/글자/여백 키움 + 하단 고정 요소(버튼/탭바)만큼 여유 패딩 */}
      <div className="w-full max-w-[520px] px-6 pt-10 pb-44">
        {/* 타이틀 크게 */}
        <h1 className="text-3xl font-bold mb-7">포인트 랭킹</h1>

        {/* 표 카드 */}
        <div className="rounded-2xl border border-white/20 overflow-hidden shadow-lg">
          {/* 헤더 (크게) */}
          <div className="grid grid-cols-12 bg-white/10 py-5 px-6 text-lg font-semibold">
            <div className="col-span-3 text-center">순위</div>
            <div className="col-span-3 text-center">포인트</div>
            <div className="col-span-6 pl-4">아이디</div>
          </div>

          {/* 데이터 행 */}
          {rows.map((r, idx) => (
            <div
              key={`${r.id}-${idx}`}
              className={`grid grid-cols-12 items-center px-6 py-5 text-lg ${
                idx === 0 ? "bg-white/15" : "bg-white/[0.07]"
              }`}
            >
              <div className="col-span-3 text-center">{r.rank}</div>
              <div className="col-span-3 text-center">{r.points}</div>
              <div className="col-span-6 pl-4 truncate">{r.id}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 '고정' 버튼: 탭바와 겹치지 않게 위로 고정 */}
      <div className="fixed left-0 right-0 bottom-24 z-50 pointer-events-none">
        <div className="mx-auto w-full max-w-[520px] px-6">
          <div className="rounded-2xl bg-[#27313F]/90 backdrop-blur-sm p-3 pointer-events-auto">
            {/* MainButton 기본 w-[30rem] → 화면 폭에 맞게 덮어쓰기 */}
            <MainButton label="게임 화면으로" onClick={goGame} className="w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
