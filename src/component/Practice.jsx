import React, { useState } from 'react';
import MainButton from './MainButton';
import Modal from 'react-modal';
import Words from '../component/Words';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchStudyMistakeNotes } from '../api/fetchStudyMistakeNotes';
import { startLearning } from '../api/learning';
import { useAuthStore } from '../store/useAuthSotre';
import { useSessionStore } from '../store/useSessionStore';

const Practice = () => {
  const [selectedWords, setSelectedWords] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });
  const token = useAuthStore((s) => s.token);
  const setSessionId = useSessionStore((s) => s.setSessionId);
  const sessionId = useSessionStore((s) => s.session_id);

const { data: wordList = [] } = useQuery({
  queryKey: ["studyMistakeNotes"],
  queryFn: () => fetchStudyMistakeNotes(token),
  onError: (err) => {
    console.error("단어 목록 가져오기 실패:", err);
    setModalContent({
      title: "오류 발생",
      message: "단어 목록을 가져오는 중 오류가 발생했습니다.",
    });
    setModalIsOpen(true);
  },
});

  // 학습 세션 생성
  const { mutate: startLearningMutate, isLoading: isStartingSession } = useMutation({
    mutationFn: startLearning,
    retry: false,
    onSuccess: (res) => {
      if (res?.session_id) setSessionId(res.session_id);
    },
    onError: (err) => {
      console.error("start-learning 실패", err);
      setModalContent({
        title: "오류 발생",
        message: "학습 세션 생성 중 오류가 발생했습니다.",
      });
      setModalIsOpen(true);
    },
  });

  // 단어 선택 토글
  const toggleSelect = (word) => {
    const exists = selectedWords.some(w => w.word === word);
    if (exists) {
      setSelectedWords(selectedWords.filter(w => w.word !== word));
    } else {
      if (selectedWords.length >= 10) {
        setModalContent({
          title: '선택 제한',
          message: '최대 10개까지만 선택할 수 있어요!',
        });
        setModalIsOpen(true);
      } else {
        setSelectedWords([...selectedWords, { word }]);
      }
    }
  };

  const closeModal = () => setModalIsOpen(false);

  // 학습 시작 버튼 클릭 시
  const handleStartLearning = () => {
    if (selectedWords.length === 0) return;
    startLearningMutate({
      mode: "practice",
      total_words: selectedWords.length,
      words: selectedWords.map(w => w.word), // 선택 단어 전달
    });
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-cus py-6">
      <h2 className="text-white text-3xl font-semibold mt-8 mb-6 ml-[10%] self-start">
        학습할 단어를 선택 후 학습을 시작해주세요
      </h2>

      <MainButton
        className={`w-[80%] py-2 rounded-2xl font-semibold text-white ${
          selectedWords.length > 0 ? 'bg-blue-400' : 'bg-gray-600 cursor-not-allowed'
        }`}
        disabled={selectedWords.length === 0 || isStartingSession}
        label={isStartingSession ? "세션 생성 중..." : "학습시작"}
        onClick={handleStartLearning}
      />

      <hr className="w-[80%] border-t border-customMidGray my-4" />

      <div className="text-white w-[80%] text-left text-base">
        <p className="mb-1 text-lg font-bold">틀린 문제 {wordList.length}개</p>
        <p className="text-base">선택된 단어 {selectedWords.length}개</p>
      </div>

      <div className="bg-customFeedBack rounded-2xl w-[80%] px-4 py-3 mt-4 divide-y divide-customLightGray">
        {wordList.map((word, index) => {
          const isSelected = selectedWords.some(w => w.word === word);
          return (
            <div
              key={index}
              onClick={() => toggleSelect(word)}
              className="flex justify-between items-center px-4 py-2 cursor-pointer transition-all duration-150 bg-transparent text-white"
            >
              <span className="font-medium text-lg">{word}</span>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSelect(word)}
                className="w-5 h-5 bg-white checked:bg-customMidGray accent-custom_blue cursor-pointer"
              />
            </div>
          );
        })}
      </div>

      {/* 세션 생성 완료 후 Words 렌더링 */}
      {sessionId && selectedWords.length > 0 && <Words data={selectedWords} isReview={true}/>}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="bg-custom-blue-gradient rounded-lg shadow-lg p-6 max-w-sm mx-auto mt-40 outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-lg font-bold mb-4 text-white">{modalContent.title}</h2>
        <p className="mb-6 text-white">{modalContent.message}</p>
        <button
          onClick={closeModal}
          className="w-full py-2 rounded bg-white text-custom_blue"
        >
          확인
        </button>
      </Modal>
    </div>
  );
};

export default Practice;
