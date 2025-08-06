import React, { useRef, useState, useEffect, useCallback } from "react";
import GameButton from "../component/GameButton";
// 게임 백엔드 port 5000로 열어야함
// 게임에 사용될 단어 리스트
const WORD_LIST = [
  '사과', '바나나', '오렌지', '포도', '딸기',
  '강아지', '고양이', '토끼', '거북이', '햄스터',
  '학교', '공원', '도서관', '병원', '식당',
  '행복', '사랑', '희망', '평화', '기쁨',
  '하늘', '바다', '산', '강', '숲'
];

// 게임 상수 정의
const INITIAL_SPEED = 10;
const SPEED_INCREASE = 0.05;
const MIN_INTERVAL = 2000;
const MAX_WORDS = 10;
// 단어 생성 시 캔버스 좌우 여백
const HORIZONTAL_PADDING = 20;
// 단어들 사이의 최소 간격 (픽셀)
const MIN_WORD_SPACING = 40; // 단어 간 최소 간격을 80에서 40으로 줄임

const WordGame = () => {
  // 컴포넌트 상태 관리를 위한 Ref 및 State 변수
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const ctxRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const animationFrameId = useRef(null);
  const currentWords = useRef([]);
  const audioChunks = useRef([]);
  const lastWordTime = useRef(0);
  const wordInterval = useRef(3000);
  
  // 게임 시작 상태를 추적하는 Ref 추가
  const startedRef = useRef(false);

  const [started, setStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [micStatus, setMicStatus] = useState("마이크 준비 중...");
  const [scoreEffects, setScoreEffects] = useState([]);

  // score와 lives의 최신 값을 onstop 핸들러에서 참조하기 위한 Ref
  const scoreRef = useRef(score);
  const livesRef = useRef(lives);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { livesRef.current = lives; }, [lives]);
  
  // started 상태가 변경될 때마다 startedRef를 업데이트
  useEffect(() => {
    startedRef.current = started;
  }, [started]);

  // 게임 종료 로직
  const endGame = useCallback(() => {
    setStarted(false);
    console.log("endGame() 호출됨: 게임 종료."); // 디버깅 로그 추가
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    cancelAnimationFrame(animationFrameId.current);
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    currentWords.current = [];
  }, []);

  // 발음 일치 여부 확인
  const checkPronunciation = useCallback((spoken) => {
    const trimmedSpoken = spoken.trim();
    // 일치하는 단어의 인덱스를 찾음
    const idx = currentWords.current.findIndex((w) => w.text === trimmedSpoken);
    
    // 일치하는 단어가 있을 경우
    if (idx !== -1) {
      const matched = currentWords.current[idx];
      // 해당 단어를 배열에서 제거하여 Canvas에서 즉시 사라지게 함
      currentWords.current.splice(idx, 1);
      setScore((prev) => prev + 10);
      
      // 점수 효과를 위한 상태 업데이트
      setScoreEffects((prevEffects) => [
        ...prevEffects,
        { id: Date.now(), x: matched.x, y: matched.y },
      ]);
    }
  }, []);
  
  // 점수 효과 애니메이션 및 상태 관리
  useEffect(() => {
    if (scoreEffects.length > 0) {
      const timer = setTimeout(() => {
        setScoreEffects((prevEffects) => prevEffects.slice(1));
      }, 600); // score-effect CSS 애니메이션 지속 시간과 동일하게 설정
      return () => clearTimeout(timer);
    }
  }, [scoreEffects]);

  // 게임 애니메이션 루프
  const gameLoop = useCallback((timestamp) => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    // 매 프레임마다 폰트 재설정하여 폰트 캐싱 문제를 해결
    ctx.font = "25px 'Noto Sans KR', sans-serif";
    ctx.textBaseline = "top";

    if (
      currentWords.current.length < MAX_WORDS &&
      timestamp - lastWordTime.current >= wordInterval.current
    ) {
      let text;
      let textSelectionAttempts = 0;
      const MAX_TEXT_SELECTION_ATTEMPTS = 50; // 중복되지 않는 단어 찾기 최대 시도 횟수
      let uniqueWordFound = false;

      do {
        text = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
        textSelectionAttempts++;
        // 현재 화면에 있는 단어들과 중복되지 않는지 확인
        if (!currentWords.current.some(w => w.text === text)) {
          uniqueWordFound = true;
        }
        if (textSelectionAttempts > MAX_TEXT_SELECTION_ATTEMPTS) {
          console.warn("Unique word not found after many attempts. Skipping word creation.");
          return; // 중복되지 않는 단어를 찾지 못하면 단어 생성 건너뛰기
        }
      } while (!uniqueWordFound);

      const textWidth = ctx.measureText(text).width;
      
      let x;
      let positionAttempts = 0;
      const MAX_POSITION_ATTEMPTS = 100; // 단어 위치 탐색 최대 시도 횟수
      let foundPosition = false;

      do {
        // 단어가 캔버스 좌우 여백 안에 생성되도록 x 좌표 계산
        x = HORIZONTAL_PADDING + Math.random() * (canvas.width - textWidth - HORIZONTAL_PADDING * 2);
        positionAttempts++;
        // 현재 단어들과 겹치지 않는지 확인
        if (!currentWords.current.some((w) => Math.abs(w.x - x) < MIN_WORD_SPACING)) {
          foundPosition = true;
        }
      } while (!foundPosition && positionAttempts < MAX_POSITION_ATTEMPTS); // 시도 횟수 제한

      if (foundPosition) { // 유효한 위치를 찾았을 경우에만 단어 생성
        const currentScore = scoreRef.current;
        currentWords.current.push({
          text,
          x,
          // 단어가 캔버스 밖에서부터 떨어지도록 초기 y 좌표를 음수로 설정
          y: -30, 
          speed: INITIAL_SPEED + (currentScore / 100) * SPEED_INCREASE,
        });
        lastWordTime.current = timestamp;
        wordInterval.current = Math.max(
          MIN_INTERVAL,
          3000 - (currentScore / 100) * 100
        );
        console.log(`새 단어 생성: "${text}", 현재 단어 수: ${currentWords.current.length}`); // 디버깅 로그
      } else {
        console.warn(`새 단어 위치 찾기 실패 (시도 횟수 초과). 현재 단어 수: ${currentWords.current.length}`); // 디버깅 로그
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    currentWords.current = currentWords.current.filter((w) => {
      w.y += w.speed * (1 / 60);
      ctx.fillStyle = "#333";
      ctx.fillText(w.text, w.x, w.y);

      // 단어가 빨간 선에 닿거나 넘어서면 생명 감소 및 단어 제거
      if (w.y >= canvas.height - 120) { // 빨간 선의 위치를 100에서 50으로 내린 것에 맞춰 조건 변경
        setLives((prev) => {
          const next = prev - 1;
          console.log(`생명 감소: ${prev} -> ${next}. 현재 화면 단어 수: ${currentWords.current.length}`); // 디버깅 로그 추가
          if (next <= 0) {
            console.log("생명이 0 이하가 되어 게임 종료 조건 충족."); // 디버깅 로그 추가
            endGame();
            return 0;
          }
          return next;
        });
        return false; // 단어 제거
      }
      return true;
    });

    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [endGame]);

  // 게임 시작 로직
  const startGame = () => {
    currentWords.current = [];
    // 게임 시작과 동시에 첫 단어가 나오도록 lastWordTime을 설정
    lastWordTime.current = performance.now() - wordInterval.current; 
    wordInterval.current = 3000;
    setScore(0);
    setLives(3);
    setMicStatus("말하세요!");
    setStarted(true);

    if (mediaRecorderRef.current?.state === "inactive") {
      mediaRecorderRef.current.start();
      console.log("녹음 시작. 상태:", mediaRecorderRef.current.state);
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      }, 2000);
    }
  };

  // 게임 애니메이션 루프 제어
  useEffect(() => {
    if (started) {
      animationFrameId.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [started, gameLoop]);

  // 캔버스 크기 및 렌더링 설정 (컴포넌트 마운트 시 한 번만 실행)
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (canvas && container) {
      const setSize = () => {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
      };
      setSize();
      window.addEventListener('resize', setSize);
      
      const ctx = canvas.getContext("2d");
      ctxRef.current = ctx;

      return () => window.removeEventListener('resize', setSize);
    }
  }, []);

  // MediaRecorder 초기화 (컴포넌트 마운트 시 한 번만 실행)
  useEffect(() => {
    const initMic = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

        console.log("MediaRecorder 초기화 완료. 상태:", recorder.state);

        recorder.ondataavailable = (e) => {
          audioChunks.current.push(e.data);
          console.log("ondataavailable 이벤트 발생. 청크 크기:", e.data.size);
        };

        recorder.onstop = async () => {
          console.log("onstop 이벤트 발생. 녹음 중지.");
          const blob = new Blob(audioChunks.current, { type: "audio/webm" });
          audioChunks.current = [];
          setMicStatus("음성 분석 중...");
          const formData = new FormData();
          formData.append("audio", blob, "audio.webm");

          try {
            const res = await fetch("http://localhost:5000/transcribe_audio", { method: "POST", body: formData });
            console.log("서버 응답 상태:", res.status);

            if (res.ok) {
              const data = await res.json();
              console.log("서버 응답 데이터:", data);
              // useRef를 사용하여 최신 started 상태를 참조
              if (startedRef.current) checkPronunciation(data.transcription.trim());
            } else {
              console.error("서버 오류:", res.statusText);
              setMicStatus("서버 오류");
            }
          } catch (error) {
            console.error("네트워크 또는 변환 오류:", error);
            setMicStatus("네트워크 오류");
          } finally {
            // useRef를 사용하여 최신 started 상태를 참조하여 재녹음 여부 결정
            if (startedRef.current) {
              setMicStatus("말하세요!");
              recorder.start();
              console.log("녹음 재시작. 상태:", recorder.state);
              setTimeout(() => recorder.state === "recording" && recorder.stop(), 2000);
            } else {
              setMicStatus("게임 시작 대기 중.");
            }
          }
        };
        mediaRecorderRef.current = recorder;
        setMicStatus("마이크 준비 완료!");
      } catch (error) {
        console.error('마이크 접근 오류:', error);
        setMicStatus("마이크 접근 실패");
      }
    };
    initMic();
  }, []); // 의존성 배열을 비워서 컴포넌트 마운트 시 한 번만 실행

  return (
    <div ref={containerRef} className="relative w-full h-screen flex items-center justify-center font-noto-sans-kr">
      {/* Google Fonts와 점수 효과 애니메이션을 위한 스타일 태그 추가 */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap');
        .score-effect {
          position: absolute;
          font-size: 1.5rem;
          font-weight: bold;
          color: green;
          animation: fadeAndMoveUp 0.6s ease-out forwards;
          z-index: 30; /* 캔버스 위에 확실하게 표시되도록 z-index 추가 */
          transform: translateX(-50%); /* 단어 위치의 중앙에 표시되도록 추가 */
        }
        @keyframes fadeAndMoveUp {
          from {
            opacity: 1;
            transform: translateY(0) translateX(-50%);
          }
          to {
            opacity: 0;
            transform: translateY(-30px) translateX(-50%);
          }
        }
      `}</style>
      <div className="relative w-full max-w-[400px] h-full bg-white shadow-lg rounded-[15px] overflow-hidden">
        {/* 빨간 선의 위치를 50px로 조정 */}
        <div className="absolute left-0 right-0 h-[3px] bg-red-500 z-10" style={{ bottom: '100px' }}></div>

        <div className="absolute top-2 left-2 right-2 flex justify-between text-base font-bold text-gray-700 z-20">
          <div>점수: {score}</div>
          <div className="text-red-500 text-lg">{"❤".repeat(lives)}</div>
        </div>

        {/* 캔버스 위에 점수 효과를 렌더링 */}
        {scoreEffects.map((effect) => (
          <div
            key={effect.id}
            className="score-effect"
            style={{ left: `${effect.x}px`, top: `${effect.y}px` }}
          >
            +10
          </div>
        ))}
        <canvas ref={canvasRef} className="w-full h-full block" />

        <div 
          className={`absolute bottom-16 left-1/2 -translate-x-1/2 z-20 ${
            micStatus === "말하세요!" 
              ? "font-bold text-red-500 text-base" 
              : "text-sm text-gray-600"
          }`}
        >
          {micStatus}
        </div>

        {!started && lives > 0 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            <GameButton onClick={startGame}>시작</GameButton>
          </div>
        )}

        {!started && lives <= 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 text-white z-30">
            <h2 className="text-2xl mb-2 font-bold">게임 오버!</h2>
            <p className="mb-4 text-lg">최종 점수: {score}</p>
            <GameButton onClick={startGame}>다시 시작</GameButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordGame;