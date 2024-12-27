import { useState, useEffect, useRef } from 'react';
import { Mic, Camera, MonitorUp, PictureInPicture, Users, MoreVertical, Phone, Volume2, Settings, Maximize2, MessageCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import Hls from 'hls.js';
import { streamService } from '@/services/api';

// VideoFeed Component
function VideoFeed() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { streamKey } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);

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
            video.play()
              .then(() => {
                setIsPlaying(true);
                video.muted = false;
              })
              .catch(error => {
                console.error("Playback error:", error);
                video.muted = true;
                video.play();
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
    </div>
  );
}

// BottomControls Component
function BottomControls({ onToggleChatPanel, onEndStream }: { onToggleChatPanel: () => void, onEndStream: () => void }) {
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
  const [isChatPanelVisible, setIsChatPanelVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const { streamKey } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (streamKey) {
      loadChatHistory();
    }
  }, [streamKey]);

  const loadChatHistory = async () => {
    try {
      const response = await streamService.getChatHistory(streamKey!);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleSendMessage = async (message: string) => {
    try {
      await streamService.sendMessage(streamKey!, message);
      loadChatHistory();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleEndStream = async () => {
    try {
      await streamService.endStream(streamKey!);
      navigate('/');
    } catch (error) {
      console.error('Error ending stream:', error);
    }
  };

  const toggleChatPanel = () => {
    setIsChatPanelVisible(!isChatPanelVisible);
  };

  return (
    <div className="h-screen flex bg-black">
      <div className={`flex-1 relative flex flex-col overflow-hidden ${isChatPanelVisible ? 'mr-80' : ''}`}>
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
              <button
                className="p-2 text-white hover:bg-white/20 rounded-full"
                onClick={toggleChatPanel}
              >
                <MessageCircle className="w-5 h-5" />
              </button>
              <button className="p-2 text-white hover:bg-white/20 rounded-full">
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="h-16 relative">
          <BottomControls
            onToggleChatPanel={toggleChatPanel}
            onEndStream={handleEndStream}
          />
        </div>
      </div>

      {isChatPanelVisible && (
        <div className="w-80 fixed right-0 top-0 bottom-0">
          <ChatPanel
            onClose={toggleChatPanel}
            onSendMessage={handleSendMessage}
            messages={messages}
          />
        </div>
      )}
    </div>
  );
}
