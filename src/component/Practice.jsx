import React, { useMemo, useState } from 'react';
import MainButton from './MainButton';
import Modal from 'react-modal';
import Words from '../component/Words';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchStudyReviews } from '../api/fetchStudyReviews';
import { startLearning } from '../api/learning';
import { useAuthStore } from '../store/useAuthStore';
import { useSessionStore } from '../store/useSessionStore';
import { useNavigate } from 'react-router-dom';

const Practice = () => {
  const navigate = useNavigate();
  const [selectedWords, setSelectedWords] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });
const [openIds, setOpenIds] = useState(new Set());
  const rowToken = useAuthStore((s) => s.token);
  const token =
    typeof rowToken === 'string'
      ? rowToken
      : rowToken?.access_token || rowToken?.jwt || rowToken?.token || '';
  console.log('토큰:', token);

  const setSessionId = useSessionStore((s) => s.setSessionId);

  // 단어 목록 조회
  const { data: reviews = [] } = useQuery({
    queryKey: ['studyReviews', !!token], // 토큰 존재에 따라 캐시 분기
    // fetchStudyReviews가 (token)만 받는다면 아래 한 줄로 바꾸세요:
    // queryFn: ({ signal }) => fetchStudyReviews(token, signal),
    queryFn: () => fetchStudyReviews(token), // 권장: 객체 파라미터
    enabled: !!token,
    onError: (err) => {
      console.error('단어 목록 가져오기 실패:', err);
      setModalContent({
        title: '오류 발생',
        message: '단어 목록을 가져오는 중 오류가 발생했습니다.',
      });
      setModalIsOpen(true);
    },
  });
 const wordList = useMemo(() => reviews.map((r) => r.target_word), [reviews]);


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
    setSelectedWords((prev) => {
      if (prev.includes(word)) {
        return prev.filter((w) => w !== word);
      }
      if (prev.length >= 10) {
        setModalContent({ title: '선택 제한', message: '최대 10개까지만 선택할 수 있어요!' });
        setModalIsOpen(true);
        return prev;
      }
      return [...prev, word];
    });
  };


 // 행(리뷰) 펼침/접힘 토글
  const toggleOpen = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };




  const closeModal = () => setModalIsOpen(false);

  // 학습 시작 버튼 클릭 시
  const handleStartLearning = () => {
    if (selectedWords.length === 0) return;
    startLearningMutate({
      mode: "practice",
      total_words: selectedWords.length,

    });

    navigate("/review", {
      state: {
        selectedWords: selectedWords.map((w) => ({ word: w }))
      },
    });
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-cus py-6">
      <h2 className="text-white text-3xl font-semibold mt-8 mb-6 ml-[10%] self-start">
        학습할 단어를 선택 후 학습을 시작해주세요
      </h2>

      <MainButton
        className={`w-[80%] py-2 rounded-2xl font-semibold text-white ${selectedWords.length > 0 ? 'bg-blue-400' : 'bg-gray-600 cursor-not-allowed'
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
        {reviews.map((item) => {
          const isSelected = selectedWords.includes(item.target_word);
          const isOpen = openIds.has(item.review_id);
          return (
            <div key={item.review_id} className="py-2">
              {/* 클릭 영역: 행 */}
              <div
                onClick={() => toggleOpen(item.review_id)}
                className={`flex justify-between items-center px-4 py-2 cursor-pointer transition-all duration-150 rounded-md ${
                  isSelected ? 'bg-sky-200 text-black' : 'bg-transparent text-white'
                }`}
              >
                <span className="font-medium text-lg">{item.target_word}</span>

                {/* 체크박스 (클릭 전파 방지) */}
                <input
                  type="checkbox"
                  checked={isSelected}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => toggleSelect(item.target_word)}
                  className="w-5 h-5 bg-white checked:bg-customMidGray accent-custom_blue cursor-pointer"
                />
              </div>

              {/* 접히는 상세 영역 */}
              {isOpen && (
                <div className="mx-4 mt-2 mb-3 rounded-md bg-black/20 text-white p-3 text-sm"> 
                  <div className="grid grid-cols-1 gap-y-1">
                    <p><span className="font-semibold">target_word:</span> {item.target_word}</p>
                    <p className='block'><span className="font-semibold ">recognized_word:</span> {item.recognized_word || '없음'}</p>
                    <p><span className="font-semibold">score:</span> {item.score}</p>
                    <p className="md:col-span-2">
                      <span className="font-semibold">feedback_summary:</span>{' '}
                      {item.feedback_summary || '피드백 없음'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>



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
