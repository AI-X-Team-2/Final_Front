import React, { useState } from "react";
import apple from "../assets/word-audio/apple.mp4";
import banana from "../assets/word-audio/banana.mp4";
import car from "../assets/word-audio/car.mp4";
import hippo from "../assets/word-audio/hippo.mp4";
import milk from "../assets/word-audio/milk.mp4";
import pizza from "../assets/word-audio/pizza.mp4";
import potato from "../assets/word-audio/potato.mp4";
import rabbit from "../assets/word-audio/rabbit.mp4";
import radio from "../assets/word-audio/radio.mp4";
import school from "../assets/word-audio/school.mp4";
import Audio from "./Audio";

const wordData = [
  { word: "사과", videoPath: apple },
  { word: "바나나", videoPath: banana },
  { word: "자동차", videoPath: car },
  { word: "하마", videoPath: hippo },
  { word: "우유", videoPath: milk },
  { word: "피자", videoPath: pizza },
  { word: "감자", videoPath: potato },
  { word: "토끼", videoPath: rabbit },
  { word: "라디오", videoPath: radio },
  { word: "학교", videoPath: school },
];


 
const Words = () => {
      const [currentWord, setCurrentWord] = useState(null);
      const getRandomWord = () => {
    const randomIndex = Math.floor(Math.random() * wordData.length);
    return wordData[randomIndex];
  };

  const getWord = () => {
    const newWord = getRandomWord();
    setCurrentWord(newWord);
  };
  return (
    <div className="mb-10 flex flex-col gap-3">
      <button onClick={() => getWord()} className="w-60 h-10 bg-black text-white">랜덤 글자</button>
      {currentWord && (
        <div className="text-center">
          <div className="text-xl font-semibold mb-2 bg-yellow-400 w-30 h-20 flex items-center justify-center"><p>{currentWord.word}</p></div>
          <video
            src={currentWord.videoPath}
            controls
            className="w-64 rounded shadow"
          />
        </div>
      )}

            <Audio target={currentWord}/>

    </div>
  );
};

export default Words;
