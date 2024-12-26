import { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Shield, X, Send, Mic, Camera, MonitorUp, PictureInPicture, MessageCircle, Users, MoreVertical, Phone } from 'lucide-react';
// import ReactPlayer from 'react-player';
import { streamService } from '@/services/api';
import { useParams, useNavigate } from 'react-router-dom';
import Hls from 'hls.js';

// VideoFeed Component
function VideoFeed() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { streamKey } = useParams();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!streamKey || !videoRef.current) return;

    const video = videoRef.current;
    let hls: Hls | null = null;

    const initializeStream = async () => {
      try {
        setIsLoading(true);
        setError('');

        const streamUrl = `http://localhost:8000/live/${streamKey}/index.m3u8`;

        // Add check stream status
        const checkStream = async () => {
          try {
            const response = await fetch(streamUrl);
            if (response.ok) {
              return true;
            }
          } catch (error) {
            console.error('Error checking stream:', error);
            console.log('Stream not ready yet');
          }
          return false;
        };

        // Wait for stream to be ready
        let retries = 10;
        while (retries > 0) {
          if (await checkStream()) {
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
          retries--;
        }

        if (retries === 0) {
          throw new Error('Stream không khả dụng');
        }

        if (Hls.isSupported()) {
          hls = new Hls({
            debug: true,
            enableWorker: true,
            lowLatencyMode: true,
            xhrSetup: function(xhr) {
              xhr.withCredentials = false;
            }
          });

          hls.loadSource(streamUrl);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setIsLoading(false);
            video.play().catch(err => {
              console.error('Playback failed:', err);
              setError('Failed to start playback');
            });
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS error:', data);
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.log('Fatal network error encountered, trying to recover...');
                  hls?.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.log('Fatal media error encountered, trying to recover...');
                  hls?.recoverMediaError();
                  break;
                default:
                  hls?.destroy();
                  setError('Stream không khả dụng');
                  break;
              }
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
          video.addEventListener('loadedmetadata', () => {
            setIsLoading(false);
            video.play().catch(console.error);
          });
        } else {
          setError('Trình duyệt không hỗ trợ HLS');
        }
      } catch (err) {
        console.error('Stream initialization error:', err);
        setError('Không thể khởi tạo stream');
        setIsLoading(false);
      }
    };

    initializeStream();

    return () => {
      if (hls) {
        hls.destroy();
      }
      if (video) {
        video.pause();
        video.src = '';
        video.load();
      }
    };
  }, [streamKey]);

  return (
    <div className="relative w-full h-full bg-black">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        playsInline
        muted
      />

      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 text-center">
          {error}
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
  const [isChatPanelVisible, setIsChatPanelVisible] = useState(true);
  const [messages, setMessages] = useState<Array<{id: string; message: string; sender: string}>>([]);
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
      {/* Main content area */}
      <div className={`flex-1 relative flex flex-col ${isChatPanelVisible ? 'mr-80' : ''}`}>
        {/* Video container - fills available space */}
        <div className="flex-1 relative">
          <VideoFeed />
        </div>

        {/* Bottom controls - fixed height */}
        <div className="h-16">
          <BottomControls
            onToggleChatPanel={toggleChatPanel}
            onEndStream={handleEndStream}
          />
        </div>
      </div>

      {/* Chat panel - fixed width */}
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
