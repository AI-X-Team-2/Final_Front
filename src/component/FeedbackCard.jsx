import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

const WordFeedback = ({ data }) => (
    <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-center">
            <div>
                <p className="text-sm text-gray-400">내 발음</p>
                <p className="text-lg font-bold text-white">{data.my_text || '-'}</p>
            </div>
            <div>
                <p className="text-sm text-gray-400">종합 점수</p>
                <p className="text-lg font-bold text-white">{data.score}점</p>
            </div>
        </div>
        {data.incorrect_points && data.incorrect_points.length > 0 && (
            <div>
                <h4 className="font-bold text-white mt-4 mb-2">상세 피드백</h4>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 scrollbar-hide">
                    {data.incorrect_points.map((point, index) => (
                        <div key={index} className="p-3 bg-black bg-opacity-20 rounded-lg text-left text-sm">
                            <p className="font-bold">
                                <span className="text-white">"{point.actual}"</span> → <span className="text-white">"{point.expected}"</span>
                            </p>
                            <p className="text-xs text-gray-300 mt-1 mb-2">{point.teaching_point}</p>
                            <div className="text-xs space-y-1 border-t border-white/10 pt-2">
                                <p><strong>입모양:</strong> {point.mouth_feedback}</p>
                                <p><strong>혀 위치:</strong> {point.tongue_position_feedback}</p>
                                <p><strong>호흡법:</strong> {point.breathing_feedback}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
);

const SentenceFeedback = ({ data }) => (
    <div className="space-y-4 text-left">
        <div>
            <h4 className="font-bold text-white mb-1">종합 평가</h4>
            <p className="text-sm text-white">{data.evaluation}</p>
        </div>
        <div>
            <h4 className="font-bold text-white mb-1">발음 교정</h4>
            <p className="text-sm text-white">{data.correction}</p>
        </div>
        <div>
            <h4 className="font-bold text-white mb-1">총평 및 조언</h4>
            <p className="text-sm text-white">{data.general_feedback}</p>
        </div>
    </div>
);

const FeedbackCard = ({ feedbackData, onClose }) => {
    const isSentence = feedbackData.type === 'sentence';
    const data = isSentence ? feedbackData.sentence_feedback : feedbackData;

    return (
        <div className="relative w-full max-w-md p-6 mx-4 bg-customFeedBack rounded-2xl shadow-lg text-white">
            <button onClick={onClose} className="absolute top-3 right-3 text-white hover:text-gray-300">
                <XMarkIcon className="w-6 h-6" />
            </button>
            
            {/* ===== 1. 이 부분 수정 ===== */}
            <div className="mb-4 text-center space-y-2">
                <div>
                    <p className="text-sm text-gray-300">입력한 내용</p>
                    <p className="text-xl font-bold">"{feedbackData.userInput}"</p>
                </div>
                {/* 2. 문장일 때만 "사용자 발음" 표시 */}
                {isSentence && (
                     <div>
                        <p className="text-sm text-gray-300">사용자 발음</p>
                        <p className="text-lg font-bold text-gray-100">"{feedbackData.my_text || '-'}"</p>
                    </div>
                )}
            </div>

            <hr className="border-white/20 my-3" />

            {isSentence ? <SentenceFeedback data={data} /> : <WordFeedback data={data} />}
        </div>
    );
};

export default FeedbackCard;