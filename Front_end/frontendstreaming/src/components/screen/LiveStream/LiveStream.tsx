import { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Shield, X, Send, Mic, Camera, MonitorUp, PictureInPicture, MessageCircle, Users, MoreVertical, Phone, Volume2, Settings, Maximize2 } from 'lucide-react';
// import ReactPlayer from 'react-player';
import { streamService } from '@/services/api';
import { useParams, useNavigate } from 'react-router-dom';
import Hls from 'hls.js';





// VideoFeed Component
function VideoFeed() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { streamKey } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const hlsInstanceRef = useRef<Hls | null>(null);

  useEffect(() => {
    if (videoRef.current && streamKey) {
      const video = videoRef.current;

      video.controls = false;
      video.autoplay = true;
      video.playsInline = true;
      video.muted = true;

      if (Hls.isSupported()) {
        const hls = new Hls({
          debug: true,
          enableWorker: true,
          lowLatencyMode: true,
          manifestLoadPolicy: {
            default: {
              maxTimeToFirstByteMs: 10000,
              maxLoadTimeMs: 10000,
              timeoutRetry: {
                maxNumRetry: 5,
                retryDelayMs: 1000,
                maxRetryDelayMs: 8000
              },
              errorRetry: {
                maxNumRetry: 5,
                retryDelayMs: 1000,
                maxRetryDelayMs: 8000
              }
            }
          },
          fragLoadPolicy: {
            default: {
              maxTimeToFirstByteMs: 10000,
              maxLoadTimeMs: 10000,
              timeoutRetry: {
                maxNumRetry: 5,
                retryDelayMs: 1000,
                maxRetryDelayMs: 8000
              },
              errorRetry: {
                maxNumRetry: 5,
                retryDelayMs: 1000,
                maxRetryDelayMs: 8000
              }
            }
          },
          backBufferLength: 30,
          maxBufferSize: 2 * 1000 * 1000,
          maxBufferLength: 10,
          liveSyncDurationCount: 3,
          liveMaxLatencyDurationCount: 10,
        });

        hlsInstanceRef.current = hls;

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error("Network error, attempting to recover...");
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error("Media error, attempting to recover...");
                hls.recoverMediaError();
                break;
              default:
                console.error("Fatal error, destroying HLS instance...");
                hls.destroy();
                break;
            }
          }
        });

        try {
          const hlsUrl = `${import.meta.env.VITE_HLS_URL}/${streamKey}.m3u8`;
          console.log('Loading HLS source:', hlsUrl);

          hls.loadSource(hlsUrl);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play()
              .then(() => {
                setIsPlaying(true);
                video.muted = false;
              })
              .catch(console.error);
          });
        } catch (error) {
          console.error('Error loading HLS:', error);
        }

        return () => {
          if (hlsInstanceRef.current) {
            hlsInstanceRef.current.destroy();
          }
        };
      }
    }
  }, [streamKey]);

  return (
    <div className="relative w-full h-full bg-black">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        muted
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
function BottomControls({ onToggleChatPanel, onEndStream }: { onToggleChatPanel: () => void; onEndStream: () => void }) {
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
        <button className="p-2 rounded-full hover:bg-gray-700 text-white" onClick={onToggleChatPanel}>
          <MessageCircle className="w-5 h-5" />
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

// ChatPanel Component
function ChatPanel({ onClose, onSendMessage, messages }: { onClose: () => void; onSendMessage: (message: string) => void; messages: Array<{id: string; message: string; sender: string}> }) {
  const [message, setMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <Card className="h-full w-80 border-0 rounded-none bg-white flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-medium">Tin nhắn trong cuộc gọi</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4 flex-grow overflow-y-auto">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-gray-500" />
          <div className="flex items-center gap-2">
            <span>Cho phép mọi người nhắn tin</span>
            <Switch />
          </div>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className="p-2 bg-gray-100 rounded">
            <p className="font-semibold">{msg.sender}</p>
            <p>{msg.message}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t flex items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </Card>
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
