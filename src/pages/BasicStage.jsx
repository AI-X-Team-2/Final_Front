import React from 'react'
import { useParams } from "react-router-dom";
import { step1Words, step2Words, step3Words, step4Words, step5Words } from "../assets/wordList";
import Words from '../component/Words';

const BasicStage = () => {
   const { step, stage } = useParams();

  let data;

  switch (step) {
    case "1":
      data = step1Words[`step1_${stage}`];
      break;
    case "2":
      data = step2Words[`step2_${stage}`];
      break;
    case "3":
      data = step3Words[`step3_${stage}`];
      break;
    case "4":
      data = step4Words[`step4_${stage}`];
      break;
    case "5":
      data = step5Words[`step5_${stage}`];
      break;
    default:
      data = []; 


    console.log(data)
  }

  const onStageComplete = async ({ step, stage, totalCount }) => {
    try {
      const token = localStorage.getItem("token"); // JWT를 로컬에 저장해놨다면
      await fetch(`${import.meta.env.VITE_API_BASE_URL || ""}/api/learning/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        // 쿠키 기반 인증이라면 아래 옵션 필요하고 Authorization 헤더는 없어도 됨
        credentials: "include",
        body: JSON.stringify({
          step: Number(step),
          stage: Number(stage),
          completed: true,
          totalCount,       // 전체 단어 수 (옵션)
          completedAt: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error("학습 진행도 업데이트 실패:", err);
    }
  };
return <Words data={data} step={step} stage={stage} onStageComplete={onStageComplete} />;
 
}

export default BasicStage
