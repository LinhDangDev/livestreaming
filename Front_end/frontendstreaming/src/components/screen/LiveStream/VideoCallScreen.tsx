import { useState } from 'react';
import VideoFeed from './VideoFeed';
import BottomControls from './BottomControls';
import ChatPanel from './ChatPanel';

export default function VideoCallScreen() {
  const [isChatPanelVisible, setIsChatPanelVisible] = useState(true);

  const toggleChatPanel = () => {
    setIsChatPanelVisible(!isChatPanelVisible);
  };

  return (
    <div className="h-screen flex">
      {/* Main content */}
      <div className={`flex-1 relative ${isChatPanelVisible ? '' : ''}`}>
        <VideoFeed />
        <BottomControls onToggleChatPanel={toggleChatPanel} />
      </div>

      {/* Chat panel */}
      {isChatPanelVisible && <ChatPanel onClose={toggleChatPanel} />}
    </div>
  );
}
