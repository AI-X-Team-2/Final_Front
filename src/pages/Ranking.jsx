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
    let lastPoints = null;
    let lastRank = 0;
    return sorted.map((p, i) => {
      const rank = p.points === lastPoints ? lastRank : i + 1;
      lastPoints = p.points;
      lastRank = rank;
      return { ...p, rank };
    });
  }, []);

  // ⭐ 게임 페이지로 이동하면서 "autoStart: true" 상태를 전달
  const goGame = () => navigate("/game", { state: { autoStart: true } });

  return (
    <div className="min-h-screen bg-[#27313F] text-white flex flex-col items-center pt-10 pb-28">
      <div className="w-full max-w-[840px] px-6">
        {/* 타이틀 */}
        <h1 className="text-[42px] font-extrabold mb-8">포인트 랭킹</h1>

        {/* 표 카드 */}
        <div className="rounded-3xl border border-white/15 overflow-hidden shadow-xl">
          {/* 헤더 */}
          <div className="grid grid-cols-12 bg-white/10 py-5 px-8 text-lg font-semibold">
            <div className="col-span-2 text-center">순위</div>
            <div className="col-span-3 text-center">포인트</div>
            <div className="col-span-7 pl-3">아이디</div>
          </div>

          {/* 데이터 */}
          {rows.map((r, idx) => (
            <div
              key={`${r.id}-${idx}`}
              className={`grid grid-cols-12 items-center px-8 py-6 text-lg ${
                idx === 0 ? "bg-white/15" : "bg-white/5"
              }`}
            >
              <div className="col-span-2 text-center">{r.rank}</div>
              <div className="col-span-3 text-center">{r.points}</div>
              <div className="col-span-7 pl-3 truncate">{r.id}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ⭐ 하단 고정 버튼 (항상 보이게 fixed) */}
      <div className="fixed left-0 right-0 bottom-[84px] flex justify-center pointer-events-none">
        <div className="w-full max-w-[840px] px-6 pointer-events-auto">
          <MainButton label="게임 시작" onClick={goGame} className="w-full" />
        </div>
      </div>
    </div>
  );
}
