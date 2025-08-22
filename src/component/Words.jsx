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


const Words = ({ data, isReview }) => {
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
  const [userAudioURL, setUserAudioURL] = useState(null);  //추가
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
  const hasCorrectVideo = !!(currentWord && result?.correct_video_url);
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
      setUserAudioURL(null);  //추가
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
    <div className="mb-10 flex flex-col items-center gap-2 h-screen">
      <div className="flex flex-col w-full items-center gap-3">
        {currentWord && (
          <div className="text-center bg-white w-64 h-24 flex items-center justify-center rounded-xl mt-10">
            <p className="text-3xl font-bold text-gray-800">{currentWord.word}</p>
          </div>
        )}

       
          <Audio
            target={currentWord ? currentWord.word : ""}
            onResult={handleResult}
            disabled={audioDisabled}
            reset={currentWordIndex}
            onRecordingChange={handleRecordingChange}
            camerareset={currentWordIndex}
            onMouthVideoReady={setMouthVideoURL}
            onAudioRecorded={setUserAudioURL}
            isReview={isReview}

          />
  

      </div>
      <div className={`${!isRecording && isWaitingResult ? "flex items-center justify-center" : "h-auto overflow-y-auto scrollbar-hide"}`}>
         {!isRecording && isWaitingResult && <LodadingSpinner />}

      {result && (
        <div className="w-full max-w-2xl">
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

          <div className="flex flex-col items-center gap-8 ">
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
                  className={`
                   w-[30rem] max-w-full mx-auto
                    flex flex-nowrap items-center gap-2 
                    bg-white/5 p-2 rounded-2xl 
                    overflow-x-auto whitespace-nowrap select-none
                    scrollbar-hide
                    ${isDragging ? "cursor-grabbing" : "cursor-grab"}
                  `}

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
                <div className=" min-h-[30rem]">
                  {activeTab === TABS.CORRECT_VIDEO && hasCorrectVideo && (
                    <div>
                      <p className="text-xl font-semibold mb-2 text-start text-white">
                        올바른 발음 영상
                      </p>
                      <div className="w-[30rem]">
                        <SmoothVideo src={result.correct_video_url} />

                      </div>
                    </div>
                  )}

                  {activeTab === TABS.USER_VIDEO && (
                    <div >
                      {mouthVideoURL && ( // 비디오와 오디오를 그룹으로 묶어 렌더링 
                        <>
                          <p className="text-xl font-semibold mb-2 text-start text-white">
                            추출된 입모양 영상
                          </p>
                          <div className="w-[30rem]">
                            <SmoothVideo src={mouthVideoURL} />
                          </div>

                        </>
                      )}
                    </div>
                  )}

                  {activeTab === TABS.FEEDBACK && hasFeedback && (
                    <div className="floex flex-col relative">
                      <h3 className="text-xl font-bold mb-3 text-white">
                        상세 피드백
                      </h3>
                      <div className="flex items-center gap-2 ">
                        <button
                          onClick={() => scrollByCard(-1)}
                          className="absolute -left-12 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-90 text-white p-2 rounded-full shadow"
                          aria-label="이전 피드백"
                        >
                          <ChevronLeftIcon className="h-6 w-6" />
                        </button>

                        <div
                          ref={feedbackScrollRef}

                          className="w-[30rem] overflow-x-auto overflow-y-hidden snap-x snap-mandatory flex gap-4 pb-2 scroll-smooth scrollbar-hide flex-1"
                        >
                          {filteredFeedback.map((point, index) => (
                            <div

                              key={index}
                              data-card="true"
                              className="w-[30rem] snap-start rounded-xl p-4 bg-customFeedBack shadow-md flex-shrink-0 "

                            >
                              <p className="font-bold text-lg mb-2 text-white">
                                틀린 발음: <span className="font-normal ">"{point.wrong_text}" → "{point.expected}"</span>
                              </p>

                              {point.teaching_point && (
                                <p className="font-bold text-lg text-white mb-3">
                                  교정 포인트:  <span className="font-normal">{point.teaching_point}</span>
                                </p>
                              )}

                              <div className="my-3 flex justify-center items-start ">
                                {point.correct_img_url && (
                                  <img
                                    src={point.correct_img_url}
                                    alt="정답 이미지"
                                    className="w-64 h-32 object-contain"
                                  />
                                )}
                              </div>

                              <div className="space-y-1 text-sm text-white">
                                <p>
                                  <p className="font-bold text-base">입모양:</p>{" "}
                                  {point.mouth_feedback}
                                </p>
                                <p>
                                  <p className="font-bold text-base">혀 위치:</p>{" "}
                                  {point.tongue_position_feedback}
                                </p>
                                <p>
                                  <p className="font-bold text-base">호흡법:</p>{" "}
                                  {point.breathing_feedback}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => scrollByCard(1)}
                          className="absolute -right-12 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-90 text-white p-2 rounded-full shadow"
                          aria-label="다음 피드백"
                        >
                          <ChevronRightIcon className="h-6 w-6" />
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === TABS.MISSING && hasMissing && (
                    <div >
                      <h4 className="text-xl font-bold text-white mb-2">
                        누락된 단어
                      </h4>
                      <ul className="space-y-3">
                        {missingPoints.map((point, idx) => (
                          <li
                            key={idx}
                            className="w-[30rem] px-4 py-3 rounded-xl bg-customFeedBack text-white shadow-sm"
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
                      <h4 className="text-xl font-bold text-white mb-3">
                        추가된 단어
                      </h4>
                      <ul className="space-y-3">
                        {extraPoints.map((point, idx) => (
                          <li
                            key={idx}
                            className="w-[30rem] px-4 py-3 rounded-xl bg-white/10 text-white shadow-sm"
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

      </div>


     
      <MainButton
        onClick={isLastWord ? handleComplete : goToNextWord}
        disabled={!result}
        label={isLastWord ? "학습 완료" : "다음 단어"}
        className="fixed bottom-6  max-w-[20rem] "
      />

      {showResultPopup && resultInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="flex flex-col rounded-lg p-6 shadow-lg w-[30rem] bg-custom_blue relative">
            <p className="font-extrabold text-lg text-white text-shadow-lg mb-2 text-center">
              {isReview
                ? "학습을 모두 완료했습니다."
                : resultInfo.isPassed
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
