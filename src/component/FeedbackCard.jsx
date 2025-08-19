import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

// 단어 피드백을 표시하는 컴포넌트
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
                {/* === 상세 피드백 표시 로직 수정 === */}
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
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


// 문장 피드백을 표시하는 컴포넌트
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

// 메인 피드백 카드
const FeedbackCard = ({ feedbackData, onClose }) => {
    const isSentence = feedbackData.type === 'sentence';
    const data = isSentence ? feedbackData.sentence_feedback : feedbackData;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="relative w-full max-w-md p-6 mx-4 bg-custom-blue-gradient rounded-2xl shadow-lg text-white">
                <button onClick={onClose} className="absolute top-3 right-3 text-white hover:text-gray-300">
                    <XMarkIcon className="w-6 h-6" />
                </button>
                
                <div className="mb-4 text-center">
                    <p className="text-sm text-gray-300">입력한 내용</p>
                    <p className="text-xl font-bold">"{feedbackData.userInput}"</p>
                </div>

                <hr className="border-white/20 my-3" />

                {isSentence ? <SentenceFeedback data={data} /> : <WordFeedback data={data} />}
            </div>
        </div>
    );
};

export default FeedbackCard;