import React, { useRef, useEffect } from "react";

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

function WordGame() {
  const canvasRef = useRef(null);
  const currentWords = useRef([]);
  const lastWordTime = useRef(0);
  const wordInterval = useRef(3000);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const animationId = useRef(null);
  const gameRunning = useRef(false);

  // 단어 생성 함수
  const createWord = (ctx, canvas) => {
    let text = "";
    let tries = 0;
    do {
      text = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
      tries++;
    } while (currentWords.current.some(w => w.text === text) && tries < 10);

    const textWidth = ctx.measureText(text).width;
    let x = 0;
    let xTries = 0;
    do {
      x = Math.random() * (canvas.width - textWidth);
      xTries++;
    } while (currentWords.current.some(w => Math.abs(w.x - x) < 40) && xTries < 10);

    currentWords.current.push({
      text,
      x,
      y: 0,
      speed: INITIAL_SPEED + (scoreRef.current / 100) * SPEED_INCREASE,
    });
  };

  // 애니메이션 루프
  const gameLoop = (timestamp) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    if (!gameRunning.current) return;

    if (
      currentWords.current.length < MAX_WORDS &&
      (!lastWordTime.current || timestamp - lastWordTime.current >= wordInterval.current)
    ) {
      createWord(ctx, canvas);
      lastWordTime.current = timestamp;
      wordInterval.current = Math.max(MIN_INTERVAL, 3000 - (scoreRef.current / 100) * 100);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "24px Noto Sans KR";
    ctx.fillStyle = "#333";

    currentWords.current = currentWords.current.filter(word => {
      word.y += word.speed * (1 / 60);
      ctx.fillText(word.text, word.x, word.y);

      if (word.y > canvas.height - 100) {
        livesRef.current -= 1;
        if (livesRef.current <= 0) {
          endGame();
        }
        return false;
      }
      return true;
    });

    animationId.current = requestAnimationFrame(gameLoop);
  };

  const startGame = () => {
    if (gameRunning.current) return; // 이미 실행중이면 무시
    scoreRef.current = 0;
    livesRef.current = 3;
    currentWords.current = [];
    lastWordTime.current = 0;
    wordInterval.current = 3000;
    gameRunning.current = true;

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    animationId.current = requestAnimationFrame(gameLoop);
  };

  const endGame = () => {
    gameRunning.current = false;
    if (animationId.current) {
      cancelAnimationFrame(animationId.current);
    }
    alert(`게임 종료! 점수: ${scoreRef.current}`);
  };

  // 컴포넌트 언마운트시 애니메이션 정리
  useEffect(() => {
    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, []);

  return (
    <div style={{ width: "400px", height: "600px", position: "relative" }}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", border: "1px solid #ccc" }}
      />
      <button
        onClick={startGame}
        style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)" }}
      >
        시작
      </button>
    </div>
  );
}

export default WordGame;
