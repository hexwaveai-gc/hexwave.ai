"use client";

import { useRef, useEffect, useState } from "react";
import { AUTH_VIDEOS } from "./constants";

interface AuthVideoPlayerProps {
  isActive?: boolean;
}

export function AuthVideoPlayer({ isActive = true }: AuthVideoPlayerProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoEnd = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % AUTH_VIDEOS.length);
  };

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !isActive) return;

    const playVideo = async () => {
      try {
        videoElement.load();
        await videoElement.play();
      } catch (err) {
        console.error("Error playing video:", err);
      }
    };

    playVideo();
  }, [currentVideoIndex, isActive]);

  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black">
      <video
        ref={videoRef}
        key={currentVideoIndex}
        className="absolute inset-0 w-full h-full object-cover"
        poster={AUTH_VIDEOS[currentVideoIndex].poster}
        autoPlay
        muted
        playsInline
        loop={false}
        onEnded={handleVideoEnd}
      >
        <source src={AUTH_VIDEOS[currentVideoIndex].url} type="video/mp4" />
      </video>
    </div>
  );
}


