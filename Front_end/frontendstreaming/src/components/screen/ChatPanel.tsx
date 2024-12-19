import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Shield, X, Send } from 'lucide-react';
export default function ChatPanel({ onClose }: { onClose: () => void })
{
  const [message, setMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sending message:', message);
    setMessage('');
  };

  return (
    <Card
      className="h-full w-80 border-0 rounded-none bg-white flex flex-col"
    >
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
        <Switch  />
          </div>
        </div>

      </div>

      {/* Message input */}
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
