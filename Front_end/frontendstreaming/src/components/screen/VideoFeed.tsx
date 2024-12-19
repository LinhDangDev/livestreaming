export default function VideoFeed() {
  return (
    <div className="relative w-full h-full">
      <img
        src="/Front_end/frontendstreaming/src/assets/background.svg"
        alt="Video feed"
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-4 left-4 text-white/80 text-sm flex items-center gap-2">
        <span>14:06</span>
        <span className="text-gray-400">|</span>
        <span>cxa-mmst-moz</span>
      </div>
    </div>
  );
}
