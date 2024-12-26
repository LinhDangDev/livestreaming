import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

export const streamService = {
  // Stream creation
  createStream: async (title: string, streamerName: string) => {
    const response = await axios.post(`${BASE_URL}/streams/create`, {
      title,
      streamer_name: streamerName
    });
    return response.data;
  },

  // Join stream
  joinStream: async (streamKey: string, displayName: string) => {
    const response = await axios.post(`${BASE_URL}/streams/viewer/join/${streamKey}`, {
      display_name: displayName
    });
    return response.data;
  },

  // End stream
  endStream: async (streamKey: string) => {
    const response = await axios.post(`${BASE_URL}/streams/end/${streamKey}`);
    return response.data;
  },

  // Chat operations
  sendMessage: async (streamKey: string, message: string) => {
    const response = await axios.post(`${BASE_URL}/streams/chat/${streamKey}`, {
      message
    });
    return response.data;
  },

  getChatHistory: async (streamKey: string) => {
    const response = await axios.get(`${BASE_URL}/streams/chat/${streamKey}`);
    return response.data;
  },

  // Recording operations
  startRecording: async (streamKey: string) => {
    const response = await axios.post(`${BASE_URL}/streams/recording/start/${streamKey}`);
    return response.data;
  },

  stopRecording: async (streamKey: string) => {
    const response = await axios.post(`${BASE_URL}/streams/recording/stop/${streamKey}`);
    return response.data;
  },

  // Ban operations
  banParticipant: async (streamKey: string, participantId: number, reason?: string) => {
    const response = await axios.post(`${BASE_URL}/streams/ban/${streamKey}`, {
      participant_id: participantId,
      reason
    });
    return response.data;
  },

  unbanParticipant: async (streamKey: string, participantId: number) => {
    const response = await axios.post(`${BASE_URL}/streams/unban/${streamKey}`, {
      participant_id: participantId
    });
    return response.data;
  }
};
