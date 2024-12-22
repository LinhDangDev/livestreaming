const NodeMediaServer = require('node-media-server');
const ffmpeg = require('fluent-ffmpeg');
const streamService = require('./streamService');
const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8000,
    mediaroot: './media',
    allow_origin: '*'
  },
  trans: {
    ffmpeg: '/usr/local/bin/ffmpeg',
    tasks: [
      {
        app: 'live',
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]'
      }
    ]
  }
};
const nms = new NodeMediaServer(config);
nms.on('prePublish', async (id, StreamPath, args) => {
  const streamKey = StreamPath.split('/')[2];
  await streamService.updateStreamStatus(streamKey, 'active');
});
nms.on('donePublish', async (id, StreamPath, args) => {
  const streamKey = StreamPath.split('/')[2];
  await streamService.updateStreamStatus(streamKey, 'inactive');
 // Bắt đầu xử lý recording nếu cần
  await handleStreamRecording(streamKey);
});
module.exports = nms;
