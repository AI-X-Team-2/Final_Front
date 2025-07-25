import React from "react";
import { useState } from "react";
import { useRef } from "react";

const Camera = ({onRecorded}) => {
  const videoRef = useRef(null); // 실시간 웹캠
  const mediaRecorderRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [recordedVideoURL, setRecordedVideoURL] = useState(null);
  const recordedChunksRef = useRef([]);

  // ▶ 카메라 시작
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  };

  // 🔴 녹화 시작
  const startRecording = () => {
    recordedChunksRef.current = [];
    const stream = videoRef.current.srcObject;
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const videoBlob = new Blob(recordedChunksRef.current, {
        type: "video/webm",
      });
      const videoUrl = URL.createObjectURL(videoBlob);
      setRecordedVideoURL(videoUrl); // 화면에 보여줄 URL
       if (onRecorded) {
        onRecorded(videoUrl);
      }

    };

    
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setRecording(true);
  };

  // ⏹ 녹화 중지
  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  return (
    <div className="flex flex-col gap-4">
    

      <div className="flex gap-2">
        <button
          onClick={startCamera}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          카메라 켜기
        </button>
        {!recording && (
          <button
            onClick={startRecording}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            녹화 시작
          </button>
        )}
        {recording && (
          <button
            onClick={stopRecording}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            녹화 중지
          </button>
        )}
      </div>

      {recordedVideoURL && (
        <div className="mt-4">
          <h3 className="text-lg font-bold">당신의 입모양</h3>
          <video
            src={recordedVideoURL}
            controls
            className="border rounded w-[20rem] max-w-full h-auto mt-2"
          />
        </div>
      )}
    </div>
  );
};

export default Camera;
