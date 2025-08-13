// src/pages/WordGame.jsx
import React, { useRef, useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import MainButton from "../component/MainButton";
import gameimage from "../assets/gameimage.png"; // PNG 배경

const WORD_LIST = [
  "사과","바나나","오렌지","포도","딸기",
  "강아지","고양이","토끼","거북이","햄스터",
  "학교","공원","도서관","병원","식당",
  "행복","사랑","희망","평화","기쁨",
  "하늘","바다","산","강","숲"
];

// ===== 고정 상수(기존 유지) =====
const DEADLINE_OFFSET = 100;
const FONT_SIZE       = 24;
const MAX_WORDS       = 10;
const SPAWN_PERIOD_MS = 2800;

const INITIAL_SPEED   = 10;
const SPEED_INCREASE  = 0.05; // (값 유지, 로직은 아래의 레벨 방식 사용)

// 화면 안 스폰용
const SAFE_MARGIN_LEFT  = 12;
const SAFE_MARGIN_RIGHT = 18;
const EDGE_FUDGE        = 6;
const MIN_H_SPACING       = 40;
const TOP_COLLISION_WINDOW = 120;

// ===== 새로 추가된 상수(요청 기능) =====
// 10점, 20점, 30점 … 마다 속도를 아주 조금 올리는 비율(누적)
const SPEED_STEP_PER_LEVEL = 0.06;   // 레벨당 +6%
// “SPEED UP!!” 표시 시간
const SPEEDUP_DURATION_MS  = 700;    // 0.7초

export default function WordGame() {
  const location = useLocation();

  const cardRef    = useRef(null);
  const canvasRef  = useRef(null);
  const ctxRef     = useRef(null);
  const deadlineRef = useRef(null);   // ← 데드라인 점선 길이 제어용

  const logicalW   = useRef(0);
  const logicalH   = useRef(0);

  const spawnMinX  = useRef(0);
  const spawnMaxX  = useRef(0);

  const currentWords = useRef([]);
  const rafId        = useRef(null);

  const nextSpawnAt  = useRef(0);
  const startedRef   = useRef(false);

  const [started, setStarted] = useState(false);
  const [score,   setScore]   = useState(0);
  const [lives,   setLives]   = useState(3);
  const [countdown, setCountdown] = useState(null);

  const [micStatus, setMicStatus] = useState("마이크 준비 중...");
  const mediaRecorderRef = useRef(null);

  const [scoreEffects, setScoreEffects] = useState([]);
  const [wrongWords, setWrongWords] = useState([]);

  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  useEffect(() => { startedRef.current = started; }, [started]);
  useEffect(() => { scoreRef.current   = score;   }, [score]);
  useEffect(() => { livesRef.current   = lives;   }, [lives]);

  // ====== 새로 추가된 상태/Ref(요청 기능) ======
  const [showSpeedUp, setShowSpeedUp] = useState(false);
  const speedUpTimerRef = useRef(null);

  // 현재 ‘속도 레벨’ (0: 0~9점, 1: 10~19점, 2: 20~29점 …)
  const [speedLevel, setSpeedLevel] = useState(0);
  const speedLevelRef = useRef(0);
  useEffect(() => { speedLevelRef.current = speedLevel; }, [speedLevel]);

  // 점수가 10점 단위를 넘어갈 때마다 레벨 상승 + SPEED UP 표시 + 현재 단어 속도 재계산
  useEffect(() => {
    const newLevel = Math.floor(score / 10); // 0~9 -> 0, 10~19 -> 1, ...
    if (newLevel > speedLevelRef.current) {
      setSpeedLevel(newLevel);
      speedLevelRef.current = newLevel;

      if (newLevel >= 1) {
        setShowSpeedUp(true);
        if (speedUpTimerRef.current) clearTimeout(speedUpTimerRef.current);
        speedUpTimerRef.current = setTimeout(() => setShowSpeedUp(false), SPEEDUP_DURATION_MS);

        const mult = 1 + SPEED_STEP_PER_LEVEL * newLevel;
        currentWords.current.forEach(w => { w.speed = INITIAL_SPEED * mult; });
      }
    }
  }, [score]);

  // ===== 자동 카운트다운(기존 유지) =====
  const consumed = useRef(false);
  useEffect(() => {
    if (location.state?.autoStart && !consumed.current) {
      consumed.current = true;
      setCountdown(3);
    }
  }, [location.state]);
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) { setCountdown(null); startGame(); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // ===== 캔버스/스폰 범위 셋업 =====
  useEffect(() => {
    const canvas = canvasRef.current;
    const card   = cardRef.current;
    if (!canvas || !card) return;

    const resize = () => {
      const rect = card.getBoundingClientRect();
      const dpr  = Math.max(1, window.devicePixelRatio || 1);

      logicalW.current = Math.round(rect.width);
      logicalH.current = Math.round(rect.height);

      canvas.width  = Math.round(rect.width  * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width  = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${FONT_SIZE}px 'Noto Sans KR', sans-serif`; // (생성 단어 폰트: 굵기 변경 없음)
      ctx.textBaseline = "top";
      ctx.imageSmoothingEnabled = true;
      ctxRef.current = ctx;

      spawnMinX.current = SAFE_MARGIN_LEFT;
      spawnMaxX.current = logicalW.current - SAFE_MARGIN_RIGHT - EDGE_FUDGE;
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // ===== 데드라인 ‘점선 길이 = "마" 글자폭’ 설정 =====
  useEffect(() => {
    const cv = document.createElement("canvas");
    const c = cv.getContext("2d");
    // 마이크 안내 텍스트와 유사한 크기로 측정
    c.font = "17px 'Noto Sans KR', sans-serif";
    const dash = Math.ceil(c.measureText("마").width);
    if (deadlineRef.current) {
      deadlineRef.current.style.setProperty("--dashLenPx", `${dash}px`);
    }
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx    = ctxRef.current;
    if (!canvas || !ctx) return;
    ctx.save();
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.restore();
    ctx.font = `${FONT_SIZE}px 'Noto Sans KR', sans-serif`;
    ctx.textBaseline = "top";
  }, []);

  const clampX = (x, textWidth) => {
    const minX = spawnMinX.current;
    const maxX = spawnMaxX.current - textWidth;
    if (maxX <= minX) return minX;
    return Math.min(maxX, Math.max(minX, x));
  };

  // 단어 스폰(화면 안에서만)
  const trySpawnWord = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return false;
    if (currentWords.current.length >= MAX_WORDS) return false;

    let text = null;
    for (let i = 0; i < 50; i++) {
      const c = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
      if (!currentWords.current.some(w => w.text === c)) { text = c; break; }
    }
    if (!text) return false;

    const tw = Math.ceil(ctx.measureText(text).width);
    const th = FONT_SIZE;

    const minX = spawnMinX.current;
    const maxX = spawnMaxX.current - tw;
    if (maxX <= minX) return false;

    let x = null;
    for (let i = 0; i < 100; i++) {
      const candX = minX + Math.random() * (maxX - minX);
      const overlapTop = currentWords.current.some(w => {
        if (w.y >= TOP_COLLISION_WINDOW) return false;
        const aL = candX - MIN_H_SPACING;
        const aR = candX + tw + MIN_H_SPACING;
        const bL = w.x, bR = w.x + w.w;
        return Math.max(aL, bL) < Math.min(aR, bR);
      });
      if (!overlapTop) { x = candX; break; }
    }
    if (x === null) return false;

    const mult  = 1 + SPEED_STEP_PER_LEVEL * speedLevelRef.current;
    const speed = INITIAL_SPEED * mult;

    currentWords.current.push({ text, x, y: -th, w: tw, h: th, speed });
    return true;
  }, []);

  // 게임 루프(기존 유지)
  const gameLoop = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    const now = performance.now();
    while (startedRef.current && currentWords.current.length < MAX_WORDS && now >= nextSpawnAt.current) {
      const ok = trySpawnWord();
      nextSpawnAt.current += ok ? SPAWN_PERIOD_MS : 80;
    }

    clearCanvas();

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, logicalW.current, logicalH.current);
    ctx.clip();

    const deadlineY = logicalH.current - DEADLINE_OFFSET;
    const next = [];
    const missedTexts = [];

    for (const w of currentWords.current) {
      w.y += w.speed * (1/60);

      if (w.y + w.h >= deadlineY) { missedTexts.push(w.text); continue; }

      const drawX = clampX(w.x, w.w);
      ctx.fillStyle = "#333";
      ctx.fillText(w.text, drawX, w.y);
      w.x = drawX;
      next.push(w);
    }

    ctx.restore();
    currentWords.current = next;

    if (missedTexts.length) {
      setLives(prev => {
        const n = Math.max(0, prev - missedTexts.length);
        if (n === 0) endGame();
        return n;
      });
      setWrongWords(prev => [...prev, ...missedTexts]);
    }

    rafId.current = requestAnimationFrame(gameLoop);
  }, [clearCanvas, trySpawnWord]);

  const startGame = useCallback(() => {
    currentWords.current = [];
    setWrongWords([]);
    setScore(0);
    setLives(3);
    setStarted(true);
    // 레벨/표시 초기화
    if (speedUpTimerRef.current) clearTimeout(speedUpTimerRef.current);
    setShowSpeedUp(false);
    setSpeedLevel(0);
    speedLevelRef.current = 0;

    nextSpawnAt.current = performance.now() + 400;
    rafId.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  const endGame = useCallback(() => {
    setStarted(false);
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = null;
    clearCanvas();
  }, [clearCanvas]);

  useEffect(() => {
    return () => { if (rafId.current) cancelAnimationFrame(rafId.current); };
  }, []);

  // =====(기존) 마이크 로직은 그대로 유지=====
  useEffect(() => {
    const initMic = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
        const chunks = [];
        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = async () => {
          const blob = new Blob(chunks, { type: "audio/webm" });
          chunks.length = 0;

          setMicStatus("음성 분석 중...");
          const fd = new FormData();
          fd.append("audio", blob, "audio.webm");

          try {
            const res = await fetch("http://localhost:5000/transcribe_audio", { method: "POST", body: fd });
            if (res.ok) {
              const data = await res.json();
              if (startedRef.current) {
                const spoken = (data.transcription || "").trim();
                const idx = currentWords.current.findIndex(w => w.text === spoken);
                if (idx !== -1) {
                  const m = currentWords.current[idx];
                  currentWords.current.splice(idx, 1);
                  setScore(s => s + 10);
                  setScoreEffects(e => [...e, { id: Date.now(), x: m.x, y: m.y }]);
                }
              }
            } else setMicStatus("서버 오류");
          } catch { setMicStatus("네트워크 오류"); }
          finally {
            if (startedRef.current) {
              setMicStatus("말하세요!");
              recorder.start();
              setTimeout(() => { if (recorder.state === "recording") recorder.stop(); }, 2000);
            } else setMicStatus("게임 시작 대기 중.");
          }
        };
        mediaRecorderRef.current = recorder;
        setMicStatus("마이크 준비 완료!");
      } catch { setMicStatus("마이크 접근 실패"); }
    };
    initMic();
  }, []);

  // +10 이펙트 제거 타이머
  useEffect(() => {
    if (!scoreEffects.length) return;
    const t = setTimeout(() => setScoreEffects(e => e.slice(1)), 600);
    return () => clearTimeout(t);
  }, [scoreEffects]);

  return (
    <div className="relative w-full h-[48rem] flex items-center justify-center mt-10">
      <style>{`
        .score-effect {
          position:absolute; font-size:1.5rem; font-weight:bold; color:green;
          animation:fadeUp .6s ease-out forwards; z-index:30; transform:translateX(-50%);
        }
        @keyframes fadeUp {
          from { opacity:1; transform:translateY(0) translateX(-50%); }
          to   { opacity:0; transform:translateY(-30px) translateX(-50%); }
        }
      `}</style>

      <div
        ref={cardRef}
        className="relative w-full max-w-[480px] h-full bg-white shadow-lg rounded-[15px] overflow-hidden"
      >
        {/* ◆ 배경 이미지(카드 안, 최하단 레이어) */}
        <img
          src={gameimage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          draggable={false}
        />

        {/* 데드라인: 연한 갈색 ‘긴 점선’ (세그먼트 길이 = “마” 폭) */}
        <div
          ref={deadlineRef}
          className="absolute left-0 right-0 z-10"
          style={{
            bottom: `${DEADLINE_OFFSET}px`,
            height: "2px",
            backgroundImage:
              "repeating-linear-gradient(to right, #D2B48C 0 calc(var(--dashLenPx, 18px)), transparent calc(var(--dashLenPx, 18px)) calc(var(--dashLenPx, 18px) + 12px))",
          }}
        />

        {/* 점수/목숨 */}
        <div className="absolute top-2 left-2 right-2 flex justify-between text-base font-bold text-gray-700 z-20">
          <div>점수: {score}</div>
          <div className="text-red-500 text-lg">{"❤".repeat(lives)}</div>
        </div>

        {/* +10 이펙트 */}
        {scoreEffects.map(e => (
          <div key={e.id} className="score-effect" style={{ left: `${e.x}px`, top: `${e.y}px` }}>+10</div>
        ))}

        {/* SPEED UP!! 오버레이 */}
        {showSpeedUp && (
          <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
            <div className="text-4xl font-extrabold text-red-500 drop-shadow">SPEED UP!!</div>
          </div>
        )}

        {/* 게임 캔버스(배경 위, UI 아래) */}
        <canvas ref={canvasRef} className="w-full h-full block relative z-20" />

        {/* 카운트다운 */}
        {countdown !== null && (
          <div className="absolute inset-0 bg-black/70 text-white flex items-center justify-center z-50">
            <span className="text-7xl font-extrabold">{countdown}</span>
          </div>
        )}

        {/* 게임 오버 오버레이 */}
        {!started && lives <= 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white z-50">
            <h2 className="text-2xl mb-2 font-bold">게임 오버!</h2>
            <p className="mb-1 text-lg">최종 점수: {score}</p>
            {wrongWords.length > 0 && (
              <p className="mb-5 text-sm text-white/80">
                틀린 단어: {Array.from(new Set(wrongWords)).join(", ")}
              </p>
            )}
            {/* 버튼은 2/3 폭, 중앙 */}
            <MainButton label="다시 시작" onClick={startGame} className="w-3/5 mx-auto" />
          </div>
        )}
      </div>

      {/* 마이크 상태: ‘데드라인~바닥’ 구간의 세로 중앙, 흰색/조금 크게 */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-20 text-center"
        style={{ bottom: `${DEADLINE_OFFSET / 10}px` }} // 그 구간의 중앙
      >
        <div className="font-semibold text-white text-[17px]">
          {micStatus}
        </div>
        <div className="text-white/90 text-[15px] mt-1">
          단어를 소리 내어 읽어주세요!
        </div>
      </div>
    </div>
  );
}
