import axios, { AxiosError } from 'axios';

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
    try {
      console.log('Joining stream:', { streamKey, displayName });
      const response = await axios.post(`${BASE_URL}/streams/viewer/join/${streamKey}`, {
        display_name: displayName
      });
      console.log('Join response:', response.data);
      return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
        console.error('Axios error', error.message);
        throw {
            message: error.response?.data?.error || 'Không thể tham gia stream',
            status: error.response?.status
        };
        } else {
        console.error('Unknown error', error);
        throw error;
        }
    }
},

  // End stream
  endStream: async (streamKey: string) => {
    const response = await axios.post(`${BASE_URL}/streams/end/${streamKey}`);
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
  },

  // Stream status check
  checkStreamStatus: async (streamKey: string) => {
    try {
      console.log('Checking stream status:', streamKey);
      const response = await axios.get(`${BASE_URL}/streams/status/${streamKey}`);
      console.log('Status response:', response.data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Axios error', error.message);
        throw {
          message: error.response?.data?.error || 'Không thể kiểm tra trạng thái stream',
          status: error.response?.status
        };
      } else {
        console.error('Unknown error', error);
        throw error;
      }
    }
  }
};
