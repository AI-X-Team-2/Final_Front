import React from 'react'
import { useParams } from "react-router-dom";
import { step1Words, step2Words, step3Words, step4Words, step5Words } from "./wordList";
import Words from '../component/Words';

const BasicStage = () => {
   const { step, stage } = useParams();

  let data;

  switch (step) {
    case "1":
      data = wordList.step1Words[`step1_${stage}`];
      break;
    case "2":
      data = wordList.step2Words[`step2_${stage}`];
      break;
    case "3":
      data = wordList.step3Words[`step3_${stage}`];
      break;
    case "4":
      data = wordList.step4Words[`step4_${stage}`];
      break;
    case "5":
      data = wordList.step5Words[`step5_${stage}`];
      break;
    default:
      data = []; // 혹은 null 처리
  }

  return <Words data={data} />;
}

export default BasicStage
