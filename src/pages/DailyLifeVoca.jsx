import Audio from "../component/Audio";
import Words from "../component/Words";
import { dailyWords } from "../assets/wordList";
import { dailyWords2 } from "../assets/wordList";
import { useParams } from "react-router-dom";
import { useSessionStore } from "../store/useSessionStore";
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { startLearning } from "../api/learning";


const DailyLifeVoca = () => {
  const { step } = useParams();
  const level = Number(step) || 1;

  const setSessionId = useSessionStore((s) => s.setSessionId);

  const getDataByStep = () => {
    switch (step) {
      case "1":
        return dailyWords;

      default:
        return dailyWords2;
    }
  };

  const data = getDataByStep(); // 첫 10개 단어만 사용


  const { mutate: startLearningMutate } = useMutation({
    mutationFn: startLearning,
    retry: false,
    onSuccess: (res) => {
      if (res?.session_id) setSessionId(res.session_id);
    },
    onError: (err) => {
      console.error("start-learning 실패", err);

    },
  });

  const sessionId = useSessionStore((s) => s.session_id);

  useEffect(() => {
    if (!sessionId) { // 기존 세션이 없을 때만 새로 생성
      startLearningMutate({ mode: "daily", level, total_words: data.length });
    }
  }, [level, data, sessionId]);

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <Words data={data} />
    </div>
  );
};

export default DailyLifeVoca;
