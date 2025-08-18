import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Camera from "./Camera";
import MainButton from "./MainButton";
import { useSessionStore } from "../store/useSessionStore";

const Audio = ({
    target,
    onResult,
    onRecorded,
    disabled,
    reset,
    onRecordingChange,
    camerareset,
    onMouthVideoReady,
}) => {

    const session_id = useSessionStore((s) => s.session_id);
    const mediaRecorderRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const audioChunksRef = useRef([]);
    const [audioURL, setAudioURL] = useState(null);
    const cameraRef = useRef(null);

    useEffect(() => {
        if (reset) {
            setAudioURL(null);
        }
    }, [reset]);

    const startRecording = async () => {
        if (onRecordingChange) onRecordingChange(true);

        // ✅ 카메라 정지 (있을 때만)
        if (cameraRef.current) {
            try {
                cameraRef.current.stopRecording();
                cameraRef.current.stopStream();
            } catch (err) {
                console.warn("카메라 정지 불가:", err.message);
            }
        }

        // 🎤 마이크 스트림 가져오기
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);

        // ✅ 이제 참조 연결
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
            }
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
            const audioUrl = URL.createObjectURL(audioBlob);
            setAudioURL(audioUrl);

            if (!audioBlob || !target) {
                console.warn("❗ audioBlob 또는 target 없음");
            } else {
                await sendToServer(audioBlob, target);
            }
        };

        mediaRecorder.start();
        setIsRecording(true);
    };

    const stopRecording = () => {
        if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state !== "inactive"
        ) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (onRecordingChange) onRecordingChange(false);

            // ✅ 카메라 없는 환경에서도 안전하게 동작하도록 수정
            if (cameraRef.current) {
                try {
                    cameraRef.current.stopRecording();
                    cameraRef.current.stopStream();
                } catch (err) {
                    console.warn("카메라 정지 불가:", err.message);
                }
            }
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const sendToServer = async (audioBlob) => {

        if (!session_id) {
            console.warn("세션 아이디 없음");
            return;
        }


        const formData = new FormData();
        formData.append("audio_file", audioBlob, "recording.webm");
        formData.append("target_sentence", target);
        formData.append("session_id", session_id);


        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/analyze",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            console.log("요청 성공");
            console.log("응답받은 데이터", response.data);

            if (onResult) {
                onResult(response.data);
            }
        } catch (error) {
            console.error("전송 실패:", error);
        }
    };

    return (
        <div className="flex flex-col gap-3 justify-center" >
            <MainButton
                onClick={toggleRecording}
                disabled={disabled || !!audioURL}
                className="w-full max-w-[20rem] text-lg font-bold rounded mx-auto"
                label={isRecording ? "녹음 중지" : "녹음 시작"}
            />

            <Camera
                ref={cameraRef}
                onRecorded={onRecorded}
                reset={camerareset}
                onUploadComplete={onMouthVideoReady}
            />
        </div>
    );
};

export default Audio;
