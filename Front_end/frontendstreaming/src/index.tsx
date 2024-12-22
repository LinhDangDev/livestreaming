import React from 'react';
import ReactDOM from 'react-dom/client';
import VideoCallScreen from './components/screen/LiveStream/VideoCallScreen';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <VideoCallScreen />
  </React.StrictMode>
);
