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
import Camera from "./Camera";

const Words = () => {
  const [currentWord, setCurrentWord] = useState(null);
  const [result, setResult] = useState(null);
   const [videoURL, setVideoURL] = useState(null);
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

  const handleResult = (resultData) => {
    setResult(resultData);
  };

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
      <button
        onClick={() => getWord()}
        className="w-60 h-10 bg-black text-white"
      >
        랜덤 글자
      </button>
      {currentWord && (
        <div className="text-center">
          <div className="text-xl font-semibold mb-2 bg-yellow-400 w-30 h-20 flex items-center justify-center">
            <p>{currentWord.word}</p>
          </div>
          
        </div>
      )}

      <Audio target={currentWord} onResult={handleResult} />
      <Camera  onRecorded={setVideoURL} />

      {result && (
        <div>
            <video
            src={currentWord.videoPath}
            controls
            className="w-64 rounded shadow"
          />


      {videoURL && (
        <div className="mt-6">
          <h2 className="font-semibold">부모에서 받은 녹화 영상</h2>
          <video
            src={videoURL}
            controls
            className="w-[20rem] border mt-2 rounded"
          />
        </div>
      )}

          <div>점수: {result.score}</div>
          <div>인식된 단어: {result.transcription}</div>
          {result.incorrect_points && (
            <div>
                <div>올바른 부분: {result.transcription.expected}</div>
                <div>틀린 부분: {result.transcription.expected}</div>
                <img src={result.incorrect_points.img} alt="올바른 입모양" />
                <div>입모양 피드백: {result.incorrect_points.mouth_shape}</div>
                <div>혀모양 피드백: {result.incorrect_points.tongue_shape}</div>
                <div>호흡법 피드백: {result.incorrect_points.breathing}</div>

            </div>
          
          )

          }
        </div>
      )}
    </div>
  );
};

export default Words;
