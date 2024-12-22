import { ChangeEvent } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from '@/components/ui/label'

type JoinStreamFormProps = {
  formData: {
    streamKey: string;
    displayName: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    streamKey: string;
    displayName: string;
  }>>;
}

export default function JoinStreamForm({ formData, setFormData }: JoinStreamFormProps) {
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
