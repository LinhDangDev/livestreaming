const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class RtmpService {
  async disconnectStream(streamKey) {
    try {
      console.log('Attempting to disconnect RTMP for stream:', streamKey);

      // Tìm và kill process ffmpeg
      const { stdout } = await execAsync('ps aux | grep ffmpeg');
      const processes = stdout.split('\n');

      let killed = false;
      for (const process of processes) {
        if (process.includes(streamKey)) {
          const pid = process.split(/\s+/)[1];
          try {
            await execAsync(`kill -9 ${pid}`);
            console.log(`Killed RTMP process: ${pid}`);
            killed = true;
          } catch (error) {
            console.warn(`Failed to kill process ${pid}:`, error);
          }
        }
      }

      return killed;
    } catch (error) {
      console.error('Error in disconnectStream:', error);
      return false;
    }
  }
}

module.exports = new RtmpService();
