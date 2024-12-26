import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Mic, MicOff, Video, VideoOff, PresentationIcon as PresentationScreen, StopCircle, MoreVertical } from 'lucide-react'
import axios from 'axios'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

// Header Component
function Header() {
  return (
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-lg font-medium">DisplayName</h1>
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

  const handleJoinLive = () => {
    navigate('/live')
  }

  return (
    <div className="w-full md:w-80 p-4 bg-white">
      <div className="h-full flex flex-col">
        <h2 className="text-2xl font-medium mb-4 text-orange-500">Tạo phiên live</h2>
        <Button className="w-full mb-4" size="lg" onClick={handleJoinLive}>
          Tạo phiên live ngay
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full">
              Những cách tham gia khác
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full">
            <DropdownMenuItem onClick={() => navigate('/join')}>
              Tham gia qua link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/join')}>
              Tham gia qua mã
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

// VideoPreview Component
interface VideoPreviewProps {
  isCameraOn: boolean
  videoRef: React.RefObject<HTMLVideoElement>
  isMicOn: boolean
  toggleMic: () => void
  toggleCamera: () => void
  handleCreateStream: () => void
  isRecording: boolean
  toggleRecording: () => void
}

function VideoPreview({
  isCameraOn,
  videoRef,
  isMicOn,
  toggleMic,
  toggleCamera,
  handleCreateStream,
  isRecording,
  toggleRecording
}: VideoPreviewProps) {
  const [isAudioDetected, setIsAudioDetected] = useState(false)
  const audioRef = useRef<AudioContext | null>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    if (isMicOn && videoRef.current && videoRef.current.srcObject) {
      try {
        const stream = videoRef.current.srcObject as MediaStream
        const audioTracks = stream.getAudioTracks()
        if (audioTracks.length === 0) {
          console.warn('No audio tracks available in the stream.')
          return
        }

        const audioContext = new AudioContext()
        const analyzer = audioContext.createAnalyser()
        const source = audioContext.createMediaStreamSource(stream)
        source.connect(analyzer)
        analyzer.fftSize = 256
        const dataArray = new Uint8Array(analyzer.frequencyBinCount)

        const detectAudio = () => {
          analyzer.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length
          setIsAudioDetected(average > 20)
          animationRef.current = requestAnimationFrame(detectAudio)
        }

        detectAudio()
        audioRef.current = audioContext

        return () => {
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current)
          }
          audioContext.close()
        }
      } catch (error) {
        console.error('Error processing audio:', error)
      }
    }
  }, [isMicOn, videoRef])

  return (
    <Card className={`flex-1 bg-black relative overflow-hidden rounded-lg ${isAudioDetected ? 'border-4 border-red-500 animate-flash' : ''}`}>
      {!isCameraOn && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          Máy ảnh đang tắt
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transform ${!isCameraOn ? 'hidden' : '-scale-x-100'}`}
      />
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-black-500 hover:bg-red-500 text-white"
          onClick={toggleMic}
        >
          {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-gray-800 hover:bg-gray-700 text-white"
          onClick={toggleCamera}
        >
          {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-gray-800 hover:bg-gray-700 text-white"
          onClick={handleCreateStream}
        >
          <PresentationScreen className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className={`rounded-full ${isRecording ? 'bg-red-500' : 'bg-gray-800'} hover:bg-gray-700 text-white`}
          onClick={toggleRecording}
        >
          {isRecording ?
            <StopCircle className="h-5 w-5" /> :
            <StopCircle className="h-5 w-5" />
          }
        </Button>
      </div>
    </Card>
  )
}

// Main Component
export default function CreateRoomLive() {
  const [isMicOn, setIsMicOn] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const navigate = useNavigate()
  const [isRecording, setIsRecording] = useState(false)
  const [recordingId, setRecordingId] = useState<string | null>(null)
  const [showStreamInfo, setShowStreamInfo] = useState(false)
  const [streamInfo, setStreamInfo] = useState({
    streamKey: '',
    rtmpUrl: '',
    previewUrl: ''
  })

  const toggleMic = async () => {
    if (!isMicOn) {
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const currentStream = videoRef.current?.srcObject as MediaStream
        if (currentStream) {
          audioStream.getTracks().forEach(track => currentStream.addTrack(track))
        }
        setIsMicOn(true)
      } catch (error) {
        console.error('Error accessing microphone:', error)
      }
    } else {
      const currentStream = videoRef.current?.srcObject as MediaStream
      currentStream?.getAudioTracks().forEach(track => track.stop())
      setIsMicOn(false)
    }
  }

  const toggleCamera = async () => {
    try {
      if (!isCameraOn) {
        const constraints: MediaStreamConstraints = { video: true }
        if (isMicOn) {
          constraints.audio = true
        }
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } else {
        const stream = videoRef.current?.srcObject as MediaStream
        stream?.getTracks().forEach(track => track.stop())
        if (videoRef.current) {
          videoRef.current.srcObject = null
        }
      }
      setIsCameraOn(!isCameraOn)
    } catch (error) {
      console.error('Error accessing camera:', error)
    }
  }

  const handleCreateStream = async () => {
    try {
      // 1. Tạo stream
      const response = await axios.post('http://localhost:3000/api/streams/create', {
        title: 'My Stream',
        streamerName: 'DisplayName'
      });

      const { streamKey } = response.data.data;

      // 2. Lưu thông tin stream
      const streamDetails = {
        streamKey,
        rtmpUrl: `rtmp://localhost:1935/live`,
        previewUrl: `http://localhost:8000/hls/${streamKey}/index.m3u8`
      };

      localStorage.setItem('streamInfo', JSON.stringify(streamDetails));
      setStreamInfo(streamDetails);
      setShowStreamInfo(true);

    } catch (error) {
      console.error('Failed to create stream:', error);
      alert('Không thể tạo stream. Vui lòng thử lại.');
    }
  };

  const toggleRecording = async () => {
    try {
      if (!isRecording) {
        const streamInfo = JSON.parse(localStorage.getItem('streamInfo') || '{}');
        const response = await axios.post(
          `http://localhost:3000/api/streams/recording/start/${streamInfo.streamKey}`
        );
        setRecordingId(response.data.data.recording_id);
      } else if (recordingId) {
        const streamInfo = JSON.parse(localStorage.getItem('streamInfo') || '{}');
        await axios.post(
          `http://localhost:3000/api/streams/recording/stop/${streamInfo.streamKey}`
        );
        setRecordingId(null);
      }
      setIsRecording(!isRecording);
    } catch (error) {
      console.error('Error toggling recording:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-col md:flex-row h-screen">
        <div className="flex-1 p-4">
          <div className="h-full flex flex-col">
            <Header />
            <VideoPreview
              isCameraOn={isCameraOn}
              videoRef={videoRef}
              isMicOn={isMicOn}
              toggleMic={toggleMic}
              toggleCamera={toggleCamera}
              handleCreateStream={handleCreateStream}
              isRecording={isRecording}
              toggleRecording={toggleRecording}
            />
          </div>
        </div>
        <Sidebar />
        <Dialog open={showStreamInfo} onOpenChange={setShowStreamInfo}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thông tin Stream</DialogTitle>
              <DialogDescription>
                Sử dụng thông tin này để cấu hình OBS Studio
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Stream URL</Label>
                <div className="flex items-center space-x-2">
                  <Input readOnly value={streamInfo.rtmpUrl} />
                  <Button
                    onClick={() => navigator.clipboard.writeText(streamInfo.rtmpUrl)}
                    variant="outline"
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Stream Key</Label>
                <div className="flex items-center space-x-2">
                  <Input readOnly value={streamInfo.streamKey} />
                  <Button
                    onClick={() => navigator.clipboard.writeText(streamInfo.streamKey)}
                    variant="outline"
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <Button
                  onClick={() => {
                    setShowStreamInfo(false);
                    navigate(`/live/${streamInfo.streamKey}`);
                  }}
                >
                  Bắt đầu Stream
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
