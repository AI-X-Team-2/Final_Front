import React, {
    forwardRef,
    useImperativeHandle,
    useState,
    useRef,
    useEffect,
} from "react";
import axios from "axios";

const Camera = forwardRef(({ onRecorded, reset, onUploadComplete }, ref) => {
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    // const [recording, setRecording] = useState(false); // 이 상태는 Audio.js에서 관리하므로 필요 없음
    const [recordedVideoURL, setRecordedVideoURL] = useState(null);
    const recordedChunksRef = useRef([]);
    const streamRef = useRef(null); // 스트림을 저장할 ref 추가

    useEffect(() => {
        setRecordedVideoURL(null);
    }, [reset]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            return stream;
        } catch (err) {
            console.warn("📷 카메라 접근 불가:", err.message);
            return null; // 카메라가 없어도 실행 계속 가능
        }
    };

    // 스트림을 완전히 종료하는 함수 추가
    const stopStream = () => {
        if (streamRef.current) {
            // 모든 비디오/오디오 트랙을 중지시켜 카메라 하드웨어를 해제합니다.
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
            // 비디오 요소의 소스를 비워 화면을 검게 만듭니다.
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        }
    };

    const uploadVideoToServer = async (videoBlob) => {
        console.log("서버로 영상 업로드 시작...");
        try {
            const formData = new FormData();
            formData.append("video_file", videoBlob, "recording.webm");

            const response = await axios.post(
                "http://127.0.0.1:8000/upload_video",
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    responseType: "blob",
                }
            );

            console.log("영상 업로드 성공", response.data);
            const mouthVideoUrl = URL.createObjectURL(response.data);
            if (onUploadComplete) {
                onUploadComplete(mouthVideoUrl);
            }
        } catch (error) {
            console.error("영상 업로드 실패", error);
        }
    };

    const startRecording = () => {
        recordedChunksRef.current = [];
        const stream = videoRef.current.srcObject;
        const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunksRef.current.push(event.data);
            }
        };

        mediaRecorder.onstop = async () => {
            const videoBlob = new Blob(recordedChunksRef.current, {
                type: "video/webm",
            });
            const videoUrl = URL.createObjectURL(videoBlob);
            // setRecordedVideoURL(videoBlob) // 이 부분은 원본 영상을 보여줄 때 필요하지만 현재는 사용하지 않음

            if (onRecorded) {
                onRecorded(videoUrl);
            }

            await uploadVideoToServer(videoBlob);
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }
    };

    useImperativeHandle(ref, () => ({
        startCamera,
        startRecording,
        stopRecording,
        stopStream,
    }));

    return (
        <div className="flex flex-col gap-4 items-center">
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`w-96 ${recordedVideoURL ? "hidden" : ""}`}
            />
        </div>
    );
});

export default Camera;
