import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNavigate } from 'react-router-dom'; // Import useNavigate

export default function Sidebar() {
  const navigate = useNavigate(); // Initialize navigate

  const handleJoinLive = () => {
    navigate('/live'); // Navigate to live screen
  };

  return (
    <div className="w-full md:w-80 p-4 bg-white">
      <div className="h-full flex flex-col">
        <h2 className="text-2xl font-medium mb-4 text-orange-500">Tạo phiên live</h2>
        {/* <p className="text-gray-500 mb-4">Không có người nào khác ở đây</p> */}
        <Button className="w-full mb-4" size="lg" onClick={handleJoinLive}>
          Tạp phiên live ngay
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full">
              Những cách tham gia khác
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full">
            <DropdownMenuItem>Tham gia qua link</DropdownMenuItem>
            <DropdownMenuItem>Tham gia qua mã</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
