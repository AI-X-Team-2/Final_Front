import React, { useEffect, useState } from "react";
import Audio from "./Audio";
import MainButton from "./MainButton";
import LodadingSpinner from "./LodadingSpinner";

const Words = ({ data }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState(null);
  const [result, setResult] = useState(null);
  const [audioDisabled, setAudioDisabled] = useState(false);
  const [isWaitingResult, setIsWaitingResult] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mouthVideoURL, setMouthVideoURL] = useState(null);

  const handleRecordingChange = (recording) => {
    setIsRecording(recording);
    if (!recording) {
      setIsWaitingResult(true);
    }
  };

  const handleResult = (resultData) => {
    setResult(resultData);
    setAudioDisabled(true);
    setIsWaitingResult(false);
    console.log("Words 컴포넌트에서 받은 결과:", resultData);
  };

  useEffect(() => {
    if (data[currentIndex]) {
      console.log("단어 바뀜, 버튼 활성화");
      setCurrentWord(data[currentIndex]);
      setAudioDisabled(false);
    }
  }, [currentIndex, data]);

  const goToNextWord = () => {
    if (currentIndex < data.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setResult(null);
      setMouthVideoURL(null);
    }
  };

  return (
    <div className="mb-10 flex flex-col items-center gap-4 p-4">
      {currentWord && (
        <div className="text-center bg-white w-64 h-24 flex items-center justify-center rounded-xl mt-10">
          <p className="text-3xl font-bold text-gray-800">
            {currentWord.word}
          </p>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 items-start">
        <Audio
          target={currentWord ? currentWord.word : ""}
          onResult={handleResult}
          disabled={audioDisabled}
          reset={currentIndex}
          onRecordingChange={handleRecordingChange}
          camerareset={currentIndex}
          onMouthVideoReady={setMouthVideoURL}
        />
      </div>
      
      {!isRecording && isWaitingResult && <LodadingSpinner />}

      {result && (
        <div className="w-full max-w-2xl mt-4 p-5 ">
          <div>
            <p className="text-lg">
              <span className="font-semibold text-white text-xl">내 발음:</span>{" "}
              <span className="font-bold text-white text-xl">
                {result.my_text}
              </span>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-8 mb-4">
            <p className="text-lg">
              <span className="font-semibold text-white text-xl">
                종합 점수:
              </span>{" "}
              <span className="font-bold text-white text-xl">
                {result.score}점
              </span>
            </p>
          </div>

          {/* ==================== [수정된 부분 시작] ==================== */}
          {/* 1. 영상들을 감싸는 부모 div를 세로 정렬로 변경합니다. */}
          <div className="flex flex-col items-center gap-8 mt-4">
            {/* 올바른 발음 영상 */}
            {currentWord && currentWord.videoPath && (
              <div className="flex flex-col items-center w-full md:w-1/2">
                <p className="font-semibold mb-2 text-center text-white">
                  올바른 발음 영상
                </p>
                <video
                  src={currentWord.videoPath}
                  controls
                  className="w-full rounded shadow"
                />
              </div>
            )}

            {/* 처리된 입 모양 영상 */}
            {mouthVideoURL && (
              <div className="flex flex-col items-center w-full md:w-1/2">
                <p className="font-semibold mb-2 text-center text-white">
                  추출된 입모양 영상
                </p>
                {/* 2. autoPlay 속성을 삭제했습니다. */}
                <video
                  src={mouthVideoURL}
                  controls
                  className="w-full rounded shadow"
                />
              </div>
            )}
          </div>
          {/* ==================== [수정된 부분 끝] ==================== */}

          <div className="mt-6">
            <h3 className="text-xl font-bold mb-3 text-white">상세 피드백</h3>
            
            {result.score === "0" ? (
              <p className="mt-2 p-4 bg-red-100 text-red-800 rounded-lg text-center font-semibold mb-36">
                일치하지 않는 단어입니다. 다시 시도해 보세요.
              </p>
            ) : result.incorrect_points && result.incorrect_points.length > 0 ? (
              <div className="space-y-4 mb-36">
                {result.incorrect_points.map((point, index) => {
                  if (point.diff_detail === "누락된 단어") {
                    return (
                      <div
                        key={index}
                        className="border rounded-lg p-4 bg-gray-50"
                      >
                        <h4 className="font-semibold text-lg text-red-600">
                          누락된 단어: "{point.expected}"
                        </h4>
                      </div>
                    );
                  }

                  if (point.diff_detail === "추가된 단어") {
                    return (
                      <div
                        key={index}
                        className="border rounded-lg p-4 bg-gray-50"
                      >
                        <h4 className="font-semibold text-lg text-red-600">
                          추가된 단어: "{point.actual}"
                        </h4>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={index}
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      <h4 className="font-semibold text-lg mb-1 text-red-600">
                        틀린 발음: "{point.actual}" → "{point.expected}"
                      </h4>

                      {point.teaching_point && (
                        <p className="font-bold text-md text-orange-600 mb-3">
                          교정 포인트: {point.teaching_point}
                        </p>
                      )}
                      
                      <div className="my-4 flex justify-center items-start gap-4">
                        {point.image_guides?.chosung_img && (
                          <div className="text-center">
                            <img
                              src={`http://127.0.0.1:8000/static/images/${point.image_guides.chosung_img}`}
                              alt="자음 가이드"
                              className="w-32 h-32 object-contain border rounded p-1 bg-white"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "http://127.0.0.1:8000/static/images/default.png";
                              }}
                            />
                            <span className="text-sm font-semibold mt-1 block">
                              자음(초성)
                            </span>
                          </div>
                        )}
                        {point.image_guides?.jungsung_img && (
                          <div className="text-center">
                            <img
                              src={`http://127.0.0.1:8000/static/images/${point.image_guides.jungsung_img}`}
                              alt="모음 가이드"
                              className="w-32 h-32 object-contain border rounded p-1 bg-white"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "http://127.0.0.1:8000/static/images/default.png";
                              }}
                            />
                            <span className="text-sm font-semibold mt-1 block">
                              모음(중성)
                            </span>
                          </div>
                        )}
                        {point.image_guides?.default_img && (
                          <div className="text-center">
                            <img
                              src={`http://127.0.0.1:8000/static/images/${point.image_guides.default_img}`}
                              alt="발음 가이드"
                              className="w-32 h-32 object-contain border rounded p-1 bg-white"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "http://127.0.0.1:8000/static/images/default.png";
                              }}
                            />
                            <span className="text-sm font-semibold mt-1 block">
                              올바른 입모양
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-2 text-base text-left">
                        <p>
                          <strong>입모양:</strong> {point.mouth_feedback}
                        </p>
                        <p>
                          <strong>혀 위치:</strong> {point.tongue_position_feedback}
                        </p>
                        <p>
                          <strong>호흡법:</strong> {point.breathing_feedback}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-2 p-4 bg-gray-50 text-black rounded-lg text-center font-semibold mb-36">
                완벽한 발음입니다! 아주 잘하셨어요!
              </p>
            )}
          </div>
        </div>
      )}
      <MainButton
        onClick={goToNextWord}
        disabled={!result}
        label={"다음 단어"}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 "
      />
    </div>
  );
};

export default Words;
