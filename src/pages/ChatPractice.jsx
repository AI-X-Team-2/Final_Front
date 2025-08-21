import React, { useState, useRef } from 'react';
import axios from 'axios';
import { MicrophoneIcon, StopCircleIcon } from '@heroicons/react/24/solid';
import FeedbackCard from '../component/FeedbackCard';
import LoadingSpinner from '../component/LodadingSpinner';

const ChatPractice = () => {
    const [text, setText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [error, setError] = useState('');
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const handleStartRecording = async () => {
        if (!text.trim()) {
            alert('먼저 연습할 단어나 문장을 입력하세요.');
            return;
        }
        setError('');
        setFeedback(null);
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
            const response = await axios.post(`http://127.0.0.1:8000${endpoint}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setFeedback({ ...response.data, type: isSentence ? 'sentence' : 'word', userInput: text });
        } catch (err) {
            console.error('분석 API 오류:', err);
            setError('음성을 분석하는 중 오류가 발생했습니다.');
            setFeedback(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center w-full h-screen bg-customGray overflow-hidden p-4">
            {/* 피드백 카드 */}
            {feedback && !isLoading && (
                <FeedbackCard 
                    feedbackData={feedback} 
                    onClose={() => setFeedback(null)} 
                />
            )}
            
            {/* 로딩 스피너 */}
            {isLoading && <LoadingSpinner />}

            {/* 하단 채팅 입력창 및 녹음 버튼 */}
            <div className="fixed bottom-[90px] left-0 right-0 w-full p-4">
                <div className="flex items-center w-full max-w-2xl mx-auto">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="연습할 단어나 문장을 입력하세요..."
                        className="flex-grow p-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-custom_blue"
                        disabled={isRecording}
                    />
                    <button
                        onClick={isRecording ? handleStopRecording : handleStartRecording}
                        className={`p-3 text-white rounded-r-lg ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-custom_blue hover:bg-blue-700'}`}
                    >
                        {isRecording ? <StopCircleIcon className="w-6 h-6" /> : <MicrophoneIcon className="w-6 h-6" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatPractice;