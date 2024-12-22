import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

export default function VideoFeed() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const streamInfo = JSON.parse(localStorage.getItem('streamInfo') || '{}');
    const { streamKey } = streamInfo;

    if (streamKey && videoRef.current) {
      const hls = new Hls();
      const playbackUrl = `http://localhost:8000/live/${streamKey}/index.m3u8`;

      hls.loadSource(playbackUrl);
      hls.attachMedia(videoRef.current);
    }
  }, []);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        controls
        autoPlay
      />
    </div>
  );
}
