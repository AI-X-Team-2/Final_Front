import React, { useState } from "react";
import Audio from "./Audio";
import Camera from "./Camera";

// 비디오 파일 import
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
    console.log("Words 컴포넌트에서 받은 결과:", resultData);
  };

  const getRandomWord = () => {
    const randomIndex = Math.floor(Math.random() * wordData.length);
    return wordData[randomIndex];
  };

  const getWord = () => {
    const newWord = getRandomWord();
    setCurrentWord(newWord);
    setResult(null);
    setVideoURL(null);
  };

  return (
    <div className="mb-10 flex flex-col items-center gap-4 p-4">
      <button
        onClick={getWord}
        className="w-60 h-12 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors text-lg font-semibold"
      >
        랜덤 단어 뽑기
      </button>

      {currentWord && (
        <div className="text-center bg-yellow-300 w-48 h-24 flex items-center justify-center rounded-lg shadow">
          <p className="text-3xl font-bold text-gray-800">{currentWord.word}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 items-start">
        <Audio target={currentWord ? currentWord.word : ""} onResult={handleResult} />
        <Camera onRecorded={setVideoURL} />
      </div>

      {result && (
        <div className="w-full max-w-2xl mt-4 p-5 border rounded-lg shadow-lg bg-white">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">발음 분석 결과</h2>
          
          <div className="grid grid-cols-2 gap-x-8 mb-4">
            <p className="text-lg"><span className="font-semibold">종합 점수:</span> <span className="font-bold text-blue-600">{result.score}점</span></p>
            <p className="text-lg"><span className="font-semibold">내 발음:</span> <span className="font-bold text-green-600">{result.transcription}</span></p>
          </div>

          <div className="flex justify-center gap-4 mt-4 items-start">
            {currentWord && currentWord.videoPath && (
              <div className="w-full md:w-1/2">
                <p className="font-semibold mb-2 text-center">올바른 발음 영상</p>
                <video src={currentWord.videoPath} controls className="w-full rounded shadow" />
              </div>
            )}
            
          
          </div>
          
          {/*incorrect_points는 백엔드에서 사용자의 틀린 부분에 대한 정보가 담겨있는 리스트(배열)임*/}
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-3 text-gray-800">상세 피드백</h3>
            {result.incorrect_points && result.incorrect_points.length > 0 ? (
              <div className="space-y-4">
                {result.incorrect_points.map((point, index) => {
                  if (point.diff_detail === '누락된 단어') {    {/*누락된 단어 확인*/}
                    return (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <h4 className="font-semibold text-lg text-red-600">
                          누락된 단어: "{point.expected}"
                        </h4>
                      </div>
                    );
                  }

                  if (point.diff_detail === '추가된 단어') {    {/*추가된 단어 확인*/}
                    return (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <h4 className="font-semibold text-lg text-red-600">
                          추가된 단어: "{point.actual}"
                        </h4>
                      </div>
                    );
                  }
                  
                  return (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <h4 className="font-semibold text-lg mb-1 text-red-600">
                        틀린 발음: "{point.actual}" → "{point.expected}"
                      </h4>
                      
                      {point.diff_detail && (
                        <p className="font-bold text-md text-orange-600 mb-3">
                          교정 포인트: {point.diff_detail}
                        </p>
                      )}

                      <div className="flex flex-col md:flex-row items-start gap-4">
                        {point.img && (
                          <div className="text-center">
                            <img
                              src={`http://127.0.0.1:8000/static/images/${point.img}`}
                              alt="혀 위치 가이드"
                              className="w-24 h-24 object-contain border rounded p-1 bg-white"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'http://127.0.0.1:8000/static/images/default.png';
                              }}
                            />
                            <span className="text-sm font-semibold mt-1 block">올바른 입모양</span>
                          </div>
                        )}
                        <div className="flex-1 space-y-2 text-base">
                          <p><strong>입모양:</strong> {point.mouth_shape}</p>
                          <p><strong>혀 위치:</strong> {point.tongue_shape}</p>
                          <p><strong>호흡법:</strong> {point.breathing}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-2 p-4 bg-green-100 text-green-800 rounded-lg text-center font-semibold">
                완벽한 발음입니다! 아주 잘하셨어요!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Words;
