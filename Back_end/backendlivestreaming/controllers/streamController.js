const streamService = require('../services/streamService');
onst { v4: uuidv4 } = require('uuid');
exports.createStream = async (req, res) => {
 try {
   const streamKey = uuidv4();
   const { streamerName } = req.body;

   const stream = await streamService.createStream({
     stream_key: streamKey,
     streamer_name: streamerName,
     status: 'inactive'
   });
    res.status(201).json({
     success: true,
     data: {
       streamId: stream.id,
       streamKey,
       rtmpUrl: `rtmp://your-server/live/${streamKey}`,
       playbackUrl: `http://your-server/live/${streamKey}/index.m3u8`
     }
   });
 } catch (error) {
   res.status(500).json({ success: false, error: error.message });
 }
;
exports.joinStream = async (req, res) => {
 try {
   const { streamId, displayName, ipAddress } = req.body;

   const participant = await streamService.addParticipant({
     stream_id: streamId,
     display_name: displayName,
     ip_address: ipAddress,
     role: 'viewer'
   });
    res.status(200).json({
     success: true,
     data: {
       participantId: participant.id,
       streamId,
       displayName
     }
   });
 } catch (error) {
   res.status(500).json({ success: false, error: error.message });
 }
;
