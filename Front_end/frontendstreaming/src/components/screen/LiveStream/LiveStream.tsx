import { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Shield, X, Send, Mic, Camera, MonitorUp, PictureInPicture, MessageCircle, Users, MoreVertical, Phone } from 'lucide-react';
import Hls from 'hls.js';
import { streamService } from '@/services/api';
import { useParams, useNavigate } from 'react-router-dom';

// VideoFeed Component
function VideoFeed() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const streamInfo = JSON.parse(localStorage.getItem('streamInfo') || '{}');
    const { streamKey } = streamInfo;

    if (streamKey && videoRef.current) {
      const hls = new Hls();
      // Sửa URL để match với nginx config
      const playbackUrl = `http://localhost:8000/hls/${streamKey}/index.m3u8`;

      hls.loadSource(playbackUrl);
      hls.attachMedia(videoRef.current);

      // Thêm error handling
      hls.on(Hls.Events.ERROR, function (event, data) {
        console.error('HLS error:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('Network error, trying to recover...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Media error, trying to recover...');
              hls.recoverMediaError();
              break;
            default:
              console.error('Fatal error, cannot recover');
              break;
          }
        }
      });
    }

    return () => {
      // Cleanup
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.destroy();
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        controls
        autoPlay
        playsInline
      />
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
    <div className="h-screen flex">
      <div className={`flex-1 relative ${isChatPanelVisible ? '' : ''}`}>
        <VideoFeed />
        <BottomControls onToggleChatPanel={toggleChatPanel} onEndStream={handleEndStream} />
      </div>
      {isChatPanelVisible && (
        <ChatPanel
          onClose={toggleChatPanel}
          onSendMessage={handleSendMessage}
          messages={messages}
        />
      )}
    </div>
  );
}
