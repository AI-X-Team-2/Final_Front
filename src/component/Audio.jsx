import React, { useState, useRef } from "react";
import axios from "axios";
import Camera from "./Camera";

const Audio = ({ target, onResult}) => {
  const mediaRecorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const audioChunksRef = useRef([]);
  const [audioURL, setAudioURL] = useState(null);
  

  const startRecording = async () => {
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

      if (!audioBlob && !target) {
        console.log("❗ audioBlob과 target 모두 준비되지 않았습니다.");
      } else if (!audioBlob) {
        console.log("❗ audioBlob이 준비되지 않았습니다.");
      } else if (!target) {
        console.log("❗ target이 준비되지 않았습니다.");
      } else {
        await sendToServer(audioBlob, target);
      }
    };

    mediaRecorder.start();
    setIsRecording(true);

    // 5초 후 자동 정지
    setTimeout(() => stopRecording(), 5000);
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
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
    
      if(onResult){
        onResult(response.data)
      }
      
    } catch (error) {
      console.error("전송 실패:", error);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={startRecording}
        disabled={isRecording}
        className="w-40 h-10 bg-blue-500 text-white text-lg font-bold rounded"
      >
        {isRecording ? "녹음 중..." : "녹음 시작"}
      </button>

     

      
    </div>
  );
};

export default Audio;
