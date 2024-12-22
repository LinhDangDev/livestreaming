import { useState, FormEvent } from 'react'
import { Button } from "@/components/ui/button"

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import JoinStreamForm from './JoinStreamForm'

export default function JoinStream() {
  const [formData, setFormData] = useState({
    streamKey: '',
    displayName: ''
  })
  const [error, setError] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.streamKey.trim() || !formData.displayName.trim()) {
      setError('Vui lòng điền đầy đủ thông tin')
      return
    }

    // Here you would typically handle the join stream logic
    console.log('Joining stream with:', formData)
  }

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
