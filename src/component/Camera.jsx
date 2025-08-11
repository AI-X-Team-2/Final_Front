import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
  useEffect,
} from "react";


const Camera = forwardRef(({ onRecorded, reset,  onUploadComplete }, ref) => {
  const videoRef = useRef(null); // 실시간 웹캠
  const mediaRecorderRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [recordedVideoURL, setRecordedVideoURL] = useState(null);
  const recordedChunksRef = useRef([]);

    useEffect(() => {
    setRecordedVideoURL(null);
  }, [reset]);

  // ▶ 카메라 시작
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }

    return stream;
  };

    // 서버로 영상 업로드 함수
  const uploadVideoToServer = async (videoBlob) => {
    try {
      const formData = new FormData();
      formData.append("video_file", videoBlob, "recording.webm");

      // axios 사용 예시 (import axios from 'axios' 필요)
      const response = await axios.post("http://127.0.0.1:8000/upload_video", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("영상 업로드 성공", response.data);
         if (onUploadComplete) {
        onUploadComplete(response.data); // 예: { videoUrl: "서버영상경로" }
      }
    } catch (error) {
      console.error("영상 업로드 실패", error);
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

    mediaRecorder.onstop =  async() => {
      const videoBlob = new Blob(recordedChunksRef.current, {
        type: "video/webm",
      });
       console.log(videoBlob)
      const videoUrl = URL.createObjectURL(videoBlob);
      setRecordedVideoURL(videoBlob)

      if (onRecorded) {
        onRecorded(videoUrl);
       
      }

      await uploadVideoToServer(videoBlob);

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

  useImperativeHandle(ref, () => ({
    startCamera,
    startRecording,
    stopRecording,
  }));

  console.log(recordedVideoURL)

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