
import React, { useRef, useState, useEffect } from "react";
import GameButton from "../component/GameButton";

const WORD_LIST = [
  '사과', '바나나', '오렌지', '포도', '딸기',
  '강아지', '고양이', '토끼', '거북이', '햄스터',
  '학교', '공원', '도서관', '병원', '식당',
  '행복', '사랑', '희망', '평화', '기쁨',
  '하늘', '바다', '산', '강', '숲'
];

const INITIAL_SPEED = 15;
const SPEED_INCREASE = 0.05;
const MIN_INTERVAL = 2000;
const MAX_WORDS = 10;
const WordGame = () => {
 const canvasRef = useRef(null);
   const containerRef = useRef(null);
   const ctxRef = useRef(null);
   const mediaRecorderRef = useRef(null);
 
   const [started, setStarted] = useState(false);
   const [score, setScore] = useState(0);
   const [lives, setLives] = useState(3);
   const [words, setWords] = useState([]);
   const [micStatus, setMicStatus] = useState("마이크 준비 중...");
 
   const currentWords = useRef([]);
   const audioChunks = useRef([]);
   const lastWordTime = useRef(0);
   const wordInterval = useRef(3000);
 
   // 🔊 마이크 및 MediaRecorder 설정
   useEffect(() => {
     const init = async () => {
       try {
         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
         const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
 
         recorder.ondataavailable = (e) => {
           audioChunks.current.push(e.data);
         };
 
         recorder.onstop = async () => {
           const blob = new Blob(audioChunks.current, { type: "audio/webm" });
           audioChunks.current = [];
           setMicStatus("음성 분석 중...");
 
           const formData = new FormData();
           formData.append("audio", blob, "audio.webm");
 
           try {
             const res = await fetch("http://localhost:8000/transcribe_audio", {
               method: "POST",
               body: formData,
             });
 
             if (res.ok) {
               const data = await res.json();
               const transcript = data.transcription.trim();
               console.log("🎤 변환됨:", transcript);
               if (started) checkPronunciation(transcript);
             } else {
               setMicStatus("서버 오류");
             }
           } catch (err) {
             setMicStatus("네트워크 오류");
           } finally {
             if (started) {
               setMicStatus("말하세요!");
               recorder.start();
               setTimeout(() => recorder.state === "recording" && recorder.stop(), 2000);
             }
           }
         };
 
         mediaRecorderRef.current = recorder;
         setMicStatus("마이크 준비 완료!");
       } catch {
         setMicStatus("마이크 접근 실패");
       }
     };
     init();
   }, []);
 
   // 🎮 게임 시작
   const startGame = () => {
     if (!mediaRecorderRef.current) {
       alert("마이크가 아직 준비되지 않았습니다.");
       return;
     }
 
     setStarted(true);
     setScore(0);
     setLives(3);
     currentWords.current = [];
     lastWordTime.current = 0;
     wordInterval.current = 3000;
 
     mediaRecorderRef.current.start();
     setTimeout(() => mediaRecorderRef.current.stop(), 2000);
     requestAnimationFrame(gameLoop);
   };
 
   const checkPronunciation = (spoken) => {
     const matchIndex = currentWords.current.findIndex(w => w.text === spoken);
     if (matchIndex !== -1) {
       const matched = currentWords.current[matchIndex];
       currentWords.current.splice(matchIndex, 1);
       setScore(prev => prev + 10);
       createScoreEffect(matched.x, matched.y);
     }
   };
 
   const createScoreEffect = (x, y) => {
     const el = document.createElement("div");
     el.textContent = "+10";
     el.className = "score-effect";
     el.style.left = `${x}px`;
     el.style.top = `${y}px`;
     containerRef.current.appendChild(el);
     setTimeout(() => {
       el.style.transform = "translateY(-30px)";
       el.style.opacity = "0";
     }, 100);
     setTimeout(() => el.remove(), 600);
   };
 
   const createWord = () => {
     const canvas = canvasRef.current;
     const ctx = ctxRef.current;
     ctx.font = "24px Noto Sans KR";
 
     let text = "";
     let tries = 0;
     do {
       text = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
       tries++;
     } while (currentWords.current.some(w => w.text === text) && tries < 10);
 
     const textWidth = ctx.measureText(text).width;
     let x = 0;
     do {
       x = Math.random() * (canvas.width - textWidth);
     } while (currentWords.current.some(w => Math.abs(w.x - x) < 40));
 
     currentWords.current.push({
       text,
       x,
       y: 0,
       speed: INITIAL_SPEED + (score / 100) * SPEED_INCREASE,
     });
   };
 
   const gameLoop = (ts) => {
     const canvas = canvasRef.current;
     const ctx = ctxRef.current;
     if (!started || !canvas || !ctx) return;
 
     if (currentWords.current.length < MAX_WORDS && (!lastWordTime.current || ts - lastWordTime.current >= wordInterval.current)) {
       createWord();
       lastWordTime.current = ts;
       wordInterval.current = Math.max(MIN_INTERVAL, 3000 - (score / 100) * 100);
     }
 
     ctx.clearRect(0, 0, canvas.width, canvas.height);
     currentWords.current = currentWords.current.filter(w => {
       w.y += w.speed * (1 / 60);
       ctx.fillStyle = "#333";
       ctx.fillText(w.text, w.x, w.y);
       if (w.y > canvas.height - 100) {
         setLives(prev => {
           const newLives = prev - 1;
           if (newLives <= 0) endGame();
           return newLives;
         });
         return false;
       }
       return true;
     });
 
     requestAnimationFrame(gameLoop);
   };
 
   const endGame = () => {
     setStarted(false);
     if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
       mediaRecorderRef.current.stop();
     }
   };
 
   useEffect(() => {
     const canvas = canvasRef.current;
     if (canvas) {
       canvas.width = canvas.offsetWidth;
       canvas.height = canvas.offsetHeight;
       ctxRef.current = canvas.getContext("2d");
     }
   }, []);
 
   return (
     <div ref={containerRef} className="relative w-full h-screen bg-slate-100 flex items-center justify-center">
       <div className="relative w-full max-w-[400px] h-full bg-white shadow rounded overflow-hidden">
         {/* Danger Line */}
         <div className="absolute bottom-[100px] w-full h-[3px] bg-red-500 z-10"></div>
 
         {/* 상태바 */}
         <div className="absolute top-2 left-2 right-2 flex justify-between text-sm text-gray-700 z-20">
           <div>점수: {score}</div>
           <div className="text-red-500">{"❤".repeat(lives)}</div>
         </div>
 
         <canvas ref={canvasRef} className="w-full h-full block" />
 
         <div className="absolute bottom-14 left-1/2 -translate-x-1/2 text-sm text-gray-600 z-20">{micStatus}</div>
 
         <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
           {!started && <GameButton onClick={startGame}>시작</GameButton>}
           {started && lives <= 0 && <GameButton onClick={startGame}>재시작</GameButton>}
         </div>
 
         {!started && lives <= 0 && (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 text-white z-30">
             <h2 className="text-2xl mb-2">게임 오버!</h2>
             <p className="mb-4">최종 점수: {score}</p>
             <GameButton onClick={startGame}>다시 시작</GameButton>
           </div>
         )}
       </div>
     </div>
   );
}

export default WordGame
