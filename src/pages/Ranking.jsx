// src/pages/Ranking.jsx

import { useNavigate } from "react-router-dom";
import MainButton from "../component/MainButton";
import { fetchLeaderboard } from "../api/game";
import React, { useMemo, useState, useEffect } from "react";

export default function Ranking() {
    const navigate = useNavigate();
    const [leaderboardData, setLeaderboardData] = useState(null);
    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await fetchLeaderboard();
                console.log("fetchLeaderboard response:", res);
                setLeaderboardData(res);
            } catch (err) {
                console.error("Leaderboard fetch error:", err);
            }
        };
        loadData();
    }, []);

    if (!leaderboardData) {
        return (
            <div className="min-h-screen bg-cus text-white flex items-center justify-center">
                <p>랭킹 불러오는 중...</p>
            </div>
        );
    }


    const goGame = () => navigate("/game", { state: { autoStart: true } });

    return (
        <div className="min-h-screen bg-cus text-white flex flex-col items-center pt-10 pb-28">
            <div className="w-full max-w-[700px] px-6">
                {/* 타이틀 */}
                <h1 className="text-white text-3xl font-semibold mb-8 self-start">포인트 랭킹</h1>

                {/* 표 카드 */}
                <div className="bg-customFeedBack rounded-2xl overflow-hidden shadow-xl divide-customLightGray">
                    {/* 헤더 */}
                    <div className="grid grid-cols-12 bg-white/10 py-5 px-10 text-lg font-semibold">
                        <div className="col-span-2 text-center">순위</div>
                        <div className="col-span-3 text-center">포인트</div>
                        <div className="col-span-7 pl-3">아이디</div>
                    </div>
                    <hr className="w-full border-t border-customLightGray" />


                    {/* 데이터 */}
                    {leaderboardData.leaderboard.map((r, idx) => (
                        <div
                            key={`${r.id}-${idx}`}
                            className={`grid grid-cols-12 items-center px-8 py-6 text-lg ${idx === 0 ? "bg-white/15" : "bg-white/5"
                                }`}
                        >
                            <div className="col-span-2 text-center">{r.rank}</div>
                            <div className="col-span-3 text-center">{r.points}</div>
                            <div className="col-span-7 pl-3 truncate">{r.username}</div>
                        </div>
                    ))}
                </div>
            </div>


            {/* 하단 고정 버튼: 가로 꽉 + 둥근 모서리 */}
            <div className="absolute bottom-[100px] inset-x-0 pointer-events-none flex justify-center">
                {/* 둥근 래퍼로 버튼을 클리핑 */}
                <div className="pointer-events-auto rounded-xl overflow-hidden w-[80%]">
                    <MainButton
                        label="게임 시작"
                        onClick={goGame}
                        className={'py-2 rounded-2xl font-semibold text-white bg-blue-400 w-full'}
                    />

                </div>
            </div>




        </div>
    );
}
