import React, { useState, useRef } from 'react';
import axios from 'axios';
import { MicrophoneIcon, StopCircleIcon, Bars3Icon } from '@heroicons/react/24/solid';
import FeedbackCard from '../component/FeedbackCard';
import LoadingSpinner from '../component/LodadingSpinner';

// ... HistoryItem 컴포넌트 ...
const HistoryItem = ({ item, onClick }) => {
    return (
        <div
            className="bg-customBarGray p-3 rounded-lg mb-3 shadow-md cursor-pointer hover:bg-gray-700 transition-colors"
            onClick={() => onClick(item.id)}
        >
            <p className="text-lg text-white font-bold truncate">"{item.userInput}"</p>
            {item.type === 'word' && (
                <div className="flex justify-between items-baseline mt-2">
                    <p className="text-sm text-gray-300">인식된 발음: "{item.my_text || '-'}"</p>
                    <p className="text-xl font-bold text-white">
                        {item.score}점
                    </p>
                </div>
            )}
            {item.type === 'sentence' && item.sentence_feedback?.evaluation && (
                 <p className="text-sm text-gray-300 mt-2 truncate">
                    {item.sentence_feedback.evaluation}
                 </p>
            )}
        </div>
    );
};


const ChatPractice = () => {
    const [text, setText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [error, setError] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    // ... 함수들 ...
    const archiveCurrentFeedback = () => {
        if (feedback) {
            const isAlreadyArchived = chatHistory.some(item => item.id === feedback.id);
            if (!isAlreadyArchived) {
                setChatHistory(prev => [{ ...feedback, id: Date.now() }, ...prev]);
            }
            setFeedback(null);
        }
    };
    const handleHistoryClick = (historyId) => {
        const selectedFeedback = chatHistory.find(item => item.id === historyId);
        if (selectedFeedback) {
            if (feedback && !chatHistory.some(item => item.id === feedback.id)) {
                archiveCurrentFeedback();
            }
            setFeedback(selectedFeedback);
        }
    };
    const handleStartRecording = async () => {
        if (!text.trim()) {
            alert('먼저 연습할 단어나 문장을 입력하세요.');
            return;
        }
        if (feedback) {
            archiveCurrentFeedback();
        }
        setError('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                await handleAnalysis(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };
            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error('마이크 접근 오류:', err);
            setError('마이크에 접근할 수 없습니다. 권한을 확인해주세요.');
        }
    };
    const handleStopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };
    const handleAnalysis = async (audioBlob) => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('audio_file', audioBlob, 'recording.webm');
        formData.append('target_sentence', text);
        const isSentence = text.length >= 6 || text.includes(' ');
        const endpoint = isSentence ? '/analyze_sentence' : '/analyze';
        try {
            const response = await axios.post(`${endpoint}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setFeedback({ ...response.data, type: isSentence ? 'sentence' : 'word', userInput: text });
            setText('');
        } catch (err) {
            console.error('분석 API 오류:', err);
            setError('음성을 분석하는 중 오류가 발생했습니다.');
            setFeedback(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full h-screen bg-customGray overflow-hidden relative">
            <style>
                {`
                    .hide-scrollbar::-webkit-scrollbar { display: none; }
                    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `}
            </style>

            <div className="flex w-full h-full">
                {/* 왼쪽: 학습 내역 패널 */}
                <aside className={`flex-shrink-0 h-full transition-all duration-300 ease-in-out ${isHistoryVisible ? 'w-1/3' : 'w-0'} overflow-hidden`}>
                    <div className="w-[33.33vw] h-full flex flex-col bg-customGray border-r border-gray-700">
                        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-700">
                            <h2 className="text-xl text-white font-bold whitespace-nowrap">학습 내역</h2>
                        </div>
                        {/* ===== 여기가 수정된 부분입니다 ===== */}
                        <div className="h-[65vh] overflow-y-auto p-4 space-y-2 hide-scrollbar">
                            {chatHistory.length > 0 ? (
                                chatHistory.map(item => <HistoryItem key={item.id} item={item} onClick={handleHistoryClick} />)
                            ) : (
                                <div className=" text-gray-500 pt-10">
                                    <p>아직 학습 내역이 없습니다.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

                {/* 오른쪽: 메인 학습 공간 */}
                <main className="flex-grow h-full flex flex-col relative">
                    <button
                        onClick={() => setIsHistoryVisible(!isHistoryVisible)}
                        className="absolute top-4 left-4 text-white z-20 p-2 rounded-md hover:bg-gray-700 transition-colors"
                    >
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                    <div className="flex-grow flex items-center justify-center pb-24">
                        {isLoading && <LoadingSpinner />}
                        {feedback && !isLoading && (
                            <FeedbackCard
                                feedbackData={feedback}
                                onClose={archiveCurrentFeedback}
                            />
                        )}
                    </div>
                </main>
            </div>
            
            <div className="absolute bottom-20 left-0 right-0 w-full p-4 z-20">
                <div className="flex items-center w-full max-w-2xl mx-auto">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="연습할 단어나 문장을 입력하세요..."
                        className="flex-grow p-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-custom_blue text-black"
                        disabled={isRecording}
                    />
                    <button
                        onClick={isRecording ? handleStopRecording : handleStartRecording}
                        className={`p-3 text-white rounded-r-lg transition-colors ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-custom_blue hover:bg-blue-700'}`}
                    >
                        {isRecording ? <StopCircleIcon className="w-6 h-6" /> : <MicrophoneIcon className="w-6 h-6" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatPractice;