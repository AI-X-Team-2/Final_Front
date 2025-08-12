// src/pages/WordGame.jsx
import React, { useRef, useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import MainButton from "../component/MainButton";

const WORD_LIST = [
  "사과","바나나","오렌지","포도","딸기",
  "강아지","고양이","토끼","거북이","햄스터",
  "학교","공원","도서관","병원","식당",
  "행복","사랑","희망","평화","기쁨",
  "하늘","바다","산","강","숲"
];

// ===== 상수 =====
const DEADLINE_OFFSET = 100;
const FONT_SIZE       = 24;
const MAX_WORDS       = 10;

// ⬇ 여기만 바꿨습니다: 스폰 간격을 키움(이전 1200ms → 2800ms)
const SPAWN_PERIOD_MS = 2800;

const INITIAL_SPEED   = 10;
const SPEED_INCREASE  = 0.05;

const SAFE_MARGIN_LEFT  = 12;
const SAFE_MARGIN_RIGHT = 18;
const EDGE_FUDGE        = 6;

const MIN_H_SPACING       = 40;
const TOP_COLLISION_WINDOW = 120;

export default function WordGame() {
  const location = useLocation();

  const cardRef    = useRef(null);
  const canvasRef  = useRef(null);
  const ctxRef     = useRef(null);

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
      ctx.font = `${FONT_SIZE}px 'Noto Sans KR', sans-serif`;
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

    const speed = INITIAL_SPEED + (scoreRef.current / 100) * SPEED_INCREASE;
    currentWords.current.push({ text, x, y: -th, w: tw, h: th, speed });
    return true;
  }, []);

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

  // 마이크 로직(기존 유지) — 필요시 그대로 사용
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
              setMicStatus("단어를 소리 내어 읽어주세요!");
              recorder.start();
              setTimeout(() => { if (recorder.state === "recording") recorder.stop(); }, 2000);
            } else setMicStatus("게임 시작 대기 중.");
          }
        };
        mediaRecorderRef.current = recorder;
        setMicStatus("마이크 준비 완료!");
      } catch { setMicStatus("❌ 마이크 접근 실패 ❌"); }
    };
    initMic();
  }, []);

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
        @keyframes fadeUp { from{opacity:1; transform:translateY(0) translateX(-50%);} to{opacity:0; transform:translateY(-30px) translateX(-50%);} }
      `}</style>

      <div
        ref={cardRef}
        className="relative w-full max-w-[480px] h-full bg-white shadow-lg rounded-[15px] overflow-hidden"
      >
        <div className="absolute left-0 right-0 h-[3px] bg-red-500 z-10" style={{ bottom: `${DEADLINE_OFFSET}px` }} />

        <div className="absolute top-2 left-2 right-2 flex justify-between text-base font-bold text-gray-700 z-20">
          <div>점수: {score}</div>
          <div className="text-red-500 text-lg">{"❤".repeat(lives)}</div>
        </div>

        {scoreEffects.map(e => (
          <div key={e.id} className="score-effect" style={{ left: `${e.x}px`, top: `${e.y}px` }}>+10</div>
        ))}

        <canvas ref={canvasRef} className="w-full h-full block" />

        {countdown !== null && (
          <div className="absolute inset-0 bg-black/70 text-white flex items-center justify-center z-30">
            <span className="text-7xl font-extrabold">{countdown}</span>
          </div>
        )}

        {!started && lives <= 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white z-30">
            <h2 className="text-2xl mb-2 font-bold">게임 오버!</h2>
            <p className="mb-1 text-lg">최종 점수: {score}</p>
            {wrongWords.length > 0 && (
              <p className="mb-5 text-sm text-white/80">
                틀린 단어: {Array.from(new Set(wrongWords)).join(", ")}
              </p>
            )}
            <MainButton label="다시 시작" onClick={startGame} className="w-[12rem]" />
          </div>
        )}
      </div>

      <div className={`absolute bottom-16 left-1/2 -translate-x-1/2 z-20 ${micStatus === "말하세요!" ? "font-bold text-red-500 text-base" : "text-sm text-gray-600"}`}>
        {micStatus}
      </div>
    </div>
  );
}
