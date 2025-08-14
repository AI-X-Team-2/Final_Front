// SmoothVideo.jsx
import React, { useState, useRef, useEffect } from "react";

export default function SmoothVideo({
  src,
  className = "",
  poster,
  controls = true,
}) {
  const [ready, setReady] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    setReady(false);
  }, [src]);

  return (
    <div className={`w-full ${className}`}>
      {/* 스켈레톤 */}
      <div
        className={`w-full h-full rounded shadow
                    bg-white/10 animate-pulse
                    ${ready ? "opacity-0" : "opacity-100"}
                    transition-opacity duration-300`}
        aria-hidden
      />

      {/* 비디오 */}
      <video
        ref={videoRef}
        src={src || ""}
        poster={poster}
        controls={controls}
        preload="metadata"
        playsInline
        className={`mb-36 w-full h-auto rounded shadow aspect-video
                    transition-opacity duration-300
                    ${ready ? "opacity-100" : "opacity-0"}`}
        onLoadedData={() => setReady(true)}
        onCanPlay={() => setReady(true)}
      />
    </div>
  );
}
