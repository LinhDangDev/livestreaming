import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Video, VideoOff, PresentationIcon as PresentationScreen } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'

interface VideoPreviewProps {
  isCameraOn: boolean
  videoRef: React.RefObject<HTMLVideoElement>
  isMicOn: boolean
  toggleMic: () => void
  toggleCamera: () => void
  handleCreateStream: () => void
}

export default function VideoPreview({
  isCameraOn,
  videoRef,
  isMicOn,
  toggleMic,
  toggleCamera,
  handleCreateStream,
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

        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const analyzer = audioContext.createAnalyser()
        const source = audioContext.createMediaStreamSource(stream)
        source.connect(analyzer)
        analyzer.fftSize = 256
        const dataArray = new Uint8Array(analyzer.frequencyBinCount)

        const detectAudio = () => {
          analyzer.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length
          setIsAudioDetected(average > 20) // Adjust threshold as needed
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
      </div>
    </Card>
  )
}
