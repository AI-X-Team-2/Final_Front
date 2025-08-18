import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useLayoutEffect,
} from "react";
import Audio from "./Audio";
import MainButton from "./MainButton";
import LodadingSpinner from "./LodadingSpinner";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import TabButton from "./TabButton";
import SmoothVideo from "./SmoothVideo";
import { useLearningStore } from "../store/useLearningStore";
import { useNavigate } from "react-router-dom";
import { completeSession } from "../api/session";
import { useSessionStore } from "../store/useSessionStore";


const Words = ({ data }) => {
  const navigate = useNavigate();
  const setCurrentWordIndex = useLearningStore((s) => s.setCurrentWordIndex);
  const currentWordIndex = useLearningStore((s) => s.currentWordIndex);
  const sessionId = useSessionStore((s) => s.session_id);

  const [currentWord, setCurrentWord] = useState(null);
  const [result, setResult] = useState(null);
  const [audioDisabled, setAudioDisabled] = useState(false);
  const [isWaitingResult, setIsWaitingResult] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mouthVideoURL, setMouthVideoURL] = useState(null);
  const feedbackScrollRef = useRef(null);
  const tabScrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);


  const [showResultPopup, setShowResultPopup] = useState(false);
  const [resultInfo, setResultInfo] = useState(null);

  

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - tabScrollRef.current.offsetLeft);
    setScrollLeft(tabScrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - tabScrollRef.current.offsetLeft;
    const walk = (x - startX) * 1; // 속도 조절
    tabScrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const feedbackRef = useRef(null);
  const [tabWidth, setTabWidth] = useState("80%");

  useLayoutEffect(() => {
    if (feedbackRef.current) {
      setTabWidth(`${feedbackRef.current.offsetWidth}px`);
    }
  }, []);

  const TABS = {
    CORRECT_VIDEO: "올바른 영상",
    USER_VIDEO: "사용자 영상",
    FEEDBACK: "상세 피드백",
    MISSING: "누락된 단어",
    EXTRA: "추가된 단어",
  };
  const [activeTab, setActiveTab] = useState(TABS.CORRECT_VIDEO);

  const filteredFeedback = useMemo(
    () =>
      result?.incorrect_points?.filter(
        (p) =>
          p.diff_detail !== "누락된 단어" && p.diff_detail !== "추가된 단어"
      ) || [],
    [result]
  );
  const missingPoints = useMemo(
    () =>
      result?.incorrect_points?.filter(
        (p) => p.diff_detail === "누락된 단어"
      ) || [],
    [result]
  );
  const extraPoints = useMemo(
    () =>
      result?.incorrect_points?.filter(
        (p) => p.diff_detail === "추가된 단어"
      ) || [],
    [result]
  );
  const hasCorrectVideo = !!(currentWord && currentWord.videoPath);
  const hasUserVideo = !!mouthVideoURL;
  const hasFeedback = filteredFeedback.length > 0;
  const hasMissing = missingPoints.length > 0;
  const hasExtra = extraPoints.length > 0;

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

    if (
      resultData?.incorrect_points?.some(
        (p) =>
          p.diff_detail !== "누락된 단어" && p.diff_detail !== "추가된 단어"
      )
    ) {
      setActiveTab(TABS.FEEDBACK);
    } else if (mouthVideoURL) {
      setActiveTab(TABS.USER_VIDEO);
    } else {
      setActiveTab(TABS.CORRECT_VIDEO);
    }
  };

  useEffect(() => {
    if (data[currentWordIndex]) {
      setCurrentWord(data[currentWordIndex]);
      setAudioDisabled(false);
      setActiveTab(TABS.CORRECT_VIDEO);
    }
  }, [currentWordIndex, data]);

  const goToNextWord = () => {
    if (currentWordIndex < data.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setResult(null);
      setMouthVideoURL(null);
    }
  };

  const scrollByCard = (direction) => {
    const container = feedbackScrollRef.current;
    if (!container) return;
    const cardWidth = container.firstChild?.offsetWidth || 0;
    container.scrollBy({
      left: direction * cardWidth,
      behavior: "smooth",
    });
  };

  const handleComplete = async () => {
    try {
      const res = await completeSession(sessionId);
      useSessionStore.getState().clearSession();
      useLearningStore.getState().resetLearning();
      setResultInfo(res);
      setShowResultPopup(true);
    } catch (err) {
      console.error(err);
      alert("세션 완료 중 오류가 발생했습니다.");
    }
  };

  const isLastWord = currentWordIndex === data.length - 1;

  return (
    <div className="mb-10 flex flex-col items-center gap-2 p-4">
      {currentWord && (
        <div className="text-center bg-white w-64 h-24 flex items-center justify-center rounded-xl mt-10">
          <p className="text-3xl font-bold text-gray-800">{currentWord.word}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row  items-start">
        <Audio
          target={currentWord ? currentWord.word : ""}
          onResult={handleResult}
          disabled={audioDisabled}
          reset={currentWordIndex}
          onRecordingChange={handleRecordingChange}
          camerareset={currentWordIndex}
          onMouthVideoReady={setMouthVideoURL}
        />
      </div>

      {!isRecording && isWaitingResult && <LodadingSpinner />}

      {result && (
        <div className="w-full max-w-2xl p-5 ">
          {result.my_text && (
            <div>
              <p className="text-lg">
                <span className="font-semibold text-white text-xl">
                  내 발음:
                </span>{" "}
                <span className="font-bold text-white text-xl">
                  {result.my_text}
                </span>
              </p>
            </div>
          )}

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

          <div className="flex flex-col items-center gap-8 mt-4">
            {result.score === "0" ? (
              <p className="mt-2 p-4 bg-customFeedBack text-white rounded-lg text-center font-semibold mb-36">
                일치하지 않는 단어입니다.
              </p>
            ) : (
              <>
                {/* 탭 헤더 */}
                <div
                  ref={tabScrollRef}
                  onMouseDown={handleMouseDown}
                  onMouseLeave={handleMouseLeave}
                  onMouseUp={handleMouseUp}
                  onMouseMove={handleMouseMove}
                  className="
                    flex flex-nowrap items-center gap-2 
                    bg-white/5 p-2 rounded-2xl 
                    overflow-x-auto whitespace-nowrap select-none
                    scrollbar-hide
                  "
                  style={{
                    width: tabWidth,
                    maxWidth: "100%",
                    cursor: isDragging ? "grabbing" : "grab",
                  }}
                >
                  <TabButton
                    label={TABS.CORRECT_VIDEO}
                    active={activeTab === TABS.CORRECT_VIDEO}
                    onClick={() => setActiveTab(TABS.CORRECT_VIDEO)}
                    disabled={!hasCorrectVideo}
                    className="flex-shrink-0 whitespace-nowrap"
                  />
                  <TabButton
                    label={TABS.USER_VIDEO}
                    active={activeTab === TABS.USER_VIDEO}
                    onClick={() => setActiveTab(TABS.USER_VIDEO)}
                    disabled={!hasUserVideo}
                    className="flex-shrink-0 whitespace-nowrap"
                  />
                  <TabButton
                    label={TABS.FEEDBACK}
                    active={activeTab === TABS.FEEDBACK}
                    onClick={() => setActiveTab(TABS.FEEDBACK)}
                    disabled={!hasFeedback}
                    badge={filteredFeedback.length}
                    className="flex-shrink-0 whitespace-nowrap"
                  />
                  <TabButton
                    label={TABS.MISSING}
                    active={activeTab === TABS.MISSING}
                    onClick={() => setActiveTab(TABS.MISSING)}
                    disabled={!hasMissing}
                    badge={missingPoints.length}
                    className="flex-shrink-0 whitespace-nowrap"
                  />
                  <TabButton
                    label={TABS.EXTRA}
                    active={activeTab === TABS.EXTRA}
                    onClick={() => setActiveTab(TABS.EXTRA)}
                    disabled={!hasExtra}
                    badge={extraPoints.length}
                    className="flex-shrink-0 whitespace-nowrap"
                  />
                </div>

                {/* 탭 콘텐츠 */}
                <div className="mt-6">
                  {activeTab === TABS.CORRECT_VIDEO && hasCorrectVideo && (
                    <div style={{ width: tabWidth, margin: "0 auto" }}>
                      <p className="font-semibold mb-2 text-center text-white">
                        올바른 발음 영상
                      </p>
                      <SmoothVideo src={currentWord.videoPath} />
                    </div>
                  )}

                  {activeTab === TABS.USER_VIDEO && (
                    <div style={{ width: tabWidth, margin: "0 auto" }}>
                      <p className="font-semibold mb-2 text-center text-white">
                        추출된 입모양 영상
                      </p>
                      <SmoothVideo src={mouthVideoURL} />
                    </div>
                  )}

                  {activeTab === TABS.FEEDBACK && hasFeedback && (
                    <>
                      <h3 className="text-xl font-bold mb-3 text-white">
                        상세 피드백
                      </h3>
                      <div className="flex items-center gap-2 ">
                        <button
                          onClick={() => scrollByCard(-1)}
                          className="bg-gray-800 bg-opacity-90 text-white p-2 rounded-full shadow"
                          aria-label="이전 피드백"
                        >
                          <ChevronLeftIcon className="h-6 w-6" />
                        </button>

                        <div
                          ref={feedbackScrollRef}
                          className="overflow-x-auto overflow-y-hidden snap-x snap-mandatory flex gap-4 pb-2 scroll-smooth scrollbar-hide flex-1"
                        >
                          {filteredFeedback.map((point, index) => (
                            <div
                              ref={feedbackRef}
                              key={index}
                              data-card="true"
                              className="w-full snap-start rounded-xl p-4 bg-customFeedBack shadow-md flex-shrink-0"
                              style={{ minWidth: "80%" }}
                            >
                              <h4 className="font-semibold text-lg mb-2 text-white">
                                틀린 발음: "{point.actual}" → "{point.expected}"
                              </h4>

                              {point.teaching_point && (
                                <p className="font-bold text-md text-white mb-3">
                                  교정 포인트: {point.teaching_point}
                                </p>
                              )}

                              <div className="my-3 flex justify-center items-start gap-3">
                                {point.image_guides?.chosung_img && (
                                  <div className="text-center">
                                    <img
                                      src={`http://127.0.0.1:8000/static/images/${point.image_guides.chosung_img}`}
                                      alt="자음 가이드"
                                      className="w-28 h-28 object-contain border rounded p-1 bg-customFeedBack"
                                    />
                                    <span className="text-xs font-semibold mt-1 block">
                                      자음(초성)
                                    </span>
                                  </div>
                                )}
                                {point.image_guides?.jungsung_img && (
                                  <div className="text-center">
                                    <img
                                      src={`http://127.0.0.1:8000/static/images/${point.image_guides.jungsung_img}`}
                                      alt="모음 가이드"
                                      className="w-28 h-28 object-contain border rounded p-1 bg-customFeedBack"
                                    />
                                    <span className="text-xs font-semibold mt-1 block">
                                      모음(중성)
                                    </span>
                                  </div>
                                )}
                                {point.image_guides?.default_img && (
                                  <div className="text-center">
                                    <img
                                      src={`http://127.0.0.1:8000/static/images/${point.image_guides.default_img}`}
                                      alt="발음 가이드"
                                      className="w-28 h-28 object-contain border rounded p-1 bg-customFeedBack"
                                    />
                                    <span className="text-xs font-semibold mt-1 block">
                                      올바른 입모양
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-1 text-sm text-white">
                                <p>
                                  <strong>입모양:</strong>{" "}
                                  {point.mouth_feedback}
                                </p>
                                <p>
                                  <strong>혀 위치:</strong>{" "}
                                  {point.tongue_position_feedback}
                                </p>
                                <p>
                                  <strong>호흡법:</strong>{" "}
                                  {point.breathing_feedback}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => scrollByCard(1)}
                          className="bg-gray-800 bg-opacity-90 text-white p-2 rounded-full shadow"
                          aria-label="다음 피드백"
                        >
                          <ChevronRightIcon className="h-6 w-6" />
                        </button>
                      </div>
                    </>
                  )}

                  {activeTab === TABS.MISSING && hasMissing && (
                    <div style={{ width: tabWidth, maxWidth: "100%" }}>
                      <h4 className="text-lg font-bold text-white mb-2">
                        누락된 단어
                      </h4>
                      <ul className="space-y-3">
                        {missingPoints.map((point, idx) => (
                          <li
                            key={idx}
                            className="w-full px-4 py-3 rounded-xl bg-customFeedBack text-white shadow-sm"
                          >
                            <span className="font-semibold break-keep">
                              누락된 단어:
                            </span>
                            <span className="ml-2 break-keep">
                              "{point.expected}"
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {activeTab === TABS.EXTRA && hasExtra && (
                    <div style={{ width: tabWidth, maxWidth: "100%" }}>
                      <h4 className="text-lg font-bold text-white mb-3">
                        추가된 단어
                      </h4>
                      <ul className="space-y-3">
                        {extraPoints.map((point, idx) => (
                          <li
                            key={idx}
                            className="w-full px-4 py-3 rounded-xl bg-white/10 text-white shadow-sm"
                          >
                            <span className="font-semibold break-keep">
                              추가된 단어:
                            </span>
                            <span className="ml-2 break-keep">
                              "{point.actual}"
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <MainButton
        onClick={isLastWord ? handleComplete : goToNextWord}
        disabled={!result}
        label={isLastWord ? "학습 완료" : "다음 단어"}
        className="fixed bottom-6 w-full max-w-[20rem] "
      />

      {showResultPopup && resultInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="flex flex-col rounded-lg p-6 shadow-lg w-[30rem] bg-custom_blue relative">
            <p className="font-extrabold text-lg text-white text-shadow-lg mb-2 text-center">
              {resultInfo.isPassed
                ? "다음 단계가 열렸습니다!"
                : "다시 시도해볼까요?"}
            </p>
            <p className="mb-6 font-semibold text-base text-white/90 text-center">
              맞은 개수: {resultInfo.correctCount} / {resultInfo.total_words}
            </p>

            <button
              className="px-4 py-2 rounded-md bg-white text-custom_blue w-full font-bold"
              onClick={() => {
                setShowResultPopup(false);
                navigate("/main");
              }}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Words;
