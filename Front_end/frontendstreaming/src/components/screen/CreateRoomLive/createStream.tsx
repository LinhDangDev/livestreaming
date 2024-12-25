import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from './Header'
import VideoPreview from './VideoPreview'
import Sidebar from './Sidebar'
import axios from 'axios'

// Rename the component to CreateStream
export default function CreateStream() {
  const [isMicOn, setIsMicOn] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const navigate = useNavigate()
  const [isRecording, setIsRecording] = useState(false)
  const [recordingId, setRecordingId] = useState<string | null>(null)

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
      const response = await axios.post('http://localhost:3000/api/streams/create', {
        title: 'My Stream', // You can add a title input field
        streamerName: 'DisplayName' // Get this from user input or context
      });

      const { streamKey, rtmpUrl } = response.data.data;

      // Save stream info to local storage or context
      localStorage.setItem('streamInfo', JSON.stringify({
        streamKey,
        rtmpUrl
      }));

      // Navigate to live screen
      navigate('/live');
    } catch (error) {
      console.error('Failed to create stream:', error);
      // Handle error (show notification etc.)
    }
  };

  const toggleRecording = async () => {
    try {
      if (!isRecording) {
        const response = await axios.post(
          `http://localhost:3000/api/streams/recording/start/${streamKey}`
        );
        setRecordingId(response.data.data.recording_id);
      } else if (recordingId) {
        await axios.post(
          `http://localhost:3000/api/streams/recording/stop/${streamKey}`
        );
        setRecordingId(null);
      }
      setIsRecording(!isRecording);
    } catch (error) {
      console.error('Error toggling recording:', error);
      // Handle error (show notification etc.)
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-col md:flex-row h-screen">
        {/* Main Content */}
        <div className="flex-1 p-4">
          <div className="h-full flex flex-col">
            {/* Header */}
            <Header />

            {/* Video Preview */}
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

        {/* Sidebar */}
        <Sidebar />
      </div>
    </div>
  )
}
