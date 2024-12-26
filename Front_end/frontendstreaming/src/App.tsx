import { Routes, Route } from 'react-router-dom';
import CreateStream from './components/screen/CreateRoomLive/CreateRoomLive';
import LiveStream from './components/screen/LiveStream/LiveStream';
import JoinRoomLive from './components/screen/JoiningRoomLive/JoinRoomLive';

function App() {
  return (
    <Routes>
      <Route path="/" element={<CreateStream />} />
      <Route path="/live/:streamKey?" element={<LiveStream />} />
      <Route path="/join/:streamKey?" element={<JoinRoomLive />} />
    </Routes>
  );
}

export default App;
