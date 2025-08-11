import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Camera from "./Camera";
import MainButton from "./MainButton";

const Audio = ({ target, onResult, onRecorded, disabled, reset, onRecordingChange, camerareset, onUploadComplete }) => {
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

  
 // 마운트 시 또는 target 바뀔 때 카메라 미리 켜기
  useEffect(() => {
    async function initCamera() {
      if (cameraRef.current) {
        try {
          await cameraRef.current.startCamera();
        } catch (e) {
          console.warn("카메라 초기화 실패", e);
        }
      }
    }
    initCamera();
  }, [target]);

  const startRecording = async () => {
   if (onRecordingChange) onRecordingChange(true);

    if (cameraRef.current) {
      // 카메라가 이미 켜져 있으니 녹화만 시작
      cameraRef.current.startRecording();
    } else {
      console.warn("카메라 레퍼런스 없음");
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
    const formData = new FormData();
    formData.append("audio_file", audioBlob, "recording.webm");
    formData.append("target_sentence", target);

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
        onResult(response.data)
      }

    } catch (error) {
      console.error("전송 실패:", error);
    }
  };

  
  const handleUploadComplete = (serverResponse) => {
    if (onUploadComplete) onUploadComplete(serverResponse);
  };


  return (
    <div className="flex flex-col gap-3">
      <MainButton
        onClick={toggleRecording}
        disabled={disabled || (!!audioURL && !isRecording)}
        className="w-40 h-10 text-lg font-bold rounded"
        label={isRecording ? "녹음 중단" : "녹음 시작"}
      />
      <Camera ref={cameraRef} onRecorded={onRecorded} reset={camerareset} onUploadComplete={handleUploadComplete}/>




    </div>
  );
};

export default Audio;