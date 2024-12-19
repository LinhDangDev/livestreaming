import VideoFeed from './VideoFeed';
import BottomControls from './BottomControls';
import ChatPanel from './ChatPanel';

export default function VideoCallScreen() {
  return (
    <div className="h-screen flex">
      {/* Main content */}
      <div className="flex-1 relative">
        <VideoFeed />
        <BottomControls />
      </div>

      {/* Chat panel */}
      <ChatPanel />
    </div>
  );
}
