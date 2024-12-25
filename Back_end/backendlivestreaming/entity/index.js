const Stream = require('./Stream');
const Participant = require('./Participant');
const Chat = require('./chat');
const Attachment = require('./attachments');
const BannedParticipant = require('./BannedParticipants');

// 1. Stream - Participant
Stream.hasMany(Participant, { foreignKey: 'stream_id' });
Participant.belongsTo(Stream, { foreignKey: 'stream_id' });

// 2. Stream - Chat
Stream.hasMany(Chat, { foreignKey: 'stream_id' });
Chat.belongsTo(Stream, { foreignKey: 'stream_id' });

// 3. Participant - Chat (Quan trọng: Đây là phần bị lỗi)
Chat.belongsTo(Participant, {
    foreignKey: 'participant_id',
    as: 'Sender'  // Phải thêm alias này để match với chatRoutes.js
});
Participant.hasMany(Chat, {
    foreignKey: 'participant_id',
    as: 'Messages'
});

// 4. Chat - Attachment
Chat.hasOne(Attachment, { foreignKey: 'chat_id' });
Attachment.belongsTo(Chat, { foreignKey: 'chat_id' });

// 5. Stream - BannedParticipant
Stream.hasMany(BannedParticipant, { foreignKey: 'stream_id' });
BannedParticipant.belongsTo(Stream, { foreignKey: 'stream_id' });

// 6. Participant - BannedParticipant (người bị ban)
BannedParticipant.belongsTo(Participant, {
    foreignKey: 'participant_id',
    as: 'BannedUser'
});
Participant.hasMany(BannedParticipant, {
    foreignKey: 'participant_id',
    as: 'BannedRecords'
});

// 7. Participant - BannedParticipant (người ban)
BannedParticipant.belongsTo(Participant, {
    foreignKey: 'banned_by',
    as: 'Banner'
});
Participant.hasMany(BannedParticipant, {
    foreignKey: 'banned_by',
    as: 'BannedOthers'
});

module.exports = {
    Stream,
    Participant,
    Chat,
    Attachment,
    BannedParticipant
};
