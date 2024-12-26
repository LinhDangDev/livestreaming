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
          onChange={(e) => setFormData(prev => ({
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
      // 1. Kiểm tra stream có tồn tại và đang active
      const streamStatus = await streamService.checkStreamStatus(formData.streamKey);

      if (!streamStatus.data.isActive) {
        setError('Stream không tồn tại hoặc đã kết thúc');
        return;
      }

      // 2. Join stream
      const response = await streamService.joinStream(
        formData.streamKey,
        formData.displayName
      );

      // 3. Lưu thông tin
      localStorage.setItem('participantInfo', JSON.stringify({
        displayName: formData.displayName,
        streamKey: formData.streamKey,
        participantId: response.data.participant.id
      }));

      // 4. Chuyển đến trang xem stream
      navigate(`/live/${formData.streamKey}`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      setError(err.response?.data?.error || 'Không thể tham gia stream');
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
