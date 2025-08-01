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

  return <Words data={data} />;
}

export default BasicStage
