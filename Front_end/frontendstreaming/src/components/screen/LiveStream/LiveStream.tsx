import { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Shield, X, Send, Mic, Camera, MonitorUp, PictureInPicture, MessageCircle, Users, MoreVertical, Phone, Volume2, Settings, Maximize2 } from 'lucide-react';
// import ReactPlayer from 'react-player';
import { streamService } from '@/services/api';
import { useParams, useNavigate } from 'react-router-dom';
import Hls from 'hls.js';
import axios from 'axios';

// Thêm interface cho message
interface ChatMessage {
  id: string;
  message: string;
  sent_time: string;
  sender: {
    id: number;
    display_name: string;
  };
  attachment?: {
    url: string;
    type: string;
  } | null;
}

// VideoFeed Component
function VideoFeed() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { streamKey } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const hlsInstanceRef = useRef<Hls | null>(null);

  useEffect(() => {
    if (videoRef.current && streamKey) {
      const video = videoRef.current;

      if (Hls.isSupported()) {
        const hls = new Hls({
          debug: true,
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 30,
          maxBufferSize: 2 * 1000 * 1000,
          maxBufferLength: 10,
          liveSyncDurationCount: 3,
          liveMaxLatencyDurationCount: 10,
        });

        hlsInstanceRef.current = hls;

        try {

          const hlsUrl = `${import.meta.env.VITE_HLS_URL}/live/${streamKey}.m3u8`;
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

          // Thêm error handling
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

          return () => {
            if (hlsInstanceRef.current) {
              hlsInstanceRef.current.destroy();
            }
          };
        } catch (error) {
          console.error('Error loading HLS:', error);
        }
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

// Component hiển thị từng tin nhắn
function ChatMessageItem({ message }: { message: ChatMessage }) {
  return (
    <div className="flex flex-col space-y-1 mb-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">
          {message.sender.display_name}
        </span>
        <span className="text-xs text-gray-500">
          {new Date(message.sent_time).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>
      <p className="text-sm text-gray-600 bg-gray-100 rounded-lg p-2">
        {message.message}
      </p>
    </div>
  );
}

// Cập nhật ChatPanel component
function ChatPanel({
  onClose,
  onSendMessage,
  messages
}: {
  onClose: () => void;
  onSendMessage: (message: string) => void;
  messages: ChatMessage[]
}) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-gray-500" />
          <div className="flex items-center gap-2">
            <span>Cho phép mọi người nhắn tin</span>
            <Switch />
          </div>
        </div>

        <div className="space-y-4">
          {messages.map((msg) => (
            <ChatMessageItem key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </Card>
  );
}

// Main LiveStream Component
export default function LiveStream() {
  const [isChatPanelVisible, setIsChatPanelVisible] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { streamKey } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/streams/chat/${streamKey}`
        );
        if (response.data.success) {
          setMessages(response.data.data);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };

    if (streamKey) {
      loadChatHistory();
    }
  }, [streamKey]);

  const handleSendMessage = async (message: string) => {
    try {
      // Sửa lại URL API chat
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/streams/chat/${streamKey}`,
        { message }
      );

      if (response.data.success) {
        // Thêm tin nhắn mới vào state
        setMessages(prev => [...prev, response.data.data.chat]);
      }
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
