// src/pages/Practice.jsx
import React, { useState, useEffect } from 'react';
import MainButton from './MainButton';
import Modal from 'react-modal';

const WRONG_WORDS = [
    "바다", "나비", "라면", "바나나", "다리미",
    "자연", "자격", "조각", "고기", "자전거", "자격증"
];

const Practice = () => {
    const [wordList, setWordList] = useState([]);
    const [selectedWords, setSelectedWords] = useState([]);

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalContent, setModalContent] = useState({
        title: '',
        message: '',
    });

    useEffect(() => {
        setWordList(WRONG_WORDS);
    }, []);

    const toggleSelect = (word) => {
        if (selectedWords.includes(word)) {
            setSelectedWords(selectedWords.filter((w) => w !== word));
        } else {
            if (selectedWords.length >= 10) {
                setModalContent({
                    title: '선택 제한',
                    message: '최대 10개까지만 선택할 수 있어요!',
                });
                setModalIsOpen(true);
            } else {
                setSelectedWords([...selectedWords, word]);
            }
        }
    };

    
  const closeModal = () => {
    setModalIsOpen(false);
  };

    return (
        <div className="flex flex-col items-center min-h-screen bg-cus py-6">
            {/* 안내 문구 */}
            <h2 className="text-white text-3xl font-semibold mt-8 mb-6 ml-[10%] self-start">
                학습할 단어를 선택 후 학습을 시작해주세요
            </h2>

            {/* 학습 시작 버튼 */}

            <MainButton
                className={`w-[80%] py-2 rounded-2xl font-semibold text-white ${selectedWords.length > 0
                    ? 'bg-blue-400'
                    : 'bg-gray-600 cursor-not-allowed'
                    }`}
                disabled={selectedWords.length === 0}
                label={"학습시작"}
            />


            {/* 구분선 */}
            <hr className="w-[80%] border-t border-customMidGray my-4" />

            {/* 통계 */}
            <div className="text-white w-[80%] text-left text-base">
                <p className="mb-1 text-lg font-bold">틀린 문제 {wordList.length}개</p>
                <p className="text-base">선택된 단어 {selectedWords.length}개</p>
            </div>

            {/* 단어 리스트 (공책형태 박스) */}
            <div className="bg-customFeedBack rounded-2xl w-[80%] px-4 py-3 mt-4 divide-y divide-customLightGray">
                {wordList.map((word, index) => {
                    const isSelected = selectedWords.includes(word);
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
                                className="w-5 h-5 bg-white checked:bg-customMidGray accent-custom_blue cursor-pointer" />
                        </div>
                    );
                })}
            </div>

            {/* 알림창 */}
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