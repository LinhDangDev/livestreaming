const streamService = require('../services/streamService');
const { v4: uuidv4 } = require('uuid');

exports.createStream = async (req, res) => {
  try {
    const streamKey = uuidv4();
    const { title, streamerName } = req.body;

    // Validate input
    if (!title || !streamerName) {
      return res.status(400).json({
        success: false,
        error: 'Title and streamer name are required'
      });
    }

    const stream = await streamService.createStream({
      streamKey,
      title,
      streamerName,
      status: 'inactive',
      rtmpUrl: `rtmp://${process.env.NGINX_HOST}:${process.env.RTMP_PORT}/live/${streamKey}`,
      playbackUrl: `http://${process.env.NGINX_HOST}:${process.env.HTTP_PORT}/live/${streamKey}/index.m3u8`
    });

    res.status(201).json({
      success: true,
      data: stream
    });
  } catch (error) {
    console.error('Create stream error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

exports.getStream = async (req, res) => {
  try {
    const { streamKey } = req.params;
    const stream = await streamService.getStreamByKey(streamKey);

    if (!stream) {
      return res.status(404).json({
        success: false,
        error: 'Stream not found'
      });
    }

    res.json({
      success: true,
      data: stream
    });
  } catch (error) {
    console.error('Get stream error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
