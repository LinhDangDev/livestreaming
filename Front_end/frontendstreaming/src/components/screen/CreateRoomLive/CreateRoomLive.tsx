import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
// import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  // DropdownMenuContent,
  // DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Mic, Video, PresentationIcon as PresentationScreen, MoreVertical } from 'lucide-react'
import { streamService } from '@/services/api'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

// Cập nhật interface cho streamInfo
interface StreamInfo {
  streamKey: string;
  streamerName: string;
  title: string;
  isRecording?: boolean;  // Thêm trường này
}

// Header Component
function Header() {
  return (
    <div className="flex justify-between items-center mb-4">

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
      </DropdownMenu>
    </div>
  )
}

// Sidebar Component
function Sidebar() {
  const navigate = useNavigate()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showStreamInfo, setShowStreamInfo] = useState(false)
  const [formData, setFormData] = useState({
    displayName: '',
    title: '',
    enableRecording: false
  })
  const [streamInfo, setStreamInfo] = useState<StreamInfo | null>(null)

  const handleCreateStream = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await streamService.createStream(
        formData.title,
        formData.displayName,
        // formData.enableRecording
      );

      if (response.success) {
        const { stream } = response.data;
        setStreamInfo({
          streamKey: stream.stream_key,
          streamerName: stream.streamer_name,
          title: stream.title,
          isRecording: formData.enableRecording
        });
        setShowCreateForm(false);
        setShowStreamInfo(true);
      }
    } catch (error) {
      console.error('Error creating stream:', error);
      alert('Không thể tạo stream. Vui lòng thử lại.');
    }
  };

  return (
    <div className="w-full md:w-80 p-4 bg-white">
      <div className="h-full flex flex-col">
        <h2 className="text-2xl font-medium mb-4 text-orange-500">Tạo phiên live</h2>

        <div className="space-y-4 mb-4">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
            onClick={() => setShowCreateForm(true)}
          >
            Tạo phiên live ngay
          </Button>

          <Button
            className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
            size="lg"
            variant="outline"
            onClick={() => {
              if (streamInfo?.streamKey) {
                navigate(`/join/${streamInfo.streamKey}`);
              } else {
                navigate('/join');
              }
            }}
          >
            Tham gia bằng mã stream
          </Button>
        </div>

        {/* Form Dialog */}
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogContent className="sm:max-w-[425px] bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Tạo phiên Live Stream</DialogTitle>
              <DialogDescription className="text-gray-500">
                Điền thông tin để bắt đầu stream
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateStream} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tên hiển thị</Label>
                  <Input
                    required
                    value={formData.displayName}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      displayName: e.target.value
                    }))}
                    placeholder="Nhập tên hiển thị của bạn"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tiêu đề Stream</Label>
                  <Input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      title: e.target.value
                    }))}
                    placeholder="Nhập tiêu đề cho stream"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enableRecording"
                  checked={formData.enableRecording}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    enableRecording: e.target.checked
                  }))}
                  className="w-4 h-4"
                />
                <Label htmlFor="enableRecording">
                  Ghi lại video stream
                </Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
                >
                  Tạo Stream
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Stream Info Dialog */}
        <Dialog open={showStreamInfo} onOpenChange={setShowStreamInfo}>
          <DialogContent className="sm:max-w-[425px] bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Thông tin Stream</DialogTitle>
              <DialogDescription className="text-gray-500">
                Sử dụng thông tin này để cấu hình OBS Studio
                {streamInfo?.isRecording && (
                  <div className="mt-2 text-blue-600">
                    ⚫ Ghi hình đã được bật cho phiên stream này
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            {streamInfo && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Stream Title</Label>
                  <Input readOnly value={streamInfo.title} className="bg-gray-50" />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Streamer Name</Label>
                  <Input readOnly value={streamInfo.streamerName} className="bg-gray-50" />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Stream Key</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      readOnly
                      value={streamInfo.streamKey}
                      type="password"
                      className="bg-gray-50 flex-1"
                    />
                    <Button
                      onClick={() => navigator.clipboard.writeText(streamInfo.streamKey)}
                      variant="outline"
                      className="px-3"
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">RTMP URL</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      readOnly
                      value="rtmp://localhost:1935/live"
                      className="bg-gray-50 flex-1"
                    />
                    <Button
                      onClick={() => navigator.clipboard.writeText("rtmp://localhost:1935/live")}
                      variant="outline"
                      className="px-3"
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                {/* Thêm thông tin về recording status */}
                {streamInfo.isRecording && (
                  <div className="p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-700">
                      Video của buổi stream sẽ được lưu lại tự động khi kết thúc.
                    </p>
                  </div>
                )}

                <div className="pt-4 flex justify-end">
                  <Button
                    onClick={() => {
                      setShowStreamInfo(false);
                      navigate(`/live/${streamInfo.streamKey}`);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Bắt đầu Stream
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

// Main Component
export default function CreateRoomLive() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-col md:flex-row h-screen">
        <div className="flex-1 p-4">
          <div className="h-full flex flex-col">
            <Header />
            <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden relative">
              <video
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4">
                <Button variant="secondary" size="icon">
                  <Mic className="h-5 w-5" />
                </Button>
                <Button variant="secondary" size="icon">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="secondary" size="icon">
                  <PresentationScreen className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        <Sidebar />
      </div>
    </div>
  )
}
