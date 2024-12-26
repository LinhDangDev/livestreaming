import { useState, FormEvent, ChangeEvent, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { streamService } from '@/services/api'
import { useNavigate, useParams } from 'react-router-dom'

// JoinStreamForm Component
function JoinStreamForm({
  formData,
  setFormData
}: {
  formData: {
    streamKey: string;
    displayName: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    streamKey: string;
    displayName: string;
  }>>;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="streamKey">Stream Key</Label>
        <Input
          id="streamKey"
          placeholder="Nhập mã stream key"
          value={formData.streamKey}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({
            ...prev,
            streamKey: e.target.value
          }))}
          className="focus-visible:ring-2 focus-visible:ring-blue-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="displayName">Tên hiển thị</Label>
        <Input
          id="displayName"
          placeholder="Nhập tên của bạn"
          value={formData.displayName}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({
            ...prev,
            displayName: e.target.value
          }))}
          className="focus-visible:ring-2 focus-visible:ring-blue-500"
        />
      </div>
    </>
  )
}

// Main JoinRoomLive Component
export default function JoinRoomLive() {
  const [formData, setFormData] = useState({
    streamKey: '',
    displayName: ''
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { streamKey } = useParams()

  useEffect(() => {
    if (streamKey) {
      setFormData(prev => ({ ...prev, streamKey }))
    }
  }, [streamKey])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.streamKey.trim() || !formData.displayName.trim()) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      // Kiểm tra stream status
      const statusResponse = await streamService.checkStreamStatus(formData.streamKey);

      if (!statusResponse.success) {
        setError(statusResponse.error || 'Stream không tồn tại');
        return;
      }

      // Join stream
      const joinResponse = await streamService.joinStream(
        formData.streamKey,
        formData.displayName
      );

      if (joinResponse.success) {
        localStorage.setItem('participantInfo', JSON.stringify({
          displayName: formData.displayName,
          streamKey: formData.streamKey,
          participantId: joinResponse.data.participant.id
        }));

        navigate(`/live/${formData.streamKey}`);
      } else {
        setError(joinResponse.error || 'Không thể tham gia stream');
      }
    } catch (error: unknown) {
      console.error('Join stream error:', error);
      setError(
        error instanceof Error && 'response' in error && typeof error.response === 'object' && error.response !== null && 'data' in error.response && typeof error.response.data === 'object' && error.response.data !== null && 'error' in error.response.data
          ? String(error.response.data.error)
          : 'Có lỗi xảy ra khi tham gia stream, vui lòng thử lại'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center">Tham gia Livestream</h1>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <JoinStreamForm formData={formData} setFormData={setFormData} />
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              Tham gia Stream
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
