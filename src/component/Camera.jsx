import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
} from "react";

const Camera = forwardRef(({ onRecorded }, ref) => {
  const videoRef = useRef(null); // 실시간 웹캠
  const mediaRecorderRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [recordedVideoURL, setRecordedVideoURL] = useState(null);
  const recordedChunksRef = useRef([]);

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
       console.log(videoBlob)
      const videoUrl = URL.createObjectURL(videoBlob);
      setRecordedVideoURL(videoBlob)

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

  useImperativeHandle(ref, () => ({
    startCamera,
    startRecording,
    stopRecording,
  }));

  return (
    <div className="flex flex-col gap-4">
     
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={recordedVideoURL ? "hidden" : ""}
      />

     
    </div>
  );
});

export default Camera;
