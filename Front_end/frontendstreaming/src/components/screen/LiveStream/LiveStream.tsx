import { useState, useEffect, useRef } from 'react';
import { Mic, Camera, MonitorUp, PictureInPicture, Users, MoreVertical, Phone, Volume2, Settings, Maximize2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import Hls from 'hls.js';
import { streamService } from '@/services/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"


// VideoFeed Component
function VideoFeed() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { streamKey } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(true);

  const handleUserInteraction = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setNeedsInteraction(false);
        })
        .catch(error => {
          console.error("Playback error:", error);
        });
    }
  };

  useEffect(() => {
    if (videoRef.current && streamKey) {
      const video = videoRef.current;
      let retryCount = 0;
      const maxRetries = 10;

      const initializeHLS = () => {
        if (Hls.isSupported()) {
          const hls = new Hls({
            debug: true,
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 30,
            maxBufferSize: 0,
            maxBufferLength: 10,
            liveSyncDurationCount: 3,
            liveMaxLatencyDurationCount: 10,
            manifestLoadingTimeOut: 20000,
            manifestLoadingMaxRetry: 6,
            manifestLoadingRetryDelay: 2000,
            levelLoadingTimeOut: 20000,
            fragLoadingTimeOut: 20000,
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS Error:', data.type, data.details, data);
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.log('Network error, attempting recovery...');
                  if (retryCount < maxRetries) {
                    console.log(`Retry ${retryCount + 1}/${maxRetries}`);
                    retryCount++;
                    setTimeout(() => {
                      hls.startLoad();
                    }, 2000);
                  }
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.log('Media error, attempting recovery...');
                  hls.recoverMediaError();
                  break;
                default:
                  if (retryCount < maxRetries) {
                    console.log(`Fatal error, retry ${retryCount + 1}/${maxRetries}`);
                    retryCount++;
                    initializeHLS();
                  } else {
                    console.error('Cannot recover from error');
                    hls.destroy();
                  }
                  break;
              }
            }
          });

          const hlsUrl = `http://localhost:8080/live/${streamKey}.m3u8`;
          console.log('Loading HLS source:', hlsUrl);

          hls.loadSource(hlsUrl);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('Manifest parsed, attempting playback');
            video.muted = true;
            video.play()
              .then(() => {
                setIsPlaying(true);
              })
              .catch(error => {
                console.error("Playback error:", error);
              });
          });

          return () => {
            hls.destroy();
          };
        }
      };

      initializeHLS();
    }
  }, [streamKey]);

  // Handle video errors
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video error:', e);
  };

  return (
    <div className="relative w-full h-full bg-black">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        muted
        onError={handleVideoError}
      />
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white">Loading stream...</div>
        </div>
      )}

      {needsInteraction && isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer"
          onClick={handleUserInteraction}
        >
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg text-white text-center">
            <h3 className="text-xl mb-2">Click để bật âm thanh</h3>
            <p className="text-sm">Stream đang được phát không có âm thanh</p>
          </div>
        </div>
      )}
    </div>
  );
}

// BottomControls Component
function BottomControls({ onEndStream }: { onEndStream: () => void }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-16 bg-black/50 backdrop-blur-sm flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        {[Mic, Camera].map((Icon, idx) => (
          <button key={idx} className="p-2 rounded-full hover:bg-gray-700 text-white">
            <Icon className="w-5 h-5" />
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 rounded-full hover:bg-gray-700 text-white">
          <MonitorUp className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-700 text-white">
          <PictureInPicture className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-700 text-white">
          <Users className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-700 text-white">
          <MoreVertical className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white" onClick={onEndStream}>
          <Phone className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// Main LiveStream Component
export default function LiveStream() {
  const { streamKey } = useParams();
  const navigate = useNavigate();
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Kiểm tra trạng thái recording khi component mount
  useEffect(() => {
    const streamInfo = localStorage.getItem('streamInfo');
    if (streamInfo) {
      const { isRecording } = JSON.parse(streamInfo);
      setIsRecording(isRecording);
    }
  }, []);

  const handleEndStream = async () => {
    try {
      await streamService.endStream(streamKey!);

      if (isRecording) {
        setShowEndDialog(true);
      } else {
        navigate('/create');
      }
    } catch (error) {
      console.error('Error ending stream:', error);
    }
  };

  return (
    <div className="h-screen flex bg-black">
      <div className="flex-1 relative flex flex-col overflow-hidden">
        <div className="flex-1 relative max-h-[calc(100%-4rem)]">
          <VideoFeed />
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button className="p-2 text-white hover:bg-white/20 rounded-full">
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-white hover:bg-white/20 rounded-full">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 text-white hover:bg-white/20 rounded-full">
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="h-16 relative">
          <BottomControls onEndStream={handleEndStream} />
        </div>

        {/* End Stream Dialog */}
        <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
          <DialogContent className="sm:max-w-[425px] bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Stream đã kết thúc</DialogTitle>
              <DialogDescription className="text-gray-500">
                Video của buổi stream đã được lưu lại
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-700">
                  Video đã được lưu tại: /usr/local/nginx/recordings/{streamKey}.mp4
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Video sẽ được xử lý và có sẵn trong thư viện của bạn sau vài phút.
                </p>
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  onClick={() => {
                    setShowEndDialog(false);
                    navigate('/create');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
                >
                  Quay về trang chủ
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
