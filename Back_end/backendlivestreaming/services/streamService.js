const Stream = require('../entity/Stream');
const mediaService = require('./mediaService');

class StreamService {
  async createStream(streamData) {
    try {
      const stream = await Stream.create(streamData);
      return stream;
    } catch (error) {
      throw error;
    }
  }

  async getStreamByKey(streamKey) {
    try {
      const stream = await Stream.findOne({
        where: { streamKey }
      });
      return stream;
    } catch (error) {
      throw error;
    }
  }

  async updateStreamStatus(streamKey, status) {
    try {
      const stream = await Stream.findOne({
        where: { streamKey }
      });

      if (stream) {
        stream.status = status;
        await stream.save();
      }

      return stream;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new StreamService();
