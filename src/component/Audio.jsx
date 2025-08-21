import React, { forwardRef, useState, useRef, useEffect, useImperativeHandle } from "react";
import axios from "axios";
import Camera from "./Camera";
import MainButton from "./MainButton";
import { useSessionStore } from "../store/useSessionStore";


// forwardRef를 사용하여 ref를 받을 수 있도록 수정
const Audio = forwardRef(({

  target,
  onResult,
  onRecorded,
  disabled,
  reset,
  onRecordingChange,
  camerareset,
  onMouthVideoReady,
  isReview

}, ref) => {



  const sessionId = useSessionStore((s) => s.session_id);


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
    let cameraStream = null;

    if (cameraRef.current) {
      cameraStream = await cameraRef.current.startCamera();
      if (cameraStream) {
        cameraRef.current.startRecording();
      } else {
        console.warn("📷 카메라 stream을 받아오지 못했습니다.");
        return;
      }
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
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

      if (cameraRef.current) {
        cameraRef.current.stopRecording();
        cameraRef.current.stopStream();
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

  // useImperativeHandle을 사용하여 상위 컴포넌트에서 호출할 함수를 정의
  useImperativeHandle(ref, () => ({
    toggleRecording,
    startRecording,
    stopRecording,
  }));

  const sendToServer = async (audioBlob) => {
    const formData = new FormData();
    formData.append("audio_file", audioBlob, "recording.webm");
    formData.append("target_sentence", target);
    {isReview &&

    formData.append("isReview", true);

    }


  
    if (sessionId) {
      formData.append("session_id", sessionId);
    } else {
      console.warn("세션 ID가 없습니다. 새로고침 시 세션 복구 로직을 확인하세요.");
    }

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
    <div className="flex flex-col items-center gap-3">
      <MainButton
        onClick={toggleRecording}
        disabled={disabled || !!audioURL}
        className="w-40 h-10 text-lg font-bold rounded  max-w-[20rem]"
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
});

export default Audio;