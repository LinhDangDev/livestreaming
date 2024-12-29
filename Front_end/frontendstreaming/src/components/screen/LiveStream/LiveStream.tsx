import { useState, useEffect, useRef } from 'react';
import { Mic, Camera, MonitorUp, PictureInPicture, Users, MoreVertical, Phone, Volume2, Settings, Maximize2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import Hls from 'hls.js';
import {

  DialogHeader,

  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';


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
  const [recordingInfo, setRecordingInfo] = useState<{
    file_url?: string;
    status?: string;
  } | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // Kiểm tra trạng thái recording khi component mount
  useEffect(() => {
    const streamInfo = localStorage.getItem('streamInfo');
    if (streamInfo) {
      const { isRecording } = JSON.parse(streamInfo);
      setIsRecording(isRecording);
    }
  }, []);

  const handleEndStreamClick = () => {
    setIsConfirmDialogOpen(true);
  };

  const handleEndStream = async () => {
    try {
        setIsConfirmDialogOpen(false);

        if (!streamKey) {
            throw new Error('Stream key not found');
        }

        const response = await fetch(`http://localhost:3000/api/streams/end/${streamKey}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            // Chuyển hướng về trang chủ sau khi end stream thành công
            navigate('/');
        } else {
            throw new Error(data.error || 'Failed to end stream');
        }

    } catch (error) {
        console.error('Error ending stream:', error);
        alert('Không thể kết thúc stream. Vui lòng thử lại!');
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
          <BottomControls onEndStream={handleEndStreamClick} />
        </div>

        {/* End Stream Dialog */}
        <Dialog open={showEndDialog} onChange={setShowEndDialog}>
          <DialogContent className="sm:max-w-[425px] bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Stream đã kết thúc</DialogTitle>
              <DialogDescription className="text-gray-500">
                {isRecording ? "Video của buổi stream đã được lưu lại" : "Stream đã kết thúc thành công"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {isRecording && recordingInfo && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-700 font-medium mb-2">
                      Trạng thái Recording: {recordingInfo.status === 'completed' ? 'Đã hoàn thành' : 'Đang xử lý'}
                    </p>
                    <p className="text-sm text-blue-700">
                      Video đã được lưu tại: {recordingInfo.file_url}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      • OBS Studio đã được ngắt kết nối
                    </p>
                    <p className="text-sm text-gray-500">
                      • Video sẽ được xử lý và có sẵn trong thư viện của bạn sau vài phút
                    </p>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-md">
                    <svg
                      className="w-5 h-5 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm text-yellow-700">
                      Vui lòng không đóng trình duyệt cho đến khi video được xử lý xong
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-2">
                {recordingInfo && recordingInfo.file_url && (
                  <Button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(recordingInfo.file_url || '');
                        alert('Đã copy đường dẫn vào clipboard!');
                      } catch (error) {
                        console.error('Error copying to clipboard:', error);
                        alert('Không thể copy đường dẫn. Vui lòng thử lại!');
                      }
                    }}
                    variant="outline"
                    className="px-4 py-2"
                  >
                    Copy đường dẫn
                  </Button>
                )}
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

        {/* Dialog xác nhận */}
        <Dialog
          open={isConfirmDialogOpen}
          onClose={() => setIsConfirmDialogOpen(false)}
        >
          <DialogTitle>
            Xác nhận kết thúc live stream
          </DialogTitle>
          <DialogContent>
            Bạn có chắc chắn muốn kết thúc phiên live stream này?
            {isRecording && (
              <p>
                Lưu ý: File recording sẽ được lưu lại và phiên live stream sẽ kết thúc hoàn toàn.
                Người xem sẽ không thể tham gia lại phiên này.
              </p>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setIsConfirmDialogOpen(false)}
              color="primary"
            >
              Hủy
            </Button>
            <Button
              onClick={handleEndStream}
              color="error"
              variant="default"
            >
              Kết thúc
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}
